/**
 * Notification Tools
 *
 * Tools for managing in-app notifications:
 * - List notifications
 * - Mark as read
 */

import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { apiCall } from '../api-client.js';

export function registerNotificationTools(server: FastMCP) {
  /**
   * List notifications
   */
  server.addTool({
    name: 'ryla_notifications_list',
    description: 'Get user notifications with pagination. Useful for debugging notification delivery.',
    parameters: z.object({
      page: z.number().min(1).default(1).describe('Page number'),
      take: z.number().min(1).max(100).default(20).describe('Items per page'),
      order: z.enum(['ASC', 'DESC']).default('DESC').describe('Sort order'),
    }),
    execute: async (args) => {
      try {
        const params = new URLSearchParams();
        params.set('page', String(args.page));
        params.set('take', String(args.take));
        params.set('order', args.order);

        const result = await apiCall<{
          data: Array<{
            id: number;
            type: string;
            title: string;
            body: string;
            isRead: boolean;
            href: string | null;
            createdAt: string;
          }>;
          meta: {
            page: number;
            take: number;
            itemCount: number;
            pageCount: number;
          };
        }>(`/notifications?${params.toString()}`);

        return JSON.stringify(
          {
            success: true,
            notifications: result.data,
            pagination: result.meta,
          },
          null,
          2
        );
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });

  /**
   * Mark notification as read
   */
  server.addTool({
    name: 'ryla_notification_read',
    description: 'Mark a specific notification as read.',
    parameters: z.object({
      notificationId: z.number().describe('Notification ID (integer)'),
    }),
    execute: async (args) => {
      try {
        await apiCall(`/notifications/${args.notificationId}/read`, {
          method: 'POST',
        });

        return JSON.stringify({
          success: true,
          message: `Notification ${args.notificationId} marked as read`,
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });

  /**
   * Mark all notifications as read
   */
  server.addTool({
    name: 'ryla_notifications_read_all',
    description: 'Mark all notifications as read.',
    parameters: z.object({}),
    execute: async () => {
      try {
        await apiCall('/notifications/read-all', { method: 'POST' });

        return JSON.stringify({
          success: true,
          message: 'All notifications marked as read',
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });
}

