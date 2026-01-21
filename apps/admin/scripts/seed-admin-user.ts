/**
 * Seed Script: Create First Admin User
 * 
 * Run this script to create the first admin user in the database.
 * Usage: tsx apps/admin/scripts/seed-admin-user.ts
 */

import bcrypt from 'bcryptjs';
import { createDrizzleDb, adminUsers, ROLE_PERMISSIONS } from '@ryla/data';

function getDbConfig() {
  const env = process.env['POSTGRES_ENVIRONMENT'] || process.env['NODE_ENV'] || 'development';
  const isLocal = env === 'local' || env === 'development';
  const isProduction = env === 'production';

  return {
    host: process.env['POSTGRES_HOST'] || 'localhost',
    port: Number(process.env['POSTGRES_PORT']) || 5432,
    user: process.env['POSTGRES_USER'] || 'ryla',
    password: process.env['POSTGRES_PASSWORD'] || 'ryla_local_dev',
    database: process.env['POSTGRES_DB'] || 'ryla',
    ssl: isLocal ? false : isProduction ? { rejectUnauthorized: false } : false,
  };
}

async function seedAdminUser() {
  const db = createDrizzleDb(getDbConfig());

  const email = process.env.ADMIN_EMAIL || 'admin@ryla.ai';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const name = process.env.ADMIN_NAME || 'Admin User';
  const role = (process.env.ADMIN_ROLE || 'super_admin') as 'super_admin' | 'billing_admin' | 'support_admin' | 'content_admin' | 'viewer';

  // Check if admin already exists
  const existing = await db.query.adminUsers.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });

  if (existing) {
    console.log(`❌ Admin user with email ${email} already exists.`);
    process.exit(1);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Get permissions for role
  const permissions = ROLE_PERMISSIONS[role] || [];

  // Create admin user
  const [admin] = await db
    .insert(adminUsers)
    .values({
      email,
      passwordHash,
      name,
      role,
      permissions: permissions as any,
      isActive: true,
    })
    .returning();

  console.log('✅ Admin user created successfully!');
  console.log(`   Email: ${admin.email}`);
  console.log(`   Name: ${admin.name}`);
  console.log(`   Role: ${admin.role}`);
  console.log(`   ID: ${admin.id}`);
  console.log('');
  console.log('⚠️  Please change the default password after first login!');
}

seedAdminUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error seeding admin user:', error);
    process.exit(1);
  });
