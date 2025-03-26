"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Home, BookOpen, User, Calendar, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

// 建物の型定義
interface Building {
  id: string;
  name: string;
  level: number;
  isUnlocked: boolean;
  requiredLevel: number;
  position: {
    x: number;
    y: number;
  };
  image: string;
}

export default function SettlementPage() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [showButtons, setShowButtons] = useState(false);
  const [showClouds, setShowClouds] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [levelUpToast, setLevelUpToast] = useState<{
    show: boolean;
    message: string;
    buildingName: string;
    requiredLevel: number;
  } | null>(null);

  const [userStats] = useState({
    level: 1,
    dayStreak: 3,
    totalStudyHours: 12.5,
    username: "開拓者",
  });

  // 建物データ
  const buildings: Building[] = [
    {
      id: "house",
      name: "マイハウス",
      level: 1,
      isUnlocked: true,
      requiredLevel: 1,
      position: { x: 50, y: 50 },
      image: "/placeholder.svg?height=120&width=120",
    },
    {
      id: "library",
      name: "図書館",
      level: 3,
      isUnlocked: false,
      requiredLevel: 3,
      position: { x: 25, y: 25 },
      image: "/placeholder.svg?height=120&width=120",
    },
    {
      id: "school",
      name: "小学校",
      level: 5,
      isUnlocked: false,
      requiredLevel: 5,
      position: { x: 75, y: 25 },
      image: "/placeholder.svg?height=120&width=120",
    },
    {
      id: "university",
      name: "大学",
      level: 10,
      isUnlocked: false,
      requiredLevel: 10,
      position: { x: 25, y: 75 },
      image: "/placeholder.svg?height=120&width=120",
    },
    {
      id: "lab",
      name: "研究所",
      level: 15,
      isUnlocked: false,
      requiredLevel: 15,
      position: { x: 75, y: 75 },
      image: "/placeholder.svg?height=120&width=120",
    },
    {
      id: "cafe",
      name: "カフェ",
      level: 7,
      isUnlocked: false,
      requiredLevel: 7,
      position: { x: 50, y: 85 },
      image: "/placeholder.svg?height=120&width=120",
    },
  ];

  // 雲のデータ
  const clouds = [
    { id: 1, x: 10, y: 20, size: 160, delay: 0.2, scale: 1.7 },
    { id: 2, x: 30, y: 40, size: 180, delay: 0.5, scale: 1.8 },
    { id: 3, x: 60, y: 30, size: 200, delay: 0.3, scale: 1.9 },
    { id: 4, x: 80, y: 50, size: 170, delay: 0.7, scale: 1.6 },
    { id: 5, x: 20, y: 70, size: 190, delay: 0.4, scale: 1.8 },
    { id: 6, x: 50, y: 80, size: 160, delay: 0.6, scale: 1.7 },
    { id: 7, x: 70, y: 15, size: 200, delay: 0.1, scale: 1.9 },
    { id: 8, x: 40, y: 60, size: 220, delay: 0.8, scale: 2.0 },
    { id: 9, x: 15, y: 45, size: 180, delay: 0.35, scale: 1.7 },
    { id: 10, x: 85, y: 30, size: 190, delay: 0.55, scale: 1.8 },
    { id: 11, x: 45, y: 25, size: 170, delay: 0.25, scale: 1.6 },
    { id: 12, x: 65, y: 65, size: 200, delay: 0.65, scale: 1.9 },
  ];

  // クライアントサイドでのみマウント状態を設定
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 時計の更新
  useEffect(() => {
    if (!isMounted) return;

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [isMounted]);

  // ページロード時のアニメーション
  useEffect(() => {
    if (!isMounted) return;

    // ページロード時のアニメーションシーケンス
    const sequence = async () => {
      // 最初に少し待機
      await new Promise((resolve) => setTimeout(resolve, 800));

      // ページがロードされたことを示す
      setIsLoaded(true);

      // 雲が消えるまで待機
      await new Promise((resolve) => setTimeout(resolve, 2500));

      // 雲を消す
      setShowClouds(false);

      // ボタンを表示
      await new Promise((resolve) => setTimeout(resolve, 800));
      setShowButtons(true);
    };

    sequence();
  }, [isMounted]);

  // 建物を選択
  const handleBuildingClick = (buildingId: string) => {
    const building = buildings.find((b) => b.id === buildingId);
    if (!building) return;

    if (building.isUnlocked) {
      setSelectedBuilding(buildingId);
    } else {
      // レベルが足りない場合はトースト通知を表示
      const remainingLevels = building.requiredLevel - userStats.level;
      let message = "";

      if (remainingLevels === 1) {
        message = `あと1レベルで解放できます！もう少しですね！`;
      } else if (remainingLevels <= 3) {
        message = `あと${remainingLevels}レベルで解放できます！頑張りましょう！`;
      } else {
        message = `目標に向かって一歩ずつ進みましょう！`;
      }

      setLevelUpToast({
        show: true,
        message,
        buildingName: building.name,
        requiredLevel: building.requiredLevel,
      });

      // 3秒後に自動的に消える
      setTimeout(() => {
        setLevelUpToast(null);
      }, 4000);
    }
  };

  // ルーム作成ページへ移動
  const goToCreateRoom = () => {
    router.push("/host/building-selection");
  };

  // ルーム参加ページへ移動
  const goToJoinRoom = () => {
    router.push("/join");
  };

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* 背景パターン */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: "#FEF3C7",
        }}
      />

      {/* ページ全体の霧エフェクト - 徐々に消える */}
      <AnimatePresence>
        {isLoaded && isMounted && (
          <motion.div
            className="absolute inset-0 bg-white/50 z-20 pointer-events-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 3, delay: 2 }}
          />
        )}
      </AnimatePresence>

      {/* ヘッダー */}
      <header className="bg-amber-800 text-amber-50 p-3 flex items-center justify-between shadow-md z-50 relative">
        <div className="flex items-center">
          <Home className="h-6 w-6 mr-2" />
          <h1 className="text-lg font-bold">マイ開拓地</h1>
          <span className="ml-2 bg-amber-700 px-2 py-0.5 rounded text-xs">
            Lv.{userStats.level}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-sm">
              {isMounted
                ? currentTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "00:00"}
            </span>
          </div>

          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span className="text-sm">{userStats.dayStreak}日連続</span>
          </div>

          <div className="flex items-center">
            <BookOpen className="h-4 w-4 mr-1" />
            <span className="text-sm">{userStats.totalStudyHours}時間</span>
          </div>

          <div className="flex items-center bg-amber-700 px-2 py-1 rounded">
            <User className="h-4 w-4 mr-1" />
            <span className="text-sm">{userStats.username}</span>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main
        className="relative w-full h-[calc(100vh-60px)] overflow-hidden"
        ref={containerRef}
      >
        {/* 建物配置エリア */}
        <div className="absolute inset-0 z-10">
          {buildings.map((building) => {
            const isSelected = selectedBuilding === building.id;
            const scale = isSelected ? 1.2 : 1;
            // 位置に基づく確定的な遅延を計算（Math.randomを使わない）
            const positionBasedDelay = isSelected
              ? 0.1
              : isLoaded
                ? 1.5 + (building.position.x + building.position.y) / 400
                : 0;

            return (
              <motion.div
                key={building.id}
                initial={{ opacity: 0, scale: 0.2, y: 30 }}
                animate={{
                  opacity: isLoaded && isMounted ? 1 : 0,
                  scale: isLoaded && isMounted ? scale : 0.2,
                  x: isSelected ? 0 : 0,
                  y: isSelected ? -20 : isLoaded && isMounted ? 0 : 30,
                }}
                className={cn(
                  "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300",
                  building.isUnlocked ? "" : "grayscale opacity-70",
                  isLoaded && isMounted ? "" : "blur-md",
                )}
                whileHover={{
                  y: -10,
                  scale: 1.1,
                  transition: {
                    type: "spring",
                    stiffness: 500, // 反応速度をより速く
                    damping: 8, // 振動をより少なく
                    duration: 0.2, // より短い時間で
                  },
                }}
                transition={{
                  delay: positionBasedDelay,
                  duration: isSelected ? 0.4 : 1.2,
                  type: "spring",
                  stiffness: isSelected ? 200 : 50,
                  damping: isSelected ? 15 : 12,
                }}
                style={{
                  left: `${building.position.x}%`,
                  top: `${building.position.y}%`,
                  zIndex: isSelected ? 30 : 20,
                }}
                onClick={() => handleBuildingClick(building.id)}
              >
                <div
                  className={cn(
                    "relative flex flex-col items-center transition-all duration-200", // 少し短いトランジション
                    "hover:drop-shadow-[0_15px_15px_rgba(217,119,6,0.25)]",
                  )}
                >
                  {/* ホバー時のグロー効果 */}
                  <div
                    className={cn(
                      "absolute -inset-2 rounded-xl transition-all duration-300 -z-10",
                      building.isUnlocked
                        ? "group-hover:bg-amber-400/10"
                        : "group-hover:bg-gray-400/10",
                    )}
                  ></div>

                  {/* 建物画像 */}
                  <div className="relative w-24 h-24 mb-2">
                    <Image
                      src={building.image || "/placeholder.svg"}
                      alt={building.name}
                      fill
                      className={cn(
                        "object-contain drop-shadow-lg transition-all duration-1000",
                        isLoaded && isMounted ? "filter-none" : "blur-sm",
                        building.isUnlocked
                          ? "hover:drop-shadow-[0_8px_24px_rgba(217,119,6,0.4)]"
                          : "hover:drop-shadow-[0_8px_24px_rgba(120,120,120,0.4)]",
                      )}
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

                    {/* ロックアイコン */}
                    {!building.isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/50 rounded-full p-2">
                          <Lock className="h-6 w-6 text-white" />
                        </div>
                        <motion.div
                          className="absolute -bottom-6 bg-amber-800 text-white text-xs px-2 py-1 rounded-full"
                          whileHover={{
                            y: -2,
                            scale: 1.05,
                            backgroundColor: "rgba(180, 83, 9, 1)", // amber-800より少し明るく
                          }}
                        >
                          Lv.{building.requiredLevel}で解放
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
          })}
        </div>

        {/* 雲のアニメーション */}
        <AnimatePresence>
          {showClouds && isMounted && (
            <div className="absolute inset-0 z-40 pointer-events-none">
              {clouds.map((cloud) => (
                <motion.div
                  key={cloud.id}
                  initial={{ opacity: 1 }}
                  animate={{
                    opacity: 1,
                    y: [0, 10, 0],
                    scale: [1, 1.02, 1],
                    transition: {
                      y: {
                        repeat: Infinity,
                        duration: 5 + (cloud.id % 5),
                        ease: "easeInOut",
                        repeatType: "mirror",
                      },
                      scale: {
                        repeat: Infinity,
                        duration: 4 + (cloud.id % 3),
                        ease: "easeInOut",
                        repeatType: "mirror",
                      },
                    },
                  }}
                  exit={{
                    opacity: 0,
                    scale: cloud.scale || 1.5,
                    transition: {
                      delay: cloud.delay,
                      duration: 2,
                      ease: "easeOut",
                    },
                  }}
                  className="absolute"
                  style={{
                    left: `${cloud.x}%`,
                    top: `${cloud.y}%`,
                    width: cloud.size,
                    height: cloud.size / 1.8,
                  }}
                >
                  <div
                    className="w-full h-full bg-gradient-radial from-white via-white to-white/60 rounded-full blur-lg"
                    style={{
                      boxShadow:
                        "0 0 40px 30px rgba(255, 255, 255, 0.8), 0 0 100px 60px rgba(255, 255, 255, 0.5)",
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* 左上のタイトル */}
        <motion.div
          className="absolute top-8 left-8 z-20 text-left"
          initial={{ opacity: 0, x: -50 }}
          animate={{
            opacity: isLoaded && isMounted ? 1 : 0,
            x: isLoaded && isMounted ? 0 : -50,
          }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <div className="relative p-4 rounded-lg overflow-hidden backdrop-blur-sm border-2 border-amber-500/30 shadow-xl">
            {/* 背景グラデーション */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100/90 via-amber-50/80 to-white/70 z-0"></div>

            {/* キラキラ効果 */}
            <div className="absolute top-1 left-2 w-3 h-3 rounded-full bg-white/80 blur-[1px]"></div>
            <div className="absolute top-3 right-6 w-2 h-2 rounded-full bg-white/80 blur-[1px]"></div>
            <div className="absolute bottom-3 left-4 w-2 h-2 rounded-full bg-white/80 blur-[1px]"></div>

            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)] relative z-10 tracking-wide">
              マイ開拓地へようこそ
            </h2>
            <p className="mt-3 text-lg font-medium text-amber-800 relative z-10 leading-snug drop-shadow-sm">
              建物を選んで
              <span className="font-bold underline decoration-amber-500/60 decoration-2 underline-offset-2">
                自習室を作成
              </span>
              したり、
              <span className="font-bold underline decoration-amber-500/60 decoration-2 underline-offset-2">
                参加
              </span>
              したりできます
            </p>
          </div>
        </motion.div>

        {/* ボタンエリア - 横並び右配置 */}
        <AnimatePresence>
          {showButtons && isMounted && (
            <motion.div
              className="absolute top-8 right-5 transform -translate-x-1/2 z-30 flex flex-row space-x-6"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
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
                  className="absolute -bottom-2 -right-1 left-1 top-2 rounded-lg bg-amber-800"
                  style={{
                    transform: "translateZ(-10px)",
                    boxShadow: "inset 0 -2px 6px 1px rgba(0,0,0,0.2)",
                  }}
                ></div>

                <button
                  onClick={goToCreateRoom}
                  className="relative w-48 h-12 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-lg flex items-center justify-center z-10 border-2 border-amber-500 group-hover:border-amber-400 transition-all duration-300"
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
                  <span className="text-xl font-bold relative z-10 drop-shadow-sm group-hover:text-white transition-colors duration-300">
                    ルームを作成
                  </span>

                  {/* 押し込み時の影効果 */}
                  <div className="absolute inset-0 opacity-0 group-active:opacity-100 bg-black/10 transition-opacity duration-150"></div>
                </button>
              </motion.div>

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
                  className="absolute -bottom-2 -right-1 left-1 top-2 rounded-lg bg-amber-900"
                  style={{
                    transform: "translateZ(-10px)",
                    boxShadow: "inset 0 -2px 6px 1px rgba(0,0,0,0.2)",
                  }}
                ></div>

                <button
                  onClick={goToJoinRoom}
                  className="relative w-48 h-12 bg-gradient-to-br from-amber-600 to-amber-700 text-white rounded-lg flex items-center justify-center z-10 border-2 border-amber-600 group-hover:border-amber-500 transition-all duration-300"
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
                  <span className="text-xl font-bold relative z-10 drop-shadow-sm group-hover:text-white transition-colors duration-300">
                    ルームに参加
                  </span>

                  {/* 押し込み時の影効果 */}
                  <div className="absolute inset-0 opacity-0 group-active:opacity-100 bg-black/10 transition-opacity duration-150"></div>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* レベルアップ通知トースト */}
        <AnimatePresence>
          {levelUpToast && levelUpToast.show && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ type: "spring", damping: 15 }}
              className="fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl shadow-lg z-50 border-2 border-amber-200"
              style={{ maxWidth: "90vw", width: "auto" }}
            >
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-3 rounded-full flex items-center justify-center text-white">
                  <Lock className="h-6 w-6" />
                </div>

                <div>
                  <h3 className="text-amber-900 font-bold text-lg mb-1">
                    {levelUpToast.buildingName}はまだ解放されていません
                  </h3>
                  <p className="text-amber-800">
                    レベル{levelUpToast.requiredLevel}で解放されます。
                    {levelUpToast.message}
                  </p>
                  <div className="mt-3 bg-amber-700/10 rounded-full h-2 w-full">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, (userStats.level / levelUpToast.requiredLevel) * 100)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-amber-700">
                    <span>現在 Lv.{userStats.level}</span>
                    <span>目標 Lv.{levelUpToast.requiredLevel}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setLevelUpToast(null)}
                className="absolute top-2 right-2 text-amber-500 hover:text-amber-700 transition-colors"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
