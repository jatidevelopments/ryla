import { forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { Config, JwtConfig } from '../../../config/config.type';
import { IJwtActionTokenPayload } from '../interfaces/jwt-action-token-payload.interface';
import { ActionTokenType } from '../enums/action-token.type';
import { TokenType } from '../enums/token-type.enum';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';
import { ITokenPair } from '../interfaces/token-pair.interface';

@Injectable()
export class TokenService {
  private readonly jwtConfig: JwtConfig;

  constructor(
    @Inject(forwardRef(() => JwtService)) private readonly jwtService: JwtService,
    @Inject(ConfigService) private readonly configService: ConfigService<Config>,
  ) {
    const config = this.configService.get<JwtConfig>('jwt');
    if (!config) {
      throw new Error('JWT config not found');
    }
    this.jwtConfig = config;
  }

  public async generateAuthTokens(payload: IJwtPayload): Promise<ITokenPair> {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtConfig.accessSecret,
      expiresIn: this.jwtConfig.accessExpiresIn,
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtConfig.refreshSecret,
      expiresIn: this.jwtConfig.refreshExpiresIn,
    });

    return { accessToken, refreshToken };
  }

  public async generateActionToken(
    payload: IJwtActionTokenPayload,
    type: ActionTokenType,
  ): Promise<string> {
    let secret: string;
    let expiresIn: number;
    switch (type) {
      case ActionTokenType.FORGOT_PASSWORD:
        secret = this.jwtConfig.actionForgotPasswordSecret;
        expiresIn = this.jwtConfig.actionForgotPasswordExpiresIn;
        break;
      default:
        throw new UnauthorizedException();
    }
    return await this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    });
  }

  public async verifyToken(
    token: string,
    type: TokenType,
  ): Promise<IJwtPayload> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.getSecret(type),
      });
    } catch (_error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  public async verifyActionToken(
    token: string,
    type: ActionTokenType,
  ): Promise<IJwtPayload> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.getActionSecret(type),
      });
    } catch (_error) {
      throw new UnauthorizedException(
        'Incorrect magic_token. Please request another one.',
      );
    }
  }

  private getActionSecret(type: ActionTokenType): string {
    let secret: string;
    switch (type) {
      case ActionTokenType.FORGOT_PASSWORD:
        secret = this.jwtConfig.actionForgotPasswordSecret;
        break;
      default:
        throw new UnauthorizedException('Unknown token type');
    }
    return secret;
  }

  /**
   * Generate a long-lived dev token (10 years) for MCP/development use
   * This bypasses the normal expiration for development tools
   */
  public async generateDevToken(payload: IJwtPayload): Promise<string> {
    // 10 years in seconds (315360000 seconds)
    const tenYearsInSeconds = 10 * 365 * 24 * 60 * 60;

    return await this.jwtService.signAsync(payload, {
      secret: this.jwtConfig.accessSecret,
      expiresIn: tenYearsInSeconds,
    });
  }

  private getSecret(type: TokenType): string {
    let secret: string;
    switch (type) {
      case TokenType.ACCESS:
        secret = this.jwtConfig.accessSecret;
        break;
      case TokenType.REFRESH:
        secret = this.jwtConfig.refreshSecret;
        break;
      default:
        throw new UnauthorizedException('Unknown token type');
    }
    return secret;
  }
}

