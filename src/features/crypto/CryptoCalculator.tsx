"use client";

import { useState, useEffect } from "react";
import { Field } from "@/components/ui/Field";
import WatchListButton from "@/features/watchlist/WatchListButton";
import { useWatchlist } from "@/features/watchlist/useWatchlist";
import BudgetCoverageCard from "@/features/budget/BudgetCoverageCard";
const FIATS = ["EUR", "USD"] as const;


type Fiat = (typeof FIATS)[number];

type MarketCoin = {
  id: string;
  symbol: string; // already uppercased from your API
  name: string;
  image: string;
  price: number;
  change24h: number | null;
  rank: number | null;
};
export default function CryptoCalculator() {
  const [amount, setAmount] = useState<string>("1");
  const [coinId, setCoinId] = useState<string>("bitcoin");
const [coins, setCoins] = useState<MarketCoin[]>([]);
  const [fiat, setFiat] = useState<Fiat>("EUR");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [monthlyExpenses, setMonthlyExpenses] = useState<string>("");
  const [loading, setLoading] = useState(true);
  

  // Fetch rates from internal API on first render
  useEffect(() => {
    const fetchRates = async () => {
      setLoading(true);
      setErrorMsg(null);
  
      try {
       const res = await fetch(`/api/coins?vs=${fiat.toLowerCase()}&perPage=250&page=1`);
const data: MarketCoin[] = await res.json();
setCoins(data);

if (data.length > 0 && !data.some((c) => c.id === coinId)) {
  setCoinId(data[0].id);
}
      } catch (error) {
        console.error("Failed to load rates:", error);
        setErrorMsg("Could not load live rates. Please try again.");
        setCoins([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchRates();
  },  [fiat, coinId]);

  const { has, toggle } = useWatchlist();

  <WatchListButton
  active={has(coinId)}
  onToggle={() => toggle(coinId)}
/>
  
  const selected = coins.find((c) => c.id === coinId);
  const rate = selected?.price ?? 0;

  const numericAmount = Number(amount || 0);
  const result = Number.isFinite(numericAmount) ? numericAmount * rate : 0;
  const monthly = Number(monthlyExpenses || 0);
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur shadow-[0_0_0_1px_rgba(255,255,255,0.04)] p-6">
      <div className="flex flex-col gap-6">
        {loading ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 px-4 py-3 text-sm text-zinc-400">
            Loading latest rates…
            
          </div>
          
        ) : null}

{errorMsg ? (
  <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
    {errorMsg}
  </div>
) : null}
        

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <Field label="Amount">
    <input
      value={amount}
      onChange={(e) => setAmount(e.target.value)}
      inputMode="decimal"
      className="w-full px-4 py-3 rounded-lg bg-zinc-950/40 border border-zinc-800 focus:outline-none focus:border-yellow-400 transition"
      placeholder="e.g. 1.5"
    />
  </Field>

  <Field label="Coin">
  <select
    value={coinId}
    onChange={(e) => setCoinId(e.target.value)}
    className="w-full px-4 py-3 rounded-lg bg-zinc-950/40 border border-zinc-800 focus:outline-none focus:border-yellow-400 transition"
  >
    {coins.map((c) => (
      <option key={c.id} value={c.id}>
        {c.symbol} — {c.name}
      </option>
    ))}
  </select>
</Field>


  <Field label="Currency">
    <select
      value={fiat}
      onChange={(e) => setFiat(e.target.value as Fiat)}
      className="w-full px-4 py-3 rounded-lg bg-zinc-950/40 border border-zinc-800 focus:outline-none focus:border-yellow-400 transition"
    >
      {FIATS.map((f) => (
        <option key={f} value={f}>
          {f}
        </option>
      ))}
    </select>
  </Field>

  <div className="md:col-span-3">
  <Field label="Monthly expenses">
    <input
      value={monthlyExpenses}
      onChange={(e) => setMonthlyExpenses(e.target.value)}
      inputMode="decimal"
      className="w-full px-4 py-3 rounded-lg bg-zinc-950/40 border border-zinc-800 focus:outline-none focus:border-yellow-400 transition"
      placeholder="e.g. 2500"
    />
  </Field>
</div>

  {/* Selected coin quick card */}
  <div className="md:col-span-3">
    <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/30 px-4 py-3">
      <div>
        <div className="text-sm text-zinc-400">Selected coin</div>
<div className="text-lg font-semibold text-white">
  {selected ? `${selected.symbol} — ${selected.name}` : coinId}
</div>      </div>

<WatchListButton active={has(coinId)} onToggle={() => toggle(coinId)} />    </div>
  </div>
</div>

{!loading && !errorMsg && selected ? (
  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6">
    <div className="text-sm text-zinc-400">Estimated value</div>
    {!loading && !errorMsg && selected && monthly > 0 ? (
  <BudgetCoverageCard
    totalValueFiat={result}
    monthlyExpenses={monthly}
    currency={fiat}
  />
) : null}
    <div className="mt-2 text-3xl font-bold">
      {result.toLocaleString(undefined, { maximumFractionDigits: 2 })} {fiat}
    </div>
    <div className="mt-2 text-sm text-zinc-500">
      Rate: 1 {selected.symbol ?? "-"} ≈ {rate.toLocaleString(undefined, { maximumFractionDigits: 2 })} {fiat}
    </div>
  </div>
) : null}

      </div>
    </section>
  );
}

