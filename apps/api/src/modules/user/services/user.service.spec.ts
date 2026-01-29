import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from './user.service';
import { AuthCacheService } from '../../auth/services/auth-cache.service';
import { UsersRepository } from '@ryla/data';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UserService', () => {
    let service: UserService;
  let mockDb: any;
  let mockAuthCacheService: AuthCacheService;
  let mockUsersRepository: UsersRepository;

  beforeEach(() => {
    mockDb = {};
    mockAuthCacheService = {
      deleteAllUserTokens: vi.fn(),
    } as unknown as AuthCacheService;
    mockUsersRepository = {
      findByEmail: vi.fn(),
      findByPublicName: vi.fn(),
      findById: vi.fn(),
      updateById: vi.fn(),
      setBanned: vi.fn(),
      deleteById: vi.fn(),
    } as unknown as UsersRepository;

    service = new UserService(mockDb, mockAuthCacheService);
    // Replace the repository instance created in constructor
    (service as any).usersRepository = mockUsersRepository;
  });

  describe('isEmailExistOrThrow', () => {
    it('should not throw when email does not exist', async () => {
      vi.mocked(mockUsersRepository.findByEmail).mockResolvedValue(null);

      await expect(service.isEmailExistOrThrow('test@example.com')).resolves.not.toThrow();
    });

    it('should throw ConflictException when email exists', async () => {
      vi.mocked(mockUsersRepository.findByEmail).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
      } as any);

      await expect(service.isEmailExistOrThrow('test@example.com')).rejects.toThrow(
        ConflictException,
      );
        });
    });

    describe('isPublicNameExistOrThrow', () => {
    it('should not throw when public name does not exist', async () => {
      vi.mocked(mockUsersRepository.findByPublicName).mockResolvedValue(null);

      await expect(service.isPublicNameExistOrThrow('testuser')).resolves.not.toThrow();
    });

    it('should throw ConflictException when public name exists', async () => {
      vi.mocked(mockUsersRepository.findByPublicName).mockResolvedValue({
        id: 'user-1',
        publicName: 'testuser',
      } as any);

      await expect(service.isPublicNameExistOrThrow('testuser')).rejects.toThrow(
        ConflictException,
      );
    });
    });

    describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      vi.mocked(mockUsersRepository.findById).mockResolvedValue(mockUser as any);

      const result = await service.getUserById('user-1');

      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.findById).toHaveBeenCalledWith('user-1');
    });

    it('should throw NotFoundException when user not found', async () => {
      vi.mocked(mockUsersRepository.findById).mockResolvedValue(null);

      await expect(service.getUserById('user-1')).rejects.toThrow(NotFoundException);
    });
    });

    describe('getUserByEmail', () => {
    it('should return user when found', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      vi.mocked(mockUsersRepository.findByEmail).mockResolvedValue(mockUser as any);

      const result = await service.getUserByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw NotFoundException when user not found', async () => {
      vi.mocked(mockUsersRepository.findByEmail).mockResolvedValue(null);

      await expect(service.getUserByEmail('test@example.com')).rejects.toThrow(
        NotFoundException,
      );
    });
    });

    describe('getUserProfile', () => {
    it('should return user profile without password', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed-password',
      };
      vi.mocked(mockUsersRepository.findById).mockResolvedValue(mockUser as any);

      const result = await service.getUserProfile('user-1');

      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('id', 'user-1');
      expect(result).toHaveProperty('email', 'test@example.com');
    });
    });

    describe('updateProfile', () => {
    it('should update user profile', async () => {
      const mockUser = { id: 'user-1', name: 'Old Name', publicName: 'oldname' };
      const updatedUser = { id: 'user-1', name: 'New Name', publicName: 'newname', password: 'hash' };
      vi.mocked(mockUsersRepository.updateById).mockResolvedValue(updatedUser as any);

      const result = await service.updateProfile('user-1', {
        name: 'New Name',
        publicName: 'newname',
      });

      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('name', 'New Name');
      expect(mockUsersRepository.updateById).toHaveBeenCalled();
    });

    it('should check publicName availability when updating', async () => {
      const updatedUser = { id: 'user-1', name: 'New Name', publicName: 'newname', password: 'hash' };
      vi.mocked(mockUsersRepository.findByPublicName).mockResolvedValue(null);
      vi.mocked(mockUsersRepository.updateById).mockResolvedValue(updatedUser as any);

      await service.updateProfile('user-1', {
        publicName: 'newname',
      });

      expect(mockUsersRepository.findByPublicName).toHaveBeenCalledWith('newname');
    });

    it('should throw ConflictException when publicName already exists', async () => {
      vi.mocked(mockUsersRepository.findByPublicName).mockResolvedValue({
        id: 'other-user',
        publicName: 'taken',
      } as any);

      await expect(
        service.updateProfile('user-1', { publicName: 'taken' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when user not found', async () => {
      vi.mocked(mockUsersRepository.updateById).mockResolvedValue(null);

      await expect(
        service.updateProfile('user-1', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateSettings', () => {
    it('should update user settings', async () => {
      const updatedUser = { id: 'user-1', settings: '{"theme":"dark"}' };
      vi.mocked(mockUsersRepository.updateById).mockResolvedValue(updatedUser as any);

      await service.updateSettings('user-1', '{"theme":"dark"}');

      expect(mockUsersRepository.updateById).toHaveBeenCalledWith('user-1', {
        settings: '{"theme":"dark"}',
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      vi.mocked(mockUsersRepository.updateById).mockResolvedValue(null);

      await expect(service.updateSettings('user-1', '{}')).rejects.toThrow(
        NotFoundException,
      );
        });
    });

  describe('banUser', () => {
    it('should ban user', async () => {
      const bannedUser = { id: 'user-1', banned: true };
      vi.mocked(mockUsersRepository.setBanned).mockResolvedValue(bannedUser as any);
      vi.mocked(mockAuthCacheService.deleteAllUserTokens).mockResolvedValue(undefined);

      await service.banUser('user-1');

      expect(mockUsersRepository.setBanned).toHaveBeenCalledWith('user-1', true);
      expect(mockAuthCacheService.deleteAllUserTokens).toHaveBeenCalledWith('user-1');
    });

    it('should throw NotFoundException when user not found', async () => {
      vi.mocked(mockUsersRepository.setBanned).mockResolvedValue(null);

      await expect(service.banUser('user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('unbanUser', () => {
    it('should unban user', async () => {
      const unbannedUser = { id: 'user-1', banned: false };
      vi.mocked(mockUsersRepository.setBanned).mockResolvedValue(unbannedUser as any);

      await service.unbanUser('user-1');

      expect(mockUsersRepository.setBanned).toHaveBeenCalledWith('user-1', false);
    });

    it('should throw NotFoundException when user not found', async () => {
      vi.mocked(mockUsersRepository.setBanned).mockResolvedValue(null);

      await expect(service.unbanUser('user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteAccount', () => {
    it('should delete user account', async () => {
      vi.mocked(mockAuthCacheService.deleteAllUserTokens).mockResolvedValue(undefined);
      vi.mocked(mockUsersRepository.deleteById).mockResolvedValue(true);

      await service.deleteAccount('user-1');

      expect(mockAuthCacheService.deleteAllUserTokens).toHaveBeenCalledWith('user-1');
      expect(mockUsersRepository.deleteById).toHaveBeenCalledWith('user-1');
    });

    it('should throw NotFoundException when user not found', async () => {
      vi.mocked(mockAuthCacheService.deleteAllUserTokens).mockResolvedValue(undefined);
      vi.mocked(mockUsersRepository.deleteById).mockResolvedValue(false);

      await expect(service.deleteAccount('user-1')).rejects.toThrow(NotFoundException);
    });
  });
});
