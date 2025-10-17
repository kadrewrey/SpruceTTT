import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
import bcrypt from 'bcrypt';
import { db } from './db';
import { users } from './schema';

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
        const existingUser = await db.select().from(users).where(eq(users.username, account.username));
        
        if (existingUser.length === 0) {
          // Hash the password
          const hashedPassword = await bcrypt.hash(account.password, 10);
          
          // Insert the guest account
          await db.insert(users).values({
            username: account.username,
            password: hashedPassword,
            isGuestAccount: true,
          });
          
          console.log(`✓ Created guest account: ${account.username}`);
        } else {
          console.log(`- Guest account already exists: ${account.username}`);
        }
      } catch (error) {
        console.error(`Error creating guest account ${account.username}:`, error);
      }
    }
    
    console.log('Guest account seeding completed!');
  } catch (error) {
    console.error('Error seeding guest accounts:', error);
  } finally {
    process.exit(0);
  }
}

// Import eq function
import { eq } from 'drizzle-orm';

seedGuestAccounts();