"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Coins, ShoppingBag } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Building, UserStats } from "../../types/settlement";

interface PurchaseDialogProps {
  building: Building;
  userStats: UserStats;
  onPurchase: (building: Building) => void;
  onClose: () => void;
}

export default function PurchaseDialog({
  building,
  userStats,
  onPurchase,
  onClose,
}: PurchaseDialogProps) {
  const hasEnoughCoins = userStats.coins >= building.price;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 20 }}
        className="bg-gradient-to-b from-amber-50 to-amber-100 p-6 rounded-2xl shadow-xl max-w-md mx-4 relative"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-amber-500 p-3 rounded-full shadow-lg">
          <ShoppingBag className="h-8 w-8 text-white" />
        </div>

        <h3 className="text-2xl font-bold text-amber-900 mt-6 mb-4 text-center">
          {building.name}を購入しますか？
        </h3>

        <div className="flex justify-center mb-6">
          <div className="relative w-72 h-72">
            <Image
              src={building.image || "/placeholder.svg"}
              alt={building.name}
              fill
              className="object-contain drop-shadow-lg"
              quality={95}
            />
          </div>
        </div>

        <div className="bg-white/60 p-4 rounded-xl mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-amber-800">価格</span>
            <div className="flex items-center text-amber-900 font-bold">
              <Coins className="h-4 w-4 mr-1 text-yellow-500" />
              <span>{building.price} コイン</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-amber-800">所持コイン</span>
            <div className="flex items-center text-amber-900 font-bold">
              <Coins className="h-4 w-4 mr-1 text-yellow-500" />
              <span>{userStats.coins} コイン</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-amber-200">
            <div className="flex justify-between items-center">
              <span className="text-amber-800">購入後残高</span>
              <div
                className="flex items-center font-bold"
                style={{
                  color: hasEnoughCoins ? "#65a30d" : "#dc2626",
                }}
              >
                <Coins
                  className="h-4 w-4 mr-1"
                  style={{
                    color: hasEnoughCoins ? "#65a30d" : "#dc2626",
                  }}
                />
                <span>{userStats.coins - building.price} コイン</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            className="flex-1 py-3 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
            onClick={onClose}
          >
            キャンセル
          </button>

          <button
            className={cn(
              "flex-1 py-3 rounded-lg font-medium transition-colors flex justify-center items-center",
              hasEnoughCoins
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed",
            )}
            onClick={() => hasEnoughCoins && onPurchase(building)}
            disabled={!hasEnoughCoins}
          >
            購入する
            <ShoppingBag className="h-5 w-5 ml-2" />
          </button>
        </div>

        {!hasEnoughCoins && (
          <div className="mt-3 text-center text-sm text-red-500">
            コインが足りません。勉強を続けてコインを集めましょう！
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
