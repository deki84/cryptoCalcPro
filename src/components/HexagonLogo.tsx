"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type Props = { size?: number };

export default function HexagonLogo({ size = 120 }: Props) {
  const haloSize = Math.round(size * 2.6);

  return (
    <div
      aria-label="CryptoCalc Logo"
      style={{ width: size, height: size }}
      className="relative select-none"
    >
      <motion.div
        className="absolute left-1/2 top-1/2 -z-10 rounded-full"
        style={{
          width: haloSize,
          height: haloSize,
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(250,204,21,0.85) 0%, rgba(250,204,21,0.25) 35%, rgba(250,204,21,0) 70%)",
          filter: "blur(18px)",
        }}
        animate={{
          opacity: [0.6, 1, 0.6],
          scale: [0.98, 1.18, 0.98],
        }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="relative"
        animate={{
          y: [0, -10, 0],
          filter: [
            "drop-shadow(0 0 18px rgba(250,204,21,0.70)) drop-shadow(0 0 60px rgba(250,204,21,0.45))",
            "drop-shadow(0 0 28px rgba(250,204,21,0.95)) drop-shadow(0 0 110px rgba(250,204,21,0.70))",
            "drop-shadow(0 0 18px rgba(250,204,21,0.70)) drop-shadow(0 0 60px rgba(250,204,21,0.45))",
          ],
        }}
        transition={{ duration: 3.0, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src="/cryptocalc-logo.png"
          alt="CryptoCalc Logo"
          width={size}
          height={size}
          priority
        />
      </motion.div>
    </div>
  );
}