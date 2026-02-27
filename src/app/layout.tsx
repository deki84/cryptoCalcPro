import type { Metadata } from "next";
import "./globals.css";
import {
  ClerkProvider ,

} from '@clerk/nextjs'

export const metadata: Metadata = {
  title: "CryptoCalc",
  description: "Crypto calculator with live rates, history and favorites.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-white">
        {children}
      </body>
    </html>
    </ClerkProvider>
  );
}