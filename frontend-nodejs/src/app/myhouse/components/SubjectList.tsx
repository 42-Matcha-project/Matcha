"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { BookOpen, RefreshCw } from "lucide-react";
import { SmilePlusIcon, TrashIcon } from "lucide-react";

// 科目（Work）の型定義
interface Subject {
  ID: number;
  WorkName: string;
  IconImageURL: string;
}

interface SubjectListProps {
  isDarkMode: boolean;
  refreshTrigger?: number; // 親コンポーネントからのリフレッシュトリガー
  isPanelExpanded?: boolean;
}

export function SubjectList({
  isDarkMode,
  refreshTrigger = 0,
  isPanelExpanded = true,
}: SubjectListProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 科目リストを取得する
  const fetchSubjects = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("認証情報がありません");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/works/get`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("科目リストの取得に失敗しました");
      }

      const data = await response.json();
      setSubjects(data.Works || []);
    } catch (error) {
      console.error("科目リスト取得エラー:", error);
      setError(error instanceof Error ? error.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  // コンポーネントマウント時とリフレッシュトリガー変更時に科目リストを取得
  useEffect(() => {
    fetchSubjects();
  }, [refreshTrigger]);

  // 手動リフレッシュ
  const handleRefresh = () => {
    fetchSubjects();
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold">登録済み科目</h3>
        <button
          onClick={handleRefresh}
          className={cn(
            "text-xs px-2 py-1 rounded-full flex items-center",
            isDarkMode
              ? "bg-amber-800 hover:bg-amber-700"
              : "bg-amber-100 hover:bg-amber-200",
          )}
          disabled={isLoading}
        >
          <RefreshCw
            className={cn("h-3 w-3 mr-1", isLoading && "animate-spin")}
          />
          更新
        </button>
      </div>

      {error && (
        <div className="p-3 mb-3 text-sm rounded-lg bg-red-100 text-red-800">
          {error}
        </div>
      )}

      {isLoading && subjects.length === 0 ? (
        <div className="p-4 text-center">
          <RefreshCw className="h-6 w-6 mx-auto mb-2 animate-spin opacity-50" />
          <p className="text-sm opacity-70">科目を読み込み中...</p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="p-4 text-center bg-amber-100/30 rounded-lg">
          <BookOpen className="h-6 w-6 mx-auto mb-2 opacity-50" />
          <p className="text-sm opacity-70">登録されている科目はありません</p>
          <p className="text-xs opacity-50 mt-1">
            「科目登録」から新しい科目を追加してください
          </p>
        </div>
      ) : (
        <ul className="space-y-2 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-transparent will-change-transform">
          {subjects.map((subject, index) => (
            <li
              key={subject.ID}
              className={cn(
                "p-3 rounded-lg flex items-center transition-all ease-in-out duration-300",
                "animate-fadeIn",
                isDarkMode
                  ? "bg-amber-800/60 hover:bg-amber-800/80"
                  : "bg-white hover:bg-amber-50 border border-amber-100",
              )}
              style={{
                animationDelay: `${index * 50}ms`,
                transform: `translateY(${isPanelExpanded ? "0" : "10px"})`,
                opacity: isPanelExpanded ? 1 : 0,
              }}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                  isDarkMode ? "bg-amber-700" : "bg-amber-100",
                )}
              >
                {subject.IconImageURL ? (
                  <img
                    src={subject.IconImageURL}
                    alt=""
                    className="w-6 h-6 object-cover rounded-full"
                  />
                ) : (
                  <BookOpen className="h-4 w-4 opacity-70" />
                )}
              </div>
              <span className="font-medium">{subject.WorkName}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
