"use client";

import { useMemo, useState } from "react";

const KEY = "cryptocalc_watchlist_v1";

function loadInitial(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function useWatchlist() {
  const [ids, setIds] = useState<string[]>(loadInitial);

  function has(id: string) {
    return ids.includes(id);
  }

  function toggle(id: string) {
    setIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];

      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }

  const count = useMemo(() => ids.length, [ids]);

  return { ids, has, toggle, count };
}