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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';

import { RegisterUserByEmailDto } from './dto/req/register-user-by-email.dto';
import { LoginUserDto } from './dto/req/login-user.dto';
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
  ) {}

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
