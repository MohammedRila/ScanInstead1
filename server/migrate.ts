import { db } from './db';
import { homeowners, salesmen, pitches, scanTracking } from './db/schema';

async function createTables() {
  try {
    console.log('Creating database tables...');
    
    // Create tables using raw SQL since drizzle-kit isn't detecting schema changes
    await db.execute(`
      CREATE TABLE IF NOT EXISTS homeowners (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        is_registered BOOLEAN DEFAULT false NOT NULL,
        notification_preference TEXT DEFAULT 'email' NOT NULL CHECK (notification_preference IN ('email', 'phone', 'both')),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        qr_url TEXT NOT NULL,
        pitch_url TEXT NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS salesmen (
        id TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        business_name TEXT NOT NULL,
        business_type TEXT,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        is_verified BOOLEAN DEFAULT false NOT NULL,
        total_scans INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        last_scan_at TIMESTAMP
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS scan_tracking (
        id TEXT PRIMARY KEY,
        salesman_id TEXT NOT NULL,
        homeowner_id TEXT NOT NULL,
        scanned_at TIMESTAMP DEFAULT NOW() NOT NULL,
        location TEXT,
        FOREIGN KEY (salesman_id) REFERENCES salesmen(id),
        FOREIGN KEY (homeowner_id) REFERENCES homeowners(id)
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS pitches (
        id TEXT PRIMARY KEY,
        homeowner_id TEXT NOT NULL,
        visitor_name TEXT NOT NULL,
        company TEXT,
        offer TEXT NOT NULL,
        reason TEXT NOT NULL,
        visitor_email TEXT,
        visitor_phone TEXT,
        file_url TEXT,
        file_name TEXT,
        user_type TEXT DEFAULT 'service_provider' NOT NULL CHECK (user_type IN ('homeowner', 'service_provider')),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
        sentiment_confidence REAL,
        ai_summary TEXT,
        detected_business_type TEXT,
        urgency TEXT CHECK (urgency IN ('low', 'medium', 'high')),
        categories JSONB,
        is_spam BOOLEAN,
        ai_processed BOOLEAN DEFAULT false NOT NULL,
        match_lvl REAL,
        s_flag REAL,
        i_tag TEXT,
        u_score REAL,
        k_meta TEXT,
        xtext TEXT,
        rscore REAL,
        click_t REAL,
        b_prob REAL,
        n_pred TEXT,
        c_prob REAL,
        FOREIGN KEY (homeowner_id) REFERENCES homeowners(id)
      );
    `);

    console.log('✅ Database tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createTables().catch(console.error);
}

export { createTables };