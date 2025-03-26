"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Users,
  PauseCircle,
  PlayCircle,
  Trophy,
  Bell,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";

// 参加者の型定義
export type Participant = {
  id: number;
  name: string;
  avatar: string;
  status: string;
  studyTime: number; // 分
  totalTime: string;
  remainingTime?: string;
  streak?: number;
  streakText?: string;
  level: number;
};

// 達成項目の型定義
export type Achievement = {
  id: number;
  name: string;
  icon: string;
  completed: boolean;
};

// イベントの型定義
export type Event = {
  id: number;
  name: string;
  icon: string;
  description: string;
};

// テーマの型定義
export type ThemeSettings = {
  id: string;
  name: string;
  emoji: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    border: string;
    cardHeader: string;
    cardHeaderText: string;
    sidebarBg: string;
    headerBg: string;
  };
  backgroundImage?: string;
  customHeader?: ReactNode;
};

// 自習室ベースコンポーネントのプロパティ
interface StudyRoomBaseProps {
  theme: ThemeSettings;
  participants: Participant[];
  achievements: Achievement[];
  events: Event[];
  roomCode: string;
  goal: string;
  todayStudyTime: number;
}

export default function StudyRoomBase({
  theme,
  participants,
  achievements,
  events,
  roomCode,
  goal,
  todayStudyTime,
}: StudyRoomBaseProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [timerMinutes, setTimerMinutes] = useState(52);
  const [timerSeconds, setTimerSeconds] = useState(17);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [breakCount, setBreakCount] = useState(2);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userStudySeconds, setUserStudySeconds] = useState(0);
  const [localParticipants, setLocalParticipants] =
    useState<Participant[]>(participants);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const studyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // クライアントサイドでのみ実行される初期化
  useEffect(() => {
    // 初期時刻を設定
    setCurrentTime(new Date());

    // 初期勉強時間を設定（ユウキのデータから秒に変換）
    const initialUserSeconds = participants[0]?.studyTime * 60 || 0;
    setUserStudySeconds(initialUserSeconds);
    setLocalParticipants(participants);
  }, [participants]);

  // 時計の更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ユーザーの勉強時間をカウントアップする処理
  useEffect(() => {
    if (isTimerRunning) {
      // タイマーが動作中の場合、1秒ごとに勉強時間を増やす
      studyTimerRef.current = setInterval(() => {
        setUserStudySeconds((prev) => {
          const newSeconds = prev + 1;

          // localParticipantsを更新して画面表示を反映
          setLocalParticipants((prevParticipants) => {
            const newParticipants = [...prevParticipants];
            if (newParticipants[0]) {
              const hours = Math.floor(newSeconds / 3600);
              const mins = Math.floor((newSeconds % 3600) / 60);
              const secs = newSeconds % 60;

              newParticipants[0] = {
                ...newParticipants[0],
                studyTime: Math.floor(newSeconds / 60),
                totalTime: `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`,
              };
            }
            return newParticipants;
          });

          return newSeconds;
        });
      }, 1000);
    } else if (studyTimerRef.current) {
      clearInterval(studyTimerRef.current);
    }

    return () => {
      if (studyTimerRef.current) {
        clearInterval(studyTimerRef.current);
      }
    };
  }, [isTimerRunning]);

  // タイマーの更新
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev === 0) {
            if (timerMinutes === 0) {
              // タイマー終了
              setIsTimerRunning(false);
              clearInterval(timerRef.current as NodeJS.Timeout);

              // 通知を表示
              setNotificationMessage(
                "タイマーが終了しました！休憩しましょう。",
              );
              setShowNotification(true);

              // 休憩カウントを増やす
              setBreakCount((prev) => prev + 1);
              // breakCountはユーザーの休憩回数を追跡するために使用 (現在UIには表示されていませんが、将来の分析に使用)

              // 25分タイマーをリセット
              setTimerMinutes(25);
              return 0;
            }
            setTimerMinutes((prev) => prev - 1);
            return 59;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning, timerMinutes]);

  // 通知を5秒後に非表示
  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  // タイマー開始/停止
  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
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

  // 時間表示のためのレンダリング用関数
  const renderTime = (date: Date | null): string => {
    // サーバーサイドレンダリング時や初期化前は空の文字列を返す
    if (!date || typeof window === "undefined") return "";

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
    <div
      className={cn(
        "min-h-screen relative overflow-hidden",
        theme.colors.background,
      )}
    >
      {/* 背景画像 */}
      {theme.backgroundImage && (
        <div className="absolute inset-0 z-0 opacity-20">
          <Image
            src={theme.backgroundImage || "/placeholder.svg"}
            alt={`${theme.name}の背景`}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="flex h-screen overflow-hidden relative z-10">
        {/* サイドバー */}
        <div
          className={cn(
            "w-72 border-r flex flex-col",
            theme.colors.sidebarBg,
            theme.colors.border,
          )}
        >
          {/* ユーザー情報 */}
          <div className={cn("p-4 border-b", theme.colors.border)}>
            <div className={cn("rounded-xl p-4", theme.colors.secondary)}>
              <div className="flex items-center mb-2">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mr-3",
                    theme.colors.accent,
                  )}
                >
                  <span className="text-xl">👤</span>
                </div>
                <div>
                  <h3 className={cn("font-bold", theme.colors.text)}>
                    {localParticipants[0]?.name || "ユーザー"}
                  </h3>
                  <div
                    className={cn(
                      "flex items-center text-xs",
                      theme.colors.text,
                    )}
                  >
                    <span className="mr-1">
                      {localParticipants[0]?.streakText || "学習中"}
                    </span>
                    <span>✨</span>
                  </div>
                </div>
              </div>

              <div className={cn("text-xs", theme.colors.text)}>
                目標: {goal}
              </div>
            </div>
          </div>

          {/* 学習時間 */}
          <div className={cn("p-4 border-b", theme.colors.border)}>
            <h3 className={cn("text-sm font-medium mb-2", theme.colors.text)}>
              学習時間
            </h3>
            <div className="flex space-x-1 mb-2">
              {[1, 2, 3, 4, 5].map((hour) => (
                <div
                  key={hour}
                  className={cn(
                    "flex-1 h-8 rounded-md",
                    hour <= Math.floor(todayStudyTime / 60)
                      ? theme.colors.primary
                      : hour === Math.ceil(todayStudyTime / 60) &&
                          todayStudyTime % 60 > 0
                        ? `bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)]`
                        : theme.colors.secondary,
                    "--primary-color: " +
                      theme.colors.primary.replace("bg-", ""),
                    "--secondary-color: " +
                      theme.colors.secondary.replace("bg-", ""),
                  )}
                  style={
                    {
                      "--tw-gradient-from": `var(--primary-color)`,
                      "--tw-gradient-to": `var(--secondary-color)`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
            <div
              className={cn(
                "flex items-center justify-between text-xs",
                theme.colors.text,
                "dark:text-gray-200",
              )}
            >
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                今週の合計: {formatStudyTime(todayStudyTime)}
              </div>
              <span>{theme.emoji}</span>
            </div>
          </div>

          {/* 達成項目 */}
          <div className={cn("p-4 border-b", theme.colors.border)}>
            <h3 className={cn("text-sm font-medium mb-2", theme.colors.text)}>
              達成項目
            </h3>
            <div className="space-y-2">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg",
                    achievement.completed
                      ? theme.colors.secondary
                      : "bg-white/50 dark:bg-slate-700/50",
                  )}
                >
                  <div className="flex items-center">
                    <span className="mr-2">{achievement.icon}</span>
                    <span
                      className={cn(
                        "text-sm",
                        achievement.completed
                          ? theme.colors.text
                          : `${theme.colors.text} opacity-50 dark:text-gray-400`,
                      )}
                    >
                      {achievement.name}
                    </span>
                  </div>
                  {achievement.completed && <span>✓</span>}
                </div>
              ))}
            </div>
          </div>

          {/* 参加者 */}
          <div className={cn("p-4 border-b", theme.colors.border)}>
            <h3 className={cn("text-sm font-medium mb-2", theme.colors.text)}>
              参加者
            </h3>
            <div className="space-y-2">
              {localParticipants.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 bg-white/50 dark:bg-slate-700/50 rounded-lg"
                >
                  <div className="flex items-center">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center mr-2",
                        theme.colors.accent,
                      )}
                    >
                      <span className="text-sm">👤</span>
                    </div>
                    <div>
                      <div
                        className={cn(
                          "text-sm font-medium",
                          theme.colors.text,
                          "dark:text-white",
                        )}
                      >
                        {user.name}
                      </div>
                      <div
                        className={cn(
                          "text-xs",
                          theme.colors.text,
                          "dark:text-gray-300",
                        )}
                      >
                        {user.status}
                      </div>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "text-xs",
                      theme.colors.text,
                      "dark:text-gray-200",
                    )}
                  >
                    {user.totalTime}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* イベント */}
          <div className={cn("p-4 border-b", theme.colors.border)}>
            <h3 className={cn("text-sm font-medium mb-2", theme.colors.text)}>
              {theme.name}のイベント
            </h3>
            {events.map((event) => (
              <div
                key={event.id}
                className={cn("p-3 rounded-lg", theme.colors.secondary)}
              >
                <div className="flex items-center mb-1">
                  <span className="mr-1">{event.icon}</span>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      theme.colors.text,
                      "dark:text-white",
                    )}
                  >
                    {event.name}
                  </span>
                </div>
                <p
                  className={cn(
                    "text-xs",
                    theme.colors.text,
                    "dark:text-gray-300",
                  )}
                >
                  {event.description}
                </p>
                <div className="flex justify-end mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "text-xs h-7 bg-white dark:bg-slate-700 border hover:bg-opacity-80",
                      theme.colors.text,
                      theme.colors.border,
                      "dark:text-white",
                    )}
                  >
                    詳細
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* ルームコード */}
          <div className="p-4 mt-auto">
            <div
              className={cn(
                "text-xs mb-1",
                theme.colors.text,
                "dark:text-gray-300",
              )}
            >
              ルームコード
            </div>
            <div
              className={cn(
                "text-2xl font-bold",
                theme.colors.primary.replace("bg-", "text-"),
                "dark:text-white",
              )}
            >
              {roomCode}
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1 flex flex-col">
          {/* ヘッダー */}
          <header
            className={cn(
              "border-b p-3 flex items-center justify-between",
              theme.colors.headerBg,
              theme.colors.border,
            )}
          >
            {theme.customHeader ? (
              theme.customHeader
            ) : (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <span className="mr-2">{theme.emoji}</span>
                  <h1 className={cn("text-lg font-bold", theme.colors.text)}>
                    {theme.name}の自習室
                  </h1>
                  <span className={cn("mx-2", theme.colors.border)}>|</span>
                  <div className={cn("flex items-center", theme.colors.text)}>
                    <span className="mr-1">{theme.emoji}</span>
                    <span>{theme.name}の環境</span>
                    <span className={cn("mx-2", theme.colors.border)}>|</span>
                    <Users className="h-4 w-4 mr-1" />
                    <span>参加者: {localParticipants.length}人</span>
                  </div>
                </div>

                <div className="flex items-center">
                  <div
                    className={cn(
                      "flex items-center mr-4",
                      theme.colors.text,
                      "dark:text-white",
                    )}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    <span suppressHydrationWarning className="font-medium">
                      {renderTime(currentTime)}
                    </span>
                  </div>
                  {/* テーマトグルを追加 */}
                  <ThemeToggle />
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8 ml-2", theme.colors.text)}
                  >
                    <Bell className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8", theme.colors.text)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </header>

          {/* メインエリア */}
          <main className="flex-1 p-6 overflow-auto">
            {/* 通知 */}
            <AnimatePresence>
              {showNotification && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={cn(
                    "mb-4 p-3 bg-white/90 dark:bg-slate-800/95 border rounded-lg flex items-center justify-between",
                    theme.colors.border,
                    theme.colors.text,
                  )}
                >
                  <span>{notificationMessage}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-6 w-6", theme.colors.text)}
                    onClick={() => setShowNotification(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 参加者カード */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {localParticipants.map((user) => (
                <div
                  key={user.id}
                  className={cn(
                    "bg-white/80 dark:bg-slate-800/90 border rounded-xl overflow-hidden",
                    theme.colors.border,
                  )}
                >
                  <div
                    className={cn(
                      "p-3 flex items-center justify-between",
                      user.status === "集中モード"
                        ? theme.colors.cardHeader
                        : user.status === "勉強中"
                          ? "bg-amber-500 dark:bg-amber-600 text-white"
                          : "bg-slate-400 dark:bg-slate-600 text-white",
                    )}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center mr-2">
                        <span className="text-sm">👤</span>
                      </div>
                      <span>{user.name}</span>
                    </div>
                    <span>
                      {user.status === "集中モード"
                        ? "集中モード"
                        : user.status === "勉強中"
                          ? `勉強中 - ${user.remainingTime}`
                          : "休憩中"}
                    </span>
                  </div>

                  <div className="p-6 flex flex-col items-center">
                    {user.id === 1 ? (
                      // 自分のタイマー
                      <>
                        <div className="relative mb-4">
                          <div
                            className={cn(
                              "w-32 h-32 rounded-full border-4 flex items-center justify-center",
                              theme.colors.border,
                              "bg-white/30 dark:bg-slate-700/50",
                            )}
                          >
                            <div
                              className={cn(
                                "text-3xl font-bold",
                                theme.colors.text,
                                "dark:text-white",
                              )}
                              suppressHydrationWarning
                            >
                              {formattedTime}
                            </div>
                          </div>
                          <div
                            className={cn(
                              "absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs",
                              theme.colors.secondary,
                              theme.colors.text,
                              "dark:bg-slate-700 dark:text-white",
                            )}
                          >
                            学習時間
                          </div>
                        </div>

                        <Button
                          variant={isTimerRunning ? "destructive" : "default"}
                          className={
                            isTimerRunning
                              ? cn(
                                  theme.colors.secondary,
                                  theme.colors.text,
                                  "hover:opacity-90 dark:text-white dark:bg-red-700/80",
                                )
                              : cn(
                                  theme.colors.primary,
                                  theme.colors.cardHeaderText,
                                  "hover:opacity-90",
                                )
                          }
                          onClick={toggleTimer}
                        >
                          {isTimerRunning ? (
                            <>
                              <PauseCircle className="h-4 w-4 mr-2" />
                              一時停止
                            </>
                          ) : (
                            <>
                              <PlayCircle className="h-4 w-4 mr-2" />
                              再開
                            </>
                          )}
                        </Button>

                        <div
                          className={cn(
                            "flex items-center mt-4 text-xs",
                            theme.colors.text,
                            "dark:text-gray-200",
                          )}
                        >
                          <Trophy className="h-3 w-3 mr-1" />
                          <span>{user.streakText}</span>
                          <span className="ml-1">✨</span>
                        </div>
                      </>
                    ) : (
                      // 他の参加者
                      <>
                        <div
                          className={cn(
                            "text-3xl font-bold mb-2",
                            theme.colors.text,
                            "dark:text-white",
                          )}
                          suppressHydrationWarning
                        >
                          {user.id === 2 ? "00:40:15" : "00:15:30"}
                        </div>
                        <div
                          className={cn(
                            "text-xs mb-4",
                            theme.colors.text,
                            "dark:text-gray-200",
                          )}
                        >
                          学習時間
                        </div>

                        {user.id === 2 ? (
                          <div className="w-16 h-16 flex items-center justify-center">
                            <span className={cn("text-sm", theme.colors.text)}>
                              集中中！
                            </span>
                          </div>
                        ) : (
                          <div className="w-16 h-16">
                            <Image
                              src="/placeholder.svg?height=64&width=64"
                              alt="休憩中"
                              width={64}
                              height={64}
                              className="opacity-50"
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ユーザーの累積学習時間（秒数）: {userStudySeconds}秒 - 将来的に分析機能で使用予定 */}
          </main>
        </div>
      </div>
    </div>
  );
}
