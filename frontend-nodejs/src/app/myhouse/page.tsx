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
  LucideIcon,
  CheckCircle,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { ChatPanel } from "./components/ChatPanel";
import { Message } from "./types";
import { CompletedTasks } from "./components/CompletedTasks";
import { formatTime, formatDeadline } from "./lib/timeUtils";

// APIから取得するタスクの型定義
interface ApiTask {
  ID: number;
  WorkName: string;
  IconImageURL: string;
  notes?: string;
  timeSpent?: number;
  deadline?: string;
}

type TabType = "tasks" | "chat" | "stats" | "completed";

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

  // APIから取得したタスク一覧
  const [apiTasks, setApiTasks] = useState<ApiTask[]>([]);
  const [isLoadingApiTasks, setIsLoadingApiTasks] = useState(false);
  const [totalTasksCount, setTotalTasksCount] = useState(0);

  const [activeTab, setActiveTab] = useState<TabType>("tasks");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "オーナー",
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
    { id: "completed", label: "完了したタスク", icon: CheckCircle },
    { id: "chat", label: "チャット", icon: MessageSquare },
    { id: "stats", label: "学習データ", icon: BarChart2 },
  ];

  // 全タスク表示モーダルを開く
  const openTasksModal = () => {
    setActiveTab("tasks");
  };

  // APIからタスク情報を取得する関数
  const fetchApiTasks = async () => {
    setIsLoadingApiTasks(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // タイムスタンプを追加してキャッシュを回避
      const timestamp = Date.now();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/works/get?t=${timestamp}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error(`タスクの取得に失敗しました (${response.status})`);
      }

      const data = await response.json();

      // データの存在確認とフォーマット検証を柔軟に行う
      const worksData = data.Works || data.works || [];
      setApiTasks(worksData);
      setTotalTasksCount(worksData.length);

      // DBから取得したタスクをTask型に変換
      const convertedTasks = worksData.map((apiTask: ApiTask) => ({
        id: apiTask.ID,
        title: apiTask.WorkName,
        deadline: apiTask.deadline ? new Date(apiTask.deadline) : undefined,
        subject: apiTask.WorkName, // 科目部分がないため、タスク名を科目として使用
        completed: false,
        timeSpent: apiTask.timeSpent || 0,
        iconImageURL: apiTask.IconImageURL || "",
      }));

      // ローカルのタスクに反映
      setTasks(convertedTasks);
    } catch (error) {
      console.error("APIタスク取得エラー:", error);
    } finally {
      setIsLoadingApiTasks(false);
    }
  };

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
      fetchApiTasks(); // APIからタスクデータを取得

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

      loadSavedMessages();
    }
  }, [isAuthenticated, authLoading]);

  // タブが変更されたときに再取得
  useEffect(() => {
    if (activeTab === "tasks" || activeTab === "stats") {
      fetchApiTasks();
    }
  }, [activeTab]);

  // メッセージが変更されたらローカルストレージに保存
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  const handleTaskComplete = (taskId: number) => {
    // タスク完了時の処理
    // タスクの完了状態を更新
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        // 完了へ変更の場合は現在時刻を記録、未完了へ戻す場合は完了日時をクリア
        const wasCompleted = task.completed;
        const newCompletedState = !wasCompleted;
        const completedDate = newCompletedState ? new Date() : undefined;

        // タスクが新たに完了した場合は、完了タスクタブに自動的に切り替え
        if (newCompletedState && !wasCompleted) {
          // 少し遅延を入れてからタブを切り替え（アニメーションのため）
          setTimeout(() => {
            setActiveTab("completed");
          }, 500);
        }

        return {
          ...task,
          completed: newCompletedState,
          completedDate,
        };
      }
      return task;
    });

    // タスク状態を更新
    setTasks(updatedTasks);
  };

  const handleTaskAdd = (task: Task) => {
    setTasks((prev) => [...prev, task]);
    // タスクが追加されたらAPIタスクも再取得
    setTimeout(() => {
      fetchApiTasks();
    }, 500);
  };

  // 学習データサマリーコンポーネント - Card コンポーネントを使用する形に変更
  const StudyDataSummary = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card
        icon={<Calendar />}
        label="連続学習"
        value={`${userStats.dayStreak}日`}
      />
      <Card
        icon={<Clock />}
        label="総タスク数"
        value={isLoadingApiTasks ? "読込中..." : `${totalTasksCount}件`}
      />
      <Card
        icon={<BookOpen />}
        label="総学習時間"
        value={`${userStats.totalStudyHours}時間`}
      />
      <Card
        icon={<Clock />}
        label="今日の学習"
        value={`${Math.floor(tasks.reduce((acc, task) => acc + task.timeSpent, 0) / 60)}分`}
      />
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

            {/* 学習ステータス */}
            <div className="mb-8 p-4 bg-[#f8eddc] rounded-2xl border-2 border-[#e4cbac] shadow-md">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-[#8cc750] rounded-full flex items-center justify-center border-2 border-[#7ab145] shadow-sm">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <h3 className="ml-2 text-lg font-bold text-[#7b6c5d]">
                  学習ステータス
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg border border-[#e4cbac]">
                  <div className="text-xs text-[#9b8e7e] mb-1">
                    累計学習時間
                  </div>
                  <div className="text-xl font-bold text-[#7b6c5d]">
                    {formatTime(
                      tasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0),
                    )}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-[#e4cbac]">
                  <div className="text-xs text-[#9b8e7e] mb-1">
                    今日の学習時間
                  </div>
                  <div className="text-xl font-bold text-[#7b6c5d]">
                    {formatTime(
                      tasks.reduce(
                        (sum, task) => sum + (task.timeSpent || 0),
                        0,
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>

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
                    <div className="bg-white dark:bg-amber-800/90 rounded-lg p-6 shadow-md border border-amber-200 dark:border-amber-700">
                      <h3 className="text-2xl font-bold mb-4 border-b pb-2 border-amber-200 dark:border-amber-700">
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

                {activeTab === "completed" && (
                  <div className="bg-white dark:bg-amber-800/90 rounded-lg p-6 shadow-md border border-amber-200 dark:border-amber-700">
                    <h3 className="text-2xl font-bold mb-4 border-b pb-2 border-amber-200 dark:border-amber-700">
                      完了したタスク
                    </h3>
                    <CompletedTasks
                      tasks={tasks}
                      isDarkMode={isDarkMode}
                      onToggleComplete={handleTaskComplete}
                    />
                  </div>
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
                    {/* 学習ステータス */}
                    <div className="bg-white dark:bg-amber-800/90 rounded-lg p-6 shadow-md border border-amber-200 dark:border-amber-700 mb-6">
                      <h3 className="text-2xl font-bold mb-4 border-b pb-2 border-amber-200 dark:border-amber-700">
                        学習統計
                      </h3>
                      <StudyTimeChart tasks={tasks} isDarkMode={isDarkMode} />
                    </div>

                    {/* タスク別分析 */}
                    <div className="bg-white dark:bg-amber-800/90 rounded-lg p-6 shadow-md border border-amber-200 dark:border-amber-700">
                      <h3 className="text-2xl font-bold mb-4 border-b pb-2 border-amber-200 dark:border-amber-700">
                        タスク別分析
                      </h3>
                      <div className="space-y-4">
                        {tasks.length === 0 ? (
                          <div className="text-center py-8">
                            <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-2" />
                            <p className="text-lg text-amber-800 dark:text-amber-200">
                              タスクがありません
                            </p>
                            <p className="text-sm text-amber-600 dark:text-amber-300">
                              タスクを追加すると、ここに分析データが表示されます
                            </p>
                          </div>
                        ) : (
                          tasks.map((task) => (
                            <div
                              key={task.id}
                              className="p-4 border border-amber-200 dark:border-amber-700 rounded-lg"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-bold">{task.title}</h4>
                                  <p className="text-sm text-amber-700 dark:text-amber-300">
                                    {task.subject}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">
                                    {formatTime(task.timeSpent || 0)}
                                  </div>
                                  {task.deadline && (
                                    <div
                                      className={cn(
                                        "text-xs",
                                        new Date() > task.deadline
                                          ? "text-red-500"
                                          : "text-amber-600 dark:text-amber-300",
                                      )}
                                    >
                                      {formatDeadline(task.deadline)}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="w-full bg-amber-100 dark:bg-amber-700/30 h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-amber-500 h-full rounded-full"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      (task.timeSpent || 0) / 60,
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
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

// Card コンポーネント - 最初のコードのカード実装を利用
function Card({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white flex items-center space-x-3">
      <div>{icon}</div>
      <div>
        <div className="text-sm opacity-80">{label}</div>
        <div className="text-xl font-bold">{value}</div>
      </div>
    </div>
  );
}
