"use client";

import { useState, useEffect } from "react";
import CryptoCalculator from "@/features/crypto/CryptoCalculator";
import PortfolioPage from "@/features/portfolio/PortfolioPage";
import WatchlistPage from "@/features/watchlist/WatchListPage";
import HexagonLogo from "@/components/HexagonLogo";
import { useUser, useClerk } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

function DashboardContent() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";
  const { isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
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

  useEffect(() => {
    if (isLoaded && !isSignedIn && !isDemo) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, isDemo, router]);

  if (!mounted || !isLoaded) return null;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Navbar */}
      <div className="fixed top-3 right-3 sm:top-4 sm:right-6 z-50 flex items-center gap-2 sm:gap-3">
        {isDemo && (
          <button
            onClick={() => router.push("/")}
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-zinc-700 text-zinc-300 text-xs sm:text-sm font-medium hover:bg-zinc-800 transition"
          >
            ← Back
          </button>
        )}

        {isSignedIn && !isDemo && (
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-zinc-700 text-zinc-300 text-xs sm:text-sm font-medium hover:bg-zinc-800 transition"
          >
            Sign Out
          </button>
        )}
      </div>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 sm:pb-20">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="flex justify-center mb-4 sm:mb-6">
            <HexagonLogo size={100} />
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">
            CryptoCalc Pro
          </h1>

          <p className="text-zinc-400 mt-3 sm:mt-4 max-w-2xl mx-auto text-sm sm:text-base">
            Live crypto rates
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="inline-flex rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur p-1">
            <TabButton
              active={tab === "calculator"}
              onClick={() => setTab("calculator")}
            >
              Calculator
            </TabButton>
            <TabButton
              active={tab === "portfolio"}
              onClick={() => setTab("portfolio")}
            >
              Portfolio
            </TabButton>
            <TabButton
              active={tab === "watchlist"}
              onClick={() => setTab("watchlist")}
            >
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
        "px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition",
        active
          ? "bg-yellow-400 text-black"
          : "text-zinc-200 hover:bg-zinc-950/40",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
