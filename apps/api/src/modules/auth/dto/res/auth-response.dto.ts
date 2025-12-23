import { ITokenPair } from '../../interfaces/token-pair.interface';

export interface AuthUserDto {
  id: string;
  email: string;
  name: string;
  publicName: string;
  role: string | null;
  isEmailVerified: boolean | null;
  banned: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class AuthResponseDto {
  user!: AuthUserDto;
  tokens!: ITokenPair;
}

