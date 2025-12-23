import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { Config, JwtConfig } from '../../../config/config.type';
// TODO: Import UserRepository when available
// import { UserRepository } from '../../repository/services/user.repository';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService<Config>,
    // TODO: Uncomment when UserRepository is available
    // private readonly userRepository: UserRepository,
  ) {
    const extractJwtFromCookie = (req: any) => {
      let token = null;
      if (req && req.cookies) {
        token = req.cookies['access_token'];
      }
      return token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    };
    const jwtConfig = configService.get<JwtConfig>('jwt');
    if (!jwtConfig) {
      throw new Error('JWT config not found');
    }
    super({
      ignoreExpiration: false,
      secretOrKey: jwtConfig.accessSecret,
      jwtFromRequest: extractJwtFromCookie,
    });
  }

  async validate(payload: IJwtPayload) {
    // TODO: Uncomment when UserRepository is available
    // const user = await this.userRepository.findOne({
    //   where: { id: payload.userId },
    // });
    // if (!user) throw new UnauthorizedException('Please log in to continue');

    return {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
      deviceId: payload.deviceId,
    };
  }
}

