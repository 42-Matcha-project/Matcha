"use client";

export const dynamic = "force-dynamic";

import type React from "react";

import { useState, useEffect, useRef, createContext, useContext } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Clock,
  MessageSquare,
  Mic,
  Moon,
  PauseCircle,
  PlayCircle,
  Settings,
  Sun,
  Users,
  X,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  Coffee,
  Timer,
  Sparkles,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// テーマの型定義
export type Theme = {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    backgroundDark: string;
    text: string;
    textDark: string;
    border: string;
    borderDark: string;
  };
  backgroundImage: string;
};

// デフォルトテーマ
export const defaultTheme: Theme = {
  id: "default",
  name: "デフォルト",
  description: "シンプルで使いやすい基本テーマ",
  colors: {
    primary: "bg-blue-600 hover:bg-blue-700",
    secondary: "bg-slate-200 hover:bg-slate-300",
    accent: "bg-amber-500",
    background: "from-slate-50 to-slate-100",
    backgroundDark: "from-slate-900 to-slate-800",
    text: "text-slate-800",
    textDark: "text-slate-200",
    border: "border-slate-200",
    borderDark: "border-slate-700",
  },
  backgroundImage: "/placeholder.svg?height=1080&width=1920",
};

// 春テーマ
export const springTheme: Theme = {
  id: "spring",
  name: "春",
  description: "桜と新緑の爽やかな空間",
  colors: {
    primary: "bg-pink-500 hover:bg-pink-600",
    secondary: "bg-pink-100 hover:bg-pink-200",
    accent: "bg-green-400",
    background: "from-pink-50 to-slate-50",
    backgroundDark: "from-pink-950 to-slate-950",
    text: "text-pink-900",
    textDark: "text-pink-100",
    border: "border-pink-200",
    borderDark: "border-pink-800/50",
  },
  backgroundImage: "/placeholder.svg?height=1080&width=1920",
};

// 夏テーマ
export const summerTheme: Theme = {
  id: "summer",
  name: "夏",
  description: "南国リゾートの開放的な空間",
  colors: {
    primary: "bg-cyan-500 hover:bg-cyan-600",
    secondary: "bg-blue-100 hover:bg-blue-200",
    accent: "bg-yellow-400",
    background: "from-cyan-50 to-blue-50",
    backgroundDark: "from-cyan-950 to-blue-950",
    text: "text-cyan-900",
    textDark: "text-cyan-100",
    border: "border-cyan-200",
    borderDark: "border-cyan-800/50",
  },
  backgroundImage: "/placeholder.svg?height=1080&width=1920",
};

// 秋テーマ
export const autumnTheme: Theme = {
  id: "autumn",
  name: "秋",
  description: "紅葉と実りの季節を感じる空間",
  colors: {
    primary: "bg-amber-600 hover:bg-amber-700",
    secondary: "bg-amber-100 hover:bg-amber-200",
    accent: "bg-red-500",
    background: "from-amber-50 to-orange-50",
    backgroundDark: "from-amber-950 to-orange-950",
    text: "text-amber-900",
    textDark: "text-amber-100",
    border: "border-amber-200",
    borderDark: "border-amber-800/50",
  },
  backgroundImage: "/placeholder.svg?height=1080&width=1920",
};

// 冬テーマ
export const winterTheme: Theme = {
  id: "winter",
  name: "冬",
  description: "雪景色の静かで落ち着いた空間",
  colors: {
    primary: "bg-indigo-600 hover:bg-indigo-700",
    secondary: "bg-blue-100 hover:bg-blue-200",
    accent: "bg-sky-400",
    background: "from-blue-50 to-slate-100",
    backgroundDark: "from-blue-950 to-slate-900",
    text: "text-blue-900",
    textDark: "text-blue-100",
    border: "border-blue-200",
    borderDark: "border-blue-800/50",
  },
  backgroundImage: "/placeholder.svg?height=1080&width=1920",
};

// 全テーマのマップ
export const themes: Record<string, Theme> = {
  default: defaultTheme,
  spring: springTheme,
  summer: summerTheme,
  autumn: autumnTheme,
  winter: winterTheme,
};

// テーマコンテキスト
type ThemeContextType = {
  currentTheme: Theme;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  changeTheme: (themeId: string) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: defaultTheme,
  isDarkMode: false,
  toggleDarkMode: () => {},
  changeTheme: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);

// 参加者データ
const participants = [
  {
    id: 1,
    name: "ユーザー1",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "学習中",
    focusScore: 87,
    studyTime: 125, // 分
    isActive: true,
  },
  {
    id: 2,
    name: "ユーザー2",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "休憩中",
    focusScore: 62,
    studyTime: 45,
    isActive: false,
  },
  {
    id: 3,
    name: "ユーザー3",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "学習中",
    focusScore: 93,
    studyTime: 180,
    isActive: true,
  },
  {
    id: 4,
    name: "ユーザー4",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "離席中",
    focusScore: 0,
    studyTime: 90,
    isActive: false,
  },
];

// チャットメッセージ
const initialMessages = [
  {
    id: 1,
    user: "システム",
    text: "自習室へようこそ！一緒に頑張りましょう！",
    time: new Date(0),
  },
  {
    id: 2,
    user: "ユーザー1",
    text: "おはようございます！今日も頑張ります✨",
    time: new Date(0),
  },
  {
    id: 3,
    user: "ユーザー3",
    text: "数学の問題で質問があります。後でよろしいですか？",
    time: new Date(0),
  },
];

export default function StudyRoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const themeId = searchParams.get("theme") || "default";

  const [currentTheme, setCurrentTheme] = useState<Theme>(
    themes[themeId] || defaultTheme,
  );
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date(0));
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerEndTime, setTimerEndTime] = useState<number | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [roomCode, setRoomCode] = useState(""); // バックエンドから取得するため空文字に変更

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // クライアントサイドでのみ実行される初期化
  useEffect(() => {
    // 正しい現在時刻を設定
    setCurrentTime(new Date());

    // メッセージの時間を更新
    setMessages((prevMessages) =>
      prevMessages.map((msg, index) => ({
        ...msg,
        time: new Date(Date.now() - (3 - index) * 900000),
      })),
    );
  }, []);

  // テーマの変更
  const changeTheme = (newThemeId: string) => {
    if (themes[newThemeId]) {
      setCurrentTheme(themes[newThemeId]);

      // 通知を表示
      setNotificationMessage(
        `テーマを「${themes[newThemeId].name}」に変更しました`,
      );
      setShowNotification(true);

      // URLパラメータを更新
      router.push(`/room?theme=${newThemeId}`);
    }
  };

  // ダークモード切り替え
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // 時計の更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning]);

  // タイマーの更新
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isTimerRunning && timerEndTime) {
      // 最初の更新をすぐに実行して表示を同期
      const updateTimerDisplay = () => {
        const now = Date.now();
        const remainingTime = Math.max(0, timerEndTime - now);

        if (remainingTime <= 0) {
          // タイマー終了
          clearInterval(intervalId!);
          setIsTimerRunning(false);
          setTimerEndTime(null);
          setTimerMinutes(25);
          setTimerSeconds(0);

          // 通知を表示
          setNotificationMessage("タイマーが終了しました！休憩しましょう。");
          setShowNotification(true);
        } else {
          // 残り時間を分と秒に変換
          const minutes = Math.floor(remainingTime / 60000);
          const seconds = Math.floor((remainingTime % 60000) / 1000);

          // 表示用の状態を更新
          setTimerMinutes(minutes);
          setTimerSeconds(seconds);
        }
      };

      // 最初の更新を即時実行
      updateTimerDisplay();

      // 正確に1秒ごとに更新するためのインターバル設定
      intervalId = setInterval(updateTimerDisplay, 1000);

      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isTimerRunning, timerEndTime]);

  // メッセージが追加されたらスクロールを一番下に
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 通知を5秒後に非表示
  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  // メッセージ送信
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newMsg = {
      id: Date.now(),
      user: "あなた",
      text: newMessage,
      time: new Date(),
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  // フォーマットされた時間
  const formattedTime = `${timerMinutes.toString().padStart(2, "0")}:${timerSeconds.toString().padStart(2, "0")}`;

  // 学習時間のフォーマット
  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}時間${mins}分`;
    }
    return `${mins}分`;
  };

  // サイドバー切り替え
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // 招待コードのコピー
  const copyInviteCode = () => {
    navigator.clipboard.writeText(roomCode);
    setNotificationMessage("招待コードをコピーしました！");
    setShowNotification(true);
  };

  // タイマー開始/停止
  const toggleTimer = () => {
    if (!isTimerRunning) {
      // タイマー開始時、終了時刻を設定
      const totalTimeInMs = (timerMinutes * 60 + timerSeconds) * 1000;

      // 秒の変化を均等にするため、現在時刻の秒部分を考慮して設定
      // 現在のミリ秒をリセットして秒の境界に合わせる
      const now = new Date();
      const adjustedNow = now.getTime() - now.getMilliseconds();

      setTimerEndTime(adjustedNow + totalTimeInMs);

      // 通知を表示
      setNotificationMessage("ポモドーロタイマーを開始しました！");
      setShowNotification(true);
    } else {
      // タイマー停止時、残り時間を保持（一時停止の効果）
      if (timerEndTime) {
        const remainingTime = timerEndTime - Date.now();
        if (remainingTime > 0) {
          // 分と秒を更新（現在の残り時間を保存）
          const minutes = Math.floor(remainingTime / 60000);
          const seconds = Math.floor((remainingTime % 60000) / 1000);
          setTimerMinutes(minutes);
          setTimerSeconds(seconds);
        }
        setTimerEndTime(null);
      }
    }
    setIsTimerRunning(!isTimerRunning);
  };

  // 5分休憩ボタンのクリックハンドラー
  const setBreakTimer = () => {
    // タイマーが動いている場合は停止
    if (isTimerRunning) {
      setIsTimerRunning(false);
      setTimerEndTime(null);
    }
    // 正確に5分に設定
    setTimerMinutes(5);
    setTimerSeconds(0);
  };

  // タイマーリセット
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerEndTime(null);
    // 正確に25分に設定
    setTimerMinutes(25);
    setTimerSeconds(0);
  };

  // 時間表示のためのレンダリング用関数
  // クライアントサイドでのみ計算する
  const renderTime = (date: Date): string => {
    // サーバーサイドレンダリング時は空の文字列を返す
    if (typeof window === "undefined") return "";

    try {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      // エラーが発生した場合は空文字列を返す
      return "";
    }
  };

  return (
    <ThemeContext.Provider
      value={{ currentTheme, isDarkMode, toggleDarkMode, changeTheme }}
    >
      <div
        className={cn(
          "min-h-screen transition-colors duration-300",
          isDarkMode
            ? `bg-gradient-to-br ${currentTheme.colors.backgroundDark}`
            : `bg-gradient-to-br ${currentTheme.colors.background}`,
        )}
      >
        <div className="flex h-screen overflow-hidden">
          {/* メインコンテンツ */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* 背景画像 */}
            <div className="absolute inset-0 z-0 opacity-20">
              <Image
                src={currentTheme.backgroundImage || "/placeholder.svg"}
                alt="背景"
                fill
                className="object-cover"
              />
            </div>

            {/* ヘッダー */}
            <header
              className={cn(
                "relative z-10 px-4 py-3 flex items-center justify-between border-b",
                isDarkMode
                  ? `bg-opacity-50 bg-slate-900 ${currentTheme.colors.borderDark}`
                  : `bg-opacity-70 bg-white ${currentTheme.colors.border}`,
              )}
            >
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "mr-2",
                    isDarkMode
                      ? currentTheme.colors.textDark
                      : currentTheme.colors.text,
                  )}
                  onClick={toggleSidebar}
                >
                  {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
                </Button>

                <h1
                  className={cn(
                    "text-xl font-bold flex items-center",
                    isDarkMode
                      ? currentTheme.colors.textDark
                      : currentTheme.colors.text,
                  )}
                >
                  {currentTheme.name}の自習室
                  <Badge className="ml-3 bg-opacity-80 bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                    ルーム #{roomCode}
                  </Badge>
                </h1>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 mr-2">
                  <select
                    value={currentTheme.id}
                    onChange={(e) => changeTheme(e.target.value)}
                    className={cn(
                      "px-2 py-1 rounded text-sm border",
                      isDarkMode
                        ? `bg-slate-800 ${currentTheme.colors.borderDark} ${currentTheme.colors.textDark}`
                        : `bg-white ${currentTheme.colors.border} ${currentTheme.colors.text}`,
                    )}
                  >
                    {Object.values(themes).map((theme) => (
                      <option key={theme.id} value={theme.id}>
                        {theme.name}テーマ
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "hidden sm:flex",
                    isDarkMode
                      ? currentTheme.colors.textDark
                      : currentTheme.colors.text,
                  )}
                  onClick={copyInviteCode}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  招待
                </Button>

                <div
                  className={cn(
                    "px-3 py-1 rounded-full text-sm flex items-center",
                    isDarkMode
                      ? "bg-slate-800 text-slate-200"
                      : "bg-slate-100 text-slate-800",
                  )}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  <span suppressHydrationWarning>
                    {renderTime(currentTime)}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    isDarkMode
                      ? currentTheme.colors.textDark
                      : currentTheme.colors.text,
                  )}
                  onClick={toggleDarkMode}
                >
                  {isDarkMode ? <Sun /> : <Moon />}
                </Button>

                <Avatar>
                  <AvatarImage
                    src="/placeholder.svg?height=40&width=40"
                    alt="あなたのアバター"
                  />
                  <AvatarFallback>あ</AvatarFallback>
                </Avatar>
              </div>
            </header>

            {/* メインエリア */}
            <main className="flex-1 overflow-auto relative z-10 p-4">
              <div className="max-w-6xl mx-auto">
                {/* 通知 */}
                <AnimatePresence>
                  {showNotification && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={cn(
                        "mb-4 p-3 rounded-lg flex items-center justify-between",
                        isDarkMode
                          ? "bg-slate-800/70 text-slate-200"
                          : "bg-white/90 text-slate-800",
                      )}
                    >
                      <div className="flex items-center">
                        <Sparkles className="h-5 w-5 mr-2" />
                        <span>{notificationMessage}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setShowNotification(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* メインコンテンツグリッド */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* ポモドーロタイマー（幅広く表示） */}
                  <div className="lg:col-span-12 space-y-4">
                    <div
                      className={cn(
                        "rounded-xl p-6 border backdrop-blur-sm",
                        isDarkMode
                          ? `bg-slate-900/30 ${currentTheme.colors.borderDark}`
                          : `bg-white/60 ${currentTheme.colors.border}`,
                      )}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h2
                          className={cn(
                            "text-lg font-semibold flex items-center",
                            isDarkMode
                              ? currentTheme.colors.textDark
                              : currentTheme.colors.text,
                          )}
                        >
                          <Timer className="h-5 w-5 mr-2" />
                          ポモドーロタイマー
                        </h2>
                      </div>

                      <div className="flex flex-col items-center justify-center py-4">
                        <div
                          className={cn(
                            "text-6xl font-bold mb-4",
                            isDarkMode
                              ? currentTheme.colors.textDark
                              : currentTheme.colors.text,
                          )}
                        >
                          {formattedTime}
                        </div>

                        <div className="flex space-x-4">
                          <Button
                            className={cn(
                              "px-6",
                              currentTheme.colors.primary,
                              isDarkMode ? "text-white" : "text-white",
                            )}
                            onClick={toggleTimer}
                          >
                            {isTimerRunning ? (
                              <>
                                <PauseCircle className="h-5 w-5 mr-2" />
                                一時停止
                              </>
                            ) : (
                              <>
                                <PlayCircle className="h-5 w-5 mr-2" />
                                開始
                              </>
                            )}
                          </Button>

                          <Button
                            variant="outline"
                            className={cn(
                              isDarkMode
                                ? `border-slate-700 ${currentTheme.colors.textDark}`
                                : `border-slate-300 ${currentTheme.colors.text}`,
                            )}
                            onClick={resetTimer}
                          >
                            リセット
                          </Button>

                          <Button
                            variant="outline"
                            className={cn(
                              isDarkMode
                                ? `border-slate-700 ${currentTheme.colors.textDark}`
                                : `border-slate-300 ${currentTheme.colors.text}`,
                            )}
                            onClick={setBreakTimer}
                          >
                            <Coffee className="h-5 w-5 mr-2" />
                            休憩 (5分)
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 左側：学習エリア */}
                  <div className="lg:col-span-8 space-y-4">
                    <div
                      className={cn(
                        "rounded-xl p-6 border backdrop-blur-sm min-h-[400px]",
                        isDarkMode
                          ? `bg-slate-900/30 ${currentTheme.colors.borderDark}`
                          : `bg-white/60 ${currentTheme.colors.border}`,
                      )}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h2
                          className={cn(
                            "text-lg font-semibold",
                            isDarkMode
                              ? currentTheme.colors.textDark
                              : currentTheme.colors.text,
                          )}
                        >
                          学習エリア
                        </h2>

                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            isDarkMode ? "text-slate-300" : "text-slate-700",
                          )}
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          学習記録
                        </Button>
                      </div>

                      <div className="flex flex-col items-center justify-center h-[350px]">
                        <div
                          className={cn(
                            "text-center",
                            isDarkMode ? "text-slate-400" : "text-slate-600",
                          )}
                        >
                          <p className="mb-2">
                            ここに学習内容やメモを記録できます
                          </p>
                          <Button
                            className={cn(
                              currentTheme.colors.primary,
                              "text-white",
                            )}
                          >
                            学習を記録する
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 右側：チャット */}
                  <div className="lg:col-span-4 space-y-4">
                    {/* チャット */}
                    <div
                      className={cn(
                        "rounded-xl border backdrop-blur-sm flex flex-col h-[400px]",
                        isDarkMode
                          ? `bg-slate-900/30 ${currentTheme.colors.borderDark}`
                          : `bg-white/60 ${currentTheme.colors.border}`,
                      )}
                    >
                      <div
                        className={cn(
                          "p-3 border-b flex items-center justify-between",
                          isDarkMode
                            ? currentTheme.colors.borderDark
                            : currentTheme.colors.border,
                        )}
                      >
                        <h2
                          className={cn(
                            "font-semibold flex items-center",
                            isDarkMode
                              ? currentTheme.colors.textDark
                              : currentTheme.colors.text,
                          )}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          チャット
                        </h2>

                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Mic className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div
                        className={cn(
                          "flex-1 overflow-y-auto p-3 space-y-3",
                          isDarkMode ? "text-slate-300" : "text-slate-800",
                        )}
                      >
                        {messages.map((msg) => (
                          <div key={msg.id} className="space-y-1">
                            <div className="flex items-center">
                              <span className="font-medium">{msg.user}</span>
                              <span
                                className="text-xs ml-2 opacity-70"
                                suppressHydrationWarning
                              >
                                {renderTime(msg.time)}
                              </span>
                            </div>
                            <p
                              className={cn(
                                "text-sm px-3 py-2 rounded-lg max-w-[90%]",
                                msg.user === "あなた"
                                  ? isDarkMode
                                    ? "bg-blue-900/50 ml-auto"
                                    : "bg-blue-100 ml-auto"
                                  : isDarkMode
                                    ? "bg-slate-800/50"
                                    : "bg-white/50",
                              )}
                            >
                              {msg.text}
                            </p>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>

                      <form
                        onSubmit={sendMessage}
                        className="p-3 flex space-x-2"
                      >
                        <Input
                          placeholder="メッセージを入力..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className={cn(
                            "flex-1",
                            isDarkMode
                              ? "bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-400"
                              : "bg-white/70 border-slate-200 text-slate-800 placeholder:text-slate-400",
                          )}
                        />
                        <Button
                          type="submit"
                          className={cn(
                            currentTheme.colors.primary,
                            "text-white",
                          )}
                        >
                          送信
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>

          {/* サイドバー */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "border-l relative z-10 overflow-hidden",
                  isDarkMode
                    ? `bg-slate-900/50 ${currentTheme.colors.borderDark}`
                    : `bg-white/60 ${currentTheme.colors.border}`,
                )}
              >
                <div className="h-full flex flex-col">
                  <div
                    className={cn(
                      "p-4 border-b",
                      isDarkMode
                        ? currentTheme.colors.borderDark
                        : currentTheme.colors.border,
                    )}
                  >
                    <h2
                      className={cn(
                        "font-semibold flex items-center",
                        isDarkMode
                          ? currentTheme.colors.textDark
                          : currentTheme.colors.text,
                      )}
                    >
                      <Users className="h-5 w-5 mr-2" />
                      参加者 ({participants.length})
                    </h2>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                      {participants.map((user) => (
                        <div
                          key={user.id}
                          className={cn(
                            "p-3 rounded-lg border flex items-center space-x-3",
                            user.isActive
                              ? isDarkMode
                                ? "bg-slate-800/30 border-slate-700"
                                : "bg-slate-50/70 border-slate-200"
                              : isDarkMode
                                ? "bg-slate-900/30 border-slate-800/30"
                                : "bg-white/40 border-slate-100",
                          )}
                        >
                          <div className="relative">
                            <Avatar>
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div
                              className={cn(
                                "absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2",
                                isDarkMode
                                  ? "border-slate-900"
                                  : "border-white",
                                user.status === "学習中"
                                  ? "bg-green-500"
                                  : user.status === "休憩中"
                                    ? "bg-amber-500"
                                    : "bg-slate-400",
                              )}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p
                                className={cn(
                                  "font-medium truncate",
                                  isDarkMode
                                    ? currentTheme.colors.textDark
                                    : currentTheme.colors.text,
                                )}
                              >
                                {user.name}
                              </p>
                              <Badge
                                className={cn(
                                  "ml-2",
                                  user.isActive
                                    ? isDarkMode
                                      ? "bg-slate-700 text-slate-200"
                                      : "bg-slate-200 text-slate-800"
                                    : isDarkMode
                                      ? "bg-slate-800/50 text-slate-300"
                                      : "bg-slate-200 text-slate-700",
                                )}
                              >
                                {user.status}
                              </Badge>
                            </div>

                            <div className="mt-2 space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span
                                  className={
                                    isDarkMode
                                      ? "text-slate-400"
                                      : "text-slate-600"
                                  }
                                >
                                  学習時間:
                                </span>
                                <span
                                  className={
                                    isDarkMode
                                      ? "text-slate-300"
                                      : "text-slate-700"
                                  }
                                >
                                  {formatStudyTime(user.studyTime)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className={cn(
                      "p-4 border-t",
                      isDarkMode
                        ? currentTheme.colors.borderDark
                        : currentTheme.colors.border,
                    )}
                  >
                    <Button
                      className={cn(
                        "w-full",
                        currentTheme.colors.primary,
                        "text-white",
                      )}
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      全員に通知を送る
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
