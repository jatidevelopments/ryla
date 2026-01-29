import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationController } from './notification.controller';
import { NotificationService } from './services/notification.service';
import { IJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { PageOptionsDto } from '../../common/dto/page-options.dto';

describe('NotificationController', () => {
  let controller: NotificationController;
  let mockNotificationService: NotificationService;
  let mockUser: IJwtPayload;

  beforeEach(() => {
    mockUser = {
      userId: 'user-123',
      email: 'test@example.com',
    } as IJwtPayload;

    mockNotificationService = {
      getUserNotifications: vi.fn(),
      markOneNotificationAsRead: vi.fn(),
      markAllUserNotificationsAsRead: vi.fn(),
    } as unknown as NotificationService;

    controller = new NotificationController(mockNotificationService);
  });

  describe('getNotifications', () => {
    it('should get user notifications', async () => {
      const pageOptions = new PageOptionsDto();
      const mockNotifications = { data: [], meta: {} };
      vi.mocked(mockNotificationService.getUserNotifications).mockResolvedValue(
        mockNotifications as any,
      );

      const result = await controller.getNotifications(mockUser, pageOptions);

      expect(result).toEqual(mockNotifications);
      expect(mockNotificationService.getUserNotifications).toHaveBeenCalledWith(
        'user-123',
        pageOptions,
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      vi.mocked(mockNotificationService.markOneNotificationAsRead).mockResolvedValue(undefined);

      await controller.markAsRead(mockUser, 1);

      expect(mockNotificationService.markOneNotificationAsRead).toHaveBeenCalledWith(
        'user-123',
        1,
      );
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      vi.mocked(mockNotificationService.markAllUserNotificationsAsRead).mockResolvedValue(
        undefined,
      );

      await controller.markAllAsRead(mockUser);

      expect(mockNotificationService.markAllUserNotificationsAsRead).toHaveBeenCalledWith(
        'user-123',
      );
    });
  });
});
