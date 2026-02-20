"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createChart, ColorType, CrosshairMode, LineSeries } from "lightweight-charts";
import type { ISeriesApi, LineData, UTCTimestamp } from "lightweight-charts";
type RangeKey = "1" | "7" | "30" | "365"; // 24H, 7D, 1M, 1Y

type ApiResponse = {
  id: string;
  vs: string;
  days: number;
  prices: number[];
  timestamps: number[];
};

function toTimeSeries(prices: number[], timestamps: number[]): LineData[] {
  const len = Math.min(prices.length, timestamps.length);

  // 1) build raw points
  const raw: LineData[] = [];
  for (let i = 0; i < len; i++) {
    const tMs = timestamps[i];
    const v = prices[i];

    if (typeof tMs !== "number" || typeof v !== "number") continue;

    const tSec = Math.floor(tMs / 1000) as UTCTimestamp;
    raw.push({ time: tSec, value: v });
  }

  // 2) sort ascending by time
  raw.sort((a, b) => Number(a.time) - Number(b.time));

  // 3) dedupe: if same timestamp exists, keep the LAST value
  const map = new Map<number, number>();
  for (const p of raw) {
    map.set(Number(p.time), p.value);
  }

  // 4) rebuild ordered list
  const out: LineData[] = Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([time, value]) => ({ time: time as UTCTimestamp, value }));

  return out;
}

export default function SelectedCoinChart({
  coinId,
  fiat,
}: {
  coinId: string; // e.g. "bitcoin"
  fiat: "EUR" | "USD";
}) {
  const [range, setRange] = useState<RangeKey>("1");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  
const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  const vs = fiat.toLowerCase();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/chart?id=${coinId}&vs=${vs}&days=${range}`);
        const json = (await res.json()) as ApiResponse;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (coinId) load();
    return () => {
      cancelled = true;
    };
  }, [coinId, vs, range]);

  const seriesData = useMemo(() => {
    if (!data) return [];
    return toTimeSeries(data.prices, data.timestamps);
  }, [data]);

  // Create chart once
  useEffect(() => {
    if (!containerRef.current) return;

   const chart = createChart(containerRef.current, {
  width: containerRef.current.clientWidth,
  height: 260,
  layout: {
    background: { type: ColorType.Solid, color: "transparent" },
    textColor: "rgba(255,255,255,0.75)",
  },
  grid: {
    vertLines: { color: "rgba(255,255,255,0.06)" },
    horzLines: { color: "rgba(255,255,255,0.06)" },
  },
  rightPriceScale: { borderColor: "rgba(255,255,255,0.08)" },
  timeScale: { borderColor: "rgba(255,255,255,0.08)" },
  crosshair: { mode: CrosshairMode.Normal },
});

const line = chart.addSeries(LineSeries, {
  lineWidth: 2,
  priceLineVisible: true,
  lastValueVisible: true,
});

    chartRef.current = chart;
    seriesRef.current = line;

    const ro = new ResizeObserver(() => {
      chart.applyOptions({ width: containerRef.current!.clientWidth });
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Update series on data change
  useEffect(() => {
    if (!seriesRef.current) return;
    if (!seriesData.length) return;

    seriesRef.current.setData(seriesData);

    // Color by trend
    const first = seriesData[0]?.value ?? 0;
    const last = seriesData[seriesData.length - 1]?.value ?? 0;
    const positive = last >= first;

    seriesRef.current.applyOptions({
      color: positive ? "rgba(52, 211, 153, 0.95)" : "rgba(244, 63, 94, 0.95)",
    });

    chartRef.current?.timeScale().fitContent();
  }, [seriesData]);

  const currentPrice =
    seriesData.length > 0 ? seriesData[seriesData.length - 1].value : null;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-sm text-zinc-400">Selected coin chart</div>
          <div className="mt-1 text-xs text-zinc-500">
            {coinId} • {fiat}
          </div>

          <div className="mt-3 text-3xl font-bold text-white">
          {currentPrice !== null
  ? currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })
  : "—"}{" "}
{fiat}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(["1", "7", "30", "365"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setRange(k)}
              className={
                "rounded-xl border px-4 py-2 text-sm transition " +
                (range === k
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "border-zinc-800 bg-zinc-950/30 text-zinc-200 hover:bg-zinc-900/40")
              }
            >
              {k === "1" ? "24H" : k === "7" ? "7D" : k === "30" ? "1M" : "1Y"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        {loading && !seriesData.length ? (
          <div className="text-sm text-zinc-400">Loading chart…</div>
        ) : null}

        {!loading && seriesData.length < 2 ? (
          <div className="text-sm text-zinc-400">Not enough chart data.</div>
        ) : null}

        <div ref={containerRef} className="w-full" />
      </div>
    </div>
  );
}