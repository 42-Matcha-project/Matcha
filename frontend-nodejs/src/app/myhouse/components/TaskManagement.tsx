"use client";

import { useState, useEffect, useMemo } from "react";
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
  PlusCircle,
  CheckCircle,
  Trash2,
  ListFilter,
  Save,
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
import { AnimatePresence, motion } from "framer-motion";
import { formatTime, formatDeadline } from "../lib/timeUtils";
import { useAuth } from "@/contexts/AuthContext";

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
}

interface TaskManagementProps {
  isDarkMode: boolean;
  tasks: Task[];
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

export const TaskManagement = ({
  isDarkMode,
  tasks,
  onTaskComplete,
  onTaskAdd,
}: TaskManagementProps) => {
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    subject: "",
    deadline: "",
  });
  const [filterCompleted, setFilterCompleted] = useState(false);
  const [sortBy, setSortBy] = useState<"deadline" | "subject">("deadline");
  const { isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        return;
      }

      const taskRequest: TaskRequest = {
        WorkName: newTask.title,
        IconImageURL: "https://placehold.co/32",
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

      if (!response.ok) {
        throw new Error(`タスクの追加に失敗しました (${response.status})`);
      }

      const data = await response.json();

      // APIからの応答に含まれるタスクIDを使用
      const taskId = data.Work?.ID || data.ID || Date.now();

      // 新しいタスクオブジェクトを作成
      const task: Task = {
        id: taskId,
        title: newTask.title,
        subject: newTask.subject || "一般",
        deadline: newTask.deadline ? new Date(newTask.deadline) : undefined,
        completed: false,
        timeSpent: 0,
        iconImageURL: "https://placehold.co/32",
      };

      // 親コンポーネントにタスク追加を通知
      onTaskAdd(task);

      // タスク追加フォームをリセットして閉じる
      setNewTask({ title: "", subject: "", deadline: "" });
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
    try {
      // APIを使用してタスクを削除
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("ログインしていません");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/works/delete/${taskId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`タスクの削除に失敗しました (${response.status})`);
      }

      toast.success("タスクを削除しました");

      // 親コンポーネントに再取得を通知するため空のタスクを追加
      onTaskAdd({
        id: 0,
        title: "",
        subject: "",
        completed: false,
        timeSpent: 0,
      });
    } catch (error) {
      console.error("タスク削除エラー:", error);
      toast.error("タスクの削除に失敗しました");
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
                    htmlFor="subject"
                    className="block text-sm font-medium mb-1"
                  >
                    科目・カテゴリー
                  </label>
                  <Input
                    id="subject"
                    value={newTask.subject}
                    onChange={(e) =>
                      setNewTask({ ...newTask, subject: e.target.value })
                    }
                    placeholder="例: 数学"
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
    </div>
  );
};

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: number) => void;
  onDelete: (taskId: number) => void;
}

const TaskItem = ({ task, onComplete, onDelete }: TaskItemProps) => {
  return (
    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-650 transition-all">
      <div className="flex-1 min-w-0">
        <div className="flex items-start">
          {task.iconImageURL && (
            <img
              src={task.iconImageURL}
              alt=""
              className="w-6 h-6 mr-2 rounded-full"
              onError={(e) => {
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
              {task.subject && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-0.5 rounded">
                  {task.subject}
                </span>
              )}
              {task.deadline && (
                <span
                  className={`text-xs px-2 py-0.5 rounded flex items-center ${
                    task.deadline < new Date()
                      ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100"
                      : "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100"
                  }`}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDeadline(task.deadline)}
                </span>
              )}
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
          className="p-1 mr-1 text-gray-500 hover:text-green-500 transition-colors"
          aria-label="タスク完了"
        >
          <CheckCircle className="h-5 w-5" />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1 text-gray-500 hover:text-red-500 transition-colors"
          aria-label="タスク削除"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
