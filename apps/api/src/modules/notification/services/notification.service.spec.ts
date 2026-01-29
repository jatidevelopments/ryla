import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
  });

  describe('getUserNotifications', () => {
    it('should throw not implemented error', async () => {
      await expect(
        service.getUserNotifications('user-123', {} as any),
      ).rejects.toThrow('Not implemented - requires NotificationRepository');
    });
  });

  describe('markOneNotificationAsRead', () => {
    it('should throw not implemented error', async () => {
      await expect(
        service.markOneNotificationAsRead('user-123', 1),
      ).rejects.toThrow('Not implemented - requires NotificationRepository');
    });
  });

  describe('markAllUserNotificationsAsRead', () => {
    it('should throw not implemented error', async () => {
      await expect(
        service.markAllUserNotificationsAsRead('user-123'),
      ).rejects.toThrow('Not implemented - requires NotificationRepository');
    });
  });

  describe('sendNotification', () => {
    it('should throw not implemented error', async () => {
      await expect(
        service.sendNotification('user-123', 'Test message', 'info'),
      ).rejects.toThrow('Not implemented');
    });
  });
});
