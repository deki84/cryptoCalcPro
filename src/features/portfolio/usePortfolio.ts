"use client";

import { useMemo, useState } from "react";
import type { Holding } from "./types";
import { loadHoldings, saveHoldings } from "./storage";

function uid() {
  // Use crypto.randomUUID when available, otherwise fallback
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function usePortfolio() {
const [holdings, setHoldings] = useState<Holding[]>(loadHoldings());
  function persist(next: Holding[]) {
    setHoldings(next);
    saveHoldings(next);
  }

  function addHolding(coinId: string, amount: number) {
    if (!coinId) return;
    if (!Number.isFinite(amount) || amount <= 0) return;

    // If coin already exists, just add amount
    const existing = holdings.find((h) => h.coinId === coinId);
    if (existing) {
      persist(
        holdings.map((h) =>
          h.coinId === coinId ? { ...h, amount: h.amount + amount } : h
        )
      );
      return;
    }

    persist([...holdings, { id: uid(), coinId, amount }]);
  }

  function removeHolding(id: string) {
    persist(holdings.filter((h) => h.id !== id));
  }

  function updateAmount(id: string, amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) return;
    persist(holdings.map((h) => (h.id === id ? { ...h, amount } : h)));
  }

  const totalCoins = useMemo(() => holdings.length, [holdings]);

  return { holdings, addHolding, removeHolding, updateAmount, totalCoins };
}