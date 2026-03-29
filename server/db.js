import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import dotenv from 'dotenv';
import * as schema from './schema.js';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL is not set in .env');
  process.exit(1);
}

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const db = drizzle(pool, { schema });
export const query = (text, params) => pool.query(text, params);
export { schema };

export const connectDB = async () => {
  try {
    const client = await pool.connect();
    client.release();
    console.log('✅ Neon/Postgres connected successfully');
  } catch (error) {
    console.error('❌ Neon/Postgres connection error:', error.message);
    process.exit(1);
  }
};
