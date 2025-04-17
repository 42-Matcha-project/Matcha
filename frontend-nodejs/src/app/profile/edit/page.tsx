"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  User,
  Mail,
  MapPin,
  Save,
  AlertCircle,
  Upload,
} from "lucide-react";
import FormField from "@/app/components/FormField";
import Button from "@/app/components/Button";
import TagSelector from "@/app/components/TagSelector";
import { UserProfile } from "@/types/profile";

export default function ProfileEditPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // フォームの状態
  const [formData, setFormData] = useState({
    displayName: "",
    townName: "",
    introduction: "",
    email: "",
    iconImage: null as File | null,
  });

  // プレビュー用のURL
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 趣味タグ（カスタマイズ可能）
  const availableTags = [
    "読書",
    "映画鑑賞",
    "音楽",
    "ゲーム",
    "スポーツ",
    "料理",
    "旅行",
    "プログラミング",
    "アウトドア",
    "アート",
  ];
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          setError("認証情報がありません");
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/profile/get`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          // 認証エラーの場合はホームページにリダイレクト
          if (response.status === 401) {
            router.push("/");
            return;
          }
          throw new Error("プロフィールの取得に失敗しました");
        }

        const data = await response.json();
        setProfile(data.User);

        // フォームデータを初期化
        setFormData({
          displayName: data.User.DisplayName || "",
          townName: data.User.TownName || "",
          introduction: data.User.Introduction || "",
          email: data.User.Email || "",
          iconImage: null,
        });

        // 画像プレビューを設定
        if (data.User.IconImageURL) {
          setImagePreview(data.User.IconImageURL);
        }

        // タグがAPIから返された場合はここで設定
        if (data.User.Tags && Array.isArray(data.User.Tags)) {
          setSelectedTags(data.User.Tags);
        }
      } catch (error) {
        console.error("プロフィール取得エラー:", error);
        setError(
          error instanceof Error ? error.message : "不明なエラーが発生しました",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        iconImage: file,
      });

      // プレビュー用URLを作成
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("認証情報がありません");
        return;
      }

      // FormDataオブジェクトを作成
      const submitData = new FormData();
      submitData.append("DisplayName", formData.displayName);
      submitData.append("TownName", formData.townName);
      submitData.append("Introduction", formData.introduction);

      // タグがある場合は追加
      if (selectedTags.length > 0) {
        submitData.append("Tags", JSON.stringify(selectedTags));
      }

      // 画像がある場合は追加
      if (formData.iconImage) {
        submitData.append("IconImage", formData.iconImage);
      }

      // APIエンドポイントを使用してプロフィールを更新
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/profile/update`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: submitData,
        },
      );

      if (!response.ok) {
        throw new Error("プロフィールの更新に失敗しました");
      }

      setSuccessMessage("プロフィールを更新しました");

      // 少し待ってからプロフィールページに戻る
      setTimeout(() => {
        router.push("/profile");
      }, 2000);
    } catch (error) {
      console.error("プロフィール更新エラー:", error);
      setError(
        error instanceof Error ? error.message : "不明なエラーが発生しました",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* ヘッダー */}
        <div className="flex items-center mb-8">
          <button
            onClick={handleBackClick}
            className="mr-4 p-2 rounded-full bg-amber-200 hover:bg-amber-300 transition-colors"
          >
            <ArrowLeft size={24} className="text-amber-800" />
          </button>
          <h1 className="text-2xl font-bold text-amber-900">
            プロフィール編集
          </h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : error && !profile ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">エラー: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : profile ? (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            {/* フォームヘッダー（アイコン、名前） */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-400 p-6 text-white">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative w-32 h-32">
                  <div
                    className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-amber-100 relative cursor-pointer"
                    onClick={handleImageButtonClick}
                  >
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="ユーザーアイコン"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User size={64} className="text-amber-300" />
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
                  <FormField label="表示名" htmlFor="displayName">
                    <input
                      id="displayName"
                      name="displayName"
                      type="text"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-md border border-amber-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="表示名を入力"
                    />
                  </FormField>
                  <p className="text-amber-100 mt-1">@{profile.Username}</p>
                </div>
              </div>
            </div>

            {/* フォーム本体 */}
            <div className="p-6 space-y-6">
              {/* 基本情報 */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-amber-800 border-b pb-2 border-amber-200">
                  基本情報
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="メールアドレス" htmlFor="email">
                    <div className="flex items-center gap-3">
                      <Mail className="text-amber-500" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-md border border-amber-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="メールアドレスを入力"
                        disabled // メールアドレスは変更不可
                      />
                    </div>
                  </FormField>

                  <FormField label="街の名前" htmlFor="townName">
                    <div className="flex items-center gap-3">
                      <MapPin className="text-amber-500" />
                      <input
                        id="townName"
                        name="townName"
                        type="text"
                        value={formData.townName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-md border border-amber-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="あなたの街の名前を入力"
                      />
                    </div>
                  </FormField>
                </div>
              </div>

              {/* 自己紹介 */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-amber-800 border-b pb-2 border-amber-200">
                  自己紹介
                </h3>
                <textarea
                  id="introduction"
                  name="introduction"
                  value={formData.introduction}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-md border border-amber-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[120px]"
                  placeholder="自己紹介を入力してください"
                />
              </div>

              {/* 趣味・タグ */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-amber-800 border-b pb-2 border-amber-200">
                  趣味・興味
                </h3>
                <p className="text-sm text-gray-600">
                  興味のあるものを選択してください (複数選択可)
                </p>
                <TagSelector
                  availableTags={availableTags}
                  selectedTags={selectedTags}
                  onChange={setSelectedTags}
                />
              </div>

              {/* メッセージ表示エリア */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-start">
                  <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                  <span>{successMessage}</span>
                </div>
              )}

              {/* 送信ボタン */}
              <div className="flex justify-end mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleBackClick}
                  className="mr-4"
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSaving}
                  className="bg-amber-600 hover:bg-amber-700 flex items-center"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      保存中...
                    </>
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      プロフィールを保存
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-amber-100 p-6 rounded-lg text-center">
            <p>プロフィール情報が見つかりません</p>
          </div>
        )}
      </div>
    </div>
  );
}
