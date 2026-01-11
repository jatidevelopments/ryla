import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { AuthCacheService } from '../../auth/services/auth-cache.service';
import { UsersRepository, User } from '@ryla/data';
import * as schema from '@ryla/data/schema';

@Injectable()
export class UserService {
  private readonly usersRepository: UsersRepository;

  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<typeof schema>,
    @Inject(AuthCacheService)
    private readonly authCacheService: AuthCacheService,
  ) {
    this.usersRepository = new UsersRepository(this.db);
  }

  /**
   * Check if email exists, throw if it does
   */
  public async isEmailExistOrThrow(email: string): Promise<void> {
    const user = await this.usersRepository.findByEmail(email);
    if (user) {
      throw new ConflictException('This email is already in use');
    }
  }

  /**
   * Check if public name exists, throw if it does
   */
  public async isPublicNameExistOrThrow(publicName: string): Promise<void> {
    const user = await this.usersRepository.findByPublicName(publicName);
    if (user) {
      throw new ConflictException('This public name already exists');
    }
  }

  /**
   * Get user by ID
   */
  public async getUserById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Get user by email
   */
  public async getUserByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Get user profile (without sensitive data)
   */
  public async getUserProfile(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.getUserById(id);
    const { password: _password, ...profile } = user;
    return profile;
  }

  /**
   * Update user profile
   */
  public async updateProfile(
    id: string,
    updates: { name?: string; publicName?: string },
  ): Promise<Omit<User, 'password'>> {
    // If updating publicName, check it doesn't exist
    if (updates.publicName) {
      const existing = await this.usersRepository.findByPublicName(
        updates.publicName,
      );
      if (existing && existing.id !== id) {
        throw new ConflictException('This public name already exists');
      }
    }

    const user = await this.usersRepository.updateById(id, updates);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password: _password, ...profile } = user;
    return profile;
  }

  /**
   * Update user settings (JSON string)
   */
  public async updateSettings(id: string, settings: string): Promise<void> {
    const user = await this.usersRepository.updateById(id, { settings });
    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  /**
   * Ban a user
   */
  public async banUser(id: string): Promise<void> {
    const user = await this.usersRepository.setBanned(id, true);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Invalidate all tokens
    await this.authCacheService.deleteAllUserTokens(id);
  }

  /**
   * Unban a user
   */
  public async unbanUser(id: string): Promise<void> {
    const user = await this.usersRepository.setBanned(id, false);
    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  /**
   * Delete user account
   */
  public async deleteAccount(id: string): Promise<void> {
    // Invalidate all tokens first
    await this.authCacheService.deleteAllUserTokens(id);

    const deleted = await this.usersRepository.deleteById(id);
    if (!deleted) {
      throw new NotFoundException('User not found');
    }
  }
}
