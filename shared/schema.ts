import { pgTable, serial, text, varchar, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// User Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).unique().notNull(),
  email: varchar('email', { length: 100 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  displayName: varchar('display_name', { length: 100 }),
  avatar: text('avatar'),
  role: varchar('role', { length: 20 }).notNull().default('user'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastLogin: timestamp('last_login'),
  isActive: boolean('is_active').default(true).notNull()
});

// User Session Table
export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent')
});

// Define insert schemas with zod
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, passwordHash: true, createdAt: true, updatedAt: true, lastLogin: true })
  .extend({
    password: z.string().min(8, 'Password must be at least 8 characters long')
  });

export const insertSessionSchema = createInsertSchema(sessions)
  .omit({ id: true, createdAt: true });

// Define types based on the schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;