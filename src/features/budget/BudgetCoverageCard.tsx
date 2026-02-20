"use client";

import { calcMonthsCovered } from "./coverage";

type Props = {
  totalValueFiat: number; // e.g. result
  monthlyExpenses: number;
  currency: string; // "EUR" | "USD"
};

export default function BudgetCoverageCard({ totalValueFiat, monthlyExpenses, currency }: Props) {
  const months = calcMonthsCovered(totalValueFiat, monthlyExpenses);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6">
      <div className="text-sm text-zinc-400">Budget coverage</div>

      <div className="mt-2 flex items-baseline gap-3">
        <div className="text-3xl font-bold">
          {months.toLocaleString(undefined, { maximumFractionDigits: 1 })}
        </div>
        <div className="text-sm text-zinc-400">months</div>
      </div>

      <div className="mt-2 text-sm text-zinc-500">
        Based on {totalValueFiat.toLocaleString(undefined, { maximumFractionDigits: 2 })} {currency} and monthly expenses of{" "}
        {monthlyExpenses.toLocaleString(undefined, { maximumFractionDigits: 2 })} {currency}.
      </div>
    </div>
  );
}