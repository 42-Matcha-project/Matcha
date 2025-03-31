"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { Building } from "../../types/settlement";

interface BuildingDetailsDialogProps {
  building: Building;
  onClose: () => void;
  onCreateRoom: () => void;
}

export default function BuildingDetailsDialog({
  building,
  onClose,
  onCreateRoom,
}: BuildingDetailsDialogProps) {
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
          <Home className="h-8 w-8 text-white" />
        </div>

        <h3 className="text-2xl font-bold text-amber-900 mt-6 mb-2 text-center">
          {building.name}
        </h3>

        <div className="flex justify-center mb-4">
          <div className="relative w-96 h-96">
            <Image
              src={building.image || "/placeholder.svg"}
              alt={building.name}
              fill
              className="object-contain drop-shadow-lg"
              quality={95}
              priority
            />
          </div>
        </div>

        <div className="bg-white/60 p-4 rounded-xl mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-amber-800">レベル</span>
            <span className="font-bold text-amber-900">
              Lv.{building.level}
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-amber-200">
            <p className="text-amber-800 text-sm leading-relaxed">
              {building.description || "詳細情報がありません。"}
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            className="flex-1 py-3 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
            onClick={onClose}
          >
            閉じる
          </button>

          <button
            className="flex-1 py-3 rounded-lg font-medium transition-colors flex justify-center items-center bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
            onClick={onCreateRoom}
          >
            自習ルーム作成
            <Home className="h-5 w-5 ml-2" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
