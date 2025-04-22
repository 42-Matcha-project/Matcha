"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  X,
  Timer,
  AlertTriangle,
  Clock3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

// タスクの型定義
export interface Task {
  id: number;
  title: string;
  deadline: Date | undefined;
  subject: string;
  completed: boolean;
  timeSpent: number; // 秒単位
  iconImageURL?: string; // アイコン画像URL
  apiIconImageURL?: string; // API送信用のアイコン画像URL
  timerRunning?: boolean; // タイマー実行中かどうか
  currentTimerValue?: number; // 現在のタイマー値（秒単位）
  pausedTimerValue?: number; // 一時停止時の残り時間
  completedDate?: Date; // タスク完了日時
}

interface TaskManagementProps {
  isDarkMode: boolean;
  onTaskComplete: (taskId: number) => void;
  onTaskAdd: (task: Task) => void;
}

// 締切日のステータスを取得する関数を追加
type DeadlineStatus = {
  status: "expired" | "today" | "tomorrow" | "soon" | "future";
  message: string;
  color: "red" | "orange" | "yellow" | "green";
};

const getDeadlineStatus = (deadline: Date): DeadlineStatus => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);

  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: "expired",
      message: "期限切れ",
      color: "red",
    };
  }

  if (diffDays === 0) {
    return {
      status: "today",
      message: "今日が締切日です",
      color: "orange",
    };
  }

  if (diffDays === 1) {
    return {
      status: "tomorrow",
      message: "明日が締切日です",
      color: "orange",
    };
  }

  if (diffDays <= 3) {
    return {
      status: "soon",
      message: `あと${diffDays}日`,
      color: "yellow",
    };
  }

  return {
    status: "future",
    message: `あと${diffDays}日`,
    color: "green",
  };
};

export function TaskManagement({
  isDarkMode,
  onTaskComplete,
  onTaskAdd,
}: TaskManagementProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isAddingTask, setIsAddingTask] = useState<boolean>(false);
  const [customTimerOpen, setCustomTimerOpen] = useState<boolean>(false);
  const [customTimerHours, setCustomTimerHours] = useState<string>("0");
  const [customTimerMinutes, setCustomTimerMinutes] = useState<string>("25");
  const [extendTimerHours, setExtendTimerHours] = useState<string>("0");
  const [extendTimerMinutes, setExtendTimerMinutes] = useState<string>("5");
  const [iconImageURL, setIconImageURL] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [taskToStartTimer, setTaskToStartTimer] = useState<Task | null>(null);

  // ローカルストレージからタスクを読み込む
  useEffect(() => {
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
            iconImageURL?: string;
            apiIconImageURL?: string;
          }) => ({
            ...task,
            deadline: task.deadline ? new Date(task.deadline) : undefined,
            iconImageURL: task.iconImageURL || undefined,
            apiIconImageURL: task.apiIconImageURL || "",
          }),
        );
        setTasks(tasksWithProperDates);
      } catch (e) {
        console.error("タスクの読み込みエラー:", e);
      }
    }
  }, []);

  // タスクが変更されたらローカルストレージに保存
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // 各タスクのタイマーを管理する
  useEffect(() => {
    // 実行中のタイマーを持つすべてのタスク用にタイマーを設定
    const timers: NodeJS.Timeout[] = [];

    tasks.forEach((task) => {
      if (task.timerRunning && task.currentTimerValue !== undefined) {
        const timer = setInterval(() => {
          setTasks((prevTasks) =>
            prevTasks.map((t) => {
              if (
                t.id === task.id &&
                t.timerRunning &&
                t.currentTimerValue !== undefined
              ) {
                if (t.currentTimerValue <= 1) {
                  // タイマー終了
                  clearInterval(timer);
                  toast.success(`${t.title}のタイマーが終了しました！`);
                  return {
                    ...t,
                    timerRunning: false,
                    currentTimerValue: 0,
                    timeSpent:
                      t.timeSpent + (t.pausedTimerValue || t.currentTimerValue),
                  };
                }
                return { ...t, currentTimerValue: t.currentTimerValue - 1 };
              }
              return t;
            }),
          );
        }, 1000);

        timers.push(timer);
      }
    });

    // クリーンアップ関数
    return () => {
      timers.forEach((timer) => clearInterval(timer));
    };
  }, [tasks]);

  // 新しいタスクを追加
  const addTask = () => {
    if (!newTask.trim()) {
      toast.error("タスク名を入力してください");
      return;
    }

    // Base64画像URLが長すぎる場合の処理
    let processedIconURL = iconImageURL;
    if (iconImageURL && iconImageURL.length > 1000) {
      // 長いBase64データURLの場合、ローカル表示用に保持するが
      // API送信用には空文字列を使用（サーバー側の処理が整うまで）
      console.log("画像URLが長すぎるため、API送信時には省略します");
      processedIconURL = ""; // API送信用に空にする
    }

    const newTaskObj: Task = {
      id: Date.now(),
      title: newTask,
      deadline: selectedDate,
      subject: "", // 空の文字列をデフォルト値として使用
      completed: false,
      timeSpent: 0,
      iconImageURL: iconImageURL || undefined, // 表示用はそのまま保持
      apiIconImageURL: processedIconURL || "", // API送信用
    };

    setTasks((prev) => [...prev, newTaskObj]);
    onTaskAdd(newTaskObj);

    // APIにタスクを送信
    if (localStorage.getItem("token")) {
      sendTaskToAPI(newTaskObj);
    }

    setNewTask("");
    setSelectedDate(undefined);
    setIconImageURL("");
    setIsAddingTask(false);

    toast.success("タスクを追加しました");
  };

  // APIに作業内容を送信する
  const sendTaskToAPI = async (task: Task) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // 開発環境のみに表示するデバッグログ
      if (process.env.NODE_ENV === "development") {
        console.log("作業を保存しようとしています:", {
          WorkName: task.title,
          IconImageURL: task.apiIconImageURL ? "画像あり" : "画像なし",
        });
      }

      // 開発中の機能のため、エラーハンドリングを強化
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/works/add`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              WorkName: task.title,
              IconImageURL: task.apiIconImageURL || "",
            }),
          },
        );

        if (!response.ok) {
          console.warn("API応答エラー:", response.status);
          // APIエラーをログに記録するだけで、ユーザーには通知しない
          return;
        }

        const data = await response.json();
        if (process.env.NODE_ENV === "development") {
          console.log("作業保存成功:", data);
        }
      } catch (apiError) {
        console.error("API接続エラー:", apiError);
        // 開発中のため、接続エラーはサイレント処理
      }
    } catch (error) {
      console.error("処理エラー:", error);
      // 開発中の機能であることをユーザーに通知
      toast.info(
        "タスクのサーバー保存機能は開発中です。現在はローカルに保存されています。",
      );
    }
  };

  // 画像アップロード処理
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック (500KB以下)
    if (file.size > 500 * 1024) {
      toast.error("ファイルサイズは500KB以下にしてください");
      return;
    }

    // 画像形式チェック
    if (!file.type.match("image.*")) {
      toast.error("画像ファイルを選択してください");
      return;
    }

    setIsUploading(true);

    try {
      // Base64エンコードしたデータURLを生成
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          // 結果のサイズを確認（Base64エンコードされたデータは元のサイズより約33%大きくなる）
          if (reader.result.length > 700000) {
            // 約700KB
            toast.error(
              "画像サイズが大きすぎます。より小さい画像を選択してください",
            );
            setIsUploading(false);
            return;
          }

          setIconImageURL(reader.result);
          setIsUploading(false);
          toast.success("アイコンをアップロードしました");
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("アップロードエラー:", error);
      toast.error("アイコンのアップロードに失敗しました");
      setIsUploading(false);
    }
  };

  // タスクの完了状態を切り替え
  const toggleTaskComplete = (taskId: number) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          // タスクが完了状態になる場合は現在の日時を記録
          const completedDate = !task.completed ? new Date() : undefined;

          return {
            ...task,
            completed: !task.completed,
            completedDate,
            // タイマーが実行中だった場合は停止して時間を記録
            timerRunning: false,
            timeSpent: task.timerRunning
              ? task.timeSpent + (task.currentTimerValue || 0)
              : task.timeSpent,
            currentTimerValue: undefined,
            pausedTimerValue: undefined,
          };
        }
        return task;
      }),
    );

    // 親コンポーネントに通知
    onTaskComplete(taskId);
  };

  // タスクのタイマーをスタート（プリセット時間）
  const startTaskTimer = (task: Task, minutes: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        // 他のタスクのタイマーが実行中の場合は停止
        if (t.id !== task.id && t.timerRunning) {
          return {
            ...t,
            timerRunning: false,
            timeSpent:
              t.timeSpent + (t.pausedTimerValue || t.currentTimerValue || 0),
            pausedTimerValue: undefined,
            currentTimerValue: undefined,
          };
        }

        // 対象のタスクのタイマーを開始
        if (t.id === task.id) {
          return {
            ...t,
            timerRunning: true,
            currentTimerValue: minutes * 60,
            pausedTimerValue: undefined,
          };
        }

        return t;
      }),
    );

    toast.info(`${task.title}のタイマーを${minutes}分でスタートしました`);
  };

  // カスタムタイマーをスタート
  const startCustomTimer = (task: Task) => {
    const hours = parseInt(customTimerHours);
    const minutes = parseInt(customTimerMinutes);

    if (isNaN(hours) || hours < 0 || isNaN(minutes) || minutes < 0) {
      toast.error("有効な時間を入力してください");
      return;
    }

    if (hours === 0 && minutes === 0) {
      toast.error("少なくとも1分以上の時間を設定してください");
      return;
    }

    const totalMinutes = hours * 60 + minutes;
    startTaskTimer(task, totalMinutes);
    setCustomTimerOpen(false);
  };

  // タスクのタイマーを停止
  const stopTimer = (taskId: number) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId && task.timerRunning) {
          return {
            ...task,
            timerRunning: false,
            pausedTimerValue: task.currentTimerValue,
          };
        }
        return task;
      }),
    );

    const taskTitle = tasks.find((t) => t.id === taskId)?.title || "タスク";
    toast.info(`${taskTitle}のタイマーを一時停止しました`);
  };

  // タスクのタイマーを再開
  const resumeTimer = (taskId: number) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId && !task.timerRunning && task.pausedTimerValue) {
          return {
            ...task,
            timerRunning: true,
            currentTimerValue: task.pausedTimerValue,
            pausedTimerValue: undefined,
          };
        }
        return task;
      }),
    );

    const taskTitle = tasks.find((t) => t.id === taskId)?.title || "タスク";
    toast.info(`${taskTitle}のタイマーを再開しました`);
  };

  // タスクのタイマーを終了（完全に停止）
  const endTimer = (taskId: number) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            timerRunning: false,
            timeSpent:
              task.timeSpent +
              (task.pausedTimerValue || task.currentTimerValue || 0),
            pausedTimerValue: undefined,
            currentTimerValue: undefined,
          };
        }
        return task;
      }),
    );

    const taskTitle = tasks.find((t) => t.id === taskId)?.title || "タスク";
    toast.info(`${taskTitle}のタイマーを終了しました`);
  };

  // タイマーを延長
  const extendTimer = (taskId: number) => {
    const hours = parseInt(extendTimerHours);
    const minutes = parseInt(extendTimerMinutes);

    if (isNaN(hours) || hours < 0 || isNaN(minutes) || minutes < 0) {
      toast.error("有効な時間を入力してください");
      return;
    }

    if (hours === 0 && minutes === 0) {
      toast.error("少なくとも1分以上の時間を設定してください");
      return;
    }

    const totalSeconds = (hours * 60 + minutes) * 60;

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          if (task.timerRunning && task.currentTimerValue !== undefined) {
            return {
              ...task,
              currentTimerValue: task.currentTimerValue + totalSeconds,
            };
          } else if (task.pausedTimerValue !== undefined) {
            return {
              ...task,
              pausedTimerValue: task.pausedTimerValue + totalSeconds,
            };
          }
        }
        return task;
      }),
    );

    const timeDisplay =
      hours > 0
        ? `${hours}時間${minutes > 0 ? `${minutes}分` : ""}`
        : `${minutes}分`;

    const taskTitle = tasks.find((t) => t.id === taskId)?.title || "タスク";
    toast.info(`${taskTitle}のタイマーを${timeDisplay}延長しました`);
  };

  // Format time (HH:MM:SS)
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col">
      {/* メインコンテンツ (タスク追加・管理) */}
      <div className="flex-1 space-y-6">
        {/* 新しいタスク追加ボタン */}
        {!isAddingTask && (
          <button
            onClick={() => setIsAddingTask(true)}
            className={cn(
              "w-full p-4 rounded-xl border-2 shadow-md flex items-center justify-center gap-2 transition-all transform hover:scale-105",
              isDarkMode
                ? "bg-amber-600 hover:bg-amber-500 text-white border-amber-500"
                : "bg-amber-500 hover:bg-amber-400 text-white border-amber-400",
            )}
          >
            <Plus className="h-6 w-6" />
            <span className="font-bold text-lg">新しいタスクを追加</span>
          </button>
        )}

        {/* タスク追加フォーム */}
        {isAddingTask ? (
          <div className="space-y-6 p-6 border-2 border-amber-200 dark:border-amber-700 rounded-xl bg-amber-50/50 dark:bg-amber-900/30 shadow-md">
            <div className="flex flex-col space-y-2">
              <label className="text-lg font-medium">タスク名</label>
              <Input
                placeholder="タスクを入力してください"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className={cn(
                  "text-xl p-6",
                  isDarkMode
                    ? "bg-amber-800/70 border-amber-700 text-amber-50 placeholder-amber-400"
                    : "bg-white border-amber-200 text-amber-950 placeholder-amber-300",
                )}
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-lg font-medium">締切日</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal p-6 text-xl",
                      !selectedDate && "text-muted-foreground",
                      isDarkMode
                        ? "bg-amber-800/70 border-amber-700 text-amber-50 hover:bg-amber-700 hover:text-amber-50"
                        : "bg-white border-amber-200 text-amber-950 hover:bg-amber-100",
                    )}
                  >
                    <CalendarIcon className="mr-4 h-6 w-6" />
                    {selectedDate ? (
                      format(selectedDate, "yyyy年MM月dd日")
                    ) : (
                      <span>締切日を選択</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className={cn(
                    "w-auto p-0",
                    isDarkMode
                      ? "bg-amber-800 border-amber-700"
                      : "bg-white border-amber-200",
                  )}
                >
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    className="p-4"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-lg font-medium">アイコン画像</label>
              <div className="flex items-center space-x-3">
                {iconImageURL ? (
                  <div className="relative group">
                    <img
                      src={iconImageURL}
                      alt="タスクアイコン"
                      className="w-24 h-24 rounded-md object-cover border-2 border-amber-200 dark:border-amber-700"
                    />
                    <button
                      onClick={() => setIconImageURL("")}
                      className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      id="icon-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="icon-upload"
                      className={cn(
                        "cursor-pointer px-5 py-4 rounded-md border-2 flex items-center space-x-2 text-lg",
                        isDarkMode
                          ? "bg-amber-800 border-amber-700 text-amber-50 hover:bg-amber-700"
                          : "bg-white border-amber-200 text-amber-950 hover:bg-amber-100",
                      )}
                    >
                      {isUploading ? (
                        <span>アップロード中...</span>
                      ) : (
                        <>
                          <Plus className="h-5 w-5" />
                          <span>アイコンを追加</span>
                        </>
                      )}
                    </label>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  500KB以下の小さい画像ファイル（PNG、JPG）を使用してください
                </p>
                <div
                  className={cn(
                    "p-3 text-sm rounded-md",
                    isDarkMode
                      ? "bg-amber-700/50 text-amber-200"
                      : "bg-amber-100 text-amber-700",
                  )}
                >
                  <strong>※ 開発中の機能:</strong> アイコン画像は現在開発中です
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingTask(false);
                  setIconImageURL("");
                }}
                className={cn(
                  "text-lg py-6 px-8",
                  isDarkMode
                    ? "bg-amber-800 border-amber-700 text-amber-50 hover:bg-amber-700"
                    : "bg-white border-amber-200 text-amber-950 hover:bg-amber-100",
                )}
              >
                <X className="h-5 w-5 mr-2" />
                キャンセル
              </Button>
              <Button
                onClick={addTask}
                disabled={isUploading}
                className={cn(
                  "flex items-center text-lg py-6 px-8",
                  isDarkMode
                    ? "bg-amber-600 hover:bg-amber-500 text-white"
                    : "bg-amber-500 hover:bg-amber-400 text-white",
                )}
              >
                <Plus className="h-5 w-5 mr-2" />
                追加
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setIsAddingTask(true)}
            className={cn(
              "w-full py-3 text-base flex items-center justify-center",
              isDarkMode
                ? "bg-amber-700 hover:bg-amber-600 dark:text-amber-50"
                : "bg-amber-500 hover:bg-amber-400 text-white",
            )}
          >
            <Plus className="h-5 w-5 mr-2" />
            新しいタスクを追加
          </Button>
        )}

        {/* タスク統計パネル */}
        <div
          className={cn(
            "grid grid-cols-2 sm:grid-cols-4 gap-4",
            isDarkMode ? "text-amber-100" : "text-amber-800",
          )}
        >
          <div
            className={cn(
              "bg-white rounded-xl p-4 shadow border-2 flex flex-col items-center",
              isDarkMode
                ? "bg-amber-800/40 border-amber-700"
                : "border-amber-200",
            )}
          >
            <span className="text-xl font-bold">{tasks.length}</span>
            <span className="text-xl mt-1">総タスク数</span>
          </div>
          <div
            className={cn(
              "bg-white rounded-xl p-4 shadow border-2 flex flex-col items-center",
              isDarkMode
                ? "bg-amber-800/40 border-amber-700"
                : "border-amber-200",
            )}
          >
            <span className="text-xl font-bold">
              {tasks.filter((t) => t.completed).length}
            </span>
            <span className="text-xl mt-1">完了タスク</span>
          </div>
          <div
            className={cn(
              "bg-white rounded-xl p-4 shadow border-2 flex flex-col items-center",
              isDarkMode
                ? "bg-amber-800/40 border-amber-700"
                : "border-amber-200",
            )}
          >
            <span className="text-xl font-bold">
              {tasks.filter((t) => t.timerRunning).length}
            </span>
            <span className="text-xl mt-1">実行中</span>
          </div>
          <div
            className={cn(
              "bg-white rounded-xl p-4 shadow border-2 flex flex-col items-center",
              isDarkMode
                ? "bg-amber-800/40 border-amber-700"
                : "border-amber-200",
            )}
          >
            <span className="text-xl font-bold">
              {Math.floor(tasks.reduce((sum, t) => sum + t.timeSpent, 0) / 60)}
            </span>
            <span className="text-xl mt-1">合計時間（分）</span>
          </div>
        </div>

        {/* アクティブなタスクリスト */}
        <div className="space-y-4">
          {tasks.filter((task) => !task.completed).length === 0 ? (
            <div
              className={cn(
                "text-center py-12 rounded-lg border-2",
                isDarkMode
                  ? "bg-amber-800/30 border-amber-700 text-amber-200"
                  : "bg-amber-50/80 border-amber-200 text-amber-700",
              )}
            >
              <div className="mb-3">
                <Plus
                  className={cn(
                    "h-10 w-10 mx-auto",
                    isDarkMode ? "text-amber-400" : "text-amber-500",
                  )}
                />
              </div>
              <p className="text-lg font-medium mb-2">タスクがまだありません</p>
              <p className="text-sm">
                「新しいタスクを追加」ボタンをクリックして、最初のタスクを作成しましょう
              </p>
            </div>
          ) : (
            tasks
              .filter((task) => !task.completed)
              .sort((a, b) => {
                // 期限がある場合は期限が近い順に、なければタイマー実行中→IDで降順
                if (a.deadline && b.deadline) {
                  return (
                    new Date(a.deadline).getTime() -
                    new Date(b.deadline).getTime()
                  );
                } else if (a.deadline) {
                  return -1;
                } else if (b.deadline) {
                  return 1;
                } else if (a.timerRunning && !b.timerRunning) {
                  return -1;
                } else if (!a.timerRunning && b.timerRunning) {
                  return 1;
                }
                return b.id - a.id;
              })
              .map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "p-5 rounded-xl border-2 shadow-md",
                    isDarkMode
                      ? "bg-amber-800/30 border-amber-700"
                      : "bg-amber-50/80 border-amber-200",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className={cn(
                          "w-8 h-8 rounded-full mr-4 flex items-center justify-center transition-all transform hover:scale-110",
                          task.completed
                            ? isDarkMode
                              ? "bg-green-700 text-green-100 shadow-md border-2 border-green-600"
                              : "bg-green-500 text-white shadow-md border-2 border-green-400"
                            : isDarkMode
                              ? "border-2 border-amber-600 bg-amber-800/50"
                              : "border-2 border-amber-300 bg-amber-50",
                        )}
                      >
                        {task.completed ? (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="text-white"
                          >
                            <path
                              d="M12 2C13 2 14 2.2 14.5 2.5C15 2.8 15 3 15 3.5C15 4 15 4.2 14.5 4.5C14 4.8 13.5 5 12 5C10.5 5 10 4.8 9.5 4.5C9 4.2 9 4 9 3.5C9 3 9 2.8 9.5 2.5C10 2.2 11 2 12 2Z"
                              fill="currentColor"
                            />
                            <path
                              d="M14.3 5C17 6 19.7 9 20.5 12.5C21.3 16 20.5 20 17.2 21.8C13.8 23.6 9.7 23 6.8 21C4 19 2 15.7 2.3 12.7C2.6 9.7 4.3 7.3 6.7 5.8"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        ) : (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className={
                              isDarkMode ? "text-amber-500" : "text-amber-600"
                            }
                          >
                            <path
                              d="M12 2C13 2 14 2.2 14.5 2.5C15 2.8 15 3 15 3.5C15 4 15 4.2 14.5 4.5C14 4.8 13.5 5 12 5C10.5 5 10 4.8 9.5 4.5C9 4.2 9 4 9 3.5C9 3 9 2.8 9.5 2.5C10 2.2 11 2 12 2Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M14.3 5C17 6 19.7 9 20.5 12.5C21.3 16 20.5 20 17.2 21.8C13.8 23.6 9.7 23 6.8 21C4 19 2 15.7 2.3 12.7C2.6 9.7 4.3 7.3 6.7 5.8"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1">
                        <div
                          className={cn(
                            "font-bold flex items-center text-xl",
                            task.completed && "line-through opacity-70",
                          )}
                        >
                          {task.iconImageURL && (
                            <img
                              src={task.iconImageURL}
                              alt=""
                              className="w-10 h-10 mr-3 rounded-full object-cover border-2 border-amber-200 dark:border-amber-700 flex-shrink-0"
                            />
                          )}
                          <span>{task.title}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* アクション行（タイマー設定と完了ボタン） */}
                  <div className="flex justify-end mt-3 items-center">
                    <div className="flex gap-3">
                      {/* 完了ボタン */}
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className={cn(
                          "px-5 py-2.5 rounded-3xl transition-all transform hover:scale-110 text-sm border-4 shadow-lg flex items-center relative overflow-hidden group",
                          task.completed
                            ? "opacity-50 cursor-not-allowed bg-gray-200 border-gray-300 text-gray-500"
                            : isDarkMode
                              ? "bg-gradient-to-br from-green-300 via-green-400 to-green-500 text-white border-green-600 hover:border-green-500"
                              : "bg-gradient-to-br from-green-200 via-green-300 to-green-400 text-white border-green-500 hover:border-green-400",
                        )}
                        disabled={task.completed}
                      >
                        {/* キラキラエフェクト */}
                        <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
                        <span className="absolute -top-10 -left-10 w-20 h-20 bg-white/40 rotate-45 transform translate-x-12 -translate-y-2 group-hover:translate-x-40 transition-all duration-700"></span>

                        {/* 星の装飾 */}
                        <span className="absolute top-1 left-1 w-2 h-2 bg-yellow-200 rounded-full opacity-90"></span>
                        <span className="absolute top-2 left-12 w-1.5 h-1.5 bg-yellow-200 rounded-full opacity-80"></span>
                        <span className="absolute bottom-2 right-4 w-1 h-1 bg-yellow-200 rounded-full opacity-70"></span>

                        <span className="relative z-10 flex items-center justify-center w-full">
                          {/* 葉っぱのアイコン */}
                          <span className="flex items-center justify-center bg-white rounded-full w-7 h-7 mr-2 shadow-inner border-2 border-green-300 group-hover:scale-110 transition-transform">
                            {task.completed ? (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M20 6L9 17L4 12"
                                  stroke="#10b981"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            ) : (
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M12 6.25C13.5 6.25 14.25 7 14.7 8C15.15 9 15.5 10 15.5 12C15.5 16 13.5 17.25 12 17.75"
                                  stroke="#10b981"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M8.5 14C9 15.5 10.5 17 12 17.75"
                                  stroke="#10b981"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M12 6.25C9 6.25 7 9 7 12C7 13 7 14 8.5 14"
                                  stroke="#10b981"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                />
                              </svg>
                            )}
                          </span>

                          <span className="font-bold tracking-wide">
                            {task.completed ? "完了済み" : "完了にする♪"}
                          </span>

                          {/* 指さしアイコン(完了していない場合のみ) */}
                          {!task.completed && (
                            <span className="absolute -right-1 -top-2 transform rotate-45 animate-bounce-slow">
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M12 3L14 9L21 12L14 15L12 21L10 15L3 12L10 9L12 3Z"
                                  fill="#FFDE34"
                                  stroke="#FFA723"
                                  strokeWidth="1.5"
                                />
                              </svg>
                            </span>
                          )}
                        </span>
                      </button>

                      {/* タイマー設定 */}
                      {!task.completed &&
                        !task.timerRunning &&
                        !task.currentTimerValue &&
                        !task.pausedTimerValue && (
                          <Popover
                            open={
                              customTimerOpen &&
                              taskToStartTimer?.id === task.id
                            }
                            onOpenChange={(open) => {
                              setCustomTimerOpen(open);
                              if (open) {
                                setTaskToStartTimer(task);
                              } else {
                                setTaskToStartTimer(null);
                              }
                            }}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                className={cn(
                                  "px-5 py-2.5 rounded-xl border-b-3 shadow-md transition-all transform hover:scale-105 text-sm font-medium flex items-center",
                                  isDarkMode
                                    ? "bg-blue-400 hover:bg-blue-300 text-white border-blue-600 hover:border-blue-500"
                                    : "bg-sky-400 hover:bg-sky-300 text-white border-sky-600 hover:border-sky-500",
                                )}
                              >
                                <Timer className="h-4 w-4 mr-1.5" />
                                タイマーを設定
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className={cn(
                                "w-80 p-6 rounded-3xl border-4 shadow-lg",
                                isDarkMode
                                  ? "bg-amber-700 border-amber-900 text-amber-50"
                                  : "bg-amber-100 border-amber-300 text-amber-900",
                              )}
                            >
                              <div className="space-y-4">
                                <h4 className="text-lg font-bold text-center">
                                  タイマー設定
                                </h4>
                                <div className="flex items-center justify-center gap-4">
                                  <div className="flex items-center">
                                    <Input
                                      type="number"
                                      min="0"
                                      value={customTimerHours}
                                      onChange={(e) =>
                                        setCustomTimerHours(e.target.value)
                                      }
                                      className={cn(
                                        "w-20 text-center text-lg p-6 rounded-full border-2",
                                        isDarkMode
                                          ? "bg-amber-600 border-amber-900 text-amber-50"
                                          : "bg-white border-amber-400 text-amber-900",
                                      )}
                                    />
                                    <span className="mx-2 text-lg font-medium">
                                      時間
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <Input
                                      type="number"
                                      min="0"
                                      max="59"
                                      value={customTimerMinutes}
                                      onChange={(e) =>
                                        setCustomTimerMinutes(e.target.value)
                                      }
                                      className={cn(
                                        "w-20 text-center text-lg p-6 rounded-full border-2",
                                        isDarkMode
                                          ? "bg-amber-600 border-amber-900 text-amber-50"
                                          : "bg-white border-amber-400 text-amber-900",
                                      )}
                                    />
                                    <span className="mx-2 text-lg font-medium">
                                      分
                                    </span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3 mt-4">
                                  <Button
                                    size="lg"
                                    onClick={() => startTaskTimer(task, 25)}
                                    className={cn(
                                      "text-base rounded-full border-b-3 shadow-md hover:scale-105 transition-transform",
                                      isDarkMode
                                        ? "bg-yellow-500 hover:bg-yellow-400 text-white border-yellow-700"
                                        : "bg-yellow-300 hover:bg-yellow-200 text-amber-900 border-yellow-500",
                                    )}
                                  >
                                    25分
                                  </Button>
                                  <Button
                                    size="lg"
                                    onClick={() => startTaskTimer(task, 45)}
                                    className={cn(
                                      "text-base rounded-full border-b-3 shadow-md hover:scale-105 transition-transform",
                                      isDarkMode
                                        ? "bg-green-500 hover:bg-green-400 text-white border-green-700"
                                        : "bg-green-300 hover:bg-green-200 text-green-900 border-green-500",
                                    )}
                                  >
                                    45分
                                  </Button>
                                  <Button
                                    size="lg"
                                    onClick={() => startTaskTimer(task, 60)}
                                    className={cn(
                                      "text-base rounded-full border-b-3 shadow-md hover:scale-105 transition-transform",
                                      isDarkMode
                                        ? "bg-blue-500 hover:bg-blue-400 text-white border-blue-700"
                                        : "bg-blue-300 hover:bg-blue-200 text-blue-900 border-blue-500",
                                    )}
                                  >
                                    1時間
                                  </Button>
                                </div>
                                <div className="flex justify-between gap-3 mt-4">
                                  <Button
                                    size="lg"
                                    onClick={() => startCustomTimer(task)}
                                    className={cn(
                                      "text-base rounded-full border-b-3 shadow-md font-bold flex-1 hover:scale-105 transition-transform",
                                      isDarkMode
                                        ? "bg-pink-500 hover:bg-pink-400 text-white border-pink-700"
                                        : "bg-pink-300 hover:bg-pink-200 text-pink-900 border-pink-500",
                                    )}
                                  >
                                    設定開始
                                  </Button>
                                  <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => setCustomTimerOpen(false)}
                                    className={cn(
                                      "text-base rounded-full border-2 shadow-md hover:scale-105 transition-transform",
                                      isDarkMode
                                        ? "border-amber-600 hover:bg-amber-800 text-amber-200"
                                        : "border-amber-400 hover:bg-amber-200 text-amber-800",
                                    )}
                                  >
                                    キャンセル
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                    </div>
                  </div>

                  <div className="text-base mt-2 flex flex-wrap gap-3">
                    {task.deadline &&
                      (() => {
                        const deadlineStatus = getDeadlineStatus(task.deadline);
                        const colorClasses = {
                          red: isDarkMode
                            ? "bg-red-700 text-red-50 border-red-600"
                            : "bg-red-50 text-red-800 border-red-200",
                          orange: isDarkMode
                            ? "bg-orange-700 text-orange-50 border-orange-600"
                            : "bg-orange-50 text-orange-800 border-orange-200",
                          yellow: isDarkMode
                            ? "bg-amber-700 text-amber-50 border-amber-600"
                            : "bg-amber-50 text-amber-800 border-amber-200",
                          green: isDarkMode
                            ? "bg-green-700 text-green-50 border-green-600"
                            : "bg-green-50 text-green-800 border-green-200",
                        };

                        return (
                          <div className="flex flex-col space-y-2 w-full">
                            <span
                              className={cn(
                                "px-4 py-2 rounded-md flex items-center border-2 shadow-sm text-base",
                                deadlineStatus &&
                                  colorClasses[
                                    deadlineStatus.color as keyof typeof colorClasses
                                  ],
                              )}
                            >
                              <CalendarIcon className="h-5 w-5 mr-2 text-amber-500" />
                              <span className="font-medium mr-2">締切:</span>
                              {format(task.deadline, "yyyy/MM/dd")}
                            </span>

                            {deadlineStatus &&
                              ["expired", "today", "tomorrow", "soon"].includes(
                                deadlineStatus.status,
                              ) && (
                                <span
                                  className={cn(
                                    "px-4 py-2 rounded-md flex items-center border-2 shadow-sm text-center justify-center text-base font-bold",
                                    deadlineStatus.status === "expired"
                                      ? isDarkMode
                                        ? "bg-red-700/80 text-red-50 border-red-600"
                                        : "bg-red-100 text-red-800 border-red-200"
                                      : isDarkMode
                                        ? "bg-orange-700/80 text-orange-50 border-orange-600"
                                        : "bg-orange-100 text-orange-800 border-orange-200",
                                  )}
                                >
                                  {deadlineStatus.status === "expired" ? (
                                    <AlertTriangle className="h-5 w-5 mr-2 text-red-400" />
                                  ) : (
                                    <Clock3 className="h-5 w-5 mr-2 text-orange-400" />
                                  )}
                                  <span className="font-bold">
                                    {deadlineStatus.message}
                                  </span>
                                </span>
                              )}
                          </div>
                        );
                      })()}
                    {task.timeSpent > 0 && (
                      <span
                        className={cn(
                          "px-4 py-2 rounded-full flex items-center text-base font-medium border",
                          isDarkMode
                            ? "bg-amber-700/70 text-amber-100 border-amber-600"
                            : "bg-amber-100 text-amber-800 border-amber-200",
                        )}
                      >
                        <Clock className="h-5 w-5 mr-2" />
                        {Math.floor(task.timeSpent / 60)}分
                      </span>
                    )}
                  </div>

                  {/* タスク個別のタイマー表示 */}
                  {(task.timerRunning || task.pausedTimerValue) &&
                    !task.completed && (
                      <div
                        className={cn(
                          "mt-4 p-6 rounded-xl border-4 shadow-lg relative overflow-hidden",
                          isDarkMode
                            ? "bg-gradient-to-br from-amber-700/90 to-amber-800/90 border-amber-600"
                            : "bg-gradient-to-br from-amber-100/90 to-amber-200/90 border-amber-300",
                        )}
                      >
                        {/* 装飾的な要素 */}
                        <div className="absolute -right-4 -top-4 w-12 h-12 bg-yellow-300/30 rounded-full blur-md"></div>
                        <div className="absolute right-20 top-10 w-4 h-4 bg-pink-300/40 rounded-full blur-sm animate-pulse"></div>
                        <div className="absolute left-8 bottom-6 w-6 h-6 bg-green-300/30 rounded-full blur-sm animate-pulse delay-300"></div>

                        <div className="text-center relative z-10">
                          <div className="relative mb-6">
                            <div
                              className={cn(
                                "w-40 h-40 rounded-full mx-auto border-8 flex items-center justify-center transform transition-all duration-300 relative",
                                isDarkMode
                                  ? "border-amber-500 bg-amber-800/90 shadow-inner"
                                  : "border-amber-400 bg-amber-50 shadow-inner",
                                task.timerRunning
                                  ? "animate-pulse-slow scale-105"
                                  : "",
                              )}
                            >
                              {/* 内側の照明効果 */}
                              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>

                              <div className="text-center relative z-10">
                                <div
                                  className={cn(
                                    "text-4xl font-mono font-bold transition-all duration-500",
                                    isDarkMode
                                      ? "text-amber-100"
                                      : "text-amber-800",
                                  )}
                                >
                                  {formatTime(
                                    task.timerRunning
                                      ? task.currentTimerValue || 0
                                      : task.pausedTimerValue || 0,
                                  )}
                                </div>
                                <div
                                  className={cn(
                                    "text-base mt-2 font-medium bg-opacity-70 rounded-full px-3 py-1 border-2 transition-all duration-300",
                                    isDarkMode
                                      ? "text-amber-200 bg-amber-900/40 border-amber-700"
                                      : "text-amber-700 bg-amber-100/90 border-amber-300",
                                    task.timerRunning
                                      ? "animate-bounce-slow"
                                      : "",
                                  )}
                                >
                                  {task.timerRunning ? "実行中" : "一時停止"}
                                </div>
                              </div>
                            </div>

                            {/* 円形の装飾 */}
                            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-yellow-300 border-2 border-yellow-400 flex items-center justify-center shadow-md">
                              <Clock className="h-4 w-4 text-yellow-800" />
                            </div>
                          </div>

                          {/* タイマーコントロールボタン */}
                          <div className="flex justify-center gap-4 mt-2">
                            {task.timerRunning ? (
                              <button
                                onClick={() => stopTimer(task.id)}
                                className={cn(
                                  "px-4 py-2 rounded-full font-medium text-sm border-b-3 shadow-md flex items-center transition-all hover:scale-105",
                                  isDarkMode
                                    ? "bg-orange-500 hover:bg-orange-400 text-white border-orange-700"
                                    : "bg-orange-400 hover:bg-orange-300 text-white border-orange-600",
                                )}
                              >
                                <span className="flex items-center">
                                  <span className="w-3 h-3 rounded bg-white mr-2"></span>
                                  一時停止
                                </span>
                              </button>
                            ) : (
                              <button
                                onClick={() => resumeTimer(task.id)}
                                className={cn(
                                  "px-4 py-2 rounded-full font-medium text-sm border-b-3 shadow-md flex items-center transition-all hover:scale-105",
                                  isDarkMode
                                    ? "bg-green-500 hover:bg-green-400 text-white border-green-700"
                                    : "bg-green-400 hover:bg-green-300 text-white border-green-600",
                                )}
                              >
                                <span className="flex items-center">
                                  <span className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-white mr-2"></span>
                                  再開する
                                </span>
                              </button>
                            )}

                            <button
                              onClick={() => endTimer(task.id)}
                              className={cn(
                                "px-4 py-2 rounded-full font-medium text-sm border-b-3 shadow-md flex items-center transition-all hover:scale-105",
                                isDarkMode
                                  ? "bg-red-500 hover:bg-red-400 text-white border-red-700"
                                  : "bg-red-400 hover:bg-red-300 text-white border-red-600",
                              )}
                            >
                              <span className="flex items-center">
                                <X className="h-3 w-3 mr-2" />
                                終了
                              </span>
                            </button>

                            {/* タイマー延長ボタン */}
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  className={cn(
                                    "px-4 py-2 rounded-full font-medium text-sm border-b-3 shadow-md flex items-center transition-all hover:scale-105",
                                    isDarkMode
                                      ? "bg-blue-500 hover:bg-blue-400 text-white border-blue-700"
                                      : "bg-blue-400 hover:bg-blue-300 text-white border-blue-600",
                                  )}
                                  onClick={() => {
                                    setExtendTimerHours("0");
                                    setExtendTimerMinutes("5");
                                  }}
                                >
                                  <span className="flex items-center">
                                    <Plus className="h-3 w-3 mr-2" />
                                    延長
                                  </span>
                                </button>
                              </PopoverTrigger>
                              <PopoverContent
                                className={cn(
                                  "w-64 p-4 rounded-xl border-4 shadow-lg",
                                  isDarkMode
                                    ? "bg-amber-700 border-amber-900 text-amber-50"
                                    : "bg-amber-100 border-amber-300 text-amber-900",
                                )}
                              >
                                <div className="space-y-3">
                                  <h4 className="text-base font-bold text-center">
                                    タイマー延長
                                  </h4>
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="flex items-center">
                                      <Input
                                        type="number"
                                        min="0"
                                        value={extendTimerHours}
                                        onChange={(e) =>
                                          setExtendTimerHours(e.target.value)
                                        }
                                        className={cn(
                                          "w-14 text-center p-2 rounded-lg border-2 text-sm",
                                          isDarkMode
                                            ? "bg-amber-600 border-amber-900 text-amber-50"
                                            : "bg-white border-amber-400 text-amber-900",
                                        )}
                                      />
                                      <span className="mx-1 text-sm">時間</span>
                                    </div>
                                    <div className="flex items-center">
                                      <Input
                                        type="number"
                                        min="0"
                                        max="59"
                                        value={extendTimerMinutes}
                                        onChange={(e) =>
                                          setExtendTimerMinutes(e.target.value)
                                        }
                                        className={cn(
                                          "w-14 text-center p-2 rounded-lg border-2 text-sm",
                                          isDarkMode
                                            ? "bg-amber-600 border-amber-900 text-amber-50"
                                            : "bg-white border-amber-400 text-amber-900",
                                        )}
                                      />
                                      <span className="mx-1 text-sm">分</span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => {
                                      extendTimer(task.id);
                                    }}
                                    className={cn(
                                      "w-full px-4 py-2 rounded-lg font-medium text-sm border-b-3 shadow-md flex items-center justify-center transition-all hover:scale-105 mt-2",
                                      isDarkMode
                                        ? "bg-green-500 hover:bg-green-400 text-white border-green-700"
                                        : "bg-green-400 hover:bg-green-300 text-white border-green-600",
                                    )}
                                  >
                                    <span className="flex items-center">
                                      <Plus className="h-3 w-3 mr-2" />
                                      延長する
                                    </span>
                                  </button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
