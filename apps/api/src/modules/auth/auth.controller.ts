import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
  Inject,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';

import { RegisterUserByEmailDto } from './dto/req/register-user-by-email.dto';
import { LoginUserDto } from './dto/req/login-user.dto';
import { ForgotPasswordDto } from './dto/req/forgot-password.dto';
import { ResetPasswordDto } from './dto/req/reset-password.dto';
import { ChangePasswordDto } from './dto/req/change-password.dto';
import { AuthResponseDto } from './dto/res/auth-response.dto';
import { AuthService } from './services/auth.service';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { SkipAuth } from './decorators/skip-auth.decorator';
import { IJwtPayload } from './interfaces/jwt-payload.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
   
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
  ) { }

  @Post('register')
  @SkipAuth()
  @ApiOperation({ summary: 'Register new user' })
  public async registerUserByEmail(
    @Body() dto: RegisterUserByEmailDto,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    const userAgent = req.get('User-Agent') || '';
    const ip = this.getClientIp(req);
    return await this.authService.registerUserByEmail(dto, userAgent, ip);
  }

  @Post('login')
  @SkipAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  public async loginUser(
    @Body() dto: LoginUserDto,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    const userAgent = req.get('User-Agent') || '';
    const ip = this.getClientIp(req);
    return await this.authService.loginUser(dto, userAgent, ip);
  }

  @Post('refresh')
  @SkipAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  public async refreshTokens(
    @Body('refreshToken') refreshToken: string,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    const userAgent = req.get('User-Agent') || '';
    const ip = this.getClientIp(req);
    return await this.authService.refreshTokens(refreshToken, userAgent, ip);
  }

  @Post('logout')
  @UseGuards(JwtAccessGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout current device' })
  public async logout(@CurrentUser() user: IJwtPayload): Promise<void> {
    await this.authService.logout(user.userId, user.deviceId);
  }

  @Post('logout-all')
  @UseGuards(JwtAccessGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout all devices' })
  public async logoutAll(@CurrentUser() user: IJwtPayload): Promise<void> {
    await this.authService.logoutAll(user.userId);
  }

  @Get('me')
  @UseGuards(JwtAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  public async getCurrentUser(@CurrentUser() user: IJwtPayload) {
    const currentUser = await this.authService.getCurrentUser(user.userId);
    return { user: currentUser };
  }

  @Post('forgot-password')
  @SkipAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  public async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
    await this.authService.requestPasswordReset(dto);
    // Always return success (security: don't reveal if email exists)
    return { message: 'If an account exists with this email, a password reset link has been sent.' };
  }

  @Post('reset-password')
  @SkipAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  public async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    await this.authService.resetPassword(dto);
    return { message: 'Password has been reset successfully' };
  }

  @Post('change-password')
  @UseGuards(JwtAccessGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update password for authenticated user' })
  public async changePassword(
    @CurrentUser() user: IJwtPayload,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.changePassword(user.userId, dto);
    return { message: 'Password has been updated successfully' };
  }

  @Get('check-email')
  @SkipAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check if email exists' })
  @ApiQuery({ name: 'email', type: String, description: 'Email address to check' })
  public async checkEmail(
    @Query('email') email: string,
  ): Promise<{ exists: boolean }> {
    if (!email) {
      throw new BadRequestException('Email parameter is required');
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email format');
    }

    const exists = await this.authService.checkEmailExists(email);
    return { exists };
  }

  @Post('dev-token')
  @SkipAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate long-lived dev token for MCP/development tools',
    description: 'Creates a token that expires in 10 years instead of 1 hour. Use this for MCP servers and development tools that need persistent authentication.'
  })
  public async generateDevToken(
    @Body() dto: LoginUserDto,
    @Req() req: Request,
  ): Promise<{ accessToken: string; user: Omit<import('@ryla/data').User, 'password'> }> {
    const userAgent = req.get('User-Agent') || '';
    const ip = this.getClientIp(req);
    return await this.authService.generateDevToken(dto, userAgent, ip);
  }

  /**
   * Extract client IP from request
   */
  private getClientIp(req: Request): string {
    const forwarded = req.get('X-Forwarded-For');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    return req.ip || req.socket?.remoteAddress || '';
  }
}
