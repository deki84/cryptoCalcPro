"use client";

import { Field } from "@/components/ui/Field";

type Fiat = "EUR" | "USD";

type MarketCoin = {
  id: string;
  symbol: string;
  name: string;
};

type Props = {
  coins: MarketCoin[];
  fiat: Fiat;
  coinId: string;
  amount: string;
  onCoinChange: (id: string) => void;
  onAmountChange: (v: string) => void;
  onFiatChange: (f: Fiat) => void;
  onAdd: () => void;
  totalValue: number;
};

export default function AddHoldingForm({
  coins,
  fiat,
  coinId,
  amount,
  onCoinChange,
  onAmountChange,
  onFiatChange,
  onAdd,
  totalValue,
}: Props) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
      <div className="text-lg font-semibold text-white">Your portfolio</div>
      <div className="mt-1 text-sm text-zinc-400">
        Add your holdings and track their current value.
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Coin">
     <select
  value={coinId}
  onChange={(e) => onCoinChange(e.target.value)}
  className="w-full px-4 py-3 rounded-lg bg-zinc-950/40 border border-zinc-800 focus:outline-none focus:border-yellow-400 transition"
>
  <option value="" disabled>
    Select coin...
  </option>

  {coins.map((c) => (
    <option key={c.id} value={c.id}>
      {c.symbol} — {c.name}
    </option>
  ))}
</select>
        </Field>

        <Field label="Amount (coin units)">
          <input
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            inputMode="decimal"
            className="w-full px-4 py-3 rounded-lg bg-zinc-950/40 border border-zinc-800 focus:outline-none focus:border-yellow-400 transition"
            placeholder="e.g. 0.25"
          />
        </Field>

        <Field label="Currency">
          <select
            value={fiat}
            onChange={(e) => onFiatChange(e.target.value as Fiat)}
            className="w-full px-4 py-3 rounded-lg bg-zinc-950/40 border border-zinc-800 focus:outline-none focus:border-yellow-400 transition"
          >
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </Field>

        <div className="md:col-span-3 flex items-center gap-4">
          <button
            type="button"
            onClick={onAdd}
            className="rounded-lg bg-yellow-400 text-black font-medium px-4 py-3 hover:bg-yellow-300 transition"
          >
            Add holding
          </button>

          <div className="text-sm text-zinc-400">
            Total value:{" "}
            <span className="text-white font-semibold">
              {totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} {fiat}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}