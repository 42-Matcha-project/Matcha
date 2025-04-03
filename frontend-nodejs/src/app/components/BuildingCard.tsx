"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Coins, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Building } from "../../types/settlement";

interface BuildingCardProps {
  building: Building;
  isSelected: boolean;
  isLoaded: boolean;
  isMounted: boolean;
  shouldShowAnimation: boolean;
  onClick: (buildingId: string, e: React.MouseEvent) => void;
}

export default function BuildingCard({
  building,
  isSelected,
  isLoaded,
  isMounted,
  shouldShowAnimation,
  onClick,
}: BuildingCardProps) {
  const scale = isSelected ? 1.25 : 1;

  // 初回演出時のみ遅延を適用、それ以外は即表示
  const positionBasedDelay = shouldShowAnimation
    ? isSelected
      ? 0.1
      : isLoaded
        ? 1.5 + (building.position.x + building.position.y) / 400
        : 0
    : 0;

  // 初期状態も演出の有無に基づいて変更
  const initialProps = shouldShowAnimation
    ? { opacity: 0, scale: 0.2, y: 30 }
    : { opacity: 1, scale: scale, y: isSelected ? -20 : 0 };

  return (
    <motion.div
      key={building.id}
      initial={initialProps}
      animate={{
        opacity: isLoaded && isMounted ? 1 : 0,
        scale: isLoaded && isMounted ? scale : 0.2,
        x: isSelected ? 0 : 0,
        y: isSelected ? -20 : isLoaded && isMounted ? 0 : 30,
      }}
      className={cn(
        "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 building-item",
        building.isUnlocked ? "" : "grayscale opacity-70",
        // 初回演出時のみblur効果を適用、それ以外の場合は適用しない
        shouldShowAnimation && !(isLoaded && isMounted) ? "blur-md" : "",
      )}
      whileHover={{
        y: -15,
        scale: building.id === "house" ? 1.15 : 1.1,
        transition: {
          type: "spring",
          stiffness: 500,
          damping: 8,
          duration: 0.2,
        },
      }}
      transition={{
        delay: positionBasedDelay,
        duration: isSelected ? 0.4 : shouldShowAnimation ? 1.2 : 0.3,
        type: "spring",
        stiffness: isSelected ? 200 : 50,
        damping: isSelected ? 15 : 12,
      }}
      style={{
        left: `${building.position.x}%`,
        top: `${building.position.y}%`,
        zIndex: isSelected ? 30 : 20,
      }}
      onClick={(e) => onClick(building.id, e)}
    >
      <div
        className={cn(
          "relative flex flex-col items-center transition-all duration-200",
          "hover:drop-shadow-[0_15px_15px_rgba(217,119,6,0.25)]",
          building.id === "house" && "scale-150",
        )}
      >
        {/* ホバー時のグロー効果 */}
        <div
          className={cn(
            "absolute -inset-2 rounded-xl transition-all duration-300 -z-10",
            building.isUnlocked
              ? "group-hover:bg-amber-400/10"
              : "group-hover:bg-amber-400/5",
          )}
        ></div>

        {/* 建物画像 */}
        <div
          className={cn(
            "relative mb-2",
            building.id === "house" ? "w-48 h-48" : "w-40 h-40",
          )}
        >
          <Image
            src={building.image || "/placeholder.svg"}
            alt={building.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={cn(
              "object-contain drop-shadow-lg transition-all duration-1000",
              isLoaded && isMounted ? "filter-none" : "blur-sm",
              building.isUnlocked
                ? "hover:drop-shadow-[0_8px_24px_rgba(217,119,6,0.4)]"
                : "hover:drop-shadow-[0_8px_24px_rgba(217,119,6,0.2)]",
            )}
            quality={95}
            priority={
              isLoaded &&
              isMounted &&
              (building.id === "house" || building.id === "cafe")
            }
          />

          {/* 選択インジケーター */}
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -top-4 -right-4 bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md"
            >
              ✓
            </motion.div>
          )}

          {/* 選択中インジケーター (リング) */}
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{
                opacity: 1,
                scale: [1, 1.05, 1],
                transition: {
                  scale: {
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                    repeatType: "mirror",
                  },
                },
              }}
              className="absolute -inset-4 rounded-full border-2 border-amber-500/60 z-0"
            ></motion.div>
          )}

          {/* 購入インジケーター（未購入の建物） */}
          {!building.isUnlocked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute top-0 right-0 bg-amber-600 text-white text-xs px-2 py-1 rounded-full shadow-md flex items-center">
                <Coins className="h-3 w-3 mr-1 text-yellow-300" />
                <span>{building.price}</span>
              </div>

              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full"
                whileHover={{
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                }}
              >
                <motion.div
                  className="bg-amber-500 text-white p-2 rounded-full shadow-md flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                >
                  <ShoppingBag className="h-8 w-8" />
                </motion.div>
              </motion.div>

              <motion.div
                className="absolute -bottom-6 bg-amber-700 text-white text-xs px-2 py-1 rounded-full"
                whileHover={{
                  y: -2,
                  scale: 1.05,
                  backgroundColor: "rgba(180, 83, 9, 1)",
                }}
              >
                クリックして購入
              </motion.div>
            </div>
          )}
        </div>

        {/* 建物名 */}
        <div
          className={cn(
            "px-3 py-1 rounded-full text-center shadow-md transition-all duration-300",
            isSelected
              ? "bg-amber-600 text-white font-bold"
              : building.isUnlocked
                ? "bg-white/90 text-amber-800 hover:bg-white hover:shadow-lg"
                : "bg-white/70 text-amber-800/80 hover:bg-white/80",
          )}
        >
          <span className="text-sm">{building.name}</span>
          {building.level > 1 && (
            <span className="ml-1 text-xs">Lv.{building.level}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
