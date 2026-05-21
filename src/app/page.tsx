"use client";

import { SignInButton, SignedOut } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import HexagonLogo from "@/components/HexagonLogo";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function LandingPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) return null;

  return (
    <div className="flex flex-col items-center justify-center text-center w-full">
      {/* Logo */}
      <HexagonLogo size={120} />

      {/* Title */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mt-8">
        CryptoCalc Pro
      </h1>
      <p className="text-zinc-400 mt-4 max-w-md px-4">
        Track your crypto portfolio, calculate live rates and manage your
        watchlist.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-10">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-6 py-3 rounded-xl bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition">
              Sign In
            </button>
          </SignInButton>

          <button
            onClick={() => router.push("/dashboard?demo=true")}
            className="px-6 py-3 rounded-xl border border-zinc-700 text-zinc-300 font-semibold hover:bg-zinc-800 transition"
          >
            Try Demo
          </button>
        </SignedOut>
      </div>
    </div>
  );
}
