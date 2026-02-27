import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sql, ensureWatchlistTable } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureWatchlistTable();
  const rows = await sql`
    SELECT coin_id FROM watchlist WHERE user_id = ${userId}
  `;
  return NextResponse.json(rows.map((r) => r.coin_id));
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { coinId } = await req.json();
  await ensureWatchlistTable();

  // Toggle: if exists delete, else insert
  const existing = await sql`
    SELECT 1 FROM watchlist WHERE user_id = ${userId} AND coin_id = ${coinId}
  `;

  if (existing.length > 0) {
    await sql`
      DELETE FROM watchlist WHERE user_id = ${userId} AND coin_id = ${coinId}
    `;
  } else {
    await sql`
      INSERT INTO watchlist (user_id, coin_id) VALUES (${userId}, ${coinId})
    `;
  }

  const rows = await sql`
    SELECT coin_id FROM watchlist WHERE user_id = ${userId}
  `;
  return NextResponse.json(rows.map((r) => r.coin_id));
}
