"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  FileText,
  Upload,
  Loader2,
} from "lucide-react";
import FormField from "@/app/components/FormField";
import Button from "@/app/components/Button";

export default function AddTaskPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageKey, setImageKey] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // フォームの状態
  const [formData, setFormData] = useState({
    workName: "",
    notes: "",
    iconImage: null as File | null,
  });

  // プレビュー用のURL
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    // const token = localStorage.getItem("token");
    // if (!token) {
    //   router.push("/login");
    // }
  }, [router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    // 文字数制限を設定
    let limitedValue = value;
    if (name === "workName" && value.length > 20) {
      limitedValue = value.slice(0, 20);
    } else if (name === "notes" && value.length > 100) {
      limitedValue = value.slice(0, 100);
    }

    setFormData({
      ...formData,
      [name]: limitedValue,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check file size
      if (file.size > 1 * 1024 * 1024) {
        // 1MB limit
        setWarningMessage(
          "画像サイズが大きすぎます（上限1MB）。より小さい画像を選択してください。",
        );
        return;
      }

      setFormData({
        ...formData,
        iconImage: file,
      });

      // プレビュー用URLを作成
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageKey((prev) => prev + 1);
      };
      reader.readAsDataURL(file);

      // 警告メッセージをクリア
      setWarningMessage(null);
    }
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleBackClick = () => {
    router.back();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    if (!formData.workName.trim()) {
      setError("タスク名を入力してください");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      setWarningMessage(null);

      // const token = localStorage.getItem("token");
      // if (!token) {
      //   router.push("/login");
      //   return;
      // }

      // APIにタスクを登録するリクエスト
      const taskData = {
        WorkName: formData.workName,
        Notes: formData.notes || null,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/works/add`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskData),
        },
      );

      // if (!response.ok) {
      //   if (response.status === 401) {
      //     router.push("/login");
      //     return;
      //   }
      // throw new Error(`タスクの登録に失敗しました (${response.status})`);
      // }

      // 成功レスポンスの処理
      const responseData = await response.json();

      // 画像アップロードの処理（もし画像があれば）
      if (formData.iconImage && responseData.WorkID) {
        try {
          setWarningMessage(
            "画像のアップロード機能は現在準備中のため、タスクのみ保存されました。",
          );
          // 画像アップロード機能が実装されたら以下のコードを使用
          // ...画像アップロードのコード...
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          setWarningMessage(
            "画像のアップロードに失敗しましたが、タスクは正常に保存されました。",
          );
        }
      }

      setSuccessMessage("タスクを登録しました！");

      // フォームをリセット
      setFormData({
        workName: "",
        notes: "",
        iconImage: null,
      });
      setImagePreview(null);

      // 少し待ってからプロフィールページに戻る
      setTimeout(() => {
        router.push("/profile");
      }, 2000);
    } catch (error) {
      console.error("タスク登録エラー:", error);
      setError(
        error instanceof Error ? error.message : "不明なエラーが発生しました",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e8f3d8] p-6 text-[#6a6359]">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* ヘッダー */}
        <div className="flex items-center mb-8">
          <button
            onClick={handleBackClick}
            className="mr-4 p-2 rounded-full bg-[#f8eddc] hover:bg-[#f3e6d0] transition-colors border-2 border-[#e4cbac] shadow-md"
          >
            <ArrowLeft size={24} className="text-[#7b6c5d]" />
          </button>
          <div className="relative">
            <h1 className="text-2xl font-bold text-[#7b6c5d]">
              新しいタスクを追加
            </h1>
            <div className="absolute -bottom-1 left-0 right-0 h-[3px] bg-[#bbd894]"></div>
          </div>
        </div>

        {isLoading && !successMessage ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 text-[#8cc750] animate-spin mb-4" />
              <p className="text-lg text-[#7b6c5d] font-medium">
                タスクを登録中<span className="animate-pulse">...</span>
              </p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-[#f8eddc] rounded-xl shadow-lg overflow-hidden border-2 border-[#e4cbac]"
          >
            {/* フォームヘッダー（アイコン、タスク名） */}
            <div className="bg-gradient-to-r from-violet-500 to-violet-400 p-6 text-white">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative w-32 h-32">
                  <div
                    className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-violet-100 relative cursor-pointer"
                    onClick={handleImageButtonClick}
                    title="クリックして画像を選択"
                  >
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="タスクアイコン"
                        fill
                        className="object-cover"
                        key={imageKey}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText size={64} className="text-violet-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Upload size={24} className="text-white" />
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>

                <div className="text-center md:text-left flex-1">
                  <FormField label="タスク名" htmlFor="workName">
                    <input
                      id="workName"
                      name="workName"
                      type="text"
                      value={formData.workName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-md border border-violet-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      placeholder="タスク名を入力"
                      maxLength={20}
                    />
                    <div className="text-xs text-gray-500 mt-1 text-right">
                      {formData.workName.length}/20
                    </div>
                  </FormField>

                  {/* タスク名の警告メッセージ */}
                  <div className="mt-1">
                    {formData.workName.length >= 18 &&
                      formData.workName.length < 20 && (
                        <span className="text-amber-500 text-xs block">
                          制限に近づいています
                        </span>
                      )}
                    {formData.workName.length >= 20 && (
                      <span className="text-red-500 text-xs block">
                        文字数制限に達しました
                      </span>
                    )}
                  </div>

                  <p className="text-violet-100 mt-1">
                    アイコンは任意です。後からでも変更できます。
                  </p>
                </div>
              </div>
            </div>

            {/* フォーム本体 */}
            <div className="p-6 space-y-6">
              {/* メモ */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-[#7b6c5d] border-b pb-2 border-[#e4cbac]">
                  メモ (任意)
                </h3>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-md border border-[#e4cbac] text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[120px]"
                  placeholder="課題や詰まっていることなど、メモを残しておきましょう"
                  maxLength={100}
                />
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {formData.notes.length}/100
                </div>

                {/* メモの警告メッセージ */}
                <div className="mt-1">
                  {formData.notes.length >= 90 &&
                    formData.notes.length < 100 && (
                      <span className="text-amber-500 text-xs block">
                        制限に近づいています
                      </span>
                    )}
                  {formData.notes.length >= 100 && (
                    <span className="text-red-500 text-xs block">
                      文字数制限に達しました
                    </span>
                  )}
                </div>
              </div>

              {/* メッセージ表示エリア */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-start">
                  <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {warningMessage && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded relative flex items-start">
                  <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5 text-yellow-600" />
                  <span>{warningMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    <span>{successMessage}</span>
                  </div>
                  <p className="text-sm mt-2">
                    プロフィールページに戻ります...
                  </p>
                </div>
              )}

              {/* 送信ボタン */}
              <div className="flex justify-end mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleBackClick}
                  className="mr-4 bg-[#e4cbac] hover:bg-[#d9b796]"
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading || !!successMessage}
                  className="bg-violet-600 hover:bg-violet-700 flex items-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      保存中...
                    </>
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      タスクを保存
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
