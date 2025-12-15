import { ITokenPair } from '../../interfaces/token-pair.interface';

export class AuthResponseDto {
  user!: any; // TODO: Replace with UserEntity when available
  tokens!: ITokenPair;
}

