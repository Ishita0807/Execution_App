import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // set in .env.local
  ssl: { rejectUnauthorized: false }          // required for Neon
});

// Query wrapper
export async function query<T = any>(q: string, params?: any[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    const res = await client.query(q, params);
    return res.rows;
  } finally {
    client.release();
  }
}
