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
}

interface TaskManagementProps {
  isDarkMode: boolean;
  onTaskComplete: (taskId: number) => void;
  onTaskAdd: (task: Task) => void;
}

export function TaskManagement({
  isDarkMode,
  onTaskComplete,
  onTaskAdd,
}: TaskManagementProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0); // 秒単位
  const [isAddingTask, setIsAddingTask] = useState<boolean>(false);
  const [customTimerOpen, setCustomTimerOpen] = useState<boolean>(false);
  const [customTimerMinutes, setCustomTimerMinutes] = useState<string>("25");
  const [predefinedTimes] = useState<number[]>([25, 50]); // デフォルトのタイマー時間（固定値）

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
  }, []);

  // タスクが変更されたらローカルストレージに保存
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // タイマー機能
  useEffect(() => {
    if (!timerRunning || !currentTask) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimerRunning(false);
          toast.success("タイマーが終了しました！");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerRunning, currentTask]);

  // 新しいタスクを追加
  const addTask = () => {
    if (!newTask.trim()) {
      toast.error("タスク名を入力してください");
      return;
    }

    const newTaskObj: Task = {
      id: Date.now(),
      title: newTask,
      deadline: selectedDate,
      subject: "", // 空の文字列をデフォルト値として使用
      completed: false,
      timeSpent: 0,
    };

    setTasks((prev) => [...prev, newTaskObj]);
    onTaskAdd(newTaskObj);
    setNewTask("");
    setSelectedDate(undefined);
    setIsAddingTask(false);

    toast.success("タスクを追加しました");
  };

  // タスクの完了状態を切り替え
  const toggleTaskComplete = (taskId: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
    onTaskComplete(taskId);
  };

  // タスクのタイマーをスタート（プリセット時間）
  const startTaskTimer = (task: Task, minutes: number) => {
    setCurrentTask(task);
    setTimeLeft(minutes * 60);
    setTimerRunning(true);
    toast.info(`${task.title}のタイマーを${minutes}分でスタートしました`);
  };

  // カスタムタイマーをスタート
  const startCustomTimer = (task: Task) => {
    const minutes = parseInt(customTimerMinutes);
    if (isNaN(minutes) || minutes <= 0) {
      toast.error("有効な時間を入力してください");
      return;
    }

    startTaskTimer(task, minutes);
    setCustomTimerOpen(false);
  };

  // タイマーを停止
  const stopTimer = () => {
    setTimerRunning(false);
    if (currentTask) {
      // タスクの作業時間を更新
      setTasks((prev) =>
        prev.map((task) =>
          task.id === currentTask.id
            ? {
                ...task,
                timeSpent: task.timeSpent + (timeLeft > 0 ? timeLeft : 0),
              }
            : task,
        ),
      );
    }
    setCurrentTask(null);
    toast.info("タイマーを停止しました");
  };

  // タイマーを延長
  const extendTimer = (minutes: number) => {
    setTimeLeft((prev) => prev + minutes * 60);
    toast.info(`タイマーを${minutes}分延長しました`);
  };

  // 時間のフォーマット（MM:SS）
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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

          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsAddingTask(false)}
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

      {/* タイマー表示 */}
      {timerRunning && currentTask && (
        <div
          className={cn(
            "mt-6 p-4 rounded-lg",
            isDarkMode ? "bg-amber-700" : "bg-amber-100",
          )}
        >
          <h4 className="font-bold mb-2">現在のタスク: {currentTask.title}</h4>
          <div className="text-center">
            <div
              className={cn(
                "text-3xl font-mono mb-2",
                isDarkMode ? "text-amber-100" : "text-amber-800",
              )}
            >
              {formatTime(timeLeft)}
            </div>
            <Button
              className={cn(
                "mr-2",
                isDarkMode
                  ? "bg-red-700 hover:bg-red-600 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white",
              )}
              onClick={stopTimer}
            >
              タイマー停止
            </Button>
            <Button
              className={cn(
                "mr-2",
                isDarkMode
                  ? "bg-amber-600 hover:bg-amber-500 text-white"
                  : "bg-amber-500 hover:bg-amber-400 text-white",
              )}
              onClick={() => extendTimer(5)}
            >
              +5分
            </Button>
            <Button
              className={cn(
                isDarkMode
                  ? "bg-amber-600 hover:bg-amber-500 text-white"
                  : "bg-amber-500 hover:bg-amber-400 text-white",
              )}
              onClick={() => extendTimer(10)}
            >
              +10分
            </Button>
          </div>
        </div>
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
                "p-3 rounded-lg flex items-center justify-between",
                task.completed
                  ? isDarkMode
                    ? "bg-amber-800/40 border border-amber-700"
                    : "bg-amber-100/40 border border-amber-200"
                  : isDarkMode
                    ? "bg-amber-800/60 border border-amber-700"
                    : "bg-white border border-amber-200",
              )}
            >
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
                      "font-medium",
                      task.completed && "line-through opacity-70",
                    )}
                  >
                    {task.title}
                  </div>
                  <div className="text-xs mt-1 flex flex-wrap gap-2">
                    {task.deadline && (
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full flex items-center",
                          isDarkMode
                            ? "bg-amber-700/70 text-amber-100"
                            : "bg-amber-100 text-amber-800",
                        )}
                      >
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {format(task.deadline, "MM/dd")}
                      </span>
                    )}
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

              {!task.completed && !timerRunning && (
                <div className="flex flex-wrap items-center gap-1">
                  {predefinedTimes.slice(0, 3).map((time) => (
                    <Button
                      key={time}
                      onClick={() => startTaskTimer(task, time)}
                      size="sm"
                      className={cn(
                        "text-xs px-2",
                        isDarkMode
                          ? "bg-amber-700 hover:bg-amber-600 text-white"
                          : "bg-amber-400 hover:bg-amber-300 text-white",
                      )}
                    >
                      {time}分
                    </Button>
                  ))}

                  {/* カスタムタイマー設定ボタン */}
                  <Popover
                    open={customTimerOpen}
                    onOpenChange={setCustomTimerOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className={cn(
                          "text-xs",
                          isDarkMode
                            ? "border-amber-600 bg-amber-800/50 hover:bg-amber-700 text-amber-100"
                            : "border-amber-300 hover:bg-amber-200",
                        )}
                      >
                        <Timer className="h-3 w-3" />
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
                          カスタムタイマー
                        </h4>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            value={customTimerMinutes}
                            onChange={(e) =>
                              setCustomTimerMinutes(e.target.value)
                            }
                            className={cn(
                              "flex-1",
                              isDarkMode
                                ? "bg-amber-700 border-amber-600 text-amber-50"
                                : "bg-white border-amber-200",
                            )}
                          />
                          <span className="text-sm">分</span>
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
                            onClick={() => startCustomTimer(task)}
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
          ))
        )}
      </div>
    </div>
  );
}
