"use client";

import { useEffect, useMemo, useState } from "react";
import { useWatchlist } from "@/features/watchlist/useWatchlist";
import WatchListButton from "@/features/watchlist/WatchListButton";
import SelectedCoinChart from "@/features/crypto/SelectedCoinChart";

type Fiat = "EUR" | "USD";

type MarketCoin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  price: number;
  change24h: number | null;
  rank: number | null;
};

const SEARCH_RE = /^[a-zA-Z0-9\s\-]*$/;

export default function WatchlistPage() {
  const { ids, has, toggle } = useWatchlist();

  const [fiat, setFiat] = useState<Fiat>("EUR");
  const [coins, setCoins] = useState<MarketCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [queryError, setQueryError] = useState<string | null>(null);

  function handleQueryChange(v: string) {
    if (v !== "" && !SEARCH_RE.test(v)) {
      setQueryError("Keine Sonderzeichen erlaubt — nur Buchstaben und Zahlen");
    } else {
      setQueryError(null);
    }
    setQuery(v);
  }

  const [selectedCoinId, setSelectedCoinId] = useState<string>("bitcoin");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErrorMsg(null);

      try {
        const res = await fetch(
          `/api/coins?vs=${fiat.toLowerCase()}&perPage=250&page=1`,
        );
        if (!res.ok) throw new Error("API request failed");
        const data: MarketCoin[] = await res.json();
        if (!cancelled) setCoins(data);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setErrorMsg("Could not load coins. Please try again.");
          setCoins([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [fiat]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return coins;

    return coins.filter((c) => {
      return (
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      );
    });
  }, [coins, query]);

  const favorites = useMemo(() => {
    const map = new Map(coins.map((c) => [c.id, c]));
    return ids.map((id) => map.get(id)).filter(Boolean) as MarketCoin[];
  }, [ids, coins]);

  useEffect(() => {
    if (!selectedCoinId) return;
    const exists = coins.some((c) => c.id === selectedCoinId);
    if (!exists && coins.length > 0) setSelectedCoinId(coins[0].id);
  }, [coins, selectedCoinId]);

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Header / Controls */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-6">
          <div>
            <div className="text-lg font-semibold text-white">Watchlist</div>
            <div className="mt-1 text-sm text-zinc-400">
              Search coins, star favorites, and view full charts.
            </div>
          </div>

          <select
            aria-label="Select currency"
            value={fiat}
            onChange={(e) => setFiat(e.target.value as Fiat)}
            className="w-full sm:w-auto rounded-lg bg-zinc-950/40 border border-zinc-800 px-3 py-2 text-sm text-zinc-200"
          >
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </div>

        <div className="mt-4 sm:mt-5">
          <input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className={`w-full px-4 py-3 rounded-lg bg-zinc-950/40 border focus:outline-none transition ${queryError ? "border-red-500 focus:border-red-500" : "border-zinc-800 focus:border-yellow-400"}`}
            placeholder="Search (e.g. bitcoin, BTC, solana...)"
          />
          {queryError && (
            <p className="mt-1 text-xs text-red-400">{queryError}</p>
          )}
        </div>

        {loading ? (
          <div className="mt-4 text-sm text-zinc-400">Loading coins…</div>
        ) : null}
        {errorMsg ? (
          <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMsg}
          </div>
        ) : null}
      </div>

      {/* Layout: list + chart - stacks on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Coin list */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-400">Coins (Top 250)</div>
            <div className="text-xs text-zinc-500">
              Favorites: <span className="text-zinc-200">{ids.length}</span>
            </div>
          </div>

          <div className="mt-4 max-h-[400px] sm:max-h-[520px] overflow-auto">
            <ul className="divide-y divide-zinc-800/60">
              {filtered.map((c) => (
                <li
                  key={c.id}
                  className={[
                    "py-3 flex items-center justify-between gap-3 sm:gap-4 cursor-pointer",
                    selectedCoinId === c.id
                      ? "bg-white/5 -mx-2 px-2 rounded-lg"
                      : "",
                  ].join(" ")}
                  onClick={() => setSelectedCoinId(c.id)}
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <img
                      src={c.image}
                      alt=""
                      className="h-6 w-6 sm:h-7 sm:w-7 rounded-full flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-white font-medium truncate text-sm sm:text-base">
                        {c.symbol} — {c.name}
                      </div>
                      <div className="text-xs text-zinc-500">
                        Rank {c.rank ?? "—"} ·{" "}
                        {c.price.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}{" "}
                        {fiat}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    {typeof c.change24h === "number" ? (
                      <span
                        className={
                          "text-xs font-semibold px-1.5 sm:px-2 py-1 rounded-full border " +
                          (c.change24h >= 0
                            ? "text-emerald-300 border-emerald-500/30 bg-emerald-500/10"
                            : "text-rose-300 border-rose-500/30 bg-rose-500/10")
                        }
                      >
                        {c.change24h >= 0 ? "+" : ""}
                        {c.change24h.toFixed(2)}%
                      </span>
                    ) : null}

                    <WatchListButton
                      active={has(c.id)}
                      onToggle={() => toggle(c.id)}
                      size="md"
                    />
                  </div>
                </li>
              ))}

              {!loading && filtered.length === 0 ? (
                <li className="py-6 text-sm text-zinc-500">
                  No coins match your search.
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        {/* Chart + favorites */}
        <div className="flex flex-col gap-4 sm:gap-6">
          <SelectedCoinChart coinId={selectedCoinId} fiat={fiat} />

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 sm:p-6">
            <div className="text-sm text-zinc-400">Your favorites</div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {favorites.length === 0 ? (
                <div className="text-sm text-zinc-500">
                  Star coins to add them here.
                </div>
              ) : (
                favorites.slice(0, 6).map((c) => (
                  <div
                    key={c.id}
                    className="relative text-left rounded-xl border border-zinc-800 bg-zinc-950/30 px-4 py-3 hover:bg-zinc-900/40 transition"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedCoinId(c.id)}
                      className="block w-full text-left"
                    >
                      <div className="text-white font-medium">{c.symbol}</div>
                      <div className="text-xs text-zinc-500 truncate">
                        {c.name}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(c.id);
                      }}
                      className="absolute top-3 right-3 text-sm text-zinc-500 transition-colors hover:text-white"
                      aria-label={`Remove ${c.name} from favorites`}
                      title="Remove"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
