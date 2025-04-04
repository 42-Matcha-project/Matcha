"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Building } from "../../../types/settlement";
import { buildings } from "../../../data/buildings";
import { cn } from "@/lib/utils";
import { ArrowLeft, Home, Info } from "lucide-react";

export default function BuildingSelectionPage() {
  const router = useRouter();
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [availableBuildings, setAvailableBuildings] = useState<Building[]>([]);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 利用可能な建物をフィルタリング
  useEffect(() => {
    // デモでは全ての建物を表示するか、unlocked=trueの建物だけを表示
    // 実際のシステムでは、ユーザーのレベルに基づいてフィルタリングする
    const unlocked = buildings.filter((b) => b.isUnlocked);
    setAvailableBuildings(
      unlocked.length > 0 ? unlocked : buildings.slice(0, 3),
    );

    // ロード完了
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  // 建物を選択
  const handleSelectBuilding = (buildingId: string) => {
    setSelectedBuilding(buildingId);
  };

  // 詳細表示の切り替え
  const toggleDetails = (buildingId: string) => {
    setShowDetails(showDetails === buildingId ? null : buildingId);
  };

  // 選択した建物でルーム作成へ進む
  const handleContinue = () => {
    if (selectedBuilding) {
      // マイハウスが選択された場合は直接マイハウスページへ遷移
      if (selectedBuilding === "house") {
        router.push("/myhouse");
      } else {
        // その他の建物の場合は一旦通常通りテーマ選択ページへ
        router.push(`/host/theme-selection?building=${selectedBuilding}`);
      }
    }
  };

  // 戻るボタン
  const handleGoBack = () => {
    router.back();
  };

  // 建物カードのアニメーション設定
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 * i,
        duration: 0.5,
      },
    }),
  };

  return (
    <div
      className={cn(
        "min-h-screen bg-amber-50 text-amber-900",
        "flex flex-col",
        isLoading ? "items-center justify-center" : "",
      )}
    >
      {isLoading ? (
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-amber-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4">建物情報を読み込み中...</p>
        </div>
      ) : (
        <>
          {/* ヘッダー */}
          <header className="bg-amber-100 p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
              <button
                onClick={handleGoBack}
                className="flex items-center text-amber-700 hover:text-amber-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                <span>戻る</span>
              </button>
              <h1 className="text-xl font-bold">ルーム作成：建物を選択</h1>
              <div className="w-20"></div> {/* スペーサー */}
            </div>
          </header>

          {/* メインコンテンツ */}
          <main className="container mx-auto py-8 px-4 flex-1">
            <div className="mb-8 bg-amber-100/50 rounded-lg p-6 border border-amber-200">
              <h2 className="text-xl font-semibold mb-2 flex items-center">
                <Home className="h-5 w-5 mr-2" />
                ルームを作成する建物を選択してください
              </h2>
              <p className="text-amber-800">
                それぞれの建物によって雰囲気や機能が異なります。あなたの目的に合った建物を選びましょう。
              </p>
            </div>

            {/* 建物一覧 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableBuildings.map((building, index) => (
                <motion.div
                  key={building.id}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className={cn(
                    "relative rounded-xl overflow-hidden border-2 p-4 cursor-pointer transition-all duration-300",
                    "bg-white hover:shadow-lg",
                    selectedBuilding === building.id
                      ? "border-amber-500 shadow-md scale-[1.02]"
                      : "border-amber-200 hover:border-amber-300",
                  )}
                  onClick={() => handleSelectBuilding(building.id)}
                >
                  {/* ロック状態表示 */}
                  {!building.isUnlocked && (
                    <div className="absolute top-2 right-2 bg-amber-100 text-amber-600 text-xs py-1 px-2 rounded-full">
                      要レベル {building.requiredLevel}
                    </div>
                  )}

                  {/* 建物画像 */}
                  <div className="aspect-video relative overflow-hidden rounded-lg mb-4 bg-amber-50 flex items-center justify-center">
                    <Image
                      src={building.image}
                      alt={building.name}
                      width={200}
                      height={120}
                      className="object-contain"
                    />
                  </div>

                  {/* 建物情報 */}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{building.name}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDetails(building.id);
                      }}
                      className="text-amber-500 hover:text-amber-700"
                    >
                      <Info className="h-5 w-5" />
                    </button>
                  </div>

                  {/* 簡易説明 */}
                  <p className="text-amber-700 text-sm mb-4 line-clamp-2">
                    {building.description}
                  </p>

                  {/* 詳細情報（トグル表示） */}
                  {showDetails === building.id && (
                    <div className="mt-2 p-3 bg-amber-50 rounded-lg text-sm">
                      <p className="text-amber-800">{building.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="bg-amber-100 px-2 py-1 rounded text-xs">
                          レベル: {building.level}
                        </span>
                        {building.price > 0 && (
                          <span className="bg-amber-100 px-2 py-1 rounded text-xs">
                            価格: {building.price} コイン
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* 選択継続ボタン */}
            <div className="mt-12 flex justify-center">
              <button
                onClick={handleContinue}
                disabled={!selectedBuilding}
                className={cn(
                  "px-8 py-3 rounded-full font-medium text-white transition-all",
                  "flex items-center justify-center",
                  selectedBuilding
                    ? "bg-amber-600 hover:bg-amber-700 shadow-lg hover:shadow-xl"
                    : "bg-amber-300 cursor-not-allowed",
                )}
              >
                次へ進む
              </button>
            </div>
          </main>

          {/* フッター */}
          <footer className="bg-amber-100 py-3 text-center text-amber-600 text-sm">
            <p>建物を選択して、あなたの理想の学習環境を作りましょう</p>
          </footer>
        </>
      )}
    </div>
  );
}
