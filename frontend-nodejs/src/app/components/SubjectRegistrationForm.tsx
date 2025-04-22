"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

interface SubjectRegistrationFormProps {
  isDarkMode: boolean;
  onSubjectAdded: () => void;
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

  // フォームをリセットする
  const resetForm = () => {
    setSubjectName("");
    setIconDataUrl(null);
    setIsFormOpen(false);
    setIsDragging(false);
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

  // フォーム送信ハンドラ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subjectName.trim()) {
      toast.error("タスク名を入力してください");
      return;
    }

    try {
      setIsSubmitting(true);

      // トークンを取得
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("ログインが必要です");
        return;
      }

      // リクエストデータの作成
      const requestData = {
        WorkName: subjectName.trim(),
        IconImageURL: iconDataUrl || "",
      };

      // APIリクエストの送信
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/works/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestData),
        },
      );

      // レスポンスのデバッグ
      const responseData = await response.json();

      if (!response.ok) {
        // エラーメッセージを詳細に設定
        let errorMessage = "タスクの追加に失敗しました";
        if (responseData && responseData.Message) {
          errorMessage = responseData.Message;
        } else if (response.status === 401 || response.status === 403) {
          errorMessage =
            "認証エラー: セッションが切れている可能性があります。再ログインしてください。";
        } else if (response.status === 404) {
          errorMessage = "APIエンドポイントが見つかりません。";
        } else if (response.status >= 500) {
          errorMessage =
            "サーバーエラー: しばらく時間をおいて再試行してください。";
        }
        throw new Error(errorMessage);
      }

      // 成功時の処理
      toast.success("タスクを追加しました");
      resetForm();
      onSubjectAdded(); // 親コンポーネントに通知
    } catch (error) {
      console.error("タスク追加エラー:", error);
      toast.error(
        error instanceof Error ? error.message : "タスクの追加に失敗しました",
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
        タスク登録
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
          <span className="font-medium">新しいタスクを登録</span>
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
              タスクアイコン
            </label>
            <div
              className={cn(
                "mt-2 border-2 border-dashed rounded-lg p-4 text-center transition-all",
                isDarkMode
                  ? "border-amber-600/50 hover:border-amber-500"
                  : "border-amber-300 hover:border-amber-400",
                isDragging && "border-amber-400 bg-amber-100/20",
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {iconDataUrl ? (
                <div className="space-y-2">
                  <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-amber-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={iconDataUrl}
                      alt="タスクアイコン"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex justify-center space-x-2">
                    <button
                      type="button"
                      onClick={handleSelectImageClick}
                      className={cn(
                        "px-3 py-1 rounded text-xs",
                        isDarkMode
                          ? "bg-amber-700 hover:bg-amber-600 text-white"
                          : "bg-amber-200 hover:bg-amber-300",
                      )}
                    >
                      変更
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className={cn(
                        "px-3 py-1 rounded text-xs",
                        isDarkMode
                          ? "bg-red-700 hover:bg-red-600 text-white"
                          : "bg-red-100 hover:bg-red-200 text-red-700",
                      )}
                    >
                      削除
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={handleSelectImageClick}
                  className="cursor-pointer"
                >
                  <p className="text-sm opacity-70 mb-2">
                    画像をドラッグ＆ドロップ
                  </p>
                  <button
                    type="button"
                    className={cn(
                      "px-3 py-1 rounded text-xs",
                      isDarkMode
                        ? "bg-amber-700 hover:bg-amber-600 text-white"
                        : "bg-amber-200 hover:bg-amber-300",
                    )}
                  >
                    画像を選択
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs opacity-60 mt-1">JPG、PNG、GIF（1MB以下）</p>
          </div>

          <div className="flex justify-end space-x-2 pt-3">
            <button
              type="button"
              onClick={resetForm}
              className={cn(
                "px-4 py-2 rounded-lg text-sm",
                isDarkMode
                  ? "text-amber-200 hover:bg-amber-700/50"
                  : "text-amber-800 hover:bg-amber-100",
              )}
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className={cn(
                "px-6 py-2 rounded-lg text-sm flex items-center",
                isDarkMode
                  ? "bg-amber-600 hover:bg-amber-500 text-white"
                  : "bg-amber-500 hover:bg-amber-600 text-white",
                isSubmitting && "opacity-70 cursor-not-allowed",
              )}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2">送信中...</span>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
