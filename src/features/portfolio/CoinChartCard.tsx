"use client";

import { useEffect, useMemo, useState } from "react";

type RangeKey = "1" | "7" | "30" | "365";

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "1", label: "24H" },
  { key: "7", label: "7D" },
  { key: "30", label: "1M" },
  { key: "365", label: "1Y" },
];

function Sparkline({ data }: { data: number[] }) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 120;
      const y = 32 - ((v - min) / range) * 32;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width="100%" height="72" viewBox="0 0 120 32" preserveAspectRatio="none">
      <polyline fill="none" stroke="currentColor" strokeWidth="2.5" points={points} />
    </svg>
  );
}

export default function CoinChartCard({
  coinId,
  vs,
  title,
}: {
  coinId: string;
  vs: "eur" | "usd";
  title?: string;
}) {
  const [range, setRange] = useState<RangeKey>("7");
  const [prices, setPrices] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/market-chart?id=${coinId}&vs=${vs}&days=${range}`);
        const json = await res.json();
        if (!cancelled) setPrices(Array.isArray(json?.prices) ? json.prices : []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (coinId) load();
    return () => {
      cancelled = true;
    };
  }, [coinId, vs, range]);

  const positive = useMemo(() => {
    if (prices.length < 2) return true;
    return prices[prices.length - 1] >= prices[0];
  }, [prices]);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm text-zinc-400">{title ?? "Price chart"}</div>
          <div className="mt-1 text-xs text-zinc-500">
            {coinId} • {vs.toUpperCase()}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              className={
                "rounded-lg px-3 py-1 text-xs border transition " +
                (range === r.key
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "border-zinc-800 text-zinc-300 hover:text-white")
              }
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className={
          "mt-4 " +
          (positive ? "text-emerald-400" : "text-rose-400")
        }
      >
        {loading ? (
          <div className="text-sm text-zinc-400">Loading chart…</div>
        ) : prices.length < 2 ? (
          <div className="text-sm text-zinc-500">Not enough chart data.</div>
        ) : (
          <Sparkline data={prices.slice(-80)} />
        )}
      </div>
    </div>
  );
}