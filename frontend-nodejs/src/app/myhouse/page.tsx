"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { Task } from "./components/TaskManagement";
import { TaskManagement } from "./components/TaskManagement";
import { StudyTimeChart } from "./components/StudyTimeChart";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  BookOpen,
  Calendar,
  Clock,
  MessageSquare,
  BarChart2,
  Plus,
  Target,
  LucideIcon,
} from "lucide-react";
import { ChatPanel } from "./components/ChatPanel";
import { Message } from "./types";

type TabType = "tasks" | "chat" | "stats";

interface TabInfo {
  id: TabType;
  label: string;
  icon: LucideIcon;
}

export default function MyHousePage() {
  const { isDarkMode } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [userStats, setUserStats] = useState({
    level: 1,
    dayStreak: 0,
    totalStudyHours: 0,
  });

  const [activeTab, setActiveTab] = useState<TabType>("tasks");
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

  const tabs: TabInfo[] = [
    { id: "tasks", label: "タスク管理", icon: Plus },
    { id: "chat", label: "チャット", icon: MessageSquare },
    { id: "stats", label: "学習データ", icon: BarChart2 },
  ];

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

  // 学習データサマリーコンポーネント
  const StudyDataSummary = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
            tasks.reduce((acc, task) => acc + task.timeSpent, 0) / 60,
          )}
          分
        </p>
      </div>
    </div>
  );

  // 学習ステータスコンポーネント
  const LearningStatus = () => (
    <div className="bg-white dark:bg-amber-800/90 rounded-lg p-6 mb-6 shadow-md border border-amber-200 dark:border-amber-700">
      <h3 className="text-lg font-bold mb-4 border-b pb-2 border-amber-200 dark:border-amber-700">
        学習ステータス
      </h3>

      <div className="mb-4">
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          現在の学習時間
        </div>
        <div className="flex space-x-2 mb-4">
          <motion.button
            className={cn(
              "px-6 py-2 rounded text-white font-medium",
              isDarkMode
                ? "bg-green-600 hover:bg-green-500"
                : "bg-green-500 hover:bg-green-400",
            )}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            スタート
          </motion.button>
          <motion.button
            className={cn(
              "px-6 py-2 rounded text-white font-medium",
              isDarkMode
                ? "bg-red-600 hover:bg-red-500"
                : "bg-red-500 hover:bg-red-400",
            )}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            終了
          </motion.button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-amber-50 dark:bg-amber-900 p-3 rounded border border-amber-200 dark:border-amber-700">
            <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">
              今回の学習時間
            </div>
            <div className="text-xl font-bold">0分0秒</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900 p-3 rounded border border-amber-200 dark:border-amber-700">
            <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">
              今日の累計
            </div>
            <div className="text-xl font-bold">0分0秒</div>
          </div>
        </div>
      </div>
    </div>
  );

  // 作業時間分析コンポーネント
  const WorkTimeAnalysis = () => (
    <div className="bg-white dark:bg-amber-800/90 rounded-lg p-6 mb-6 shadow-md border border-amber-200 dark:border-amber-700">
      <h3 className="text-lg font-bold mb-4 border-b pb-2 border-amber-200 dark:border-amber-700">
        作業時間分析
      </h3>
      {tasks.length > 0 ? (
        <StudyTimeChart isDarkMode={isDarkMode} tasks={tasks} />
      ) : (
        <div className="text-center p-6 text-gray-500 dark:text-gray-400">
          まだ記録された作業時間がありません。タスクに取り組んで記録を作成してください。
        </div>
      )}
    </div>
  );

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

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* モバイル向けのタブナビゲーション */}
        <div className="lg:hidden flex border-b mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 whitespace-nowrap",
                activeTab === tab.id
                  ? isDarkMode
                    ? "border-b-2 border-amber-500 text-amber-100 font-medium"
                    : "border-b-2 border-amber-500 text-amber-800 font-medium"
                  : isDarkMode
                    ? "text-amber-300"
                    : "text-amber-600",
              )}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* サイドバーナビゲーション（デスクトップ） */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="bg-white dark:bg-amber-800/90 rounded-lg shadow-md border border-amber-200 dark:border-amber-700 overflow-hidden sticky top-24">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-4 text-left transition-colors",
                    activeTab === tab.id
                      ? isDarkMode
                        ? "bg-amber-700/50 text-amber-50 font-medium border-l-4 border-amber-500"
                        : "bg-amber-100 text-amber-800 font-medium border-l-4 border-amber-500"
                      : isDarkMode
                        ? "text-amber-200 hover:bg-amber-800/50"
                        : "text-amber-700 hover:bg-amber-50",
                  )}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* メインコンテンツエリア */}
          <div className="lg:col-span-9">
            {/* 学習データサマリー - 常に表示 */}
            <StudyDataSummary />

            {/* タブコンテンツ */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === "tasks" && (
                  <>
                    <LearningStatus />

                    <div className="bg-white dark:bg-amber-800/90 rounded-lg p-6 shadow-md border border-amber-200 dark:border-amber-700">
                      <h3 className="text-lg font-bold mb-4 border-b pb-2 border-amber-200 dark:border-amber-700">
                        タスク管理
                      </h3>
                      <TaskManagement
                        isDarkMode={isDarkMode}
                        onTaskComplete={handleTaskComplete}
                        onTaskAdd={handleTaskAdd}
                      />
                    </div>
                  </>
                )}

                {activeTab === "chat" && (
                  <div
                    className="bg-white dark:bg-amber-800/90 rounded-lg overflow-hidden shadow-md border border-amber-200 dark:border-amber-700"
                    style={{ height: "600px" }}
                  >
                    <ChatPanel
                      messages={messages}
                      setMessages={setMessages}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                )}

                {activeTab === "stats" && (
                  <>
                    <LearningStatus />
                    <WorkTimeAnalysis />
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
