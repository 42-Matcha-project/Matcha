"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building } from "../../types/settlement";
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

// コンポーネントをインポート
import SettlementHeader from "../components/SettlementHeader";
import BuildingCard from "../components/BuildingCard";
import PurchaseDialog from "../components/PurchaseDialog";
import BuildingDetailsDialog from "../components/BuildingDetailsDialog";
import ActionButton from "../components/ActionButton";
import CloudAnimation from "../components/CloudAnimation";
import PurchaseSuccessNotification from "../components/PurchaseSuccessNotification";

// Add import for the initializeBuildingState function
import { initializeBuildingState } from "../../utils/buildingStateUtils";

export default function SettlementPage() {
  // 時間管理フックを使用
  const { currentTime, isMounted } = useTimeManager();

  // アニメーション状態管理フックを使用
  const {
    isLoaded,
    showButtons,
    showClouds,
    shouldShowAnimation,
    contentVisible,
  } = useAnimationState(isMounted);

  // 初期ユーザーデータを使用
  const [userStats] = useState(initialUserStats);

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

  const router = useRouter();

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
      {/* 背景パターン */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundColor: "#FEF3C7",
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

        {/* メインコンテンツ */}
        <main
          className="relative w-full overflow-y-auto pb-32 pt-16 scroll-smooth"
          ref={containerRef}
          style={{ willChange: "scroll-position" }}
        >
          {/* 建物配置エリア */}
          <div className="relative h-[320vh] w-full z-10 mx-auto rounded-xl overflow-hidden bg-amber-100/20 backdrop-blur-sm shadow-inner pb-40">
            {managedBuildings.map((building) => (
              <BuildingCard
                key={building.id}
                building={building}
                isSelected={selectedBuilding === building.id}
                isLoaded={isLoaded}
                isMounted={isMounted}
                shouldShowAnimation={shouldShowAnimation}
                onClick={handleBuildingClick}
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

          {/* 左上のタイトル */}
          <motion.div
            className="fixed top-24 left-8 z-50 text-left"
            initial={
              shouldShowAnimation
                ? { opacity: 0, x: -50 }
                : { opacity: 1, x: 0 }
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
                className="fixed top-24 right-5 transform -translate-x-1/2 z-50 flex flex-row space-x-6"
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
                <ActionButton color="amber" onClick={goToCreateRoom}>
                  ルームを作成
                </ActionButton>

                <ActionButton color="dark-amber" onClick={goToJoinRoom}>
                  ルームに参加
                </ActionButton>
              </motion.div>
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
                onCreateRoom={
                  showBuildingDetails.id === "house"
                    ? () => router.push("/myhouse")
                    : goToCreateRoom
                }
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
