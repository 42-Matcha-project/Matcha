"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building, UserStats } from "../../types/settlement";
import { useRouter } from "next/navigation";

// データのインポート
import { buildings } from "../../data/buildings";
import { cloudEffects } from "../../data/cloudEffects";
import { initialUserStats } from "../../data/initialUserStats";

// カスタムフック
import { useTimeManager } from "../../hooks/useTimeManager";
import { useAnimationState } from "../../hooks/useAnimationState";
import { useBuildingManager } from "../../hooks/useBuildingManager";
import { useSettlementNavigation } from "../../hooks/useSettlementNavigation";
import { useAuth } from "../../contexts/AuthContext";

// コンポーネントをインポート
import SettlementHeader from "../components/SettlementHeader";
import BuildingCard from "../components/BuildingCard";
import PurchaseDialog from "../components/PurchaseDialog";
import BuildingDetailsDialog from "../components/BuildingDetailsDialog";
import CloudAnimation from "../components/CloudAnimation";
import PurchaseSuccessNotification from "../components/PurchaseSuccessNotification";
import ActionButton from "../components/ActionButton";

// Add import for the initializeBuildingState function
import { initializeBuildingState } from "../../utils/buildingStateUtils";

export default function SettlementPage() {
  // 時間管理フックを使用
  const { currentTime, isMounted } = useTimeManager();

  // アニメーション状態管理フックを使用
  const { isLoaded, showClouds, shouldShowAnimation, contentVisible } =
    useAnimationState(isMounted);

  // 認証コンテキストを使用
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // ユーザー情報の状態
  const [userStats, setUserStats] = useState<UserStats>(initialUserStats);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ユーザーの統計情報を取得する関数
  const fetchUserStats = useCallback(async () => {
    if (!token) return;

    try {
      // プロフィールAPIからユーザーデータを取得
      // AbortControllerでタイムアウトを設定
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒タイムアウト

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/profile/get`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      // if (!isAuthenticated) {
      //   setError("認証情報がありません。ログインしてください。");
      //   router.push("/login");
      //   return;
      // }

      // JSONレスポンスを取得
      const data = await response.json();

      // データの存在確認とフォーマット検証を柔軟に行う
      const userData = data.User || data.user || data;

      if (
        !userData ||
        (typeof userData === "object" && Object.keys(userData).length === 0)
      ) {
        throw new Error("ユーザー情報が見つかりません");
      }

      // APIから取得したデータでユーザー情報を更新（プロパティ名のバリエーションに対応）
      setUserStats({
        level: userData.Level || userData.level || 1,
        dayStreak: userData.DayStreak || userData.dayStreak || 0,
        totalStudyHours:
          userData.TotalStudyHours || userData.totalStudyHours || 0,
        username: userData.Username || userData.username || "開拓者",
        coins: userData.CoinCount || userData.coinCount || userData.coins || 0,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "ユーザーデータ取得に失敗しました",
      );

      // if (!isAuthenticated) {
      //   setTimeout(() => {
      //     router.push("/login");
      //   }, 3000); // 3秒後にリダイレクト（エラーメッセージを見せるため）
      // }
    }
  }, [token, router]);

  // 初期ロード時に認証状態を確認し、ユーザーデータを取得
  useEffect(() => {
    const initializeUserData = async () => {
      setIsLoading(true);
      try {
        // 認証ロード中は何もしない
        if (authLoading) {
          return;
        }

        // 認証済みならユーザーデータを取得
        await fetchUserStats();
      } catch (err) {
        console.error("認証またはデータ取得中にエラー:", err);
        setError("認証またはデータ取得中にエラーが発生しました");
      } finally {
        setIsLoading(false);
      }
    };

    initializeUserData();
  }, [fetchUserStats, router, isAuthenticated, authLoading]);

  // 初期化処理: 建物の状態を初期化
  useEffect(() => {
    initializeBuildingState(buildings);
  }, []);

  // 建物管理フックを使用
  const {
    selectedBuilding,
    showPurchaseDialog,
    showBuildingDetails,
    purchaseSuccess,
    managedBuildings,
    handleBuildingClick,
    purchaseBuilding,
    clearSelection,
    closePurchaseDialog,
    closeBuildingDetails,
  } = useBuildingManager(buildings, userStats.coins);

  // ナビゲーションフックを使用
  const {
    showStoreTooltip,
    showGiftTooltip,
    setShowStoreTooltip,
    setShowGiftTooltip,
    goToCreateRoom,
    goToJoinRoom,
    goToStore,
    goToGifts,
  } = useSettlementNavigation();

  const containerRef = useRef<HTMLDivElement>(null);

  // 雲のデータを使用
  const clouds = cloudEffects;

  // --- Lazy rendering state ---
  const [visibleCount, setVisibleCount] = useState(10);
  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 500
      ) {
        setVisibleCount((prev) => Math.min(prev + 10, managedBuildings.length));
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [managedBuildings.length]);

  // 実際の購入処理（UI表示とメッセージ）
  const handlePurchase = (building: Building) => {
    const success = purchaseBuilding(building);
    if (success) {
      // 実際のシステムではここでデータを更新
      // この例では表示だけのデモ
      alert(
        `${building.name}の購入に成功しました！（実際の購入処理は実装予定です）`,
      );
    } else {
      // コインが足りない場合
      alert("コインが足りません！勉強を続けてコインを集めましょう。");
    }
  };

  return (
    <div
      className="min-h-screen relative"
      onClick={(e) => {
        // クリックされた要素が建物でない場合のみ選択状態をリセット
        if ((e.target as HTMLElement).closest(".building-item") === null) {
          clearSelection();
        }
      }}
      style={{ scrollBehavior: "smooth" }}
    >
      {/* ユーザーデータ読み込み中または認証確認中の表示 */}
      {isLoading && (
        <div className="fixed inset-0 bg-amber-50/90 z-[9999] flex flex-col items-center justify-center">
          <div className="animate-spin w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full mb-4"></div>
          <p className="text-amber-800 font-bold text-lg">
            データを読み込み中...
          </p>
        </div>
      )}

      {/* APIエラーメッセージ */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-50 border-2 border-red-400 text-red-700 px-4 py-3 rounded z-[9999] shadow-lg">
          <p className="font-bold">エラーが発生しました</p>
          <p>{error}</p>
        </div>
      )}

      {/* 背景パターン */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundColor: "#FEF3C7",
          backgroundImage: "url('/images/background2.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* 初期ロード時のブロッキングオーバーレイ */}
      {!contentVisible && (
        <div className="fixed inset-0 bg-amber-50 z-[9999]"></div>
      )}

      {/* コンテンツラッパー - 初期ロード時に非表示 */}
      <div
        className={`${contentVisible ? "opacity-100" : "opacity-0"} transition-opacity duration-500`}
      >
        {/* ページ全体の霧エフェクト - 徐々に消える */}
        <AnimatePresence>
          {isLoaded && isMounted && shouldShowAnimation && (
            <motion.div
              className="fixed inset-0 bg-white/50 z-20 pointer-events-none"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 3, delay: 2 }}
            />
          )}
        </AnimatePresence>

        {/* SettlementHeaderコンポーネントを配置 */}
        <div className="fixed top-0 left-0 w-full z-30">
          <SettlementHeader
            currentTime={currentTime}
            userStats={userStats}
            isMounted={isMounted}
            showStoreTooltip={showStoreTooltip}
            showGiftTooltip={showGiftTooltip}
            setShowStoreTooltip={setShowStoreTooltip}
            setShowGiftTooltip={setShowGiftTooltip}
            goToStore={goToStore}
            goToGifts={goToGifts}
          />
        </div>

        {/* PC: 右端3分の1の位置に縦積み、スマホ: 幅いっぱいで3分の1の位置 */}
        {/* PC用 */}
        <div className="hidden sm:flex flex-col gap-4 fixed top-1/4 right-8 z-40 w-auto">
          <ActionButton color="amber" onClick={goToCreateRoom}>
            ルームを作成
          </ActionButton>
          <ActionButton color="dark-amber" onClick={goToJoinRoom}>
            ルームに参加
          </ActionButton>
        </div>
        {/* スマホ用 */}
        <div className="flex sm:hidden flex-col gap-3 fixed right-4 left-4 top-1/4 z-40">
          <ActionButton
            color="amber"
            onClick={goToCreateRoom}
            className="w-full"
          >
            ルームを作成
          </ActionButton>
          <ActionButton
            color="dark-amber"
            onClick={goToJoinRoom}
            className="w-full"
          >
            ルームに参加
          </ActionButton>
        </div>

        {/* メインコンテンツ */}
        <main
          className="fixed inset-0 w-full h-full flex items-center justify-center z-10 pt-20"
          ref={containerRef}
        >
          {/* 建物配置エリア */}
          <div
            id="map-area"
            className="w-full max-w-5xl h-[80vh] mx-auto rounded-xl overflow-auto flex flex-wrap items-center justify-center gap-8 p-8"
          >
            {managedBuildings.slice(0, visibleCount).map((building, idx) => (
              <BuildingCard
                key={building.id}
                building={building}
                isSelected={selectedBuilding === building.id}
                isLoaded={isLoaded}
                isMounted={isMounted}
                shouldShowAnimation={shouldShowAnimation}
                onClick={handleBuildingClick}
                priority={idx === 0}
              />
            ))}
          </div>

          {/* 雲のアニメーション */}
          <AnimatePresence>
            {showClouds && isMounted && (
              <CloudAnimation
                clouds={clouds}
                showClouds={showClouds}
                isMounted={isMounted}
              />
            )}
          </AnimatePresence>

          {/* 購入ダイアログ */}
          <AnimatePresence>
            {showPurchaseDialog && (
              <PurchaseDialog
                building={showPurchaseDialog}
                userStats={userStats}
                onPurchase={handlePurchase}
                onClose={closePurchaseDialog}
              />
            )}
          </AnimatePresence>

          {/* 購入成功通知 */}
          {purchaseSuccess && (
            <PurchaseSuccessNotification purchaseSuccess={purchaseSuccess} />
          )}

          {/* 建物詳細ポップアップ */}
          <AnimatePresence>
            {showBuildingDetails && (
              <BuildingDetailsDialog
                building={showBuildingDetails}
                onClose={closeBuildingDetails}
                onCreateRoom={() => router.push("/myhouse")}
              />
            )}
          </AnimatePresence>

          {/* スクロールインジケーター */}
          <div className="fixed bottom-4 right-4 bg-amber-100/70 rounded-full p-3 shadow-lg backdrop-blur-sm z-40">
            <div className="text-amber-800 text-sm font-medium mb-1 text-center">
              スクロールして探索
            </div>
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-amber-600"
              >
                <path d="M12 5v14"></path>
                <path d="m19 12-7 7-7-7"></path>
              </svg>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
