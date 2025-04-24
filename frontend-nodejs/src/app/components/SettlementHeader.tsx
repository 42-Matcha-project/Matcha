"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Home,
  BookOpen,
  Calendar,
  ShoppingBag,
  Gift,
  Coins,
  UserCircle,
} from "lucide-react";
import { UserStats } from "../../types/settlement";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

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
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string>("開拓者");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState<number>(0);

  // Get user's profile information (display name and image)
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // タイムスタンプをクエリパラメータに追加してキャッシュを回避
        const timestamp = Date.now();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/profile/get?t=${timestamp}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error("プロフィールの取得に失敗しました");
        }

        const data = await response.json();

        // データの構造を確認し、適切なフィールドからDisplayNameを取得
        if (data.Me && data.Me.DisplayName) {
          setDisplayName(data.Me.DisplayName);
        } else if (data.User && data.User.DisplayName) {
          setDisplayName(data.User.DisplayName);
        } else if (data.User && data.User.displayName) {
          setDisplayName(data.User.displayName);
        } else if (data.user && data.user.DisplayName) {
          setDisplayName(data.user.DisplayName);
        } else if (data.user && data.user.displayName) {
          setDisplayName(data.user.displayName);
        } else if (data.DisplayName) {
          setDisplayName(data.DisplayName);
        } else if (data.displayName) {
          setDisplayName(data.displayName);
        }

        // 画像URLの取得も同様に修正
        if (data.Me && data.Me.IconImageURL) {
          setProfileImage(data.Me.IconImageURL);
          setImageKey((prev) => prev + 1);
        } else if (data.User && data.User.IconImageURL) {
          setProfileImage(data.User.IconImageURL);
          setImageKey((prev) => prev + 1);
        } else if (data.user && data.user.IconImageURL) {
          setProfileImage(data.user.IconImageURL);
          setImageKey((prev) => prev + 1);
        } else if (data.user && data.user.iconImageURL) {
          setProfileImage(data.user.iconImageURL);
          setImageKey((prev) => prev + 1);
        } else if (data.IconImageURL) {
          setProfileImage(data.IconImageURL);
          setImageKey((prev) => prev + 1);
        } else if (data.iconImageURL) {
          setProfileImage(data.iconImageURL);
          setImageKey((prev) => prev + 1);
        }
      } catch (error) {
        console.error("プロフィール取得エラー:", error);
      }
    };

    fetchUserProfile();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchUserProfile();
      }
    };

    // プロフィール更新を検知して再取得
    const checkProfileUpdate = () => {
      const lastUpdate = localStorage.getItem("profileUpdated");
      if (lastUpdate) {
        fetchUserProfile();
        // 一度使ったら削除
        localStorage.removeItem("profileUpdated");
      }
    };

    // 初回ロード時とフォーカスを取得したときにプロフィール更新をチェック
    checkProfileUpdate();
    window.addEventListener("focus", checkProfileUpdate);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", checkProfileUpdate);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const navigateToProfile = () => {
    router.push("/profile");
  };

  // プロフィールボタンのホバー状態を管理
  const [showProfileTooltip, setShowProfileTooltip] = useState(false);

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

        {/* ストアボタン */}
        <div className="relative">
          <motion.button
            className="relative bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-full shadow-md flex items-center justify-center group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => setShowStoreTooltip(true)}
            onMouseLeave={() => setShowStoreTooltip(false)}
            onClick={goToStore}
          >
            <ShoppingBag className="h-6 w-6 text-white" />
          </motion.button>

          <AnimatePresence>
            {showStoreTooltip && (
              <motion.div
                className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-amber-900 text-amber-50 px-3 py-1 rounded text-sm shadow-lg"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                ストア
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* プレゼントボタン */}
        <div className="relative">
          <motion.button
            className="relative bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-full shadow-md flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => setShowGiftTooltip(true)}
            onMouseLeave={() => setShowGiftTooltip(false)}
            onClick={goToGifts}
          >
            <Gift className="h-6 w-6 text-white" />
          </motion.button>

          <AnimatePresence>
            {showGiftTooltip && (
              <motion.div
                className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-amber-900 text-amber-50 px-3 py-1 rounded text-sm shadow-lg"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                ギフト
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* プロフィールボタン */}
        <div className="relative">
          <motion.button
            className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-amber-600 p-0.5 rounded-full shadow-md flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => setShowProfileTooltip(true)}
            onMouseLeave={() => setShowProfileTooltip(false)}
            onClick={navigateToProfile}
          >
            {profileImage ? (
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={`${profileImage}?key=${imageKey}`}
                  alt={displayName}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                  priority={true}
                  fetchPriority="high"
                />
              </div>
            ) : (
              <UserCircle className="h-10 w-10 text-white" />
            )}
          </motion.button>

          <AnimatePresence>
            {showProfileTooltip && (
              <motion.div
                className="absolute -bottom-10 right-0 bg-amber-900 text-amber-50 px-3 py-1 rounded text-sm shadow-lg whitespace-nowrap"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                {displayName}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
