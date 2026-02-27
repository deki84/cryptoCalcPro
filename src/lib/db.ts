import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;

export const sql = connectionString
  ? neon(connectionString)
  : null;

export async function ensureHoldingsTable() {
  if (!sql) return;
  await sql`
    CREATE TABLE IF NOT EXISTS holdings (
      id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      coin_id TEXT NOT NULL,
      amount DOUBLE PRECISION NOT NULL,
      PRIMARY KEY (user_id, coin_id)
    )
  `;
}

export async function ensureWatchlistTable() {
if (!sql) return;
  await sql`
    CREATE TABLE IF NOT EXISTS watchlist (
      user_id TEXT NOT NULL,
      coin_id TEXT NOT NULL,
      PRIMARY KEY (user_id, coin_id)
    )
  `;
}
