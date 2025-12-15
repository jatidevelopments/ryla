// Placeholder UserService - to be fully implemented when repositories are available
import { Injectable, ConflictException } from '@nestjs/common';
import { AuthCacheService } from '../../auth/services/auth-cache.service';
// TODO: Import when available
// import { UserRepository } from '../../repository/services/user.repository';

@Injectable()
export class UserService {
  constructor(
    // TODO: Add UserRepository when available
    // private readonly userRepository: UserRepository,
    private readonly authCacheService: AuthCacheService,
  ) {}

  // TODO: Implement when UserRepository is available
  public async isEmailExistOrThrow(email: string): Promise<void> {
    // const user = await this.userRepository.findOne({ where: { email } });
    // if (user) {
    //   throw new ConflictException('This email is already in use');
    // }
    throw new Error('Not implemented - requires UserRepository');
  }

  // TODO: Implement when UserRepository is available
  public async isPublicNameExistOrThrow(publicName: string): Promise<void> {
    // const user = await this.userRepository.findOne({ where: { publicName } });
    // if (user) {
    //   throw new ConflictException('This public name already exists');
    // }
    throw new Error('Not implemented - requires UserRepository');
  }

  // TODO: Add more user management methods
}

