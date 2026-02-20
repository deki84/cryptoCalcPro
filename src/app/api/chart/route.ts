import { NextResponse } from "next/server";

export const revalidate = 60;

// /api/chart?id=bitcoin&vs=eur&days=7
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");
    const vs = (searchParams.get("vs") ?? "eur").toLowerCase();
    const daysRaw = searchParams.get("days") ?? "7";
    const days = Number(daysRaw);

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    if (!Number.isFinite(days) || days <= 0) {
      return NextResponse.json({ error: "Invalid days" }, { status: 400 });
    }

    const url =
      `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}` +
      `/market_chart?vs_currency=${encodeURIComponent(vs)}` +
      `&days=${encodeURIComponent(String(days))}`;

    const res = await fetch(url, {
      headers: { accept: "application/json" },
      next: { revalidate },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "CoinGecko request failed" }, { status: 500 });
    }

    type MarketChartResponse = { prices?: [number, number][] };
    const data = (await res.json()) as MarketChartResponse;

    const pairs = Array.isArray(data.prices) ? data.prices : [];

    // keep only valid pairs (timestamp + price)
    const validPairs = pairs.filter(
      (p): p is [number, number] =>
        Array.isArray(p) && typeof p[0] === "number" && typeof p[1] === "number"
    );

    const timestamps = validPairs.map((p) => p[0]);
    const prices = validPairs.map((p) => p[1]);

    return NextResponse.json({ id, vs, days, prices, timestamps });
  } catch {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}