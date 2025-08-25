#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';

import { seed } from 'drizzle-seed';

import { db } from '@/graphql/lib/providers/database/connection';
import * as roleSchema from '@/graphql/repositories/roles/schema';
import * as userSchema from '@/graphql/repositories/users/schema';

// Import JSON data
const usersData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/users.json'), 'utf-8'));
const rolesData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/roles.json'), 'utf-8'));

async function main() {
  console.log('🌱 Starting database seeding from JSON files...');

  try {
    // Check if data already exists
    const existingUsers = await db.select().from(userSchema.users).limit(1);
    const existingRoles = await db.select().from(roleSchema.roles).limit(1);

    if (existingUsers.length > 0 || existingRoles.length > 0) {
      console.log('⚠️  Database already contains data!');
      console.log('💡 To import fresh data from JSON, first reset the database:');
      console.log('   npm run db:reset');
      console.log('');
      console.log('💡 Or generate fake data instead:');
      console.log('   npm run db:seed');
      return;
    }

    // Seed users from JSON data
    console.log('📝 Seeding users from JSON...');
    await seed(db, { users: userSchema.users }).refine((f) => ({
      users: {
        count: usersData.length,
        columns: {
          name: f.valuesFromArray({ values: usersData.map((u: any) => u.name) }),
          email: f.valuesFromArray({ values: usersData.map((u: any) => u.email) }),
          createdAt: f.valuesFromArray({
            values: usersData.map((u: any) => new Date(u.createdAt)),
          }),
          updatedAt: f.valuesFromArray({
            values: usersData.map((u: any) => new Date(u.updatedAt)),
          }),
        },
      },
    }));

    // Seed roles from JSON data
    console.log('🎭 Seeding roles from JSON...');
    await seed(db, { roles: roleSchema.roles }).refine((f) => ({
      roles: {
        count: rolesData.length,
        columns: {
          name: f.valuesFromArray({ values: rolesData.map((r: any) => r.name) }),
          description: f.valuesFromArray({
            values: rolesData.map((r: any) => r.description || 'Role description'),
          }),
          createdAt: f.valuesFromArray({
            values: rolesData.map((r: any) => new Date(r.createdAt)),
          }),
          updatedAt: f.valuesFromArray({
            values: rolesData.map((r: any) => new Date(r.updatedAt)),
          }),
        },
      },
    }));

    console.log('✅ Database seeding from JSON completed successfully!');
    console.log('📊 Seeded data:');
    console.log(`   - ${usersData.length} users`);
    console.log(`   - ${rolesData.length} roles`);
    console.log('');
    console.log('💡 Note: User-role relationships are not seeded due to foreign key constraints.');
    console.log('   This is a known limitation with drizzle-seed for complex relationships.');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

main();
