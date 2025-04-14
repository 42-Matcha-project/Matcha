"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { PlusCircle, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SubjectRegistrationFormProps {
  isDarkMode: boolean;
  onSubjectAdded?: () => void;
}

export function SubjectRegistrationForm({
  isDarkMode,
  onSubjectAdded,
}: SubjectRegistrationFormProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // フォームをリセットする
  const resetForm = () => {
    setSubjectName("");
    setIconUrl("");
    setIsFormOpen(false);
  };

  // 科目を登録する
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subjectName.trim()) {
      toast.error("科目名を入力してください");
      return;
    }

    try {
      setIsSubmitting(true);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("認証情報がありません");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/works/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            WorkName: subjectName,
            IconImageURL: iconUrl || null, // アイコンURLがなければnull
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Error || "科目登録に失敗しました");
      }

      const data = await response.json();

      toast.success("科目を登録しました");
      resetForm();

      // コールバック関数があれば実行（親コンポーネントで科目リストを更新するなど）
      if (onSubjectAdded) {
        onSubjectAdded();
      }
    } catch (error) {
      console.error("科目登録エラー:", error);
      toast.error(
        error instanceof Error ? error.message : "科目登録に失敗しました",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold">科目登録</h3>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className={cn(
            "text-xs px-2 py-1 rounded-full flex items-center",
            isDarkMode
              ? "bg-amber-800 hover:bg-amber-700"
              : "bg-amber-100 hover:bg-amber-200",
          )}
        >
          {isFormOpen ? (
            <>
              <X className="h-3 w-3 mr-1" />
              閉じる
            </>
          ) : (
            <>
              <PlusCircle className="h-3 w-3 mr-1" />
              追加
            </>
          )}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              科目名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className={cn(
                "w-full p-2 rounded-lg text-sm",
                isDarkMode
                  ? "bg-amber-800 border-amber-700 text-amber-50"
                  : "bg-white border border-amber-200 text-amber-950",
              )}
              placeholder="例：数学、英語、プログラミング"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              アイコンURL（任意）
            </label>
            <input
              type="text"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              className={cn(
                "w-full p-2 rounded-lg text-sm",
                isDarkMode
                  ? "bg-amber-800 border-amber-700 text-amber-50"
                  : "bg-white border border-amber-200 text-amber-950",
              )}
              placeholder="https://example.com/icon.png"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={resetForm}
              className={cn(
                "px-3 py-1 rounded-lg text-xs",
                isDarkMode
                  ? "bg-amber-700 hover:bg-amber-600"
                  : "bg-amber-100 hover:bg-amber-200",
              )}
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className={cn(
                "px-3 py-1 rounded-lg text-xs flex items-center",
                isDarkMode
                  ? "bg-amber-600 hover:bg-amber-500"
                  : "bg-amber-300 hover:bg-amber-400",
              )}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  登録中...
                </>
              ) : (
                "登録する"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
