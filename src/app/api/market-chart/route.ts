import { NextResponse } from "next/server";

export const revalidate = 60;

type MarketChartResponse = {
  prices: [number, number][];
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id"); // e.g. "bitcoin"
    const vs = (searchParams.get("vs") ?? "eur").toLowerCase();
    const days = searchParams.get("days") ?? "7"; // "1", "7", "30", "365"

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const url =
      `https://api.coingecko.com/api/v3/coins/${id}/market_chart` +
      `?vs_currency=${vs}&days=${days}`;

    const res = await fetch(url, {
      headers: { accept: "application/json" },
      next: { revalidate },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "CoinGecko request failed" }, { status: 500 });
    }

    const data = (await res.json()) as MarketChartResponse;

    // extract only prices
    const prices = Array.isArray(data?.prices)
      ? data.prices.map((p) => p[1]).filter((n): n is number => typeof n === "number")
      : [];

    return NextResponse.json({ id, vs, days, prices });
  } catch {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}