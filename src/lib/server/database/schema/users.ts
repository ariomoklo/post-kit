import { json, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const userlogs = pgTable('user-logs', {
	id: text('id').primaryKey(),
	userid: text('user_id').unique().notNull(),
	tags: json('tags').$type<string[]>().default([]),
	text: text('text').notNull(),
	timestamp: timestamp('createdAt').defaultNow()
});
