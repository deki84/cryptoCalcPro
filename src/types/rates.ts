export const COINS = ["BTC", "ETH", "USDT", "SOL"] as const;
export const FIATS = ["EUR", "USD"] as const;

export type Coin = (typeof COINS)[number];
export type Fiat = (typeof FIATS)[number];

export type Rates = Partial<Record<Coin, { eur?: number; usd?: number }>>;