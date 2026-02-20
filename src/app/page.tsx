"use client";

import { useState,useEffect } from "react";
import CryptoCalculator from "@/features/crypto/CryptoCalculator";
import PortfolioPage from "@/features/portfolio/PortfolioPage";
import WatchlistPage from "@/features/watchlist/WatchListPage";
import HexagonLogo from "@/components/HexagonLogo";



export default function HomePage() {
type Tab = "calculator" | "portfolio" | "watchlist";

const [tab, setTab] = useState<Tab>("calculator");
const [mounted, setMounted] = useState(false);

useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
  setMounted(true);

  const saved = localStorage.getItem("active_tab") as Tab | null;
  if (saved) setTab(saved);
}, []);

useEffect(() => {
  if (!mounted) return;
  localStorage.setItem("active_tab", tab);
}, [tab, mounted]);

if (!mounted) return null; 

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        {/* Header */}
       
<div className="text-center mb-10">
  <div className="flex justify-center mb-6">
    <HexagonLogo size={80} />
  </div>

  <h1 className="text-5xl md:text-6xl font-bold">
    CryptoCalc Pro
  </h1>

  <p className="text-zinc-400 mt-4 max-w-2xl mx-auto">
    Live crypto rates
  </p>
</div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur p-1">
            <TabButton active={tab === "calculator"} onClick={() => setTab("calculator")}>
              Calculator
            </TabButton>
            <TabButton active={tab === "portfolio"} onClick={() => setTab("portfolio")}>
              Portfolio
            </TabButton>
           <TabButton active={tab === "watchlist"} onClick={() => setTab("watchlist")}>
  Watchlist
</TabButton>
          </div>
        </div>

        {/* Content */}
        {tab === "calculator" ? <CryptoCalculator /> : null}
      {tab === "portfolio" ? <PortfolioPage /> : null}
      {tab === "watchlist" ? <WatchlistPage /> : null}
      </section>
    </main>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-4 py-2 rounded-xl text-sm font-medium transition",
        active
          ? "bg-yellow-400 text-black"
          : "text-zinc-200 hover:bg-zinc-950/40",
      ].join(" ")}
    >
      {children}
    </button>
  );
}


