import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { Config } from '../../config/config.type';
import { RedisModule } from '../redis/redis.module';
import { MailModule } from '../mail/mail.module';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { AuthCacheService } from './services/auth-cache.service';
import { TokenService } from './services/token.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Config>) => {
        const jwtConfig = configService.get('jwt');
        return {
          secret: jwtConfig?.accessSecret || 'secret',
          signOptions: {
            expiresIn: jwtConfig?.accessExpiresIn || 3600,
          },
        };
      },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    RedisModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    TokenService,
    AuthCacheService,
    AuthService,
    JwtStrategy,
  ],
  exports: [
    TokenService,
    AuthCacheService,
    AuthService,
    PassportModule,
  ],
})
export class AuthModule { }

