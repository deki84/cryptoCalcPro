import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL!);

export async function ensureHoldingsTable() {
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
  await sql`
    CREATE TABLE IF NOT EXISTS watchlist (
      user_id TEXT NOT NULL,
      coin_id TEXT NOT NULL,
      PRIMARY KEY (user_id, coin_id)
    )
  `;
}
