"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { PlusCircle, X, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface SubjectRegistrationFormProps {
  isDarkMode: boolean;
  onSubjectAdded?: (task: {
    WorkName: string;
    IconImageURL: string | null;
    notes?: string;
  }) => void;
}

export function SubjectRegistrationForm({
  isDarkMode,
  onSubjectAdded,
}: SubjectRegistrationFormProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [iconDataUrl, setIconDataUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 警告メッセージの状態
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  // 最大文字数を定義
  const MAX_SUBJECT_NAME_LENGTH = 20;
  // 表示する警告の閾値を調整
  const WARNING_THRESHOLD = Math.floor(MAX_SUBJECT_NAME_LENGTH * 0.8); // 80%で警告

  const [noteText, setNoteText] = useState("");

  // フォームをリセットする
  const resetForm = () => {
    setSubjectName("");
    setIconDataUrl(null);
    setIsFormOpen(false);
    setIsDragging(false);
    setNoteText("");
  };

  // 画像ファイルを処理する
  const processImageFile = (file: File) => {
    // バリデーション
    if (!file.type.startsWith("image/")) {
      toast.error("画像ファイルのみアップロードできます");
      return;
    }

    // ファイルサイズのチェック (1MB制限に縮小)
    const maxSize = 1 * 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      toast.error("ファイルサイズは1MB以下にしてください");
      return;
    }

    // 画像をData URLに変換（サイズ制限あり）
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        // 画像のデータURLをセット（文字列であることを確認）
        setIconDataUrl(reader.result);
      } else {
        toast.error("画像の読み込みに失敗しました");
      }
    };
    reader.onerror = () => {
      toast.error("画像の読み込みに失敗しました");
    };
    reader.readAsDataURL(file);
  };

  // ドラッグ＆ドロップのイベントハンドラ
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processImageFile(file);
    }
  };

  // ファイル選択のイベントハンドラ
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processImageFile(file);
      e.target.value = ""; // リセット
    }
  };

  // 「画像選択」ボタンのクリックハンドラ
  const handleSelectImageClick = () => {
    fileInputRef.current?.click();
  };

  // 選択された画像を削除する
  const handleRemoveImage = () => {
    setIconDataUrl(null);
  };

  // 入力フィールドの変更ハンドラ
  const handleSubjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // 現在の文字数が最大を超えているか確認
    if (value.length > MAX_SUBJECT_NAME_LENGTH) {
      // 警告メッセージを設定して表示
      setWarningMessage(
        `このテキストを${MAX_SUBJECT_NAME_LENGTH}文字以下にしてください（現時点で ${value.length} 文字です）。`,
      );
      setShowWarning(true);
      // 最大文字数に制限
      setSubjectName(value.slice(0, MAX_SUBJECT_NAME_LENGTH));
    } else {
      setSubjectName(value);
      // 警告を非表示
      setShowWarning(false);
    }
  };

  // タスクを登録する
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) {
      toast.error("タスク名を入力してください");
      return;
    }

    try {
      setIsSubmitting(true);

      // ローカルストレージからトークンを取得
      const token = localStorage.getItem("token");

      // タスク登録APIを呼び出す
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
            // 画像URLが長すぎる場合は省略（サーバーの許容範囲内に制限）
            IconImageURL: iconDataUrl
              ? iconDataUrl.length > 100000
                ? null
                : iconDataUrl
              : null,
            notes: noteText.trim() || undefined,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Error || "タスク登録に失敗しました");
      }

      toast.success("タスクを登録しました");
      resetForm();

      // コールバック関数があれば実行（親コンポーネントでタスクリストを更新するなど）
      if (onSubjectAdded) {
        onSubjectAdded({
          WorkName: subjectName,
          IconImageURL: iconDataUrl,
          notes: noteText.trim() || undefined,
        });
      }
    } catch (error) {
      console.error("タスク登録エラー:", error);
      toast.error(
        error instanceof Error ? error.message : "タスク登録に失敗しました",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl p-6 mb-6 shadow-md",
        isDarkMode
          ? "bg-amber-800/90 border border-amber-700 text-amber-50"
          : "bg-white border border-amber-200 text-amber-900",
      )}
    >
      {/* 非表示のファイル入力 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <h3 className="text-xl font-bold mb-4 border-b pb-2 border-amber-200">
        科目登録
      </h3>

      {!isFormOpen ? (
        <button
          onClick={() => setIsFormOpen(true)}
          className={cn(
            "w-full py-3 flex items-center justify-center gap-2 rounded-lg transition-all",
            isDarkMode
              ? "bg-amber-700 hover:bg-amber-600 text-white"
              : "bg-amber-500 hover:bg-amber-600 text-white",
          )}
        >
          <PlusCircle className="h-5 w-5" />
          <span className="font-medium">新しい科目を登録</span>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              タスク名 <span className="text-red-500">*</span>
            </label>
            {showWarning && (
              <div className="bg-gray-700 text-white p-3 rounded mb-2 relative">
                {warningMessage}
                <button
                  onClick={() => setShowWarning(false)}
                  className="absolute top-2 right-2 text-white"
                >
                  ✕
                </button>
              </div>
            )}
            <input
              type="text"
              value={subjectName}
              onChange={handleSubjectNameChange}
              className={cn(
                "w-full p-2 rounded-lg text-sm",
                isDarkMode
                  ? "bg-amber-800 border-amber-700 text-amber-50"
                  : "bg-white border border-amber-200 text-amber-950",
              )}
              placeholder="例：数学、英語、プログラミング"
              disabled={isSubmitting}
              maxLength={MAX_SUBJECT_NAME_LENGTH}
            />
            <div className="text-xs text-right mt-1">
              {subjectName.length}/{MAX_SUBJECT_NAME_LENGTH}
              {subjectName.length >= WARNING_THRESHOLD &&
                subjectName.length < MAX_SUBJECT_NAME_LENGTH && (
                  <span className="text-amber-500 ml-2">
                    制限に近づいています
                  </span>
                )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              アイコン画像（任意）
            </label>

            {/* アイコンのプレビューまたはドロップエリア */}
            <div
              className={cn(
                "w-full h-24 rounded-lg border-2 border-dashed transition-colors flex items-center justify-center",
                isDarkMode
                  ? "bg-amber-800/30 hover:bg-amber-800/50 border-amber-700"
                  : "bg-amber-50 hover:bg-amber-100 border-amber-200",
                isDragging && "border-amber-400 bg-amber-100",
                "cursor-pointer",
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleSelectImageClick}
            >
              {iconDataUrl ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-amber-300">
                    <Image
                      src={iconDataUrl}
                      alt="アイコンプレビュー"
                      fill
                      className="object-cover"
                      unoptimized={true}
                      onError={(e) => {
                        // 画像読み込みエラー時にプレースホルダーを表示
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; // エラーループ防止
                        target.src = "/images/no-image.png";
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage();
                    }}
                    className="absolute top-1 right-1 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 shadow-md"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <UploadCloud
                    className={cn(
                      "w-8 h-8 mx-auto mb-1",
                      isDarkMode ? "text-amber-400" : "text-amber-500",
                    )}
                  />
                  <p className="text-xs">
                    クリックするか画像をドロップしてアイコンを設定
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              メモ（任意）
            </label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className={cn(
                "w-full p-2 rounded-lg text-sm border border-amber-200",
                isDarkMode
                  ? "bg-amber-800 text-amber-50"
                  : "bg-white text-amber-950",
              )}
              placeholder="このタスクのメモや補足を入力"
              rows={2}
              maxLength={100}
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
