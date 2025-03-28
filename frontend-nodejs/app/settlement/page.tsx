"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
import { cn } from "@/lib/utils";

// 建物の型定義
interface Building {
  id: string;
  name: string;
  level: number;
  isUnlocked: boolean;
  requiredLevel: number;
  price: number;
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
  const [shouldShowAnimation, setShouldShowAnimation] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState<Building | null>(
    null,
  );
  const [purchaseSuccess, setPurchaseSuccess] = useState<{
    buildingId: string;
    name: string;
  } | null>(null);
  const [showStoreTooltip, setShowStoreTooltip] = useState(false);
  const [showGiftTooltip, setShowGiftTooltip] = useState(false);

  const [userStats] = useState({
    level: 1,
    dayStreak: 3,
    totalStudyHours: 12.5,
    username: "開拓者",
    coins: 250, // ユーザーが所持するコイン
  });

  // 建物データ
  const buildings: Building[] = [
    {
      id: "house",
      name: "マイハウス",
      level: 1,
      isUnlocked: true,
      requiredLevel: 1,
      price: 0,
      position: { x: 50, y: 50 },
      image: "/placeholder.svg?height=120&width=120",
    },
    {
      id: "library",
      name: "図書館",
      level: 3,
      isUnlocked: false,
      requiredLevel: 3,
      price: 100,
      position: { x: 25, y: 25 },
      image: "/placeholder.svg?height=120&width=120",
    },
    {
      id: "school",
      name: "小学校",
      level: 5,
      isUnlocked: false,
      requiredLevel: 5,
      price: 250,
      position: { x: 75, y: 25 },
      image: "/placeholder.svg?height=120&width=120",
    },
    {
      id: "university",
      name: "大学",
      level: 10,
      isUnlocked: false,
      requiredLevel: 10,
      price: 500,
      position: { x: 25, y: 75 },
      image: "/placeholder.svg?height=120&width=120",
    },
    {
      id: "lab",
      name: "研究所",
      level: 15,
      isUnlocked: false,
      requiredLevel: 15,
      price: 750,
      position: { x: 75, y: 75 },
      image: "/placeholder.svg?height=120&width=120",
    },
    {
      id: "cafe",
      name: "カフェ",
      level: 7,
      isUnlocked: false,
      requiredLevel: 7,
      price: 300,
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

    // LocalStorageをチェックして初回訪問かどうか確認
    const hasSeenAnimation =
      localStorage.getItem("hasSeenCloudAnimation") === "true";
    if (!hasSeenAnimation) {
      // 初回訪問時は演出を表示
      setShouldShowAnimation(true);
    } else {
      // 2回目以降は演出をスキップして直接コンテンツを表示
      // スムーズな表示のため、すべての状態を一度に設定
      setIsLoaded(true);
      setShowClouds(false);
      setShowButtons(true);
    }
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
    if (!isMounted || !shouldShowAnimation) return;

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

      // アニメーションを見たことをローカルストレージに記録
      localStorage.setItem("hasSeenCloudAnimation", "true");
    };

    sequence();
  }, [isMounted, shouldShowAnimation]);

  // 建物を選択または購入
  const handleBuildingClick = (buildingId: string) => {
    const building = buildings.find((b) => b.id === buildingId);
    if (!building) return;

    if (building.isUnlocked) {
      setSelectedBuilding(buildingId);
    } else {
      // 未購入の建物の場合は購入ダイアログを表示
      setShowPurchaseDialog(building);
    }
  };

  // 建物を購入する
  const purchaseBuilding = (building: Building) => {
    // 十分なコインがあるか確認
    if (userStats.coins >= building.price) {
      // 実際のシステムでは、ここでAPIリクエストを送信してユーザーデータを更新する

      // 疑似的な購入成功の処理
      setPurchaseSuccess({ buildingId: building.id, name: building.name });
      setShowPurchaseDialog(null);

      // 3秒後に成功メッセージを消す
      setTimeout(() => {
        setPurchaseSuccess(null);
      }, 3000);

      // 実際のシステムではここでデータを更新
      // この例では表示だけのデモ
      alert(
        `${building.name}の購入に成功しました！（実際の購入処理は実装予定です）`,
      );
    } else {
      // コインが足りない場合
      alert("コインが足りません！勉強を続けてコインを集めましょう。");
      setShowPurchaseDialog(null);
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

  // ストアページへ移動
  const goToStore = () => {
    // 将来的にはストアページへのルーティングを実装
    alert(
      "ストアは開発中です！今後さまざまな建物やアイテムを購入できるようになります。",
    );
  };

  // プレゼントページへ移動
  const goToGifts = () => {
    // 将来的にはプレゼントページへのルーティングを実装
    alert(
      "プレゼントボックスは開発中です！今後様々な報酬を受け取れるようになります。",
    );
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
        {isLoaded && isMounted && shouldShowAnimation && (
          <motion.div
            className="absolute inset-0 bg-white/50 z-20 pointer-events-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 3, delay: 2 }}
          />
        )}
      </AnimatePresence>

      {/* ヘッダー */}
      <header className="bg-amber-800 text-amber-50 p-4 flex items-center justify-between shadow-md z-50 relative font-sans">
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
                  "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300",
                  building.isUnlocked ? "" : "grayscale opacity-70",
                  // 初回演出時のみblur効果を適用、それ以外の場合は適用しない
                  shouldShowAnimation && !(isLoaded && isMounted)
                    ? "blur-md"
                    : "",
                )}
                whileHover={{
                  y: -10,
                  scale: 1.1,
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
                onClick={() => handleBuildingClick(building.id)}
              >
                <div
                  className={cn(
                    "relative flex flex-col items-center transition-all duration-200",
                    "hover:drop-shadow-[0_15px_15px_rgba(217,119,6,0.25)]",
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
                  <div className="relative w-24 h-24 mb-2">
                    <Image
                      src={building.image || "/placeholder.svg"}
                      alt={building.name}
                      fill
                      className={cn(
                        "object-contain drop-shadow-lg transition-all duration-1000",
                        // 初回演出時のみblur効果を適用、それ以外の場合は適用しない
                        shouldShowAnimation && !(isLoaded && isMounted)
                          ? "blur-sm"
                          : "filter-none",
                        building.isUnlocked
                          ? "hover:drop-shadow-[0_8px_24px_rgba(217,119,6,0.4)]"
                          : "hover:drop-shadow-[0_8px_24px_rgba(217,119,6,0.2)]",
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
          initial={
            shouldShowAnimation ? { opacity: 0, x: -50 } : { opacity: 1, x: 0 }
          }
          animate={{
            opacity: isLoaded && isMounted ? 1 : 0,
            x: isLoaded && isMounted ? 0 : -50,
          }}
          transition={{
            delay: shouldShowAnimation ? 1 : 0,
            duration: shouldShowAnimation ? 0.8 : 0.2,
          }}
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
              initial={
                shouldShowAnimation
                  ? { opacity: 0, y: 50 }
                  : { opacity: 1, y: 0 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: shouldShowAnimation ? 0.5 : 0.2,
                type: "spring",
              }}
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

        {/* 購入ダイアログ */}
        <AnimatePresence>
          {showPurchaseDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
              onClick={() => setShowPurchaseDialog(null)}
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 20 }}
                className="bg-gradient-to-b from-amber-50 to-amber-100 p-6 rounded-2xl shadow-xl max-w-md mx-4 relative"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-amber-500 p-3 rounded-full shadow-lg">
                  <ShoppingBag className="h-8 w-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-amber-900 mt-6 mb-4 text-center">
                  {showPurchaseDialog.name}を購入しますか？
                </h3>

                <div className="bg-white/60 p-4 rounded-xl mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-amber-800">価格</span>
                    <div className="flex items-center text-amber-900 font-bold">
                      <Coins className="h-4 w-4 mr-1 text-yellow-500" />
                      <span>{showPurchaseDialog.price} コイン</span>
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
                          color:
                            userStats.coins >= showPurchaseDialog.price
                              ? "#65a30d"
                              : "#dc2626",
                        }}
                      >
                        <Coins
                          className="h-4 w-4 mr-1"
                          style={{
                            color:
                              userStats.coins >= showPurchaseDialog.price
                                ? "#65a30d"
                                : "#dc2626",
                          }}
                        />
                        <span>
                          {userStats.coins - showPurchaseDialog.price} コイン
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    className="flex-1 py-3 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
                    onClick={() => setShowPurchaseDialog(null)}
                  >
                    キャンセル
                  </button>

                  <button
                    className={cn(
                      "flex-1 py-3 rounded-lg font-medium transition-colors flex justify-center items-center",
                      userStats.coins >= showPurchaseDialog.price
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed",
                    )}
                    onClick={() =>
                      userStats.coins >= showPurchaseDialog.price &&
                      purchaseBuilding(showPurchaseDialog)
                    }
                    disabled={userStats.coins < showPurchaseDialog.price}
                  >
                    購入する
                    <ShoppingBag className="h-5 w-5 ml-2" />
                  </button>
                </div>

                {userStats.coins < showPurchaseDialog.price && (
                  <div className="mt-3 text-center text-sm text-red-500">
                    コインが足りません。勉強を続けてコインを集めましょう！
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 購入成功通知 */}
        <AnimatePresence>
          {purchaseSuccess && (
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
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
