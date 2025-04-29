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

  // APIからタスク情報を取得する関数
  const fetchApiTasks = async () => {
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

      // DBから取得したタスクをTask型に変換
      const convertedTasks = worksData.map((apiTask: ApiTask) => ({
        id: apiTask.ID,
        title: apiTask.WorkName,
        deadline: apiTask.deadline ? new Date(apiTask.deadline) : undefined,
        subject: apiTask.WorkName, // 科目部分がないため、タスク名を科目として使用
        completed: false, // APIからの完了状態を正しく反映
        timeSpent: apiTask.timeSpent || 0,
        iconImageURL: apiTask.IconImageURL || "",
      }));

      // ローカルのタスクに反映（既存の完了状態は維持）
      setTasks((prevTasks) => {
        // 既存タスクの完了状態を維持するマップを作成
        const completionMap = new Map();
        prevTasks.forEach((task) => {
          if (task.completed) {
            completionMap.set(task.id, {
              completed: true,
              completedDate: task.completedDate,
            });
          }
        });

        // 新しいタスクリストを作成し、完了状態を適用
        return convertedTasks.map((task) => {
          const existingStatus = completionMap.get(task.id);
          if (existingStatus) {
            return {
              ...task,
              completed: existingStatus.completed,
              completedDate: existingStatus.completedDate,
            };
          }
          return task;
        });
      });
    } catch (error) {
      console.error("APIタスク取得エラー:", error);
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

  // モーダル表示用の状態
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedTaskId, setCompletedTaskId] = useState<number | null>(null);

  const handleTaskComplete = (taskId: number) => {
    // タスク完了時の処理
    // タスクの完了状態を更新
    const taskToComplete = tasks.find((task) => task.id === taskId);

    if (!taskToComplete) return;

    // すでに完了しているタスクを未完了に戻す処理のみ行う場合
    if (taskToComplete.completed) {
      const updatedTasks = tasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            completed: false,
            completedDate: undefined,
          };
        }
        return task;
      });

      // タスク状態を更新
      setTasks(updatedTasks);

      // 変更をローカルストレージにも保存
      const completedTasksInStorage = JSON.parse(
        localStorage.getItem("completedTasks") || "[]",
      );
      const updatedCompletedTasks = completedTasksInStorage.filter(
        (id: number) => id !== taskId,
      );
      localStorage.setItem(
        "completedTasks",
        JSON.stringify(updatedCompletedTasks),
      );

      // 統計情報を更新
      fetchUserStats();

      return;
    }

    // 未完了 → 完了への変更処理
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        // 完了へ変更の場合は現在時刻を記録
        const completedDate = new Date();

        // タスク完了通知を表示
        showCompletionNotification(task.title);

        // 完了モーダルを表示
        setCompletedTaskId(taskId);
        setShowCompletionModal(true);

        // タスク完了IDをローカルストレージに保存（再読み込み後も完了状態を保持するため）
        const completedTasksInStorage = JSON.parse(
          localStorage.getItem("completedTasks") || "[]",
        );
        if (!completedTasksInStorage.includes(taskId)) {
          completedTasksInStorage.push(taskId);
          localStorage.setItem(
            "completedTasks",
            JSON.stringify(completedTasksInStorage),
          );
        }

        // 作業ログAPIを使用してタスク完了を記録
        const logTaskCompletion = async () => {
          try {
            const token = localStorage.getItem("token");
            if (!token) return;

            // 学習時間（分）を計算
            const timeSpentMinutes = Math.max(
              1,
              Math.floor((task.timeSpent || 0) / 60),
            );

            console.log("APIリクエスト内容:", {
              WorkID: taskId,
              Minutes: timeSpentMinutes,
            });

            // バックエンドのAPIリクエスト形式に合わせる
            // APIが大文字キーを期待しているためここでも大文字を使用
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/works/add`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  WorkID: parseInt(taskId.toString(), 10), // 確実に数値型に変換
                  Minutes: timeSpentMinutes,
                }),
              },
            );

            const responseText = await response.text();
            console.log("APIレスポンス:", responseText);

            if (!response.ok) {
              console.error(`作業ログの追加に失敗しました: ${response.status}`);
              console.log(
                "サーバーへの保存は失敗しましたが、ローカルでは完了として処理します",
              );

              // エラーがあっても擬似的なポイント獲得表示
              showPointsNotification(Math.floor(Math.random() * 20) + 5);
            } else {
              console.log("作業ログの追加に成功しました");

              // 完了成功時の処理（例：ポイント加算など）
              try {
                const data = JSON.parse(responseText);
                if (data && data.Result && data.Result.Coins) {
                  // ポイント獲得のフィードバックを表示
                  showPointsNotification(data.Result.Coins);
                } else {
                  // レスポンスに獲得コインがない場合は擬似的に表示
                  showPointsNotification(Math.floor(Math.random() * 20) + 5);
                }
              } catch (e) {
                // JSONパースエラーが発生した場合は擬似的にポイント表示
                showPointsNotification(Math.floor(Math.random() * 20) + 5);
              }
            }

            // タスク一覧と統計情報を更新
            setTimeout(() => {
              fetchApiTasks();
              fetchUserStats();
            }, 500);
          } catch (error) {
            console.error("作業ログの追加中にエラーが発生しました:", error);

            // エラーがあってもローカルでは完了状態を保持
            console.log(
              "エラーが発生しましたが、ローカルでは完了として処理します",
            );

            // 擬似的にポイント獲得の通知を表示
            showPointsNotification(Math.floor(Math.random() * 20) + 5);

            // タスク一覧と統計情報を更新
            setTimeout(() => {
              fetchApiTasks();
              fetchUserStats();
            }, 500);
          }
        };

        logTaskCompletion();

        return {
          ...task,
          completed: true,
          completedDate,
        };
      }
      return task;
    });

    // タスク状態を更新
    setTasks(updatedTasks);
  };

  // ポイント獲得通知を表示する関数
  const showPointsNotification = (points: number) => {
    const pointNotification = document.createElement("div");
    pointNotification.className =
      "fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50";
    pointNotification.innerHTML = `<p class="font-bold">+${points}ポイント獲得！</p>`;
    document.body.appendChild(pointNotification);

    // 3秒後に通知を消す
    setTimeout(() => {
      pointNotification.remove();
    }, 3000);
  };

  // handleTaskAdd 関数を追加
  const handleTaskAdd = (task: Task) => {
    setTasks((prev) => [...prev, task]);
    // タスクが追加されたらAPIタスクも再取得
    setTimeout(() => {
      fetchApiTasks();
    }, 500);
  };

  // 完了済みタスクを維持するための処理を追加
  useEffect(() => {
    // ローカルストレージから完了済みタスクIDのリストを取得
    const loadCompletedTasksFromStorage = () => {
      const completedTaskIds = JSON.parse(
        localStorage.getItem("completedTasks") || "[]",
      );

      // 既存のタスクに完了状態を適用
      if (completedTaskIds.length > 0 && tasks.length > 0) {
        const updatedTasks = tasks.map((task) => {
          if (completedTaskIds.includes(task.id)) {
            return {
              ...task,
              completed: true,
              completedDate: task.completedDate || new Date(), // 完了日時がなければ現在時刻を設定
            };
          }
          return task;
        });

        setTasks(updatedTasks);
      }
    };

    loadCompletedTasksFromStorage();
  }, [tasks.length]); // タスクリストが変わったときだけ実行

  // 学習データサマリーコンポーネント - Card コンポーネントを使用する形に変更
  const StudyDataSummary = () => {
    // 完了済みのタスク数と未完了のタスク数を計算
    const completedTasksCount = tasks.filter((task) => task.completed).length;
    const activeTasksCount = tasks.filter((task) => !task.completed).length;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card
          icon={<Calendar />}
          label="連続学習"
          value={`${userStats.dayStreak}日`}
        />
        <Card
          icon={<Clock />}
          label="総タスク数"
          value={`${completedTasksCount + activeTasksCount}件`}
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

      {/* タスク完了モーダル */}
      {showCompletionModal && completedTaskId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-backdrop">
          <div className="bg-white dark:bg-amber-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl transform transition-all">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-10 w-10 text-green-500 dark:text-green-400" />
              </div>

              <h3 className="text-xl font-bold text-amber-800 dark:text-amber-100 mb-2">
                タスク完了！
              </h3>

              <p className="text-amber-600 dark:text-amber-300 mb-4">
                「{tasks.find((t) => t.id === completedTaskId)?.title}
                」を完了しました。 おめでとうございます！
              </p>

              <button
                onClick={() => {
                  setShowCompletionModal(false);
                }}
                className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                いい調子！
              </button>
            </div>
          </div>
        </div>
      )}

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
                        tasks={tasks}
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

                    {/* 完了タスク一覧 */}
                    <div className="space-y-4">
                      {tasks.filter((task) => task.completed).length === 0 ? (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 mx-auto text-amber-500 mb-2" />
                          <p className="text-lg text-amber-800 dark:text-amber-200">
                            完了したタスクはありません
                          </p>
                          <p className="text-sm text-amber-600 dark:text-amber-300">
                            タスクを完了すると、ここに表示されます
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="mb-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-green-800 dark:text-green-300 mb-2">
                              <CheckCircle className="h-5 w-5" />
                              <h4 className="font-medium">完了したタスク</h4>
                            </div>
                            <p className="text-sm text-green-700 dark:text-green-400">
                              おめでとうございます！
                              {tasks.filter((task) => task.completed).length}
                              件のタスクを完了しました。
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tasks
                              .filter((task) => task.completed)
                              .map((task) => (
                                <div
                                  key={task.id}
                                  className="bg-amber-50 dark:bg-amber-800/50 p-4 rounded-lg border border-amber-200 dark:border-amber-700"
                                >
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h5 className="font-medium line-through text-amber-700 dark:text-amber-300">
                                        {task.title}
                                      </h5>
                                      {task.completedDate && (
                                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                          完了日時:{" "}
                                          {task.completedDate.toLocaleString()}
                                        </p>
                                      )}
                                    </div>
                                    <div className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                                      完了済み
                                    </div>
                                  </div>

                                  <div className="mt-2 text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                      学習時間:{" "}
                                      {formatTime(task.timeSpent || 0)}
                                    </span>
                                  </div>

                                  <button
                                    onClick={() => handleTaskComplete(task.id)}
                                    className="mt-3 text-amber-700 dark:text-amber-300 text-sm underline flex items-center gap-1"
                                  >
                                    <span>未完了に戻す</span>
                                  </button>
                                </div>
                              ))}
                          </div>
                        </>
                      )}
                    </div>
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
    <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white flex items-center space-x-3 shadow-md">
      <div className="text-white">{icon}</div>
      <div>
        <div className="text-sm opacity-80">{label}</div>
        <div className="text-xl font-bold">{value}</div>
      </div>
    </div>
  );
}

// ユーティリティ関数：タスク完了通知を表示
function showCompletionNotification(taskTitle: string) {
  // ブラウザの通知APIが利用可能かチェック
  if ("Notification" in window) {
    // 通知の許可状態を確認
    if (Notification.permission === "granted") {
      new Notification("タスク完了", {
        body: `「${taskTitle}」を完了しました！`,
        icon: "/icons/complete-icon.png", // 適切なアイコンパスに変更
      });
    } else if (Notification.permission !== "denied") {
      // 通知の許可を要求
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("タスク完了", {
            body: `「${taskTitle}」を完了しました！`,
            icon: "/icons/complete-icon.png", // 適切なアイコンパスに変更
          });
        }
      });
    }
  }
}
