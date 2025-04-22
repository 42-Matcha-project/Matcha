import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, CheckCircle, Clock, Medal } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Task } from "./TaskManagement";
import { formatTimeDisplay } from "@/lib/date-utils";

interface CompletedTasksProps {
  tasks: Task[];
  isDarkMode: boolean;
}

export function CompletedTasks({ tasks, isDarkMode }: CompletedTasksProps) {
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [timeFilter, setTimeFilter] = useState<
    "all" | "today" | "week" | "month"
  >("all");

  // 完了したタスクのみをフィルタリング
  useEffect(() => {
    const filtered = tasks.filter((task) => task.completed);

    // 時間によるフィルタリング
    if (timeFilter !== "all") {
      const now = new Date();
      const filteredByTime = filtered.filter((task) => {
        // 完了時間がないタスクは除外（実際の実装ではこのような処理があるかもしれません）
        if (!task.completedDate) return false;

        const completedDate = new Date(task.completedDate);

        switch (timeFilter) {
          case "today":
            return (
              completedDate.getDate() === now.getDate() &&
              completedDate.getMonth() === now.getMonth() &&
              completedDate.getFullYear() === now.getFullYear()
            );
          case "week":
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(now.getDate() - 7);
            return completedDate >= oneWeekAgo;
          case "month":
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(now.getMonth() - 1);
            return completedDate >= oneMonthAgo;
          default:
            return true;
        }
      });

      setCompletedTasks(filteredByTime);
    } else {
      setCompletedTasks(filtered);
    }
  }, [tasks, timeFilter]);

  // 日付のフォーマット
  const formatDeadline = (date: Date | undefined) => {
    if (!date) return "期限なし";

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const deadlineDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    const formattedDate = date.toLocaleDateString("ja-JP", options);

    if (diffDays < 0) {
      return `${formattedDate} (期限切れ)`;
    } else if (diffDays === 0) {
      return `${formattedDate} (今日)`;
    } else if (diffDays === 1) {
      return `${formattedDate} (明日)`;
    } else {
      return formattedDate;
    }
  };

  // 完了日時のフォーマット
  const formatCompletedDate = (date: Date | undefined) => {
    if (!date) return "不明";

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };

    return date.toLocaleDateString("ja-JP", options);
  };

  // 学習状況のサマリー計算
  const calculateSummary = () => {
    const totalTasks = completedTasks.length;
    const totalTimeSpent = completedTasks.reduce(
      (sum, task) => sum + (task.timeSpent || 0),
      0,
    );

    // 今日完了したタスク
    const now = new Date();
    const todayTasks = completedTasks.filter((task) => {
      if (!task.completedDate) return false;
      const completedDate = new Date(task.completedDate);
      return (
        completedDate.getDate() === now.getDate() &&
        completedDate.getMonth() === now.getMonth() &&
        completedDate.getFullYear() === now.getFullYear()
      );
    });

    // 今週完了したタスク
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    const weekTasks = completedTasks.filter((task) => {
      if (!task.completedDate) return false;
      const completedDate = new Date(task.completedDate);
      return completedDate >= oneWeekAgo;
    });

    return {
      totalTasks,
      totalTimeSpent,
      todayTasks: todayTasks.length,
      weekTasks: weekTasks.length,
    };
  };

  const summary = calculateSummary();

  return (
    <Card
      className={cn(
        "border-2 shadow-md",
        isDarkMode
          ? "bg-gray-800 border-gray-700 text-gray-200"
          : "bg-white border-amber-200",
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <CheckCircle
            className={isDarkMode ? "text-green-400" : "text-green-500"}
          />
          <span>完了タスク</span>
        </CardTitle>
        <CardDescription
          className={isDarkMode ? "text-gray-400" : "text-gray-600"}
        >
          完了したタスクの一覧と学習履歴
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* 学習サマリー */}
        <div
          className={cn(
            "grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6",
            isDarkMode ? "text-gray-200" : "text-gray-800",
          )}
        >
          <div
            className={cn(
              "p-4 rounded-xl border flex flex-col items-center justify-center",
              isDarkMode
                ? "bg-gray-700 border-gray-600"
                : "bg-amber-50 border-amber-200",
            )}
          >
            <span className="text-3xl font-bold">{summary.totalTasks}</span>
            <span className="text-xs mt-1 text-center">完了タスク</span>
          </div>

          <div
            className={cn(
              "p-4 rounded-xl border flex flex-col items-center justify-center",
              isDarkMode
                ? "bg-gray-700 border-gray-600"
                : "bg-amber-50 border-amber-200",
            )}
          >
            <span className="text-3xl font-bold">
              {formatTimeDisplay(summary.totalTimeSpent)}
            </span>
            <span className="text-xs mt-1 text-center">総学習時間</span>
          </div>

          <div
            className={cn(
              "p-4 rounded-xl border flex flex-col items-center justify-center",
              isDarkMode
                ? "bg-gray-700 border-gray-600"
                : "bg-amber-50 border-amber-200",
            )}
          >
            <span className="text-3xl font-bold">{summary.todayTasks}</span>
            <span className="text-xs mt-1 text-center">今日の完了</span>
          </div>

          <div
            className={cn(
              "p-4 rounded-xl border flex flex-col items-center justify-center",
              isDarkMode
                ? "bg-gray-700 border-gray-600"
                : "bg-amber-50 border-amber-200",
            )}
          >
            <span className="text-3xl font-bold">{summary.weekTasks}</span>
            <span className="text-xs mt-1 text-center">今週の完了</span>
          </div>
        </div>

        {/* フィルタータブ */}
        <Tabs
          defaultValue="all"
          className="mb-4"
          onValueChange={(value) =>
            setTimeFilter(value as "all" | "today" | "week" | "month")
          }
        >
          <TabsList
            className={cn(
              "grid w-full grid-cols-4 mb-6",
              isDarkMode ? "bg-gray-700" : "bg-amber-100",
            )}
          >
            <TabsTrigger
              value="all"
              className={cn(
                isDarkMode
                  ? "data-[state=active]:bg-amber-700 data-[state=active]:text-amber-100"
                  : "data-[state=active]:bg-amber-500 data-[state=active]:text-white",
              )}
            >
              すべて
            </TabsTrigger>
            <TabsTrigger
              value="today"
              className={cn(
                isDarkMode
                  ? "data-[state=active]:bg-amber-700 data-[state=active]:text-amber-100"
                  : "data-[state=active]:bg-amber-500 data-[state=active]:text-white",
              )}
            >
              今日
            </TabsTrigger>
            <TabsTrigger
              value="week"
              className={cn(
                isDarkMode
                  ? "data-[state=active]:bg-amber-700 data-[state=active]:text-amber-100"
                  : "data-[state=active]:bg-amber-500 data-[state=active]:text-white",
              )}
            >
              今週
            </TabsTrigger>
            <TabsTrigger
              value="month"
              className={cn(
                isDarkMode
                  ? "data-[state=active]:bg-amber-700 data-[state=active]:text-amber-100"
                  : "data-[state=active]:bg-amber-500 data-[state=active]:text-white",
              )}
            >
              今月
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            {renderTaskList()}
          </TabsContent>
          <TabsContent value="today" className="mt-0">
            {renderTaskList()}
          </TabsContent>
          <TabsContent value="week" className="mt-0">
            {renderTaskList()}
          </TabsContent>
          <TabsContent value="month" className="mt-0">
            {renderTaskList()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );

  function renderTaskList() {
    if (completedTasks.length === 0) {
      return (
        <div
          className={cn(
            "text-center py-12 border rounded-xl",
            isDarkMode
              ? "bg-gray-700 border-gray-600 text-gray-300"
              : "bg-amber-50 border-amber-200 text-amber-800",
          )}
        >
          <Medal className="mx-auto h-12 w-12 mb-4 opacity-20" />
          <p className="text-lg font-medium mb-2">完了したタスクはありません</p>
          <p className="text-sm">
            {timeFilter === "all"
              ? "タスクを完了するとここに表示されます"
              : "この期間に完了したタスクはありません"}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {completedTasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              "border p-4 rounded-lg shadow-sm",
              isDarkMode
                ? "bg-gray-700 border-gray-600"
                : "bg-white border-amber-200",
            )}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold">{task.title}</h3>
              <div
                className={cn(
                  "px-2 py-1 rounded-full text-xs",
                  isDarkMode
                    ? "bg-green-800 text-green-200"
                    : "bg-green-100 text-green-800",
                )}
              >
                完了
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-1 opacity-70" />
                <span>学習時間: {formatTimeDisplay(task.timeSpent)}</span>
              </div>

              {task.deadline && (
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-1 opacity-70" />
                  <span>期限: {formatDeadline(task.deadline)}</span>
                </div>
              )}

              {task.completedDate && (
                <div className="flex items-center text-sm col-span-2">
                  <CheckCircle className="h-4 w-4 mr-1 opacity-70" />
                  <span>
                    完了日時: {formatCompletedDate(task.completedDate)}
                  </span>
                </div>
              )}
            </div>

            {task.subject && (
              <div
                className={cn(
                  "text-xs px-2 py-1 rounded-full inline-block",
                  isDarkMode
                    ? "bg-blue-800 text-blue-200"
                    : "bg-blue-100 text-blue-800",
                )}
              >
                {task.subject}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
}
