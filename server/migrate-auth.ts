import { db } from './db/index.js';
import { sql } from 'drizzle-orm';

async function migrateAuth() {
  console.log('Starting auth migration...');
  
  try {
    // Add password and profileCompleted columns to salesmen table
    await db.execute(sql`
      ALTER TABLE salesmen 
      ADD COLUMN IF NOT EXISTS password TEXT,
      ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;
    `);
    
    // Make name fields optional by removing NOT NULL constraint
    await db.execute(sql`
      ALTER TABLE salesmen 
      ALTER COLUMN first_name DROP NOT NULL,
      ALTER COLUMN last_name DROP NOT NULL,
      ALTER COLUMN business_name DROP NOT NULL;
    `);
    
    console.log('✅ Auth migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  migrateAuth()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}