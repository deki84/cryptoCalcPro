import { NextResponse } from "next/server";

export const revalidate = 60;

type CoinRow = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  sparkline_in_7d?: { price: number[] };
  price_change_percentage_24h: number | null;
  market_cap_rank: number | null;
};

type CoinResponse = {
  id: string;
  symbol: string; // already uppercased
  name: string;
  image: string;
  price: number;
  sparkline_in_7d?: { price: number[] };
  change24h: number | null;
  rank: number | null;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const vs = (searchParams.get("vs") ?? "eur").toLowerCase();
    const page = Number(searchParams.get("page") ?? 1);
    const perPage = Number(searchParams.get("perPage") ?? 250);
    const ids = searchParams.get("ids"); // optional: "bitcoin,ethereum"

    const params = new URLSearchParams({
      vs_currency: vs,
      order: "market_cap_desc",
      per_page: String(perPage),
      page: String(page),
      sparkline: "true",
      price_change_percentage: "24h",
    });

    // If ids is present, CoinGecko returns only these coins.
    // For ids, paging is not really relevant, but it doesn't hurt to keep.
    if (ids) params.set("ids", ids);

    const url = `https://api.coingecko.com/api/v3/coins/markets?${params.toString()}`;

    const res = await fetch(url, {
      headers: { accept: "application/json" },
      next: { revalidate },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Could not fetch coins" }, { status: 500 });
    }

    const data = (await res.json()) as CoinRow[];

    const mapped: CoinResponse[] = data.map((c) => ({
      id: c.id,
      symbol: c.symbol.toUpperCase(),
      name: c.name,
      image: c.image,
      price: c.current_price,
      change24h: c.price_change_percentage_24h,
      rank: c.market_cap_rank,
      sparkline_in_7d: c.sparkline_in_7d,
    }));

    return NextResponse.json(mapped);
  } catch {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}