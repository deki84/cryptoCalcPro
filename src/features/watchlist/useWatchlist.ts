"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";

const KEY = "cryptocalc_watchlist_v1";

function loadFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function useWatchlist() {
  const { isSignedIn, isLoaded } = useUser();
  const [ids, setIds] = useState<string[]>([]);

  // Load initial data
  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      fetch("/api/watchlist")
        .then((r) => r.json())
        .then((data: string[]) => setIds(data));
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIds(loadFromStorage());
    }
  }, [isSignedIn, isLoaded]);

  function has(id: string) {
    return ids.includes(id);
  }

  async function toggle(id: string) {
    if (isSignedIn) {
      const data = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coinId: id }),
      }).then((r) => r.json());
      setIds(data);
    } else {
      setIds((prev) => {
        const next = prev.includes(id)
          ? prev.filter((x) => x !== id)
          : [...prev, id];
        localStorage.setItem(KEY, JSON.stringify(next));
        return next;
      });
    }
  }

  const count = useMemo(() => ids.length, [ids]);

  return { ids, has, toggle, count };
}
