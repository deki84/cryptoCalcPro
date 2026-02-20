"use client";

import { useMemo } from "react";

/*
  This component:
  - receives all portfolio holdings (rows)
  - builds a weighted portfolio price series
  - renders a small sparkline (SVG)
*/

type MarketCoin = {
  sparkline_in_7d?: {
    price: number[];
  };
};

type Row = {
  value: number;
  coin?: MarketCoin;
};

type Props = {
  rows: Row[];
  totalValue: number;
};

/*
  Small sparkline component
  Renders a simple SVG polyline
*/
function Sparkline({
  data,
  positive,
}: {
  data: number[];
  positive: boolean;
}) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  // Convert price values into SVG coordinates
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 120;
      const y = 32 - ((v - min) / range) * 32;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width="140" height="36" viewBox="0 0 120 32">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        points={points}
        className={positive ? "text-emerald-400" : "text-rose-400"}
      />
    </svg>
  );
}

export default function PortfolioTrendCard({ rows, totalValue }: Props) {
  /*
    Build weighted portfolio price series.
    Each coin sparkline is weighted based on its share of total portfolio value.
  */
  const portfolioSeries = useMemo(() => {
    if (totalValue <= 0) return [];

    const weightedCoins = rows
      .map((r) => ({
        weight: r.value / totalValue,
        prices: r.coin?.sparkline_in_7d?.price ?? [],
      }))
      .filter((c) => c.prices.length > 0);

    if (weightedCoins.length === 0) return [];

    const length = Math.min(...weightedCoins.map((c) => c.prices.length));
    const result: number[] = [];

    for (let i = 0; i < length; i++) {
      let value = 0;

      for (const coin of weightedCoins) {
        const index = coin.prices.length - length + i;
        value += coin.prices[index] * coin.weight;
      }

      result.push(value);
    }

    return result.slice(-40); // keep last 40 points for cleaner UI
  }, [rows, totalValue]);

  if (portfolioSeries.length < 2) return null;

  const start = portfolioSeries[0];
  const end = portfolioSeries[portfolioSeries.length - 1];
  const positive = end >= start;
  const percentageChange = ((end - start) / start) * 100;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
      <div className="flex items-center justify-between gap-6">
        <div>
          <div className="text-sm text-zinc-400">Portfolio trend (7d)</div>

          <div
            className={
              "mt-2 text-2xl font-semibold " +
              (positive ? "text-emerald-300" : "text-rose-300")
            }
          >
            {positive ? "+" : ""}
            {percentageChange.toFixed(2)}%
          </div>

          <div className="mt-1 text-xs text-zinc-500">
            Weighted by your current holdings
          </div>
        </div>

        <Sparkline data={portfolioSeries} positive={positive} />
      </div>
    </div>
  );
}