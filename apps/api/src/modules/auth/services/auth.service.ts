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
import { AuthResponseDto } from '../dto/res/auth-response.dto';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';
import { ITokenPair } from '../interfaces/token-pair.interface';
import { TokenType } from '../enums/token-type.enum';
import {
  UsersRepository,
  User,
  userCredits,
  creditTransactions,
  PLAN_CREDIT_LIMITS,
  NotificationsRepository,
} from '@ryla/data';
import * as schema from '@ryla/data/schema';
import type { NotificationType } from '@ryla/data/schema';

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
    // Check if email or public name already exists
    const { emailExists, publicNameExists } =
      await this.usersRepository.existsByEmailOrPublicName(
        dto.email,
        dto.publicName,
      );

    if (emailExists) {
      throw new ConflictException('This email is already in use');
    }

    if (publicNameExists) {
      throw new ConflictException('This public name is already taken');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    // Create user
    const user = await this.usersRepository.create({
      email: dto.email.toLowerCase(),
      password: hashedPassword,
      name: dto.name,
      publicName: dto.publicName,
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
      type: 'account.welcome' as NotificationType,
      title: 'Welcome to RYLA!',
      body: `You received ${freeCredits} free credits to get started.`,
      href: '/wizard/step-0',
      metadata: { freeCredits },
    });

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
   * Get current user by ID
   */
  public async getCurrentUser(userId: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return null;
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
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
   * Build auth response DTO
   */
  private buildAuthResponse(user: User, tokens: ITokenPair): AuthResponseDto {
    // Remove sensitive data
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }
}
