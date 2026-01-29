import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserController } from './user.controller';
import { UserService } from './services/user.service';
import { IJwtPayload } from '../auth/interfaces/jwt-payload.interface';

describe('UserController', () => {
  let controller: UserController;
  let mockUserService: UserService;
  let mockUser: IJwtPayload;

  beforeEach(() => {
    mockUser = {
      userId: 'user-123',
      email: 'test@example.com',
    } as IJwtPayload;

    mockUserService = {
      getUserProfile: vi.fn(),
      updateProfile: vi.fn(),
      updateSettings: vi.fn(),
      deleteAccount: vi.fn(),
    } as unknown as UserService;

    controller = new UserController(mockUserService);
  });

  describe('getCurrentUser', () => {
    it('should return current user profile', async () => {
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };
      vi.mocked(mockUserService.getUserProfile).mockResolvedValue(mockProfile as any);

      const result = await controller.getCurrentUser(mockUser);

      expect(result).toEqual({ user: mockProfile });
      expect(mockUserService.getUserProfile).toHaveBeenCalledWith('user-123');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updates = { name: 'New Name', publicName: 'newname' };
      const updatedProfile = {
        id: 'user-123',
        name: 'New Name',
        publicName: 'newname',
      };
      vi.mocked(mockUserService.updateProfile).mockResolvedValue(updatedProfile as any);

      const result = await controller.updateProfile(mockUser, updates);

      expect(result).toEqual({ user: updatedProfile });
      expect(mockUserService.updateProfile).toHaveBeenCalledWith('user-123', updates);
    });
  });

  describe('updateSettings', () => {
    it('should update user settings', async () => {
      const settings = '{"theme":"dark"}';
      vi.mocked(mockUserService.updateSettings).mockResolvedValue(undefined);

      const result = await controller.updateSettings(mockUser, settings);

      expect(result).toEqual({ success: true });
      expect(mockUserService.updateSettings).toHaveBeenCalledWith('user-123', settings);
    });
  });

  describe('deleteAccount', () => {
    it('should delete user account', async () => {
      vi.mocked(mockUserService.deleteAccount).mockResolvedValue(undefined);

      await controller.deleteAccount(mockUser);

      expect(mockUserService.deleteAccount).toHaveBeenCalledWith('user-123');
    });
  });
});
