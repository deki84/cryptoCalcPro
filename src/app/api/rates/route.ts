/**
 * Crypto rates API route
 * Fetches live prices from CoinGecko
 * Revalidates every 60 seconds (ISR)
 */

import { NextResponse } from "next/server";
export const revalidate = 60;
type CoinGeckoResponse = {
    bitcoin?: { usd?: number; eur?: number };
    ethereum?: { usd?: number; eur?: number };
    tether?: { usd?: number; eur?: number };
    solana?: { usd?: number; eur?: number };
  };

export async function GET() {
  
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,solana&vs_currencies=usd,eur",
      { next: { revalidate: 60 } } // 60 Sekunden Cache
    );

    if (!res.ok) {
      throw new Error("Failed to fetch rates");
    }

    const data: CoinGeckoResponse = await res.json();

    // Map CoinGecko response to internal format used by frontend

    const mapped = {
        BTC: data.bitcoin ?? { usd: 0, eur: 0 },
        ETH: data.ethereum ?? { usd: 0, eur: 0 },
        USDT: data.tether ?? { usd: 0, eur: 0 },
        SOL: data.solana ?? { usd: 0, eur: 0 },
      };

    return NextResponse.json(mapped);
} catch (error) {
    console.error("Rates API error:", error);
    return NextResponse.json({ error: "Could not fetch rates" }, { status: 500 });
  }
}