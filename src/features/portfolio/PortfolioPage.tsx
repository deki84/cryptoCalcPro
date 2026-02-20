"use client";

import { useEffect, useMemo, useState } from "react";
import { usePortfolio } from "./usePortfolio";
import HoldingsTable from "./HoldingsTable";
import AddHoldingForm from "./AddHoldingForm";
import SelectedCoinChart from "@/features/crypto/SelectedCoinChart";

type Fiat = "EUR" | "USD";

type MarketCoin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  price: number;
  sparkline_in_7d?: { price: number[] };
  change24h: number | null;
  rank: number | null;
};

export default function PortfolioPage() {
  const { holdings, addHolding, removeHolding, updateAmount } = usePortfolio();

  const [fiat, setFiat] = useState<Fiat>("EUR");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // All coins for "Add holding" dropdown (250)
  const [allCoins, setAllCoins] = useState<MarketCoin[]>([]);

  // Only coins that exist in your holdings (for prices + labels)
  const [holdingCoins, setHoldingCoins] = useState<MarketCoin[]>([]);

  const [coinId, setCoinId] = useState<string>("bitcoin");
  const [amount, setAmount] = useState<string>("");

  // Chart: which holding coin is currently selected
  const [selectedChartCoinId, setSelectedChartCoinId] = useState<string>("");

  // 1) Load ALL coins for AddHoldingForm
  useEffect(() => {
    let cancelled = false;

    async function loadAllCoins() {
      setLoading(true);
      setErrorMsg(null);

      try {
        const res = await fetch(
          `/api/coins?vs=${fiat.toLowerCase()}&perPage=250&page=1`
        );
        if (!res.ok) throw new Error("API request failed");

        const data: MarketCoin[] = await res.json();
        if (cancelled) return;

        setAllCoins(data);

        // Keep selected coinId valid
        if (data.length > 0 && !data.some((c) => c.id === coinId)) {
          setCoinId(data[0].id);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setErrorMsg("Could not load coins. Please try again.");
          setAllCoins([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAllCoins();
    return () => {
      cancelled = true;
    };
  }, [fiat, coinId]); // only fiat

  // 2) Load only HOLDING coins (for correct prices + names)
  useEffect(() => {
    let cancelled = false;

    async function loadHoldingCoins() {
      const ids = Array.from(new Set(holdings.map((h) => h.coinId))).join(",");

      if (!ids) {
        setHoldingCoins([]);
        return;
      }

      try {
        const res = await fetch(`/api/coins?vs=${fiat.toLowerCase()}&ids=${ids}`);
        if (!res.ok) throw new Error("API request failed");
        const data: MarketCoin[] = await res.json();
        if (!cancelled) setHoldingCoins(data);
      } catch (e) {
        console.error(e);
        if (!cancelled) setHoldingCoins([]);
      }
    }

    loadHoldingCoins();
    return () => {
      cancelled = true;
    };
  }, [fiat, holdings]);

  // Default chart coin = first holding coin
  useEffect(() => {
    if (!selectedChartCoinId && holdings.length > 0) {
      setSelectedChartCoinId(holdings[0].coinId);
    }
  }, [holdings, selectedChartCoinId]);

  // Map for fast lookup (only holding coins!)
  const coinById = useMemo(() => {
    const map = new Map<string, MarketCoin>();
    for (const c of holdingCoins) map.set(c.id, c);
    return map;
  }, [holdingCoins]);

  // Build table rows
  const rows = useMemo(() => {
    return holdings.map((h) => {
      const c = coinById.get(h.coinId);
      const price = c?.price ?? 0;
      const value = h.amount * price;

      return {
        ...h,
        coin: c,
        price,
        value,
      };
    });
  }, [holdings, coinById]);

  const totalValue = useMemo(() => {
    return rows.reduce((sum, r) => sum + r.value, 0);
  }, [rows]);

  function onAdd() {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return;
    addHolding(coinId, n);
    setAmount("");
  }

  const holdingIds = useMemo(() => {
    return Array.from(new Set(holdings.map((h) => h.coinId)));
  }, [holdings]);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
        <div className="text-lg font-semibold text-white">Your portfolio</div>
        <div className="mt-1 text-sm text-zinc-400">
          Add your holdings and track their current value.
        </div>

        <AddHoldingForm
          coins={allCoins.map((c) => ({ id: c.id, symbol: c.symbol, name: c.name }))}
          fiat={fiat}
          coinId={coinId}
          amount={amount}
          onCoinChange={setCoinId}
          onAmountChange={setAmount}
          onFiatChange={setFiat}
          onAdd={onAdd}
          totalValue={totalValue}
        />

        {loading ? (
          <div className="mt-4 text-sm text-zinc-400">Loading coins…</div>
        ) : null}

        {errorMsg ? (
          <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMsg}
          </div>
        ) : null}
      </div>

      <HoldingsTable
        rows={rows}
        fiat={fiat}
        onRemove={removeHolding}
        onUpdate={updateAmount}
      />

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-zinc-400">Chart</div>
            <div className="text-xs text-zinc-500">Pick a coin from your portfolio</div>
          </div>

          <select
            value={selectedChartCoinId}
            onChange={(e) => setSelectedChartCoinId(e.target.value)}
            className="rounded-lg bg-zinc-950/40 border border-zinc-800 px-3 py-2 text-sm text-zinc-200"
            disabled={holdingIds.length === 0}
          >
            {holdingIds.map((id) => {
              const c = coinById.get(id);
              return (
                <option key={id} value={id}>
                  {c ? `${c.symbol} — ${c.name}` : id}
                </option>
              );
            })}
          </select>
        </div>

        {selectedChartCoinId ? (
          <div className="mt-4">
            <SelectedCoinChart coinId={selectedChartCoinId} fiat={fiat} />
          </div>
        ) : (
          <div className="mt-4 text-sm text-zinc-400">Add a holding to see charts.</div>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
        <div className="text-sm text-zinc-400">Portfolio summary</div>
        <div className="mt-3 text-3xl font-bold text-white">
          {totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} {fiat}
        </div>
        <div className="mt-1 text-xs text-zinc-500">
          Total value across all holdings
        </div>
      </div>
    </div>
  );
}