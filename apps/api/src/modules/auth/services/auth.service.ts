import {
  Injectable,
  Inject,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  forwardRef,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { TokenService } from './token.service';
import { AuthCacheService } from './auth-cache.service';
import { RegisterUserByEmailDto } from '../dto/req/register-user-by-email.dto';
import { LoginUserDto } from '../dto/req/login-user.dto';
import { ForgotPasswordDto } from '../dto/req/forgot-password.dto';
import { ResetPasswordDto } from '../dto/req/reset-password.dto';
import { ChangePasswordDto } from '../dto/req/change-password.dto';
import { AuthResponseDto } from '../dto/res/auth-response.dto';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';
import { ITokenPair } from '../interfaces/token-pair.interface';
import { TokenType } from '../enums/token-type.enum';
import { ActionTokenType } from '../enums/action-token.type';
import {
  UsersRepository,
  User,
  userCredits,
  creditTransactions,
  NotificationsRepository,
} from '@ryla/data';
import * as schema from '@ryla/data/schema';
import { sendEmail, WelcomeEmail, PasswordResetEmail } from '@ryla/email';
import {
  generateBaseUsername,
  generateUsernameWithSuffix,
  generateRandomUsername,
  PLAN_CREDIT_LIMITS,
} from '@ryla/shared';

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  private readonly usersRepository: UsersRepository;

  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<typeof schema>,
    @Inject(forwardRef(() => TokenService))
    private readonly tokenService: TokenService,
    @Inject(forwardRef(() => AuthCacheService))
    private readonly authCacheService: AuthCacheService,
  ) {
    this.usersRepository = new UsersRepository(this.db);
  }

  /**
   * Register a new user by email
   */
  public async registerUserByEmail(
    dto: RegisterUserByEmailDto,
    userAgent: string,
    ip: string,
  ): Promise<AuthResponseDto> {
    // Check if email already exists
    const { emailExists } =
      await this.usersRepository.existsByEmailOrPublicName(
        dto.email,
        dto.publicName,
      );

    if (emailExists) {
      throw new ConflictException('This email is already in use');
    }

    // Generate username if not provided
    let publicName = dto.publicName;
    if (!publicName) {
      publicName = await this.generateUniqueUsername(dto.name);
    } else {
      // Check if provided publicName is already taken
      const publicNameExists = await this.usersRepository.existsByPublicName(publicName);
      if (publicNameExists) {
        throw new ConflictException('This public name is already taken');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    // Create user
    const user = await this.usersRepository.create({
      email: dto.email.toLowerCase(),
      password: hashedPassword,
      name: dto.name,
      publicName,
      role: 'user',
      isEmailVerified: false,
    });

    // Initialize user credits with free tier credits
    const freeCredits = PLAN_CREDIT_LIMITS.free;
    await this.db.insert(userCredits).values({
      userId: user.id,
      balance: freeCredits,
      totalEarned: freeCredits,
      totalSpent: 0,
    });

    // Log the initial credit grant
    await this.db.insert(creditTransactions).values({
      userId: user.id,
      type: 'bonus',
      amount: freeCredits,
      balanceAfter: freeCredits,
      description: 'Welcome bonus - free trial credits',
    });

    // Create welcome notification
    const notificationsRepo = new NotificationsRepository(this.db);
    await notificationsRepo.create({
      userId: user.id,
      type: 'account.welcome',
      title: 'Welcome to RYLA!',
      body: `You received ${freeCredits} free credits to get started.`,
      href: '/wizard/step-0',
      metadata: { freeCredits },
    });

    // Send welcome email (don't fail registration if email fails)
    try {
      const appUrl = process.env['NEXT_PUBLIC_APP_URL'] || 'https://app.ryla.ai';
      await sendEmail({
        to: user.email,
        subject: 'Welcome to RYLA! 🎨',
        template: WelcomeEmail,
        props: {
          userName: user.name,
          loginUrl: appUrl,
        },
      });
    } catch (_error) {
      // Log but don't fail registration
      console.error('Failed to send welcome email:', _error);
    }

    // Generate tokens
    const deviceId = this.generateDeviceId(userAgent, ip);
    const tokens = await this.generateAndSaveTokens(user, deviceId);

    return this.buildAuthResponse(user, tokens);
  }

  /**
   * Login user with email and password
   */
  public async loginUser(
    dto: LoginUserDto,
    userAgent: string,
    ip: string,
  ): Promise<AuthResponseDto> {
    // Find user by email
    const user = await this.usersRepository.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user is banned
    if (user.banned) {
      throw new UnauthorizedException('Your account has been suspended');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate tokens
    const deviceId = this.generateDeviceId(userAgent, ip);
    const tokens = await this.generateAndSaveTokens(user, deviceId);

    return this.buildAuthResponse(user, tokens);
  }

  /**
   * Refresh access token using refresh token
   */
  public async refreshTokens(
    refreshToken: string,
    userAgent: string,
    ip: string,
  ): Promise<AuthResponseDto> {
    // Verify refresh token
    const payload = await this.tokenService.verifyToken(refreshToken, TokenType.REFRESH);

    // Find user
    const user = await this.usersRepository.findById(payload.userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.banned) {
      throw new UnauthorizedException('Your account has been suspended');
    }

    // Generate new tokens
    const deviceId = this.generateDeviceId(userAgent, ip);

    // Delete old token
    await this.authCacheService.deleteToken(payload.userId, payload.deviceId);

    // Generate and save new tokens
    const tokens = await this.generateAndSaveTokens(user, deviceId);

    return this.buildAuthResponse(user, tokens);
  }

  /**
   * Logout user - invalidate tokens
   */
  public async logout(userId: string, deviceId: string): Promise<void> {
    await this.authCacheService.deleteToken(userId, deviceId);
  }

  /**
   * Logout from all devices
   */
  public async logoutAll(userId: string): Promise<void> {
    await this.authCacheService.deleteAllUserTokens(userId);
  }

  /**
   * Check if email exists in the database
   */
  public async checkEmailExists(email: string): Promise<boolean> {
    const user = await this.usersRepository.findByEmail(email);
    return !!user;
  }

  /**
   * Get current user by ID
   */
  public async getCurrentUser(userId: string): Promise<(Omit<User, 'password'> & { hasPassword?: boolean }) | null> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return null;
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      hasPassword: !!password,
    };
  }

  /**
   * Request password reset - sends email with reset link
   */
  public async requestPasswordReset(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.usersRepository.findByEmail(dto.email);

    // Don't reveal if email exists (security best practice)
    if (!user) {
      return;
    }

    // Generate reset token
    // Note: IJwtActionTokenPayload expects userId as number, but we use string UUIDs
    // The token service will handle the payload structure
    const token = await this.tokenService.generateActionToken(
      {
        userId: user.id as any, // Token service will handle the conversion
        actionToken: 'password-reset',
      } as any,
      ActionTokenType.FORGOT_PASSWORD,
    );

    // Store token in database
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry
    await this.usersRepository.setPasswordResetToken(user.email, token, expiresAt);

    // Send password reset email
    try {
      const appUrl = process.env['NEXT_PUBLIC_APP_URL'] || 'https://app.ryla.ai';
      const resetUrl = `${appUrl}/reset-password?token=${token}`;

      await sendEmail({
        to: user.email,
        subject: 'Reset your RYLA password',
        template: PasswordResetEmail,
        props: {
          resetUrl,
          userName: user.name,
          expiresIn: '1 hour',
        },
      });
    } catch (_error) {
      // Log but don't fail the request (security: don't reveal if email exists)
      console.error('Failed to send password reset email:', _error);
    }
  }

  /**
   * Reset password using token
   */
  public async resetPassword(dto: ResetPasswordDto): Promise<void> {
    // Verify token - verifyActionToken returns IJwtPayload which has userId as string
    let payload: IJwtPayload;
    try {
      payload = await this.tokenService.verifyActionToken(
        dto.token,
        ActionTokenType.FORGOT_PASSWORD,
      ) as any; // Token service returns IJwtPayload which has userId
    } catch (_error) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    // Find user
    const user = await this.usersRepository.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedException('Invalid reset token');
    }

    // Verify token matches stored token
    if (user.passwordResetToken !== dto.token) {
      throw new UnauthorizedException('Invalid reset token');
    }

    // Check if token expired
    if (!user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
      throw new UnauthorizedException('Reset token has expired');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    // Update password and clear reset token
    await this.usersRepository.updateById(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    });
  }

  /**
   * Change password for an authenticated user
   */
  public async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid current password');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, BCRYPT_SALT_ROUNDS);

    // Update password
    await this.usersRepository.updateById(userId, {
      password: hashedPassword,
    });
  }

  /**
   * Generate JWT tokens and save access token to cache
   */
  private async generateAndSaveTokens(
    user: User,
    deviceId: string,
  ): Promise<ITokenPair> {
    const payload: IJwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role || 'user',
      deviceId,
    };

    const tokens = await this.tokenService.generateAuthTokens(payload);

    // Save access token to Redis cache
    await this.authCacheService.saveToken(
      user.id,
      deviceId,
      tokens.accessToken,
    );

    return tokens;
  }

  /**
   * Generate a device ID from user agent and IP
   */
  private generateDeviceId(userAgent: string, ip: string): string {
    // For MVP, generate a simple device ID
    // In production, you might want to use a hash of userAgent + IP
    if (!userAgent && !ip) {
      return uuidv4();
    }
    return Buffer.from(`${userAgent}:${ip}`).toString('base64').slice(0, 32);
  }

  /**
   * Generate a long-lived dev token for MCP/development tools
   * This creates a token that expires in 10 years instead of 1 hour
   */
  public async generateDevToken(
    dto: LoginUserDto,
    userAgent: string,
    ip: string,
  ): Promise<{ accessToken: string; user: Omit<User, 'password'> & { hasPassword?: boolean } }> {
    // Find user by email
    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate device ID
    const deviceId = this.generateDeviceId(userAgent, ip);

    // Create payload
    const payload: IJwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role || 'user',
      deviceId,
    };

    // Generate long-lived dev token (10 years)
    const devToken = await this.tokenService.generateDevToken(payload);

    // Note: We don't save dev tokens to Redis cache since they're long-lived
    // and meant for development tools, not regular user sessions

    // Remove sensitive data
    const { password, ...userWithoutPassword } = user;

    return {
      accessToken: devToken,
      user: {
        ...userWithoutPassword,
        hasPassword: !!password,
      },
    };
  }

  /**
   * Generate a unique username
   * Tries base username first, then adds random suffix if needed
   */
  private async generateUniqueUsername(name: string): Promise<string> {
    const maxAttempts = 10;
    let attempts = 0;

    while (attempts < maxAttempts) {
      let candidate: string;

      if (name && name.trim()) {
        const baseUsername = generateBaseUsername(name);
        if (baseUsername) {
          candidate = generateUsernameWithSuffix(baseUsername);
        } else {
          candidate = generateRandomUsername();
        }
      } else {
        candidate = generateRandomUsername();
      }

      // Check if username is available
      const publicNameExists = await this.usersRepository.existsByPublicName(candidate);

      if (!publicNameExists) {
        return candidate;
      }

      attempts++;
    }

    // Fallback: use UUID-based username if all attempts failed
    return `user${uuidv4().replace(/-/g, '').slice(0, 8)}`;
  }

  /**
   * Build auth response DTO
   */
  private buildAuthResponse(user: User, tokens: ITokenPair): AuthResponseDto {
    // Remove sensitive data
    const { password, ...userWithoutPassword } = user;

    return {
      user: {
        ...userWithoutPassword,
        hasPassword: !!password,
      },
      tokens,
    };
  }
}
