"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Home,
  BookOpen,
  User,
  Calendar,
  ShoppingBag,
  Gift,
  Coins,
} from "lucide-react";
import { UserStats } from "../types/settlement";

interface SettlementHeaderProps {
  currentTime: Date;
  userStats: UserStats;
  isMounted: boolean;
  showStoreTooltip: boolean;
  showGiftTooltip: boolean;
  setShowStoreTooltip: (show: boolean) => void;
  setShowGiftTooltip: (show: boolean) => void;
  goToStore: () => void;
  goToGifts: () => void;
}

export default function SettlementHeader({
  currentTime,
  userStats,
  isMounted,
  showStoreTooltip,
  showGiftTooltip,
  setShowStoreTooltip,
  setShowGiftTooltip,
  goToStore,
  goToGifts,
}: SettlementHeaderProps) {
  return (
    <header className="bg-amber-800 text-amber-50 p-4 flex items-center justify-between z-50 sticky top-0 left-0 right-0 font-sans">
      <div className="flex items-center">
        <Home className="h-7 w-7 mr-2" />
        <h1 className="text-1xl font-bold tracking-wide">マイ開拓地</h1>
        <span className="ml-3 bg-amber-700 px-3 py-1 rounded text-base font-semibold">
          Lv.{userStats.level}
        </span>
      </div>

      <div className="flex items-center space-x-6">
        {/* コイン表示 */}
        <div className="flex items-center bg-amber-700/80 px-4 py-2 rounded-full">
          <Coins className="h-6 w-6 mr-2 text-yellow-300" />
          <span className="text-lg font-bold text-yellow-50">
            {userStats.coins}
          </span>
        </div>

        <div className="flex items-center">
          <Clock className="h-6 w-6 mr-2" />
          <span className="text-lg font-medium">
            {isMounted
              ? currentTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "00:00"}
          </span>
        </div>

        <div className="flex items-center">
          <Calendar className="h-6 w-6 mr-2" />
          <span className="text-lg font-medium">
            {userStats.dayStreak}日連続
          </span>
        </div>

        <div className="flex items-center">
          <BookOpen className="h-6 w-6 mr-2" />
          <span className="text-lg font-medium">
            {userStats.totalStudyHours}時間
          </span>
        </div>

        <div className="flex items-center bg-amber-700 px-4 py-2 rounded">
          <User className="h-6 w-6 mr-2" />
          <span className="text-lg font-semibold">{userStats.username}</span>
        </div>

        {/* ストアボタン */}
        <div className="relative">
          <motion.button
            className="relative bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-full shadow-md flex items-center justify-center group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setShowStoreTooltip(true)}
            onMouseLeave={() => setShowStoreTooltip(false)}
            onClick={goToStore}
          >
            <ShoppingBag className="h-5 w-5 text-white" />
            {/* 光沢エフェクト */}
            <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </motion.button>

          <AnimatePresence>
            {showStoreTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.9 }}
                className="absolute right-0 top-full mt-2 bg-amber-100 text-amber-900 px-3 py-1.5 rounded shadow-lg z-10 whitespace-nowrap font-medium text-sm"
              >
                ストアで建物を購入
                <div className="absolute right-3 -top-1 w-2 h-2 bg-amber-100 transform rotate-45"></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* プレゼントボタン */}
        <div className="relative">
          <motion.button
            className="relative bg-gradient-to-br from-red-400 to-red-500 p-2 rounded-full shadow-md flex items-center justify-center group"
            whileHover={{
              scale: 1.1,
              rotate: [0, -5, 5, -5, 0],
              transition: { rotate: { repeat: 0, duration: 0.5 } },
            }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setShowGiftTooltip(true)}
            onMouseLeave={() => setShowGiftTooltip(false)}
            onClick={goToGifts}
          >
            <Gift className="h-5 w-5 text-white" />
            {/* 光沢エフェクト */}
            <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            {/* キラキラエフェクト */}
            <span className="absolute -top-1 -right-0 w-2.5 h-2.5 rounded-full bg-yellow-300 animate-ping"></span>
          </motion.button>

          <AnimatePresence>
            {showGiftTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.9 }}
                className="absolute right-0 top-full mt-2 bg-red-100 text-red-900 px-3 py-1.5 rounded shadow-lg z-10 whitespace-nowrap font-medium text-sm"
              >
                プレゼントを受け取る
                <div className="absolute right-3 -top-1 w-2 h-2 bg-red-100 transform rotate-45"></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
