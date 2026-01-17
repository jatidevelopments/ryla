import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, or } from 'drizzle-orm';

import * as schema from '../schema';
import type { User, NewUser } from '../schema/users.schema';

export type { User, NewUser };

export class UsersRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) { }

  /**
   * Create a new user
   */
  async create(
    values: Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<User> {
    const [row] = await this.db
      .insert(schema.users)
      .values(values)
      .returning();

    return row;
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | undefined> {
    const [row] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);

    return row;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | undefined> {
    const [row] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email.toLowerCase()))
      .limit(1);

    return row;
  }

  /**
   * Find user by public name
   */
  async findByPublicName(publicName: string): Promise<User | undefined> {
    const [row] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.publicName, publicName))
      .limit(1);

    return row;
  }

  /**
   * Check if public name already exists
   */
  async existsByPublicName(publicName: string): Promise<boolean> {
    const user = await this.findByPublicName(publicName);
    return !!user;
  }

  /**
   * Check if email or public name already exists
   */
  async existsByEmailOrPublicName(
    email: string,
    publicName?: string
  ): Promise<{ emailExists: boolean; publicNameExists: boolean }> {
    const conditions = [eq(schema.users.email, email.toLowerCase())];
    
    if (publicName) {
      conditions.push(eq(schema.users.publicName, publicName));
    }

    const [existing] = await this.db
      .select({
        email: schema.users.email,
        publicName: schema.users.publicName,
      })
      .from(schema.users)
      .where(or(...conditions))
      .limit(1);

    return {
      emailExists: existing?.email?.toLowerCase() === email.toLowerCase(),
      publicNameExists: publicName ? existing?.publicName === publicName : false,
    };
  }

  /**
   * Update user by ID
   */
  async updateById(
    id: string,
    patch: Partial<Omit<NewUser, 'id' | 'createdAt'>>
  ): Promise<User | undefined> {
    const [row] = await this.db
      .update(schema.users)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();

    return row;
  }

  /**
   * Update user by email (for password reset, email verification, etc.)
   */
  async updateByEmail(
    email: string,
    patch: Partial<Omit<NewUser, 'id' | 'createdAt' | 'email'>>
  ): Promise<User | undefined> {
    const [row] = await this.db
      .update(schema.users)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(schema.users.email, email.toLowerCase()))
      .returning();

    return row;
  }

  /**
   * Set email as verified
   */
  async setEmailVerified(id: string): Promise<User | undefined> {
    return this.updateById(id, {
      isEmailVerified: true,
      emailVerificationToken: null,
    });
  }

  /**
   * Set password reset token
   */
  async setPasswordResetToken(
    email: string,
    token: string,
    expiresAt: Date
  ): Promise<User | undefined> {
    return this.updateByEmail(email, {
      passwordResetToken: token,
      passwordResetExpiresAt: expiresAt,
    });
  }

  /**
   * Clear password reset token
   */
  async clearPasswordResetToken(id: string): Promise<User | undefined> {
    return this.updateById(id, {
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    });
  }

  /**
   * Delete user by ID (hard delete)
   */
  async deleteById(id: string): Promise<boolean> {
    const [row] = await this.db
      .delete(schema.users)
      .where(eq(schema.users.id, id))
      .returning();

    return !!row;
  }

  /**
   * Ban/unban user
   */
  async setBanned(id: string, banned: boolean): Promise<User | undefined> {
    return this.updateById(id, { banned });
  }
}

