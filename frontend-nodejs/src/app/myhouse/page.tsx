"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { Task } from "./components/TaskManagement";
import { TaskManagement } from "./components/TaskManagement";
import { StudyTimeChart } from "./components/StudyTimeChart";
import { StudyStats } from "./components/StudyStats";
import {
  Home,
  BookOpen,
  Calendar,
  Clock,
  MessageSquare,
  BarChart2,
  Users,
  X,
} from "lucide-react";
import { ChatPanel } from "./components/ChatPanel";
import { Message } from "./types";

type TabType = "chat" | "stats";

export default function MyHousePage() {
  const { isDarkMode } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [userStats, setUserStats] = useState({
    level: 1,
    dayStreak: 0,
    totalStudyHours: 0,
  });
  const [activeTab, setActiveTab] = useState<TabType>("chat");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "システム",
      content:
        "マイスタディハウスへようこそ！ここで学習の記録や他のユーザーとのコミュニケーションができます。",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // ユーザー統計情報を取得
  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/profile/get`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        const userData = data.User || data.user || data.Me || data;

        setUserStats({
          level: userData.Level || userData.level || 1,
          dayStreak: userData.DayStreak || userData.dayStreak || 0,
          totalStudyHours:
            userData.TotalStudyHours || userData.totalStudyHours || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated) {
      fetchUserStats();

      // 保存されたタスクをロード
      const loadSavedTasks = () => {
        const savedTasks = localStorage.getItem("tasks");
        if (savedTasks) {
          try {
            const parsedTasks = JSON.parse(savedTasks);
            // 日付文字列をDate型に変換
            const tasksWithProperDates = parsedTasks.map(
              (task: {
                id: number;
                title: string;
                deadline?: string;
                subject: string;
                completed: boolean;
                timeSpent: number;
              }) => ({
                ...task,
                deadline: task.deadline ? new Date(task.deadline) : undefined,
              }),
            );
            setTasks(tasksWithProperDates);
          } catch (e) {
            console.error("タスクの読み込みエラー:", e);
          }
        }
      };

      // チャットメッセージをロード
      const loadSavedMessages = () => {
        const savedMessages = localStorage.getItem("chatMessages");
        if (savedMessages) {
          try {
            const parsedMessages = JSON.parse(savedMessages);
            if (parsedMessages.length > 0) {
              setMessages(parsedMessages);
            }
          } catch (e) {
            console.error("チャットメッセージの読み込みエラー:", e);
          }
        }
      };

      loadSavedTasks();
      loadSavedMessages();
    }
  }, [isAuthenticated, authLoading]);

  // メッセージが変更されたらローカルストレージに保存
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  const handleTaskComplete = (taskId: number) => {
    // タスク完了時の処理（統計の更新など）
    console.log(`Task completed: ${taskId}`);
  };

  const handleTaskAdd = (task: Task) => {
    setTasks((prev) => [...prev, task]);
  };

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-900 dark:to-amber-800">
      <header className="bg-amber-800 text-amber-50 p-4 flex items-center justify-between z-50 sticky top-0 left-0 right-0 font-sans">
        <div className="flex items-center">
          <Home className="h-7 w-7 mr-2" />
          <h1 className="text-xl font-bold tracking-wide">
            マイスタディハウス
          </h1>
          <span className="ml-3 bg-amber-700 px-3 py-1 rounded text-base font-semibold">
            Lv.{userStats.level}
          </span>
        </div>

        <div className="flex items-center space-x-6">
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
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div
          className={cn(
            "transition-colors duration-300",
            isDarkMode ? "text-amber-50" : "text-amber-950",
          )}
        >
          {/* メインパネル起動ボタン */}
          {!isPanelOpen && (
            <div className="w-full mb-6 flex justify-center">
              <button
                onClick={togglePanel}
                className={cn(
                  "px-6 py-3 rounded-lg shadow-md flex items-center gap-2 transition-all transform hover:scale-105",
                  isDarkMode
                    ? "bg-amber-700 hover:bg-amber-600 text-white"
                    : "bg-amber-500 hover:bg-amber-400 text-white",
                )}
              >
                <Users className="h-5 w-5" />
                <span className="font-medium">スタディルームを開く</span>
              </button>
            </div>
          )}

          {/* スタディルームパネル */}
          {isPanelOpen && (
            <div
              style={{ height: "600px" }}
              className={cn(
                "mb-6 overflow-hidden rounded-2xl border shadow-lg transition-all duration-300 ease-in-out",
                isDarkMode
                  ? "bg-amber-900 border-amber-700"
                  : "bg-white border-amber-200",
              )}
            >
              {/* タブヘッダー */}
              <div
                className={cn(
                  "flex border-b",
                  isDarkMode
                    ? "border-amber-700 bg-amber-800"
                    : "border-amber-200 bg-amber-50",
                )}
              >
                <button
                  onClick={() => setActiveTab("chat")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 font-medium transition-colors",
                    activeTab === "chat"
                      ? isDarkMode
                        ? "bg-amber-900 text-amber-100 border-b-2 border-amber-500"
                        : "bg-white text-amber-800 border-b-2 border-amber-500"
                      : isDarkMode
                        ? "text-amber-300 hover:bg-amber-800/50"
                        : "text-amber-600 hover:bg-amber-100/70",
                  )}
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>チャット</span>
                </button>
                <button
                  onClick={() => setActiveTab("stats")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 font-medium transition-colors",
                    activeTab === "stats"
                      ? isDarkMode
                        ? "bg-amber-900 text-amber-100 border-b-2 border-amber-500"
                        : "bg-white text-amber-800 border-b-2 border-amber-500"
                      : isDarkMode
                        ? "text-amber-300 hover:bg-amber-800/50"
                        : "text-amber-600 hover:bg-amber-100/70",
                  )}
                >
                  <BarChart2 className="h-5 w-5" />
                  <span>学習データ</span>
                </button>

                <div className="ml-auto">
                  <button
                    onClick={togglePanel}
                    className={cn(
                      "px-4 py-3",
                      isDarkMode ? "text-amber-300" : "text-amber-600",
                      "hover:text-amber-500",
                    )}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* タブコンテンツ */}
              <div className="h-[calc(600px-48px)]">
                {activeTab === "chat" && (
                  <ChatPanel
                    messages={messages}
                    setMessages={setMessages}
                    isDarkMode={isDarkMode}
                  />
                )}

                {activeTab === "stats" && (
                  <div className="h-full overflow-y-auto p-4">
                    {/* 学習データカード表示 */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-4 text-white shadow-md">
                        <div className="flex items-center mb-2">
                          <Calendar className="h-5 w-5 mr-2" />
                          <span className="font-medium">連続学習</span>
                        </div>
                        <p className="text-2xl font-bold text-center">
                          {userStats.dayStreak}日
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-4 text-white shadow-md">
                        <div className="flex items-center mb-2">
                          <Clock className="h-5 w-5 mr-2" />
                          <span className="font-medium">完了タスク</span>
                        </div>
                        <p className="text-2xl font-bold text-center">
                          {tasks.filter((task) => task.completed).length}件
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-4 text-white shadow-md">
                        <div className="flex items-center mb-2">
                          <BookOpen className="h-5 w-5 mr-2" />
                          <span className="font-medium">総学習時間</span>
                        </div>
                        <p className="text-2xl font-bold text-center">
                          {userStats.totalStudyHours}時間
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-4 text-white shadow-md">
                        <div className="flex items-center mb-2">
                          <Clock className="h-5 w-5 mr-2" />
                          <span className="font-medium">今日の学習</span>
                        </div>
                        <p className="text-2xl font-bold text-center">
                          {Math.floor(
                            tasks.reduce(
                              (acc, task) => acc + task.timeSpent,
                              0,
                            ) / 60,
                          )}
                          分
                        </p>
                      </div>
                    </div>

                    <StudyTimeChart isDarkMode={isDarkMode} tasks={tasks} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* メインコンテンツ - チャットが表示されていない場合のみ表示 */}
          {(!isPanelOpen || (isPanelOpen && activeTab === "stats")) && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-12">
                {/* タスク管理コンポーネント */}
                <div className="mb-6">
                  <TaskManagement
                    isDarkMode={isDarkMode}
                    onTaskComplete={handleTaskComplete}
                    onTaskAdd={handleTaskAdd}
                  />
                </div>

                {/* 学習ステータス */}
                <div className="mb-6">
                  <StudyStats isDarkMode={isDarkMode} />
                </div>

                {/* 学習データカード表示 */}
                <div className="rounded-2xl p-6 mb-6 shadow-md bg-white border border-amber-200 dark:bg-amber-800/90 dark:border-amber-700 dark:text-amber-50">
                  <h3 className="text-xl font-bold mb-4 border-b pb-2 border-amber-200">
                    学習データ
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-4 text-white shadow-md">
                      <div className="flex items-center mb-2">
                        <Calendar className="h-5 w-5 mr-2" />
                        <span className="font-medium">連続学習</span>
                      </div>
                      <p className="text-2xl font-bold text-center">
                        {userStats.dayStreak}日
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-4 text-white shadow-md">
                      <div className="flex items-center mb-2">
                        <Clock className="h-5 w-5 mr-2" />
                        <span className="font-medium">完了タスク</span>
                      </div>
                      <p className="text-2xl font-bold text-center">
                        {tasks.filter((task) => task.completed).length}件
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-4 text-white shadow-md">
                      <div className="flex items-center mb-2">
                        <BookOpen className="h-5 w-5 mr-2" />
                        <span className="font-medium">総学習時間</span>
                      </div>
                      <p className="text-2xl font-bold text-center">
                        {userStats.totalStudyHours}時間
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-4 text-white shadow-md">
                      <div className="flex items-center mb-2">
                        <Clock className="h-5 w-5 mr-2" />
                        <span className="font-medium">今日の学習</span>
                      </div>
                      <p className="text-2xl font-bold text-center">
                        {Math.floor(
                          tasks.reduce((acc, task) => acc + task.timeSpent, 0) /
                            60,
                        )}
                        分
                      </p>
                    </div>
                  </div>
                </div>

                {/* チャート表示コンポーネント */}
                <div className="mb-6">
                  <StudyTimeChart isDarkMode={isDarkMode} tasks={tasks} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
