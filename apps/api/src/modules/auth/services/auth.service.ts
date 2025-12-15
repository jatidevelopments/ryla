// Placeholder AuthService - to be fully implemented when UserRepository is available
import { Injectable } from '@nestjs/common';
import { TokenService } from './token.service';
import { AuthCacheService } from './auth-cache.service';
import { RegisterUserByEmailDto } from '../dto/req/register-user-by-email.dto';
import { LoginUserDto } from '../dto/req/login-user.dto';
import { AuthResponseDto } from '../dto/res/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly authCacheService: AuthCacheService,
    // TODO: Add UserRepository, MailService, etc. when available
  ) {}

  // TODO: Implement when UserRepository is available
  public async registerUserByEmail(
    dto: RegisterUserByEmailDto,
    userAgent: string,
    normalizedIp: string,
  ): Promise<AuthResponseDto> {
    throw new Error('Not implemented - requires UserRepository');
  }

  // TODO: Implement when UserRepository is available
  public async loginUser(
    dto: LoginUserDto,
    userAgent: string,
    normalizedIp: string,
  ): Promise<AuthResponseDto> {
    throw new Error('Not implemented - requires UserRepository');
  }
}

