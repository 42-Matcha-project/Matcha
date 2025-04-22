"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  X,
  Check,
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
import { Textarea } from "@/components/ui/textarea";

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
          // タスク完了時、タイマーが実行中の場合は停止
          if (!task.completed && task.timerRunning) {
            return {
              ...task,
              completed: !task.completed,
              timerRunning: false,
              timeSpent:
                task.timeSpent +
                (task.pausedTimerValue || task.currentTimerValue || 0),
            };
          }
          return { ...task, completed: !task.completed };
        }
        return task;
      }),
    );
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
    <div
      className={cn(
        "rounded-2xl p-6 mb-8 shadow-md",
        isDarkMode
          ? "bg-amber-800/90 border border-amber-700 text-amber-50"
          : "bg-white border border-amber-200 text-amber-900",
      )}
    >
      <div className="flex justify-between items-center mb-4 border-b pb-2 border-amber-200">
        <h3 className="text-xl font-bold">タスク管理</h3>
      </div>

      {/* タスク追加フォーム */}
      {isAddingTask ? (
        <div className="space-y-4 mb-6 p-4 bg-amber-100/50 rounded-lg">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">タスク名</label>
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="タスクを入力..."
              className={cn(
                "px-3 py-2 rounded-md border",
                isDarkMode
                  ? "bg-amber-800 border-amber-700 text-amber-50"
                  : "bg-white border-amber-200 text-amber-950",
              )}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">締切日</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground",
                    isDarkMode
                      ? "bg-amber-800 border-amber-700 text-amber-50 hover:bg-amber-700"
                      : "bg-white border-amber-200 text-amber-950 hover:bg-amber-100",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "yyyy年MM月dd日")
                  ) : (
                    <span>日付を選択...</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">アイコン画像</label>
            <div className="flex items-center space-x-3">
              {iconImageURL ? (
                <div className="relative group">
                  <img
                    src={iconImageURL}
                    alt="タスクアイコン"
                    className="w-16 h-16 rounded-md object-cover border border-amber-200 dark:border-amber-700"
                  />
                  <button
                    onClick={() => setIconImageURL("")}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
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
                      "cursor-pointer px-3 py-2 rounded-md border flex items-center space-x-2",
                      isDarkMode
                        ? "bg-amber-800 border-amber-700 text-amber-50 hover:bg-amber-700"
                        : "bg-white border-amber-200 text-amber-950 hover:bg-amber-100",
                    )}
                  >
                    {isUploading ? (
                      <span>アップロード中...</span>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>アイコンを追加</span>
                      </>
                    )}
                  </label>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                500KB以下の小さい画像ファイル（PNG、JPG）を使用してください
              </p>
              <div
                className={cn(
                  "p-2 text-xs rounded-md",
                  isDarkMode
                    ? "bg-amber-700/50 text-amber-200"
                    : "bg-amber-100 text-amber-700",
                )}
              >
                <strong>※ 開発中の機能:</strong> アイコン画像は現在開発中です
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddingTask(false);
                setIconImageURL("");
              }}
              className={cn(
                isDarkMode
                  ? "bg-amber-800 border-amber-700 text-amber-50 hover:bg-amber-700"
                  : "bg-white border-amber-200 text-amber-950 hover:bg-amber-100",
              )}
            >
              <X className="h-4 w-4 mr-2" />
              キャンセル
            </Button>
            <Button
              onClick={addTask}
              disabled={isUploading}
              className={cn(
                "flex items-center",
                isDarkMode
                  ? "bg-amber-600 hover:bg-amber-500 text-white"
                  : "bg-amber-500 hover:bg-amber-400 text-white",
              )}
            >
              <Plus className="h-4 w-4 mr-2" />
              追加
            </Button>
          </div>
        </div>
      ) : (
        <Button
          className={cn(
            "w-full mb-4",
            isDarkMode
              ? "bg-amber-700 hover:bg-amber-600 text-white"
              : "bg-amber-500 hover:bg-amber-600 text-white",
          )}
          onClick={() => setIsAddingTask(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> 新しいタスクを追加
        </Button>
      )}

      {/* タスクリスト */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p
            className={cn(
              "text-center py-4 italic",
              isDarkMode ? "text-amber-300" : "text-amber-600",
            )}
          >
            タスクがありません
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "p-3 rounded-lg",
                task.completed
                  ? isDarkMode
                    ? "bg-amber-800/40 border border-amber-700"
                    : "bg-amber-100/40 border border-amber-200"
                  : isDarkMode
                    ? "bg-amber-800/60 border border-amber-700"
                    : "bg-white border border-amber-200",
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className={cn(
                      "w-5 h-5 rounded-full mr-3 flex items-center justify-center",
                      task.completed
                        ? isDarkMode
                          ? "bg-green-700 text-green-100"
                          : "bg-green-500 text-white"
                        : isDarkMode
                          ? "border-2 border-amber-600"
                          : "border-2 border-amber-300",
                    )}
                  >
                    {task.completed && <Check className="h-3 w-3" />}
                  </button>
                  <div>
                    <div
                      className={cn(
                        "font-medium flex items-center",
                        task.completed && "line-through opacity-70",
                      )}
                    >
                      {task.iconImageURL && (
                        <img
                          src={task.iconImageURL}
                          alt=""
                          className="w-8 h-8 mr-2 rounded-md object-cover border border-amber-200 dark:border-amber-700 flex-shrink-0"
                        />
                      )}
                      <span>{task.title}</span>
                    </div>
                    <div className="text-xs mt-1 flex flex-wrap gap-2">
                      {task.deadline &&
                        (() => {
                          const deadlineStatus = getDeadlineStatus(
                            task.deadline,
                          );
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
                            <div className="flex flex-col space-y-1 w-full">
                              <span
                                className={cn(
                                  "px-2 py-1 rounded-md flex items-center border shadow-sm",
                                  deadlineStatus &&
                                    colorClasses[
                                      deadlineStatus.color as keyof typeof colorClasses
                                    ],
                                )}
                              >
                                <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                                <span className="font-medium mr-1">締切:</span>
                                {format(task.deadline, "yyyy/MM/dd")}
                              </span>

                              {deadlineStatus &&
                                [
                                  "expired",
                                  "today",
                                  "tomorrow",
                                  "soon",
                                ].includes(deadlineStatus.status) && (
                                  <span
                                    className={cn(
                                      "px-2 py-1 rounded-md flex items-center border shadow-sm text-center justify-center",
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
                                      <AlertTriangle className="h-3.5 w-3.5 mr-1.5 text-red-400" />
                                    ) : (
                                      <Clock3 className="h-3.5 w-3.5 mr-1.5 text-orange-400" />
                                    )}
                                    <span className="font-medium">
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
                            "px-2 py-0.5 rounded-full flex items-center",
                            isDarkMode
                              ? "bg-amber-700/70 text-amber-100"
                              : "bg-amber-100 text-amber-800",
                          )}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {Math.floor(task.timeSpent / 60)}分
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {!task.completed &&
                  !task.timerRunning &&
                  !task.currentTimerValue &&
                  !task.pausedTimerValue && (
                    <div className="flex flex-wrap items-center gap-1">
                      <Popover
                        open={
                          customTimerOpen && taskToStartTimer?.id === task.id
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
                            size="sm"
                            className={cn(
                              "text-xs",
                              isDarkMode
                                ? "bg-green-600 hover:bg-green-500 text-white"
                                : "bg-green-500 hover:bg-green-400 text-white",
                            )}
                          >
                            <Timer className="h-3 w-3 mr-1" />
                            タイマー設定
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className={cn(
                            "w-60 p-3",
                            isDarkMode
                              ? "bg-amber-800 border-amber-700 text-amber-50"
                              : "bg-white border-amber-200",
                          )}
                        >
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">
                              タイマー設定
                            </h4>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                <Input
                                  type="number"
                                  min="0"
                                  value={customTimerHours}
                                  onChange={(e) =>
                                    setCustomTimerHours(e.target.value)
                                  }
                                  className={cn(
                                    "w-16 text-center",
                                    isDarkMode
                                      ? "bg-amber-700 border-amber-600 text-amber-50"
                                      : "bg-white border-amber-200",
                                  )}
                                />
                                <span className="mx-1">時間</span>
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
                                    "w-16 text-center",
                                    isDarkMode
                                      ? "bg-amber-700 border-amber-600 text-amber-50"
                                      : "bg-white border-amber-200",
                                  )}
                                />
                                <span className="mx-1">分</span>
                              </div>
                            </div>
                            <div className="flex justify-between gap-2 mt-2">
                              <Button
                                size="sm"
                                onClick={() => startTaskTimer(task, 25)}
                                className={cn(
                                  isDarkMode
                                    ? "bg-amber-600 hover:bg-amber-500"
                                    : "bg-amber-400 hover:bg-amber-300",
                                )}
                              >
                                25分
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => startTaskTimer(task, 15)}
                                className={cn(
                                  isDarkMode
                                    ? "bg-amber-600 hover:bg-amber-500"
                                    : "bg-amber-400 hover:bg-amber-300",
                                )}
                              >
                                15分
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => startTaskTimer(task, 5)}
                                className={cn(
                                  isDarkMode
                                    ? "bg-amber-600 hover:bg-amber-500"
                                    : "bg-amber-400 hover:bg-amber-300",
                                )}
                              >
                                5分
                              </Button>
                            </div>
                            <div className="flex justify-end gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setCustomTimerOpen(false)}
                                className={cn(
                                  isDarkMode
                                    ? "border-amber-600 hover:bg-amber-700"
                                    : "border-amber-300 hover:bg-amber-100",
                                )}
                              >
                                キャンセル
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  if (
                                    taskToStartTimer &&
                                    taskToStartTimer.id === task.id
                                  ) {
                                    startCustomTimer(task);
                                  }
                                }}
                                className={cn(
                                  isDarkMode
                                    ? "bg-amber-600 hover:bg-amber-500"
                                    : "bg-amber-500 hover:bg-amber-400",
                                )}
                              >
                                開始
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
              </div>

              {/* タスク個別のタイマー表示 */}
              {(task.timerRunning || task.pausedTimerValue) &&
                !task.completed && (
                  <div
                    className={cn(
                      "mt-2 p-3 rounded-lg",
                      isDarkMode ? "bg-amber-700/70" : "bg-amber-100/70",
                    )}
                  >
                    <div className="text-center">
                      <div className="relative mb-3">
                        <div
                          className={cn(
                            "w-24 h-24 rounded-full mx-auto border-4 flex items-center justify-center",
                            isDarkMode
                              ? "border-amber-500 bg-amber-800/60"
                              : "border-amber-400 bg-amber-50",
                            task.timerRunning ? "animate-pulse-slow" : "",
                          )}
                        >
                          <div className="text-center">
                            <div
                              className={cn(
                                "text-2xl font-mono",
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
                                "text-xs mt-1",
                                isDarkMode
                                  ? "text-amber-200"
                                  : "text-amber-600",
                              )}
                            >
                              {task.timerRunning ? "実行中" : "一時停止"}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2 mb-1">
                        {task.timerRunning ? (
                          <Button
                            size="sm"
                            className={cn(
                              isDarkMode
                                ? "bg-amber-600 hover:bg-amber-500 text-white"
                                : "bg-amber-500 hover:bg-amber-400 text-white",
                            )}
                            onClick={() => stopTimer(task.id)}
                          >
                            一時停止
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className={cn(
                              isDarkMode
                                ? "bg-green-600 hover:bg-green-500 text-white"
                                : "bg-green-500 hover:bg-green-400 text-white",
                            )}
                            onClick={() => resumeTimer(task.id)}
                          >
                            再開
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className={cn(
                            isDarkMode
                              ? "bg-red-700 hover:bg-red-600 text-white"
                              : "bg-red-500 hover:bg-red-600 text-white",
                          )}
                          onClick={() => endTimer(task.id)}
                        >
                          終了
                        </Button>
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <div className="flex items-center">
                          <Input
                            type="number"
                            min="0"
                            value={extendTimerHours}
                            onChange={(e) =>
                              setExtendTimerHours(e.target.value)
                            }
                            className={cn(
                              "w-14 text-center text-xs",
                              isDarkMode
                                ? "bg-amber-700 border-amber-600 text-amber-50"
                                : "bg-white border-amber-200",
                            )}
                          />
                          <span className="mx-1 text-xs">時間</span>
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
                              "w-14 text-center text-xs",
                              isDarkMode
                                ? "bg-amber-700 border-amber-600 text-amber-50"
                                : "bg-white border-amber-200",
                            )}
                          />
                          <span className="mx-1 text-xs">分</span>
                        </div>
                        <Button
                          size="sm"
                          className={cn(
                            "text-xs px-2 py-1 h-7",
                            isDarkMode
                              ? "bg-amber-600 hover:bg-amber-500 text-white"
                              : "bg-amber-500 hover:bg-amber-400 text-white",
                          )}
                          onClick={() => extendTimer(task.id)}
                        >
                          追加
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
