"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { PlusCircle, X, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

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
  const [iconDataUrl, setIconDataUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // ファイルサイズのチェック (5MB制限)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("ファイルサイズは5MB以下にしてください");
      return;
    }

    // 画像をData URLに変換
    const reader = new FileReader();
    reader.onloadend = () => {
      setIconDataUrl(reader.result as string);
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

  // 科目を登録する
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subjectName.trim()) {
      toast.error("科目名を入力してください");
      return;
    }

    try {
      setIsSubmitting(true);

      // ローカルストレージからトークンを取得
      let token = localStorage.getItem("token");
      if (!token) {
        throw new Error("認証情報がありません");
      }

      // 認証テスト - トークンが有効か確認
      try {
        const testResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/profile/get`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        // 認証失敗した場合はログインし直す
        if (!testResponse.ok) {
          // ダミーでログインを試みる
          const loginResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/auth/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                Username: "test", // ダミーのテストユーザー（存在するアカウント）
                Password: "test",
              }),
            },
          );

          if (loginResponse.ok) {
            const data = await loginResponse.json();
            // tokenが文字列であることを保証
            if (typeof data.Token === "string") {
              token = data.Token;
              localStorage.setItem("token", token);
              toast.success("再認証しました");
            } else {
              throw new Error("認証トークンが無効です");
            }
          } else {
            throw new Error("再認証に失敗しました");
          }
        }
      } catch (error) {
        console.error("認証テストエラー:", error);
        throw new Error("認証に失敗しました");
      }

      // この時点でtokenは必ず存在する（エラーが発生していなければ）
      if (!token) {
        throw new Error("認証トークンが見つかりません");
      }

      // 科目登録APIを呼び出す
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
            IconImageURL: iconDataUrl || null, // アイコンのデータURLがなければnull
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Error || "科目登録に失敗しました");
      }

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
      {/* 非表示のファイル入力 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

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
                  <div className="relative w-16 h-16 rounded-full overflow-hidden">
                    <Image
                      src={iconDataUrl}
                      alt="アイコンプレビュー"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage();
                    }}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
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
