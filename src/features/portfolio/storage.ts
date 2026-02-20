import type { Holding } from "./types";

const KEY = "cryptocalc_portfolio_v1";

export function loadHoldings(): Holding[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Holding[]) : [];
  } catch {
    return [];
  }
}

export function saveHoldings(holdings: Holding[]) {
  localStorage.setItem(KEY, JSON.stringify(holdings));
}