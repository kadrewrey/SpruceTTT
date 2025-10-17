import { pgTable, text, timestamp, integer, boolean, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: text('username').notNull().unique(),
  nickname: text('nickname').notNull(),
  password: text('password').notNull(),
  isGuestAccount: boolean('is_guest_account').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const games = pgTable('games', {
  id: uuid('id').primaryKey().defaultRandom(),
  playerId: uuid('player_id').references(() => users.id),
  boardSize: integer('board_size').notNull(),
  isWin: boolean('is_win').notNull(),
  moves: integer('moves').notNull(),
  duration: integer('duration'), // in seconds
  winnerId: uuid('winner_id').references(() => users.id), // UUID of the winner
  playerXId: uuid('player_x_id').references(() => users.id).notNull(), // Player X UUID
  playerOId: uuid('player_o_id').references(() => users.id).notNull(), // Player O UUID
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;