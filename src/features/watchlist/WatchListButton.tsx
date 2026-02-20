"use client";

import { MouseEvent } from "react";

type WatchListButtonProps = {
  active: boolean;
  onToggle: () => void;
  size?: "sm" | "md";
};

export default function WatchListButton({
  active,
  onToggle,
  size = "sm",
}: WatchListButtonProps) {
  const dimension =
    size === "sm" ? "h-8 w-8 text-sm" : "h-10 w-10 text-base";

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    onToggle();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      className={[
        "flex items-center justify-center rounded-full border transition",
        "border-white/10 bg-white/5 hover:bg-white/10",
        active ? "text-yellow-300" : "text-white/60 hover:text-white",
        dimension,
      ].join(" ")}
    >
      {active ? "★" : "☆"}
    </button>
  );
}