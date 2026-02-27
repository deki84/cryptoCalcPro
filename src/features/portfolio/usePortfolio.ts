"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import type { Holding } from "./types";
import { loadHoldings, saveHoldings } from "./storage";

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function usePortfolio() {
  const { isSignedIn, isLoaded } = useUser();
  const [holdings, setHoldings] = useState<Holding[]>([]);

  // Load initial data
  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      fetch("/api/portfolio")
        .then((r) => (r.ok ? r.json() : Promise.resolve([])))
        .then((data: unknown) => {
          if (Array.isArray(data)) setHoldings(data);
        })
        .catch(() => setHoldings([]));
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHoldings(loadHoldings());
    }
  }, [isSignedIn, isLoaded]);

  async function addHolding(coinId: string, amount: number) {
    if (!coinId) return;
    if (!Number.isFinite(amount) || amount <= 0) return;

    if (isSignedIn) {
      const id = uid();
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, coinId, amount }),
      });
      const data: unknown = res.ok ? await res.json() : null;
      if (Array.isArray(data)) setHoldings(data);
    } else {
      const existing = holdings.find((h) => h.coinId === coinId);
      const next = existing
        ? holdings.map((h) =>
            h.coinId === coinId ? { ...h, amount: h.amount + amount } : h
          )
        : [...holdings, { id: uid(), coinId, amount }];
      setHoldings(next);
      saveHoldings(next);
    }
  }

  async function removeHolding(id: string) {
    if (isSignedIn) {
      const res = await fetch("/api/portfolio", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data: unknown = res.ok ? await res.json() : null;
      if (Array.isArray(data)) setHoldings(data);
    } else {
      const next = holdings.filter((h) => h.id !== id);
      setHoldings(next);
      saveHoldings(next);
    }
  }

  async function updateAmount(id: string, amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) return;

    if (isSignedIn) {
      const holding = holdings.find((h) => h.id === id);
      if (!holding) return;
      const res = await fetch("/api/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coinId: holding.coinId, amount }),
      });
      const data: unknown = res.ok ? await res.json() : null;
      if (Array.isArray(data)) setHoldings(data);
    } else {
      const next = holdings.map((h) => (h.id === id ? { ...h, amount } : h));
      setHoldings(next);
      saveHoldings(next);
    }
  }

  return {
    holdings,
    addHolding,
    removeHolding,
    updateAmount,
    totalCoins: holdings.length,
  };
}
