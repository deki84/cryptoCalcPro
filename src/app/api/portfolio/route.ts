import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sql, ensureHoldingsTable } from "@/lib/db";

function toHolding(r: Record<string, unknown>) {
  return { id: r.id, coinId: r.coin_id, amount: r.amount };
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureHoldingsTable();
  const rows = await sql`
    SELECT id, coin_id, amount FROM holdings WHERE user_id = ${userId}
  `;
  return NextResponse.json(rows.map(toHolding));
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, coinId, amount } = await req.json();
  await ensureHoldingsTable();

  // If coin already exists for this user, add to the amount
  await sql`
    INSERT INTO holdings (id, user_id, coin_id, amount)
    VALUES (${id}, ${userId}, ${coinId}, ${amount})
    ON CONFLICT (user_id, coin_id)
    DO UPDATE SET amount = holdings.amount + EXCLUDED.amount
  `;

  const rows = await sql`
    SELECT id, coin_id, amount FROM holdings WHERE user_id = ${userId}
  `;
  return NextResponse.json(rows.map(toHolding));
}

export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { coinId, amount } = await req.json();
  await ensureHoldingsTable();

  await sql`
    UPDATE holdings SET amount = ${amount}
    WHERE user_id = ${userId} AND coin_id = ${coinId}
  `;

  const rows = await sql`
    SELECT id, coin_id, amount FROM holdings WHERE user_id = ${userId}
  `;
  return NextResponse.json(rows.map(toHolding));
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await ensureHoldingsTable();

  await sql`
    DELETE FROM holdings WHERE id = ${id} AND user_id = ${userId}
  `;

  const rows = await sql`
    SELECT id, coin_id, amount FROM holdings WHERE user_id = ${userId}
  `;
  return NextResponse.json(rows.map(toHolding));
}
