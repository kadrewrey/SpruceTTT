import { pgTable, text, timestamp, integer, boolean, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: text('username').notNull().unique(),
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
  winner: text('winner'), // name of the winner
  playerX: text('player_x'), // Player X name
  playerO: text('player_o'), // Player O name
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;