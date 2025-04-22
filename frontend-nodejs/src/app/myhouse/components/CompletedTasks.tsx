"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Clock, X } from "lucide-react";
import { Task } from "./TaskManagement";

interface CompletedTasksProps {
  tasks: Task[];
  isDarkMode: boolean;
  onToggleComplete: (taskId: number) => void;
}

export function CompletedTasks({
  tasks,
  isDarkMode,
  onToggleComplete,
}: CompletedTasksProps) {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  // 完了済みタスクをソート (新しい順)
  const completedTasks = tasks
    .filter((task) => task.completed)
    .sort((a, b) => {
      // completedDateがある場合は新しい順に、なければIDで降順
      if (a.completedDate && b.completedDate) {
        return (
          new Date(b.completedDate).getTime() -
          new Date(a.completedDate).getTime()
        );
      }
      return b.id - a.id;
    });

  return (
    <div
      className={cn(
        "p-4 rounded-xl border-2 shadow-md mb-4",
        isDarkMode
          ? "bg-amber-800/30 border-amber-700"
          : "bg-amber-50/80 border-amber-200",
      )}
    >
      <div
        className="flex items-center justify-between mb-4 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              isDarkMode ? "bg-green-600" : "bg-green-500",
            )}
          >
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
          </div>
          <h3
            className={cn(
              "text-lg font-bold",
              isDarkMode ? "text-amber-100" : "text-amber-800",
            )}
          >
            完了したタスク
          </h3>
        </div>
        <div
          className={cn(
            "w-5 h-5 flex items-center justify-center rounded transition-transform",
            isOpen ? "rotate-180" : "",
          )}
        >
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L5 5L9 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
          {completedTasks.length === 0 ? (
            <div
              className={cn(
                "text-center py-6 rounded-lg border",
                isDarkMode
                  ? "bg-amber-900/30 border-amber-800 text-amber-200"
                  : "bg-amber-100/50 border-amber-200 text-amber-700",
              )}
            >
              <p className="text-sm">完了したタスクはまだありません</p>
            </div>
          ) : (
            completedTasks.map((task) => (
              <div
                key={`completed-${task.id}`}
                className={cn(
                  "p-3 rounded-lg border-2 flex items-center gap-3",
                  isDarkMode
                    ? "bg-green-800/20 border-green-700"
                    : "bg-green-50 border-green-200",
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center",
                    isDarkMode ? "bg-green-600" : "bg-green-500",
                  )}
                >
                  <svg
                    width="12"
                    height="12"
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
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="overflow-hidden">
                  <div
                    className={cn(
                      "font-medium line-through text-sm truncate",
                      isDarkMode ? "text-amber-200" : "text-amber-700",
                    )}
                  >
                    {task.title}
                  </div>
                  {task.timeSpent > 0 && (
                    <div
                      className={cn(
                        "text-xs mt-1 flex items-center",
                        isDarkMode ? "text-amber-300" : "text-amber-600",
                      )}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {Math.floor(task.timeSpent / 60)}分
                    </div>
                  )}
                  {task.completedDate && (
                    <div
                      className={cn(
                        "text-xs mt-1",
                        isDarkMode ? "text-amber-300" : "text-amber-600",
                      )}
                    >
                      完了: {format(task.completedDate, "yyyy/MM/dd")}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onToggleComplete(task.id)}
                  className={cn(
                    "ml-auto p-1.5 rounded-full",
                    isDarkMode
                      ? "hover:bg-amber-700/50 text-amber-300"
                      : "hover:bg-amber-200/50 text-amber-600",
                  )}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
