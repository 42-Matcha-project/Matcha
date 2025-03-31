"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ActionButtonProps {
  onClick: () => void;
  className?: string;
  children: ReactNode;
  color?: "amber" | "dark-amber";
}

export default function ActionButton({
  onClick,
  className,
  children,
  color = "amber",
}: ActionButtonProps) {
  const colorScheme = {
    amber: {
      bg: "bg-gradient-to-br from-amber-500 to-amber-600",
      border: "border-amber-500",
      hoverBorder: "group-hover:border-amber-400",
      panel: "bg-amber-800",
    },
    "dark-amber": {
      bg: "bg-gradient-to-br from-amber-600 to-amber-700",
      border: "border-amber-600",
      hoverBorder: "group-hover:border-amber-500",
      panel: "bg-amber-900",
    },
  };

  const scheme = colorScheme[color];

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95, y: 2 }}
      className="relative overflow-hidden group"
      style={{ perspective: "1000px" }}
    >
      {/* 底面の影 - 最下層 */}
      <div className="absolute -bottom-3 left-1 right-1 h-6 bg-amber-950/20 blur-md rounded-full z-0"></div>

      {/* 背面パネル - 押し込み効果用 */}
      <div
        className={`absolute -bottom-2 -right-1 left-1 top-2 rounded-lg ${scheme.panel}`}
        style={{
          transform: "translateZ(-10px)",
          boxShadow: "inset 0 -2px 6px 1px rgba(0,0,0,0.2)",
        }}
      ></div>

      <button
        onClick={onClick}
        className={`relative w-48 h-12 ${scheme.bg} text-white rounded-lg flex items-center justify-center z-10 border-2 ${scheme.border} ${scheme.hoverBorder} transition-all duration-300 ${className}`}
        style={{
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.1), 0 -2px 0 0 rgba(255, 255, 255, 0.3) inset, 0 2px 0 0 rgba(0, 0, 0, 0.2) inset",
          transform: "translateZ(0px)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* 左上ハイライト - 光の反射効果 */}
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-br from-white/40 to-transparent rounded-tl-lg"></div>

        {/* 右下シャドウ - 奥行き感 */}
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-black/20 to-transparent rounded-br-lg"></div>

        {/* エッジハイライト - 立体的な縁取り */}
        <div className="absolute inset-0 border-t-2 border-l-2 border-white/10 rounded-lg"></div>

        {/* ボタンテキスト */}
        <span className="text-xl font-bold relative z-10 drop-shadow-sm group-hover:text-white transition-colors duration-300 flex items-center">
          {children}
        </span>

        {/* 押し込み時の影効果 */}
        <div className="absolute inset-0 opacity-0 group-active:opacity-100 bg-black/10 transition-opacity duration-150"></div>
      </button>
    </motion.div>
  );
}
