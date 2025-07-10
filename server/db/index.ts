import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres.bxtgozydlrqaihecmrwo:Mohammed@123@aws-0-us-west-1.pooler.supabase.com:6543/postgres";

const client = postgres(databaseUrl);
export const db = drizzle(client, { schema });