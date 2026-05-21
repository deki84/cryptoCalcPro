"use client";

import { useState } from "react";
import { Field } from "@/components/ui/Field";

const DECIMAL_RE = /^[0-9]*([.,][0-9]*)?$/;

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
  const [amountError, setAmountError] = useState<string | null>(null);

  function handleAmountChange(v: string) {
    if (v !== "" && !DECIMAL_RE.test(v)) {
      setAmountError("Nur Zahlen erlaubt (z. B. 0.25)");
    } else {
      setAmountError(null);
    }
    onAmountChange(v);
  }

  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <Field label="Coin">
        <select
          aria-label="Select coin"
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
          onChange={(e) => handleAmountChange(e.target.value)}
          inputMode="decimal"
          className={`w-full px-4 py-3 rounded-lg bg-zinc-950/40 border focus:outline-none transition ${amountError ? "border-red-500 focus:border-red-500" : "border-zinc-800 focus:border-yellow-400"}`}
          placeholder="e.g. 0.25"
        />
        {amountError && (
          <p className="mt-1 text-xs text-red-400">{amountError}</p>
        )}
      </Field>

      <Field label="Currency">
        <select
          aria-label="Select currency"
          value={fiat}
          onChange={(e) => onFiatChange(e.target.value as Fiat)}
          className="w-full px-4 py-3 rounded-lg bg-zinc-950/40 border border-zinc-800 focus:outline-none focus:border-yellow-400 transition"
        >
          <option value="EUR">EUR</option>
          <option value="USD">USD</option>
        </select>
      </Field>

      <div className="sm:col-span-2 md:col-span-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onAdd}
          className="w-full sm:w-auto rounded-lg bg-yellow-400 text-black font-medium px-4 py-3 hover:bg-yellow-300 transition"
        >
          Add holding
        </button>

        <div className="text-sm text-zinc-400">
          Total value:{" "}
          <span className="text-white font-semibold">
            {totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}{" "}
            {fiat}
          </span>
        </div>
      </div>
    </div>
  );
}
