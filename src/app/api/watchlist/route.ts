import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sql, ensureWatchlistTable } from "@/lib/db";

function getDb() {
  if (!sql) throw new Error("No database connection");
  return sql;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();

  await ensureWatchlistTable();
  const rows = await db`
    SELECT coin_id FROM watchlist WHERE user_id = ${userId}
  `;
  return NextResponse.json(rows.map((r) => r.coin_id));
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();

  const { coinId } = await req.json();
  await ensureWatchlistTable();

  const existing = await db`
    SELECT 1 FROM watchlist WHERE user_id = ${userId} AND coin_id = ${coinId}
  `;

  if (existing.length > 0) {
    await db`
      DELETE FROM watchlist WHERE user_id = ${userId} AND coin_id = ${coinId}
    `;
  } else {
    await db`
      INSERT INTO watchlist (user_id, coin_id) VALUES (${userId}, ${coinId})
    `;
  }

  const rows = await db`
    SELECT coin_id FROM watchlist WHERE user_id = ${userId}
  `;
  return NextResponse.json(rows.map((r) => r.coin_id));
}