"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Building, PurchaseSuccess } from "../types/settlement";

// データのインポート
import { buildings } from "../data/buildings";
import { cloudEffects } from "../data/cloudEffects";
import { initialUserStats } from "../data/initialUserStats";

// カスタムフック
import { useTimeManager } from "../hooks/useTimeManager";

// コンポーネントをインポート
import SettlementHeader from "../components/SettlementHeader";
import BuildingCard from "../components/BuildingCard";
import PurchaseDialog from "../components/PurchaseDialog";
import BuildingDetailsDialog from "../components/BuildingDetailsDialog";
import ActionButton from "../components/ActionButton";
import CloudAnimation from "../components/CloudAnimation";
import PurchaseSuccessNotification from "../components/PurchaseSuccessNotification";

export default function SettlementPage() {
  const router = useRouter();

  // 時間管理フックを使用
  const { currentTime, isMounted } = useTimeManager();

  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [showButtons, setShowButtons] = useState(false);
  const [showClouds, setShowClouds] = useState(false);
  const [shouldShowAnimation, setShouldShowAnimation] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState<Building | null>(
    null,
  );
  const [showBuildingDetails, setShowBuildingDetails] =
    useState<Building | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] =
    useState<PurchaseSuccess | null>(null);
  const [showStoreTooltip, setShowStoreTooltip] = useState(false);
  const [showGiftTooltip, setShowGiftTooltip] = useState(false);

  // 初期ユーザーデータを使用
  const [userStats] = useState(initialUserStats);

  // 雲のデータを使用
  const clouds = cloudEffects;

  // 初期ロード時の処理
  useEffect(() => {
    if (!isMounted) return;

    // ロード状態を確認するために少し遅延を入れる
    setTimeout(() => {
      // LocalStorageをチェックして初回訪問かどうか確認
      const hasSeenAnimation =
        localStorage.getItem("hasSeenCloudAnimation") === "true";

      if (!hasSeenAnimation) {
        // 初回訪問時は演出を表示
        setShouldShowAnimation(true);
        setShowClouds(true);

        // 少し遅延を入れてからコンテンツを表示
        setTimeout(() => {
          setContentVisible(true);
        }, 300);
      } else {
        // 2回目以降は演出をスキップして直接コンテンツを表示
        setIsLoaded(true);
        setShowButtons(true);

        // 少し遅延を入れてからコンテンツを表示
        setTimeout(() => {
          setContentVisible(true);
        }, 300);
      }
    }, 200);
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
  const handleBuildingClick = (buildingId: string, e: React.MouseEvent) => {
    // イベントの伝播を停止して、親要素のクリックイベントが発火しないようにする
    e.stopPropagation();

    const building = buildings.find((b) => b.id === buildingId);
    if (!building) return;

    if (building.isUnlocked) {
      // 既に選択されている建物をクリックした場合は選択解除
      if (selectedBuilding === buildingId) {
        setSelectedBuilding(null);
        setShowBuildingDetails(null);
      } else {
        // 他の建物が選択されていても、新しい建物を選択したら即座に切り替える
        setSelectedBuilding(buildingId);
        setShowBuildingDetails(building);
      }
    } else {
      // 未購入の建物の場合は選択状態をクリアして購入ダイアログを表示
      setSelectedBuilding(null);
      setShowBuildingDetails(null);
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
    <div
      className="min-h-screen relative"
      onClick={(e) => {
        // クリックされた要素が建物でない場合のみ選択状態をリセット
        if ((e.target as HTMLElement).closest(".building-item") === null) {
          setSelectedBuilding(null);
          setShowBuildingDetails(null);
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

        {/* ヘッダー */}
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
            {buildings.map((building) => (
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
                <ActionButton color="amber" onClick={() => goToCreateRoom()}>
                  ルームを作成
                </ActionButton>

                <ActionButton color="dark-amber" onClick={goToJoinRoom}>
                  ルームに参加
                </ActionButton>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 購入ダイアログ */}
          {showPurchaseDialog && (
            <PurchaseDialog
              building={showPurchaseDialog}
              userStats={userStats}
              onPurchase={purchaseBuilding}
              onClose={() => setShowPurchaseDialog(null)}
            />
          )}

          {/* 購入成功通知 */}
          {purchaseSuccess && (
            <PurchaseSuccessNotification purchaseSuccess={purchaseSuccess} />
          )}

          {/* 建物詳細ポップアップ */}
          {showBuildingDetails && (
            <BuildingDetailsDialog
              building={showBuildingDetails}
              onClose={() => {
                setShowBuildingDetails(null);
                setSelectedBuilding(null);
              }}
              onCreateRoom={() => {
                setShowBuildingDetails(null);
                setSelectedBuilding(null);
                goToCreateRoom();
              }}
            />
          )}

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
