import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: text('id').primaryKey(),
	email: text('email').unique().notNull(),
	username: text('username').unique().notNull(),
	password: text('password').notNull(),
	fullname: text('fullname').notNull(),
	isEmailVerified: boolean('email_verified').notNull().default(false),
	twoFactorSecret: text('two_factor_secret')
});
export type UserSchema = typeof users.$inferSelect;

export const sessions = pgTable('sessions', {
	id: text('id').primaryKey(),
	fresh: boolean('fresh').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	expiresAt: timestamp('expires_at', {
		withTimezone: true,
		mode: 'date'
	}).notNull()
});
export type SessionSchema = typeof sessions.$inferSelect;

export const emailTokens = pgTable('email_verification_tokens', {
	id: text('id').primaryKey(),
	userid: text('user_id').unique().notNull(),
	email: text('string').notNull(),
	expiresAt: timestamp('expires_at', {
		withTimezone: true,
		mode: 'date'
	}).notNull()
});
export type EmailTokenSchema = typeof emailTokens.$inferSelect;

export const passwordResetTokens = pgTable('password_reset_tokens', {
	id: text('id').primaryKey(),
	userid: text('user_id').unique().notNull(),
	expiresAt: timestamp('expires_at', {
		withTimezone: true,
		mode: 'date'
	}).notNull()
});
export type PasswordResetTokens = typeof passwordResetTokens.$inferSelect;
