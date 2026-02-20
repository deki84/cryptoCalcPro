"use client";

import { motion } from "framer-motion";

type Props = {
  size?: number;
};

export default function HexagonLogo({ size = 80 }: Props) {
  return (
    <motion.div
      aria-label="CryptoCalc Logo"
      style={{ width: size, height: size }}
      className="select-none"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.svg
  viewBox="0 0 100 100"
  width={size}
  height={size}
  className="drop-shadow-[0_0_25px_rgba(250,204,21,0.25)]"
  animate={{ y: [0, -2, 0] }}
  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
>
  <defs>
    <linearGradient id="hexGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#F7D154" />
      <stop offset="100%" stopColor="#D18B2C" />
    </linearGradient>
  </defs>

  {/* Outer Hex */}
  <path
    d="M50 8 L85 28.5 L85 71.5 L50 92 L15 71.5 L15 28.5 Z"
    fill="none"
    stroke="url(#hexGrad)"
    strokeWidth="6"
    strokeLinejoin="round"
    strokeLinecap="round"
  />

  {/* Inner Hex (minimal, modern look) */}
  <path
    d="M50 26 L70 37 L70 63 L50 74 L30 63 L30 37 Z"
    fill="none"
    stroke="url(#hexGrad)"
    strokeWidth="5"
    strokeLinejoin="round"
    strokeLinecap="round"
    opacity="0.85"
  />
</motion.svg>
    </motion.div>
  );
}