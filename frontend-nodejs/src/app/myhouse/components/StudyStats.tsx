"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CirclePlus } from "lucide-react";
import { SubjectRegistrationForm } from "./SubjectRegistrationForm";
import { SubjectList } from "./SubjectList";

// 学習目標の型定義
interface StudyGoal {
  id: number;
  text: string;
  completed: boolean;
  color: "green" | "orange" | "gray";
}

// 初期目標データ
const initialGoals: StudyGoal[] = [
  { id: 1, text: "例）数学の問題集 p.25-30", completed: true, color: "green" },
];

interface StudyStatsProps {
  isDarkMode: boolean;
}

export function StudyStats({ isDarkMode }: StudyStatsProps) {
  const [goals, setGoals] = useState<StudyGoal[]>(initialGoals);
  const [newGoalText, setNewGoalText] = useState("");
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [refreshSubjectsTrigger, setRefreshSubjectsTrigger] = useState(0);

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

  return (
    <div
      className={cn(
        "rounded-2xl p-8 mb-8",
        isDarkMode
          ? "bg-amber-900/90 border border-amber-800"
          : "bg-amber-50/95 border border-amber-200",
      )}
    >
      <h2 className="text-xl font-bold mb-4">あなたの学習状態</h2>

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
      </div>
    </div>
  );
}
