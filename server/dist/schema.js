"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.games = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    username: (0, pg_core_1.text)('username').notNull().unique(),
    password: (0, pg_core_1.text)('password').notNull(),
    isGuestAccount: (0, pg_core_1.boolean)('is_guest_account').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.games = (0, pg_core_1.pgTable)('games', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    playerId: (0, pg_core_1.uuid)('player_id').references(() => exports.users.id),
    boardSize: (0, pg_core_1.integer)('board_size').notNull(),
    isWin: (0, pg_core_1.boolean)('is_win').notNull(),
    moves: (0, pg_core_1.integer)('moves').notNull(),
    duration: (0, pg_core_1.integer)('duration'), // in seconds
    winnerId: (0, pg_core_1.uuid)('winner_id').references(() => exports.users.id), // UUID of the winner
    playerXId: (0, pg_core_1.uuid)('player_x_id').references(() => exports.users.id).notNull(), // Player X UUID
    playerOId: (0, pg_core_1.uuid)('player_o_id').references(() => exports.users.id).notNull(), // Player O UUID
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
