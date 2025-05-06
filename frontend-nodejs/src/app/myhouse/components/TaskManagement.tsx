"use client";

import React, { useState, useMemo } from "react";
import { Clock, PlusCircle, Trash2, ListFilter, Save } from "lucide-react";
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

export const TaskManagement = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    subject: "",
    deadline: "",
    color: "#000000",
    memo: "",
  });
  const [newTaskIcon, setNewTaskIcon] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"deadline" | "subject">("deadline");
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [now, setNow] = React.useState(new Date());
  const [isDragging, setIsDragging] = useState(false);

  // タスク追加
  const handleTaskSubmit = () => {
    if (!newTask.title.trim()) {
      toast.error("タスク名を入力してください");
      return;
    }
    let deadline: Date | undefined = undefined;
    if (newTask.deadline) {
      const d = new Date(newTask.deadline);
      if (!isNaN(d.getTime())) deadline = d;
    }
    const task: Task = {
      id: Date.now(),
      title: newTask.title,
      subject: newTask.subject || "一般",
      deadline,
      completed: false,
      timeSpent: 0,
      iconImageURL: newTaskIcon || "https://placehold.co/32",
      timerRunning: false,
      currentTimerValue: 0,
    };
    setTasks((prev) => [...prev, task]);
    setNewTask({
      title: "",
      subject: "",
      deadline: "",
      color: "#000000",
      memo: "",
    });
    setShowAddTask(false);
    setNewTaskIcon(null);
    toast.success("タスクを追加しました");
  };

  // タスク削除
  const handleDeleteTask = (taskId: number) => {
    setDeleteTargetId(taskId);
    setShowDeleteModal(true);
  };
  const confirmDeleteTask = () => {
    if (deleteTargetId === null) return;
    setTasks((prev) => prev.filter((t) => t.id !== deleteTargetId));
    setShowDeleteModal(false);
    setDeleteTargetId(null);
    toast.success("タスクを削除しました");
  };

  // タスク完了
  const handleTaskComplete = (taskId: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, completed: true, completedDate: new Date() }
          : t,
      ),
    );
    toast.success("タスクを完了しました");
  };

  // タイマー制御
  const handleToggleTimer = (taskId: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, timerRunning: !t.timerRunning } : t,
      ),
    );
  };
  // タイマーtick
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prev) =>
        prev.map((t) =>
          t.timerRunning
            ? { ...t, currentTimerValue: (t.currentTimerValue || 0) + 1 }
            : t,
        ),
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 記録する
  const handleRecord = (taskId: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              timeSpent: (t.timeSpent || 0) + (t.currentTimerValue || 0),
              currentTimerValue: 0,
              timerRunning: false,
            }
          : t,
      ),
    );
    toast.success("学習時間を記録しました");
  };

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

  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // 画像ファイル選択ハンドラ
  const handleIconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setNewTaskIcon(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // ドラッグ＆ドロップハンドラ
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setNewTaskIcon(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 画像削除ボタン
  const handleRemoveIcon = () => setNewTaskIcon(null);

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
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">
                    アイコン画像（任意）
                  </label>
                  <div
                    className={`flex items-center gap-3 border-2 rounded p-2 transition-colors ${isDragging ? "border-amber-400 bg-amber-50" : "border-gray-200"}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      document.getElementById("icon-file-input")?.click()
                    }
                  >
                    <input
                      id="icon-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleIconFileChange}
                      className="hidden"
                    />
                    {newTaskIcon ? (
                      <div className="relative">
                        <img
                          src={newTaskIcon}
                          alt="プレビュー"
                          style={{ width: 64, height: 64, borderRadius: "50%" }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveIcon();
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow"
                          title="画像を削除"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">
                        画像をクリックまたはドロップ
                      </span>
                    )}
                  </div>
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
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600"
                  >
                    {"保存"}
                    {!showAddTask && <Save className="h-4 w-4 ml-1" />}
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
              onComplete={handleTaskComplete}
              onDelete={handleDeleteTask}
              onToggleTimer={handleToggleTimer}
              onRecord={handleRecord}
              now={now}
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
  onToggleTimer: (taskId: number) => void;
  onRecord: (taskId: number) => void;
  now: Date;
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

const TaskItem = ({
  task,
  onComplete,
  onDelete,
  onToggleTimer,
  onRecord,
  now,
}: TaskItemProps) => {
  const deadlineStatus = task.deadline
    ? getDeadlineStatus(task.deadline)
    : null;
  let countdown = null;
  if (task.deadline) {
    const diff = task.deadline.getTime() - now.getTime();
    if (diff > 0) {
      const hours = Math.floor(diff / 1000 / 60 / 60);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      countdown = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    } else {
      countdown = "期限切れ";
    }
  }
  return (
    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-650 transition-all">
      <div className="flex-1 min-w-0">
        <div className="flex items-start">
          {task.iconImageURL && (
            <Image
              src={task.iconImageURL}
              alt=""
              width={64}
              height={64}
              unoptimized
              className="w-16 h-16 mr-2 rounded-full object-cover"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://placehold.co/64";
                target.style.width = "64px";
                target.style.height = "64px";
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
                      ? "bg-red-100 text-red-800 font-bold"
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
                    {deadlineStatus.status === "expired" ? (
                      <span>
                        {task.deadline.toLocaleDateString()}（期限切れ）
                      </span>
                    ) : (
                      <>
                        {formatDeadline(task.deadline)}
                        <span className="ml-2">{deadlineStatus.message}</span>
                      </>
                    )}
                  </>
                )}
              </span>
              {task.timeSpent > 0 && (
                <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 px-2 py-0.5 rounded">
                  {formatTime(task.timeSpent)}
                </span>
              )}
              {task.deadline && (
                <span
                  className={`text-base font-bold ml-2 ${countdown === "期限切れ" ? "text-red-500" : "text-blue-700"}`}
                  style={{ letterSpacing: "0.03em" }}
                >
                  {countdown === "期限切れ"
                    ? `${task.deadline.toLocaleDateString()}（期限切れ）`
                    : `締切まで: ${countdown}`}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center ml-4 gap-2">
        <button
          onClick={() => onToggleTimer(task.id)}
          className="px-2 py-1 rounded bg-amber-200 hover:bg-amber-300 text-amber-900 text-xs"
        >
          {task.timerRunning ? "一時停止" : "再開"}
        </button>
        <button
          onClick={() => onRecord(task.id)}
          className="px-2 py-1 rounded bg-green-200 hover:bg-green-300 text-green-900 text-xs"
        >
          記録する
        </button>
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
