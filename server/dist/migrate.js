"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrate = migrate;
require("dotenv/config");
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
async function migrate() {
    console.log('Starting database migration...');
    try {
        // Check current schema to understand what we're working with
        const currentGameColumns = await db_1.db.execute((0, drizzle_orm_1.sql) `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'games'
      ORDER BY ordinal_position
    `);
        console.log('Current games table columns:');
        console.log(currentGameColumns.rows);
        // Check if we have the old text-based columns
        const hasTextColumns = currentGameColumns.rows.some((col) => ['winner', 'player_x', 'player_o'].includes(col.column_name));
        if (hasTextColumns) {
            console.log('Found old text-based columns, migrating...');
            // Add UUID columns if they don't exist
            const hasUuidColumns = currentGameColumns.rows.some((col) => ['winner_id', 'player_x_id', 'player_o_id'].includes(col.column_name));
            if (!hasUuidColumns) {
                console.log('Adding UUID columns...');
                await db_1.db.execute((0, drizzle_orm_1.sql) `
          ALTER TABLE games 
          ADD COLUMN winner_id UUID REFERENCES users(id),
          ADD COLUMN player_x_id UUID REFERENCES users(id),
          ADD COLUMN player_o_id UUID REFERENCES users(id)
        `);
            }
            // Sample the data to see what we're working with
            const sampleGames = await db_1.db.execute((0, drizzle_orm_1.sql) `SELECT * FROM games LIMIT 5`);
            console.log('Sample games data:');
            console.log(sampleGames.rows);
            // Migrate existing data: populate UUID columns based on names
            console.log('Populating UUID columns...');
            // Update player_x_id based on player_x name
            await db_1.db.execute((0, drizzle_orm_1.sql) `
        UPDATE games 
        SET player_x_id = users.id 
        FROM users 
        WHERE games.player_x = users.username
      `);
            // Update player_o_id based on player_o name  
            await db_1.db.execute((0, drizzle_orm_1.sql) `
        UPDATE games 
        SET player_o_id = users.id 
        FROM users 
        WHERE games.player_o = users.username
      `);
            // Update winner_id based on winner name (only if winner is not null)
            await db_1.db.execute((0, drizzle_orm_1.sql) `
        UPDATE games 
        SET winner_id = users.id 
        FROM users 
        WHERE games.winner = users.username AND games.winner IS NOT NULL
      `);
            // Check for any games that couldn't be migrated
            const unmigrated = await db_1.db.execute((0, drizzle_orm_1.sql) `
        SELECT COUNT(*) as count FROM games 
        WHERE player_x_id IS NULL OR player_o_id IS NULL
      `);
            console.log(`Games that couldn't be migrated: ${unmigrated.rows[0].count}`);
            if (unmigrated.rows[0].count > 0) {
                console.log('Some games could not be migrated. Showing problematic records:');
                const problematic = await db_1.db.execute((0, drizzle_orm_1.sql) `
          SELECT id, player_x, player_o, winner FROM games 
          WHERE player_x_id IS NULL OR player_o_id IS NULL
          LIMIT 10
        `);
                console.log(problematic.rows);
                console.log('Deleting problematic records that cannot be migrated...');
                await db_1.db.execute((0, drizzle_orm_1.sql) `
          DELETE FROM games 
          WHERE player_x_id IS NULL OR player_o_id IS NULL
        `);
                console.log('Problematic records deleted.');
            }
            // Make the new columns NOT NULL (after ensuring they're populated)
            console.log('Setting constraints...');
            await db_1.db.execute((0, drizzle_orm_1.sql) `
        ALTER TABLE games 
        ALTER COLUMN player_x_id SET NOT NULL,
        ALTER COLUMN player_o_id SET NOT NULL
      `);
            // Drop the old text columns
            console.log('Dropping old columns...');
            await db_1.db.execute((0, drizzle_orm_1.sql) `
        ALTER TABLE games 
        DROP COLUMN winner,
        DROP COLUMN player_x,
        DROP COLUMN player_o
      `);
            console.log('Migration completed successfully!');
        }
        else {
            console.log('Already using UUID-based schema, nothing to migrate.');
        }
    }
    catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}
// Run migration if this file is executed directly
if (require.main === module) {
    migrate().then(() => process.exit(0));
}
