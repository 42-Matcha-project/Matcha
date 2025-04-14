"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Building, UserStats } from "../../../types/settlement";
import { buildings } from "../../../data/buildings";
import { initialUserStats } from "../../../data/initialUserStats"; // Import initialUserStats
import { cn } from "@/lib/utils";
import { ArrowLeft, Home, Info, Coins } from "lucide-react";
import {
  applyUnlockState,
  initializeBuildingState,
} from "../../../utils/buildingStateUtils";

export default function BuildingSelectionPage() {
  const router = useRouter();
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [availableBuildings, setAvailableBuildings] = useState<Building[]>([]);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false); // 部屋作成中の状態
  const [error, setError] = useState<string | null>(null); // エラーメッセージ
  const userStats = useState<UserStats>(initialUserStats)[0];
  const [roomName, setRoomName] = useState<string>(""); // ルーム名
  const [currentStep, setCurrentStep] = useState<1 | 2>(1); // 現在のステップ

  // 利用可能な建物をフィルタリング
  useEffect(() => {
    // 初期化
    initializeBuildingState(buildings);

    // ローカルストレージから建物のアンロック状態を読み込む
    const updatedBuildings = applyUnlockState(buildings);

    // アンロック済みの建物を取得
    const unlocked = updatedBuildings.filter((b) => b.isUnlocked);
    setAvailableBuildings(unlocked);

    // ロード完了
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  // 建物を選択
  const handleSelectBuilding = (buildingId: string) => {
    setSelectedBuilding(buildingId);
    // 選択した建物に基づいてデフォルトのルーム名を設定
    const building = availableBuildings.find((b) => b.id === buildingId);
    if (building) {
      setRoomName(`${building.name}の自習室`);
    }
  };

  // 詳細表示の切り替え
  const toggleDetails = (buildingId: string) => {
    setShowDetails(showDetails === buildingId ? null : buildingId);
  };

  // 次のステップへ進む
  const goToNextStep = () => {
    if (selectedBuilding) {
      // すべての建物選択でステップ2に進む
      setCurrentStep(2);
      setError(null);
    }
  };

  // 前のステップへ戻る
  const goToPreviousStep = () => {
    setCurrentStep(1);
    setError(null);
  };

  // スタディルーム作成リクエスト送信
  const createStudyRoom = async () => {
    if (!selectedBuilding) return;

    // マイハウスが選択された場合は直接マイハウスページへ遷移
    if (selectedBuilding === "house") {
      router.push("/myhouse");
      return;
    }

    // 入力チェック
    if (!roomName.trim()) {
      setError("ルーム名を入力してください");
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      // 選択された建物情報を取得
      const building = availableBuildings.find(
        (b) => b.id === selectedBuilding,
      );
      if (!building) {
        throw new Error("選択された建物情報が見つかりません");
      }

      // スタディルーム作成APIを呼び出し
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("認証情報が見つかりません。再ログインしてください。");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/study-room/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            StudyRoomName: roomName,
            StudyRoomImageURL: building.image, // 常に選択された建物の画像を使用
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Error || "スタディルーム作成に失敗しました");
      }

      // 成功した場合、レスポンスからルームコードを取得
      const data = await response.json();

      // 作成が完了したのでフラグをリセット
      setIsCreating(false);

      // 作成されたルームのページに遷移
      router.push(`/room/${data.RoomCode}`);
    } catch (err) {
      console.error("Study room creation error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "スタディルーム作成中にエラーが発生しました",
      );
      setIsCreating(false);
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
                onClick={currentStep === 1 ? handleGoBack : goToPreviousStep}
                className="flex items-center text-amber-700 hover:text-amber-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                <span>{currentStep === 1 ? "戻る" : "建物選択に戻る"}</span>
              </button>
              <h1 className="text-xl font-bold">
                {currentStep === 1
                  ? "ルーム作成：建物を選択"
                  : "ルーム作成：詳細設定"}
              </h1>
              {/* コイン表示 */}
              <div className="flex items-center bg-amber-200 px-3 py-1 rounded-full">
                <Coins className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="font-medium">{userStats.coins}</span>
              </div>
            </div>
          </header>

          {/* メインコンテンツ */}
          <main className="container mx-auto py-8 px-4 flex-1">
            {/* ステップ表示 */}
            <div className="mb-6">
              <div className="flex items-center justify-center">
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full ${currentStep === 1 ? "bg-amber-500 text-white" : "bg-amber-300 text-amber-800"} flex items-center justify-center font-bold`}
                  >
                    1
                  </div>
                  <div
                    className={`ml-2 ${currentStep === 1 ? "text-amber-700 font-medium" : "text-amber-500"}`}
                  >
                    建物選択
                  </div>
                </div>
                <div className="w-16 h-1 bg-amber-300 mx-2"></div>
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full ${currentStep === 2 ? "bg-amber-500 text-white" : "bg-amber-300 text-amber-800"} flex items-center justify-center font-bold`}
                  >
                    2
                  </div>
                  <div
                    className={`ml-2 ${currentStep === 2 ? "text-amber-700 font-medium" : "text-amber-500"}`}
                  >
                    ルーム設定
                  </div>
                </div>
              </div>
            </div>

            {/* ステップ1: 建物選択 */}
            {currentStep === 1 && (
              <>
                <div className="mb-8 bg-amber-100/50 rounded-lg p-6 border border-amber-200">
                  <h2 className="text-xl font-semibold mb-2 flex items-center">
                    <Home className="h-5 w-5 mr-2" />
                    ルームを作成する建物を選択してください
                  </h2>
                  <p className="text-amber-800">
                    それぞれの建物によって雰囲気や機能が異なります。あなたの目的に合った建物を選びましょう。
                  </p>
                </div>

                {availableBuildings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-amber-600 text-lg">
                      利用可能な建物がありません
                    </div>
                    <p className="mt-3 text-amber-800">
                      開拓地で建物を購入すると、ここに表示されます。
                    </p>
                    <button
                      onClick={() => router.push("/settlement")}
                      className="mt-5 px-5 py-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition"
                    >
                      開拓地へ移動
                    </button>
                  </div>
                ) : (
                  <>
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
                            <h3 className="font-bold text-lg">
                              {building.name}
                            </h3>
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
                              <p className="text-amber-800">
                                {building.description}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="bg-amber-100 px-2 py-1 rounded text-xs">
                                  レベル: {building.level}
                                </span>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    {/* 選択継続ボタン */}
                    <div className="mt-12 flex justify-center">
                      <button
                        onClick={goToNextStep}
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
                  </>
                )}
              </>
            )}

            {/* ステップ2: ルーム設定 */}
            {currentStep === 2 && selectedBuilding && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-amber-100/50 rounded-lg p-6 border border-amber-200 mb-8">
                  <h2 className="text-xl font-semibold mb-2 flex items-center">
                    <Home className="h-5 w-5 mr-2" />
                    ルームの詳細を設定してください
                  </h2>
                  <p className="text-amber-800">
                    ルーム名を設定して、スタディルームを作成しましょう。
                  </p>
                </div>

                {/* 選択した建物の情報 */}
                <div className="bg-white border-2 border-amber-300 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold mb-4">選択した建物</h3>
                  {(() => {
                    const selected = availableBuildings.find(
                      (b) => b.id === selectedBuilding,
                    );
                    return selected ? (
                      <div className="flex items-center">
                        <div className="w-24 h-24 relative rounded overflow-hidden bg-amber-50 flex-shrink-0">
                          <Image
                            src={selected.image}
                            alt={selected.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div className="ml-4">
                          <h4 className="font-medium text-lg">
                            {selected.name}
                          </h4>
                          <p className="text-sm text-amber-700 mt-1">
                            {selected.description}
                          </p>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* ルーム名入力 */}
                <div className="bg-white border-2 border-amber-300 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">ルーム設定</h3>

                  <div className="mb-6">
                    <label
                      htmlFor="roomName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      ルーム名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="roomName"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="ルーム名を入力"
                      disabled={isCreating}
                    />
                    <p className="mt-1 text-xs text-amber-600">
                      ルームに参加するユーザーに表示される名前です
                    </p>
                  </div>

                  {/* 画像プレビュー */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      ルーム画像:
                    </p>
                    <div className="w-full h-48 bg-amber-50 border border-amber-200 rounded-md overflow-hidden relative">
                      {(() => {
                        const selected = availableBuildings.find(
                          (b) => b.id === selectedBuilding,
                        );
                        return selected ? (
                          <Image
                            src={selected.image}
                            alt="ルーム画像"
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-amber-400">
                            <p>画像が設定されていません</p>
                          </div>
                        );
                      })()}
                    </div>
                    <p className="mt-1 text-xs text-amber-600 text-center">
                      選択した建物に対応する画像が自動的に使用されます
                    </p>
                  </div>
                </div>

                {/* エラーメッセージ */}
                {error && (
                  <div className="mb-6 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {/* 作成ボタン */}
                <div className="flex justify-center mt-6">
                  <button
                    onClick={createStudyRoom}
                    disabled={isCreating}
                    className={cn(
                      "px-8 py-3 rounded-full font-medium text-white transition-all",
                      "flex items-center justify-center",
                      !isCreating
                        ? "bg-amber-600 hover:bg-amber-700 shadow-lg hover:shadow-xl"
                        : "bg-amber-300 cursor-not-allowed",
                    )}
                  >
                    {isCreating ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        作成中...
                      </>
                    ) : (
                      "ルームを作成する"
                    )}
                  </button>
                </div>
              </motion.div>
            )}
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
