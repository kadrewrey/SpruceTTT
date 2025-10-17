"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '../../.env' });
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("./db");
const schema_1 = require("./schema");
const guestAccounts = [
    { username: 'EcoWarrior GreenHeart', password: 'guest1pass' },
    { username: 'SolarPump Champion', password: 'guest2pass' },
    { username: 'GeothermalGuru', password: 'guest3pass' },
    { username: 'HeatWave Hero', password: 'guest4pass' },
    { username: 'EfficientEagle', password: 'guest5pass' },
    { username: 'GreenEnergy Wizard', password: 'guest6pass' },
    { username: 'ThermalThunder', password: 'guest7pass' },
    { username: 'EcoFriendly Phoenix', password: 'guest8pass' },
    { username: 'RenewableRanger', password: 'guest9pass' },
    { username: 'SustainableSage', password: 'guest10pass' },
];
async function seedGuestAccounts() {
    try {
        console.log('Starting to seed guest accounts...');
        for (const account of guestAccounts) {
            try {
                // Check if account already exists
                const existingUser = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.username, account.username));
                if (existingUser.length === 0) {
                    // Hash the password
                    const hashedPassword = await bcrypt_1.default.hash(account.password, 10);
                    // Insert the guest account
                    await db_1.db.insert(schema_1.users).values({
                        username: account.username,
                        nickname: account.username, // Use username as nickname for guest accounts
                        password: hashedPassword,
                        isGuestAccount: true,
                    });
                    console.log(`✓ Created guest account: ${account.username}`);
                }
                else {
                    console.log(`- Guest account already exists: ${account.username}`);
                }
            }
            catch (error) {
                console.error(`Error creating guest account ${account.username}:`, error);
            }
        }
        console.log('Guest account seeding completed!');
    }
    catch (error) {
        console.error('Error seeding guest accounts:', error);
    }
    finally {
        process.exit(0);
    }
}
// Import eq function
const drizzle_orm_1 = require("drizzle-orm");
seedGuestAccounts();
