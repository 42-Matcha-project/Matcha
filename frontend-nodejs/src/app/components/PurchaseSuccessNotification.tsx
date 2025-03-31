"use client";

import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { PurchaseSuccess } from "../../types/settlement";

interface PurchaseSuccessNotificationProps {
  purchaseSuccess: PurchaseSuccess;
}

export default function PurchaseSuccessNotification({
  purchaseSuccess,
}: PurchaseSuccessNotificationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ type: "spring", damping: 15 }}
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-50 to-green-100 px-5 py-3 rounded-lg shadow-lg z-50 border-2 border-green-200 flex items-center"
    >
      <div className="bg-green-500 p-2 rounded-full mr-3">
        <ShoppingBag className="h-5 w-5 text-white" />
      </div>
      <div className="text-green-800 font-medium">
        {purchaseSuccess.name}を購入しました！
      </div>
    </motion.div>
  );
}
