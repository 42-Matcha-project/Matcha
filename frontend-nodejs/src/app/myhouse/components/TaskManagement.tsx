"use client";

import { useState, useMemo } from "react";
import {
  Clock,
  PlusCircle,
  Trash2,
  ListFilter,
  Save,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { formatTime, formatDeadline } from "../lib/timeUtils";
import Image from "next/image";

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

// APIリクエスト用のタスク型
interface TaskRequest {
  WorkName: string;
  IconImageURL?: string;
  Color: number; // uint32
  Memo?: string;
}

interface TaskManagementProps {
  tasks: Task[];
  onTaskComplete: (taskId: number) => void;
  onTaskAdd: (task: Task) => void;
}

// 締切日のステータスを取得する関数を削除

export const TaskManagement = ({
  tasks,
  onTaskComplete,
  onTaskAdd,
}: TaskManagementProps) => {
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    subject: "",
    deadline: "",
    color: "#000000",
    memo: "",
  });
  const [sortBy, setSortBy] = useState<"deadline" | "subject">("deadline");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const uncompletedTasks = useMemo(() => {
    return tasks
      ? tasks
          .filter((task) => !task.completed)
          .sort((a, b) => {
            if (sortBy === "deadline") {
              if (!a.deadline) return 1;
              if (!b.deadline) return -1;
              return a.deadline.getTime() - b.deadline.getTime();
            } else {
              return a.subject.localeCompare(b.subject);
            }
          })
      : [];
  }, [tasks, sortBy]);

  const handleTaskSubmit = async () => {
    if (!newTask.title.trim()) {
      toast.error("タスク名を入力してください");
      return;
    }

    try {
      setIsSubmitting(true);
      // APIを使用してタスクを追加
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("ログインしていません");
        window.location.href = "/login";
        return;
      }

      const taskRequest: TaskRequest = {
        WorkName: newTask.title,
        IconImageURL: "https://placehold.co/32",
        Color: Number(parseInt(newTask.color.replace("#", ""), 16)), // 確実に数値型に
        Memo: newTask.memo || "",
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/works/add`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskRequest),
        },
      );

      if (response.status === 401 || response.status === 403) {
        toast.error("認証エラーです。再ログインしてください。");
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        throw new Error(`タスクの追加に失敗しました (${response.status})`);
      }

      const data = await response.json();

      // APIからの応答に含まれるタスクIDを使用
      const taskId = data.Work?.ID || data.ID || Date.now();

      // 新しいタスクオブジェクトを作成
      let deadline: Date | undefined = undefined;
      if (newTask.deadline) {
        const d = new Date(newTask.deadline);
        if (!isNaN(d.getTime())) deadline = d;
      }
      const task: Task = {
        id: taskId,
        title: newTask.title,
        subject: newTask.subject || "一般",
        deadline,
        completed: false,
        timeSpent: 0,
        iconImageURL: "https://placehold.co/32",
      };

      // 親コンポーネントにタスク追加を通知
      onTaskAdd(task);

      // タスク追加フォームをリセットして閉じる
      setNewTask({
        title: "",
        subject: "",
        deadline: "",
        color: "#000000",
        memo: "",
      });
      setShowAddTask(false);
      toast.success("タスクを追加しました");
    } catch (error) {
      console.error("タスク追加エラー:", error);
      toast.error("タスクの追加に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    setDeleteTargetId(taskId);
    setShowDeleteModal(true);
  };

  const confirmDeleteTask = async () => {
    if (deleteTargetId === null) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("ログインしていません");
        window.location.href = "/login";
        setShowDeleteModal(false);
        return;
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/works/delete/${deleteTargetId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.status === 401 || response.status === 403) {
        toast.error("認証エラーです。再ログインしてください。");
        window.location.href = "/login";
        return;
      }
      if (!response.ok) {
        throw new Error(`タスクの削除に失敗しました (${response.status})`);
      }
      toast.success("タスクを削除しました");
      onTaskAdd({
        id: 0,
        title: "",
        subject: "",
        deadline: undefined,
        completed: false,
        timeSpent: 0,
      });
    } catch (error) {
      console.error("タスク削除エラー:", error);
      toast.error("タスクの削除に失敗しました");
    } finally {
      setShowDeleteModal(false);
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">タスク管理</h2>
        <div className="flex space-x-2">
          <Button
            onClick={() =>
              setSortBy(sortBy === "deadline" ? "subject" : "deadline")
            }
            variant="outline"
            size="icon"
            className="h-8 w-8"
          >
            <ListFilter className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setShowAddTask(!showAddTask)}
            variant="default"
            size="sm"
            className="bg-amber-500 hover:bg-amber-600"
          >
            <PlusCircle className="h-4 w-4 mr-1" /> 追加
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showAddTask && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-medium mb-2">新しいタスク</h3>
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium mb-1"
                  >
                    タスク名 *
                  </label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                    placeholder="例: レポート作成"
                  />
                </div>
                <div>
                  <label
                    htmlFor="deadline"
                    className="block text-sm font-medium mb-1"
                  >
                    締切日（任意）
                  </label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={newTask.deadline}
                    onChange={(e) =>
                      setNewTask({ ...newTask, deadline: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="color"
                    className="block text-sm font-medium mb-1"
                  >
                    カラー（必須）
                  </label>
                  <Input
                    id="color"
                    type="color"
                    value={newTask.color}
                    onChange={(e) =>
                      setNewTask({ ...newTask, color: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="memo"
                    className="block text-sm font-medium mb-1"
                  >
                    メモ（任意）
                  </label>
                  <textarea
                    id="memo"
                    value={newTask.memo}
                    onChange={(e) =>
                      setNewTask({ ...newTask, memo: e.target.value })
                    }
                    className="w-full border rounded p-2 text-sm"
                    rows={2}
                    placeholder="メモを入力"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={() => setShowAddTask(false)}
                  >
                    キャンセル
                  </Button>
                  <Button
                    onClick={handleTaskSubmit}
                    disabled={isSubmitting}
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600"
                  >
                    {isSubmitting ? "保存中..." : "保存"}
                    {!isSubmitting && <Save className="h-4 w-4 ml-1" />}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
        {uncompletedTasks.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            タスクはありません
          </p>
        ) : (
          uncompletedTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onComplete={onTaskComplete}
              onDelete={handleDeleteTask}
            />
          ))
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-xs mx-2">
            <h3 className="text-lg font-bold mb-4 text-red-600 flex items-center">
              <Trash2 className="h-5 w-5 mr-2" /> タスクを削除しますか？
            </h3>
            <p className="mb-6 text-gray-700 dark:text-gray-200 text-sm">
              この操作は取り消せません。
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                キャンセル
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={confirmDeleteTask}
              >
                削除する
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: number) => void;
  onDelete: (taskId: number) => void;
}

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

const TaskItem = ({ task, onComplete, onDelete }: TaskItemProps) => {
  const deadlineStatus = task.deadline
    ? getDeadlineStatus(task.deadline)
    : null;
  return (
    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-650 transition-all">
      <div className="flex-1 min-w-0">
        <div className="flex items-start">
          {task.iconImageURL && (
            <Image
              src={task.iconImageURL}
              alt=""
              className="w-6 h-6 mr-2 rounded-full"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://placehold.co/32";
              }}
            />
          )}
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 truncate">
              {task.title}
            </h4>
            <div className="flex flex-wrap gap-2 mt-1">
              <span
                className={`text-xs px-2 py-0.5 rounded flex items-center ${
                  !task.deadline
                    ? "bg-gray-100 text-gray-500"
                    : deadlineStatus?.status === "expired"
                      ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 font-bold animate-pulse"
                      : deadlineStatus?.status === "today" ||
                          deadlineStatus?.status === "tomorrow"
                        ? "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100 font-semibold"
                        : deadlineStatus?.status === "soon"
                          ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 font-semibold"
                          : "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100"
                }`}
              >
                <Clock className="h-3 w-3 mr-1" />
                {!task.deadline && <span>締切なし</span>}
                {task.deadline && deadlineStatus && (
                  <>
                    {deadlineStatus.status === "expired" && (
                      <AlertTriangle className="h-4 w-4 mr-1 text-red-500 animate-bounce" />
                    )}
                    {formatDeadline(task.deadline)}
                    <span className="ml-2">{deadlineStatus.message}</span>
                  </>
                )}
              </span>
              {task.timeSpent > 0 && (
                <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 px-2 py-0.5 rounded">
                  {formatTime(task.timeSpent)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center ml-4">
        <button
          onClick={() => onComplete(task.id)}
          className="relative group"
          aria-label="タスク完了"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-100 hover:bg-amber-200 dark:bg-amber-800 dark:hover:bg-amber-700 border-2 border-amber-300 dark:border-amber-600 transition-all transform group-hover:scale-110">
            <div className="text-amber-600 dark:text-amber-300">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 12L11 15L16 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <span className="absolute opacity-0 group-hover:opacity-100 left-1/2 -translate-x-1/2 top-full mt-2 bg-amber-500 text-white text-xs rounded py-1 px-2 whitespace-nowrap transition-opacity z-30">
            完了する
          </span>
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="ml-2 flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full transition-colors shadow-sm"
          aria-label="タスク削除"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">削除</span>
        </button>
      </div>
    </div>
  );
};
