"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun, Home, Users, ChevronRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function RoleSelectionPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // ログイン済みかチェック
    const token = localStorage.getItem("token");
    if (!token) {
      // 未ログインならログインページへリダイレクト
      router.push("/login");
    }

    // ユーザー名を取得
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }

    // システムのダークモード設定を確認
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    setIsDarkMode(prefersDark);
  }, [router]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    // 直接ログインページにリダイレクト
    window.location.href = "/login";
  };

  return (
    <div className={`min-h-screen w-full ${isDarkMode ? "dark" : ""}`}>
      <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
        {/* 背景のパターン */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>

        {/* 装飾的な円形 */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-gradient-to-br from-purple-200 to-blue-200 dark:from-purple-900 dark:to-blue-900 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-gradient-to-tr from-blue-200 to-purple-200 dark:from-blue-900 dark:to-purple-900 rounded-full blur-3xl opacity-30"></div>

        {/* ヘッダー */}
        <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50">
          <div className="text-xl font-bold text-primary dark:text-primary-foreground">
            Study Room
          </div>
          <div className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleDarkMode}
                    className="rounded-full"
                  >
                    {isDarkMode ? (
                      <Sun className="h-5 w-5" />
                    ) : (
                      <Moon className="h-5 w-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {isDarkMode ? "ライトモード" : "ダークモード"}に切り替え
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="rounded-full"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>ログアウト</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="relative w-full min-h-screen z-20 px-4 py-20 flex flex-col items-center justify-center">
          {/* 歓迎メッセージ */}
          <div className="text-center mb-12 animate-fade-in-down">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-3">
              ようこそ{username ? `, ${username}さん` : ""}！
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              自習室に入室する方法を選んでください
            </p>
          </div>

          {/* 選択カード */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            {/* ホストカード */}
            <div className="animate-fade-in-left h-full border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-103">
              <Card className="h-full border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 p-6 text-white">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 rounded-full">
                      <Home className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl">ホストとして入室</CardTitle>
                  </div>
                  <CardDescription className="text-blue-100">
                    自分だけの自習室を作成して管理
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ul className="space-y-3">
                    {[
                      "新しい自習室を作成",
                      "テーマや設定をカスタマイズ",
                      "友達を招待して一緒に勉強",
                      "自習室の管理・モニタリング",
                    ].map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                      >
                        <div className="mt-1 min-w-4 text-blue-500 dark:text-blue-400">
                          •
                        </div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button
                    className="w-full gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                    onClick={() => router.push("/host/theme-selection")}
                  >
                    自習室を作成する
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* ゲストカード */}
            <div className="animate-fade-in-right h-full border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-103">
              <Card className="h-full border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 p-6 text-white">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 rounded-full">
                      <Users className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl">ゲストとして入室</CardTitle>
                  </div>
                  <CardDescription className="text-emerald-100">
                    既存の自習室に参加して一緒に勉強
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ul className="space-y-3">
                    {[
                      "ルームコードで既存の自習室に参加",
                      "友達と一緒に勉強",
                      "集中力を高める環境で学習",
                      "チャットやタイマー機能を利用",
                    ].map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                      >
                        <div className="mt-1 min-w-4 text-emerald-500 dark:text-emerald-400">
                          •
                        </div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button
                    className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                    onClick={() => router.push("/guest/join")}
                  >
                    自習室に参加する
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* 説明テキスト */}
          <div className="mt-12 text-center text-gray-600 dark:text-gray-400 max-w-2xl animate-fade-in-up">
            <p>
              ホストはルームコードを取得して友達に共有できます。ゲストはそのルームコードを使って自習室に参加できます。
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
