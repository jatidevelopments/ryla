import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, desc, eq, sql } from 'drizzle-orm';

import * as schema from '../schema';
import type { NewNotification, Notification } from '../schema/notifications.schema';

export class NotificationsRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async create(
    values: Omit<
      NewNotification,
      'id' | 'createdAt' | 'isRead' | 'readAt'
    > & {
      isRead?: boolean;
      readAt?: Date | null;
    }
  ): Promise<Notification> {
    const [row] = await this.db
      .insert(schema.notifications)
      .values({
        ...values,
        isRead: values.isRead ?? false,
        readAt: values.readAt ?? null,
      })
      .returning();

    return row;
  }

  async listByUserId(input: {
    userId: string;
    limit: number;
    offset: number;
  }): Promise<{ items: Notification[]; total: number; unreadCount: number }> {
    const items = await this.db.query.notifications.findMany({
      where: eq(schema.notifications.userId, input.userId),
      orderBy: desc(schema.notifications.createdAt),
      limit: input.limit,
      offset: input.offset,
    });

    const [countResult] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.notifications)
      .where(eq(schema.notifications.userId, input.userId));

    const [unreadResult] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.notifications)
      .where(
        and(
          eq(schema.notifications.userId, input.userId),
          eq(schema.notifications.isRead, false)
        )
      );

    return {
      items,
      total: Number(countResult?.count ?? 0),
      unreadCount: Number(unreadResult?.count ?? 0),
    };
  }

  async markAsRead(input: {
    userId: string;
    notificationId: string;
  }): Promise<boolean> {
    const result = await this.db
      .update(schema.notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(
          eq(schema.notifications.id, input.notificationId),
          eq(schema.notifications.userId, input.userId)
        )
      );

    return (result.rowCount ?? 0) > 0;
  }

  async markAllAsRead(input: { userId: string }): Promise<number> {
    const result = await this.db
      .update(schema.notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(
          eq(schema.notifications.userId, input.userId),
          eq(schema.notifications.isRead, false)
        )
      );

    return result.rowCount ?? 0;
  }
}


