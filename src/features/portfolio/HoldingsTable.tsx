"use client";

type MarketCoin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  price: number;
  change24h?: number | null;
  rank: number | null;
};

type Row = {
  id: string;
  coinId: string;
  amount: number;
  coin?: MarketCoin;
  price: number;
  value: number;
};

type Props = {
  rows: Row[];
  fiat: string;
  onRemove: (id: string) => void;
  onUpdate: (id: string, amount: number) => void;
};

export default function HoldingsTable({
  rows,
  fiat,
  onRemove,
  onUpdate,
}: Props) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 sm:p-6">
      <div className="text-sm text-zinc-400">Holdings</div>

      {rows.length === 0 ? (
        <div className="mt-4 py-6 text-sm text-zinc-500">
          No holdings yet. Add your first coin above.
        </div>
      ) : (
        <>
          {/* Desktop: Table */}
          <div className="hidden sm:block mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-zinc-400">
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 pr-4">Coin</th>
                  <th className="text-right py-3 px-4">Amount</th>
                  <th className="text-right py-3 px-4">Price</th>
                  <th className="text-right py-3 pl-4">Value</th>
                  <th className="text-right py-3 pl-4">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-zinc-800/60">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        {r.coin?.image ? (
                          <img
                            src={r.coin.image}
                            alt=""
                            className="h-6 w-6 rounded-full"
                          />
                        ) : null}
                        <div>
                          <div className="font-medium text-white">
                            {r.coin
                              ? `${r.coin.symbol} — ${r.coin.name}`
                              : r.coinId}
                          </div>
                          {r.coin?.rank ? (
                            <div className="text-xs text-zinc-500">
                              Rank #{r.coin.rank}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <input
                        aria-label={`Amount for ${r.coin?.name || r.coinId}`}
                        value={String(r.amount)}
                        onChange={(e) => onUpdate(r.id, Number(e.target.value))}
                        className="w-24 text-right rounded-md bg-zinc-950/40 border border-zinc-800 px-2 py-1 focus:outline-none focus:border-yellow-400 transition"
                      />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div className="text-zinc-300">
                          {r.price.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}{" "}
                          {fiat}
                        </div>
                        {typeof r.coin?.change24h === "number" ? (
                          <span
                            className={
                              "text-xs font-semibold px-2 py-1 rounded-full border " +
                              (r.coin.change24h >= 0
                                ? "text-emerald-300 border-emerald-500/30 bg-emerald-500/10"
                                : "text-rose-300 border-rose-500/30 bg-rose-500/10")
                            }
                          >
                            {r.coin.change24h >= 0 ? "+" : ""}
                            {r.coin.change24h.toFixed(2)}%
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-3 pl-4 text-right font-semibold text-white">
                      {r.value.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}{" "}
                      {fiat}
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <button
                        onClick={() => onRemove(r.id)}
                        className="text-zinc-400 hover:text-white transition"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: Card layout */}
          <div className="sm:hidden mt-4 flex flex-col gap-3">
            {rows.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4"
              >
                {/* Coin info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {r.coin?.image ? (
                      <img
                        src={r.coin.image}
                        alt=""
                        className="h-8 w-8 rounded-full"
                      />
                    ) : null}
                    <div>
                      <div className="font-medium text-white">
                        {r.coin ? `${r.coin.symbol}` : r.coinId}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {r.coin?.name}
                      </div>
                    </div>
                  </div>
                  {typeof r.coin?.change24h === "number" ? (
                    <span
                      className={
                        "text-xs font-semibold px-2 py-1 rounded-full border " +
                        (r.coin.change24h >= 0
                          ? "text-emerald-300 border-emerald-500/30 bg-emerald-500/10"
                          : "text-rose-300 border-rose-500/30 bg-rose-500/10")
                      }
                    >
                      {r.coin.change24h >= 0 ? "+" : ""}
                      {r.coin.change24h.toFixed(2)}%
                    </span>
                  ) : null}
                </div>

                {/* Details grid */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-xs text-zinc-500">Amount</div>
                    <input
                      aria-label={`Amount for ${r.coin?.name || r.coinId}`}
                      value={String(r.amount)}
                      onChange={(e) => onUpdate(r.id, Number(e.target.value))}
                      className="mt-1 w-full rounded-md bg-zinc-950/40 border border-zinc-800 px-2 py-1 text-sm focus:outline-none focus:border-yellow-400 transition"
                    />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500">Price</div>
                    <div className="mt-1 text-zinc-300">
                      {r.price.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}{" "}
                      {fiat}
                    </div>
                  </div>
                </div>

                {/* Value + remove */}
                <div className="mt-3 flex items-center justify-between border-t border-zinc-800/60 pt-3">
                  <div>
                    <div className="text-xs text-zinc-500">Value</div>
                    <div className="font-semibold text-white">
                      {r.value.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}{" "}
                      {fiat}
                    </div>
                  </div>
                  <button
                    onClick={() => onRemove(r.id)}
                    className="text-sm text-zinc-400 hover:text-white transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
