"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CirclePlus, LogOut } from "lucide-react";
import { SubjectRegistrationForm } from "./SubjectRegistrationForm";
import { SubjectList } from "./SubjectList";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

// 学習目標の型定義
interface StudyGoal {
  id: number;
  text: string;
  completed: boolean;
  color: "green" | "orange" | "gray";
}
interface StudyStatsProps {
  isDarkMode: boolean;
}

export function StudyStats({ isDarkMode }: StudyStatsProps) {
  const router = useRouter();
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [newGoalText, setNewGoalText] = useState("");
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [refreshSubjectsTrigger, setRefreshSubjectsTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showEndSessionDialog, setShowEndSessionDialog] = useState(false);

  // 目標達成率を計算
  const completionRate = Math.round(
    (goals.filter((goal) => goal.completed).length / goals.length) * 100,
  );

  // 新しい目標を追加
  const addGoal = () => {
    if (newGoalText.trim()) {
      const newGoal: StudyGoal = {
        id: Date.now(),
        text: newGoalText.trim(),
        completed: false,
        color: "gray",
      };
      setGoals([...goals, newGoal]);
      setNewGoalText("");
      setIsAddingGoal(false);
    }
  };

  // 目標の状態を切り替え
  const toggleGoalCompletion = (id: number) => {
    setGoals(
      goals.map((goal) =>
        goal.id === id ? { ...goal, completed: !goal.completed } : goal,
      ),
    );
  };

  // 科目が追加されたときに科目リストを更新
  const handleSubjectAdded = () => {
    setRefreshSubjectsTrigger((prev) => prev + 1);
  };

  // 自習を終了する
  const endStudySession = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("認証情報がありません。再ログインしてください。");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/study-room/delete`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`自習の終了に失敗しました (${response.status})`);
      }

      toast.success("自習を終了しました");
      // settlementページへリダイレクト
      router.push("/settlement");
    } catch (error) {
      console.error("自習終了エラー:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "自習の終了中にエラーが発生しました",
      );
    } finally {
      setIsLoading(false);
      setShowEndSessionDialog(false);
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl p-8 mb-8",
        isDarkMode
          ? "bg-amber-900/90 border border-amber-800"
          : "bg-amber-50/95 border border-amber-200",
      )}
    >
      {/* 科目登録セクション */}
      <div className="mb-8">
        <SubjectRegistrationForm
          isDarkMode={isDarkMode}
          onSubjectAdded={handleSubjectAdded}
        />
        <SubjectList
          isDarkMode={isDarkMode}
          refreshTrigger={refreshSubjectsTrigger}
        />
      </div>

      {/* End Study Session Dialog */}
      <Dialog
        open={showEndSessionDialog}
        onOpenChange={setShowEndSessionDialog}
      >
        <DialogContent
          className={cn(
            "sm:max-w-xl w-[90%]",
            isDarkMode
              ? "bg-amber-900 border-amber-800 text-amber-50"
              : "bg-amber-50 border-amber-200 text-amber-950",
          )}
        >
          <DialogHeader className="p-2">
            <DialogTitle className="flex items-center gap-3 text-xl mb-2">
              <LogOut className="h-6 w-6" />
              自習を終了しますか？
            </DialogTitle>
            <DialogDescription
              className={cn(
                "text-base",
                isDarkMode ? "text-amber-300" : "text-amber-700",
              )}
            >
              自習を終了すると、現在の学習タイマーがリセットされます。タイマーの進捗はプロフィールに記録されます。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between flex-row gap-3 mt-6 mb-2">
            <button
              onClick={() => setShowEndSessionDialog(false)}
              disabled={isLoading}
              className={cn(
                "flex-1 py-3 px-5 rounded-lg text-base font-medium transition-colors",
                isDarkMode
                  ? "bg-amber-800 hover:bg-amber-700"
                  : "bg-amber-100 hover:bg-amber-200",
              )}
            >
              キャンセル
            </button>
            <button
              onClick={endStudySession}
              disabled={isLoading}
              className={cn(
                "flex-1 py-3 px-5 rounded-lg text-base font-medium transition-colors flex justify-center items-center",
                isDarkMode
                  ? "bg-red-800 hover:bg-red-700 text-red-50"
                  : "bg-red-100 hover:bg-red-200 text-red-800",
                isLoading && "opacity-70 cursor-not-allowed",
              )}
            >
              {isLoading ? (
                "処理中..."
              ) : (
                <>
                  <LogOut className="h-5 w-5 mr-2" />
                  終了する
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 目標達成度 */}
      <div className="mb-4">
        <p className="text-sm mb-1">今日の目標達成度</p>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-green-600 h-2.5 rounded-full"
            style={{ width: `${completionRate || 0}%` }}
          ></div>
        </div>
        <p className="text-right text-sm mt-1">{completionRate || 0}%</p>
      </div>

      {/* 学習時間 */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold">0分</p>
          <p className="text-xs">今日の学習</p>
        </div>
      </div>

      {/* 今日の目標 */}
      <div>
        <h3 className="text-lg font-bold mb-3">今日の目標</h3>
        <ul className="space-y-3 mb-3">
          {goals.map((goal) => (
            <li
              key={goal.id}
              className="flex items-center cursor-pointer"
              onClick={() => toggleGoalCompletion(goal.id)}
            >
              <div
                className={cn(
                  "w-3 h-3 rounded-full mr-2",
                  goal.color === "green"
                    ? "bg-green-500"
                    : goal.color === "orange"
                      ? "bg-orange-500"
                      : "bg-gray-400",
                )}
              ></div>
              <span
                className={cn(goal.completed ? "line-through opacity-70" : "")}
              >
                {goal.text}
              </span>
            </li>
          ))}
        </ul>

        {/* 目標追加フォーム */}
        {isAddingGoal ? (
          <div className="mt-3">
            <input
              type="text"
              className={cn(
                "w-full p-2 rounded-lg text-sm mb-2",
                isDarkMode
                  ? "bg-amber-800 border-amber-700 text-amber-50"
                  : "bg-white border border-amber-200 text-amber-950",
              )}
              placeholder="新しい目標を入力..."
              value={newGoalText}
              onChange={(e) => setNewGoalText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGoal()}
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                className={cn(
                  "px-3 py-1 rounded-lg text-xs",
                  isDarkMode
                    ? "bg-amber-700 hover:bg-amber-600"
                    : "bg-amber-100 hover:bg-amber-200",
                )}
                onClick={() => setIsAddingGoal(false)}
              >
                キャンセル
              </button>
              <button
                className={cn(
                  "px-3 py-1 rounded-lg text-xs",
                  isDarkMode
                    ? "bg-amber-600 hover:bg-amber-500"
                    : "bg-amber-300 hover:bg-amber-400",
                )}
                onClick={addGoal}
              >
                追加
              </button>
            </div>
          </div>
        ) : (
          <button
            className={cn(
              "w-full py-2 rounded-lg text-sm flex items-center justify-center",
              isDarkMode
                ? "bg-amber-800 hover:bg-amber-700"
                : "bg-white border border-amber-200 hover:bg-amber-50",
            )}
            onClick={() => setIsAddingGoal(true)}
          >
            <CirclePlus className="h-4 w-4 mr-1" />
            目標を追加
          </button>
        )}

        {/* 自習を終了するボタン */}
        <button
          onClick={() => setShowEndSessionDialog(true)}
          className="w-full py-3 px-6 rounded-lg flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 transition-colors mt-4 border-2 border-red-300"
        >
          <LogOut className="h-5 w-5 mr-2" />
          <span className="font-medium">自習を終了する</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-2 lucide lucide-arrow-right"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
