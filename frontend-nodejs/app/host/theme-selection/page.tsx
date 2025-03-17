"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// テーマの種類
type ThemeType =
  | "spring"
  | "summer"
  | "autumn"
  | "winter"
  | "minimal"
  | "focus"
  | "nature"
  | "cafe";

// テーマデータ
const themes = [
  {
    id: "spring",
    name: "春",
    description: "桜と新緑の爽やかな雰囲気",
    color: "bg-pink-100",
    borderColor: "border-pink-400",
    textColor: "text-pink-800",
    buttonColor: "bg-pink-500 hover:bg-pink-600",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "summer",
    name: "夏",
    description: "南国リゾートの開放感",
    color: "bg-green-100",
    borderColor: "border-green-400",
    textColor: "text-green-800",
    buttonColor: "bg-green-500 hover:bg-green-600",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "autumn",
    name: "秋",
    description: "紅葉と実りの季節",
    color: "bg-orange-100",
    borderColor: "border-orange-400",
    textColor: "text-orange-800",
    buttonColor: "bg-orange-500 hover:bg-orange-600",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "winter",
    name: "冬",
    description: "雪景色の静かな空間",
    color: "bg-blue-100",
    borderColor: "border-blue-400",
    textColor: "text-blue-800",
    buttonColor: "bg-blue-500 hover:bg-blue-600",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "minimal",
    name: "ミニマル",
    description: "シンプルで集中できる空間",
    color: "bg-slate-100",
    borderColor: "border-slate-400",
    textColor: "text-slate-800",
    buttonColor: "bg-slate-500 hover:bg-slate-600",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "focus",
    name: "フォーカス",
    description: "ダークモードで目に優しい",
    color: "bg-gray-800",
    borderColor: "border-gray-600",
    textColor: "text-gray-100",
    buttonColor: "bg-indigo-500 hover:bg-indigo-600",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "nature",
    name: "自然",
    description: "森林浴のリラックス効果",
    color: "bg-emerald-100",
    borderColor: "border-emerald-400",
    textColor: "text-emerald-800",
    buttonColor: "bg-emerald-500 hover:bg-emerald-600",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "cafe",
    name: "カフェ",
    description: "カフェのくつろぎ空間",
    color: "bg-amber-100",
    borderColor: "border-amber-400",
    textColor: "text-amber-800",
    buttonColor: "bg-amber-500 hover:bg-amber-600",
    image: "/placeholder.svg?height=400&width=400",
  },
];

export default function ThemeSelectionPage() {
  const router = useRouter();
  const [selectedTheme, setSelectedTheme] = useState<ThemeType | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1ページあたりのテーマ数
  const themesPerPage = 4;

  // ページ数を計算
  const totalPages = Math.ceil(themes.length / themesPerPage);

  // 現在のページのテーマを取得
  const currentThemes = themes.slice(
    currentPage * themesPerPage,
    (currentPage + 1) * themesPerPage,
  );

  // 次のページへ
  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  // 前のページへ
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // テーマを選択
  const selectTheme = (themeId: ThemeType) => {
    setSelectedTheme(themeId);
  };

  // テーマを確定
  const confirmTheme = async () => {
    if (!selectedTheme) return;

    setIsConfirming(true);
    setError(null); // エラーをリセット

    try {
      // テーマ情報を取得
      const theme = themes.find((theme) => theme.id === selectedTheme);

      if (!theme) {
        throw new Error("選択されたテーマが見つかりませんでした");
      }

      // リクエストボディをログに出力
      const requestBody = {
        StudyRoomName: `${theme.name}の自習室`,
        StudyRoomImageURL: theme.image || "/placeholder.svg",
      };
      console.log("Request body:", JSON.stringify(requestBody));

      // トークンの確認
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn(
          "認証トークンがありません。ログインが必要かもしれません。",
        );
      }

      // バックエンドAPIにリクエストを送信してルームコードを取得
      const response = await fetch("http://localhost:8080/study-room/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(requestBody),
        credentials: "include",
      });

      // レスポンスのステータスと生のテキストを出力してデバッグ
      console.log("Response status:", response.status);
      const responseText = await response.text();
      console.log("Raw response text:", responseText);

      if (!response.ok) {
        // JSON解析を試みる前に、エラーかどうかを確認
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.error || "自習室の作成に失敗しました");
        } catch (parseError) {
          console.error("JSONパースエラー:", parseError);
          throw new Error("サーバーからの応答の解析に失敗しました");
        }
      }

      // JSONの解析を安全に行う
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("ルーム作成成功:", data);
      } catch (parseError) {
        console.error("JSONパースエラー:", parseError);
        throw new Error("サーバーからの応答の解析に失敗しました");
      }

      // ルームコードをlocalStorageに保存しておく（オプション）
      if (data.roomCode) {
        localStorage.setItem("currentRoomCode", data.roomCode);
      }

      // 成功したらダッシュボードへリダイレクト（ルームコードをクエリパラメータで渡す）
      router.push(`/host/dashboard?roomCode=${data.roomCode || ""}`);
    } catch (error) {
      console.error("テーマの設定に失敗しました", error);
      setIsConfirming(false);

      // エラー情報をより詳細に表示
      if (error instanceof Error) {
        setError(`自習室の作成に失敗しました: ${error.message}`);
      } else if (typeof error === "string") {
        setError(`自習室の作成に失敗しました: ${error}`);
      } else {
        setError(
          "予期せぬエラーが発生しました。ネットワーク接続とログイン状態を確認してください。",
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* エラーメッセージの表示 */}
          {error && (
            <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md"
              role="alert"
            >
              <p className="font-bold">エラー</p>
              <p>{error}</p>
            </div>
          )}

          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
              自習室のデザインを選んでください
            </h1>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              あなたの自習室の雰囲気を決めるテーマを選択してください。
              参加者が集中しやすい環境づくりに役立ちます。
            </p>
          </div>

          <div className="relative">
            {/* ページネーションボタン（前へ） */}
            {currentPage > 0 && (
              <button
                onClick={prevPage}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white dark:bg-slate-800 rounded-full p-2 shadow-md text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white"
                aria-label="前のページ"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* テーマグリッド */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {currentThemes.map((theme) => (
                <motion.div
                  key={theme.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "relative rounded-2xl overflow-hidden border-2 transition-all duration-300",
                    theme.color,
                    theme.borderColor,
                    selectedTheme === theme.id
                      ? "ring-4 ring-blue-400 dark:ring-blue-500 scale-105 shadow-lg"
                      : "hover:scale-102 shadow-md",
                  )}
                  onClick={() => selectTheme(theme.id as ThemeType)}
                >
                  <div className="aspect-square relative">
                    <Image
                      src={theme.image || "/placeholder.svg"}
                      alt={`${theme.name}テーマ`}
                      fill
                      className="object-cover p-4"
                    />

                    {/* 選択チェックマーク */}
                    {selectedTheme === theme.id && (
                      <div className="absolute top-3 right-3 bg-blue-500 text-white rounded-full p-1">
                        <Check className="h-5 w-5" />
                      </div>
                    )}

                    <div className="absolute inset-0 flex items-center justify-center">
                      <h2 className={cn("text-6xl font-bold", theme.textColor)}>
                        {theme.name}
                      </h2>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className={cn("text-sm", theme.textColor)}>
                      {theme.description}
                    </p>

                    <button
                      className={cn(
                        "mt-3 w-full py-2 px-4 rounded-full text-white font-medium transition-all duration-300 flex items-center justify-center",
                        theme.buttonColor,
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectTheme(theme.id as ThemeType);
                        confirmTheme();
                      }}
                    >
                      {isConfirming && selectedTheme === theme.id ? (
                        <div className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          設定中...
                        </div>
                      ) : (
                        "確定する"
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ページネーションボタン（次へ） */}
            {currentPage < totalPages - 1 && (
              <button
                onClick={nextPage}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white dark:bg-slate-800 rounded-full p-2 shadow-md text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white"
                aria-label="次のページ"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* ページネーションインジケーター */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all duration-300",
                  currentPage === index
                    ? "bg-blue-500 w-6"
                    : "bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500",
                )}
                onClick={() => setCurrentPage(index)}
                aria-label={`ページ ${index + 1}`}
              />
            ))}
          </div>

          {/* カスタムテーマボタン */}
          <div className="mt-12 text-center">
            <button
              className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
              onClick={() => router.push("/host/theme-selection/customize")}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              カスタムテーマを作成
            </button>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              オリジナルのテーマを作成して、自分だけの自習室を演出できます
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
