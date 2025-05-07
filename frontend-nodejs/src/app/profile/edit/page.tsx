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
import { UserProfile } from "@/types/profile";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfileEditPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageKey, setImageKey] = useState<number>(0);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // フォームの状態
  const [formData, setFormData] = useState({
    displayName: "",
    townName: "",
    introduction: "",
    email: "", // 表示用のみで更新には使用しない
    iconImage: null as File | null,
  });

  // プレビュー用のURL
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    // if (!isAuthenticated) {
    //   router.push("/login");
    //   return;
    // }

    // 認証済みの場合のみプロフィール取得を実行
    if (!authLoading && isAuthenticated) {
      fetchProfile(token);
    }
  }, [isAuthenticated, authLoading, router, token]);

  // プロフィール情報を取得する関数
  const fetchProfile = async (token: string | null) => {
    try {
      setIsLoading(true);

      if (!token) {
        setError("認証情報がありません。ログインしてください。");
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/profile/get`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store", // Prevent caching
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          setError("認証が切れています。再度ログインしてください。");
          setIsLoading(false);
          return;
        }
        throw new Error("プロフィールの取得に失敗しました");
      }

      const data = await response.json();

      // データの存在確認とフォーマット検証を柔軟に行う
      const userData = data.Me || data.User || data.user || data;

      if (
        !userData ||
        (typeof userData === "object" && Object.keys(userData).length === 0)
      ) {
        throw new Error("プロフィールデータが見つかりません");
      }

      setProfile(userData);

      // フォームデータを初期化
      const initialFormData = {
        displayName: userData.DisplayName || userData.displayName || "",
        townName: userData.TownName || userData.townName || "",
        introduction: userData.Introduction || userData.introduction || "",
        email: userData.Email || userData.email || "",
        iconImage: null,
      };

      setFormData(initialFormData);

      // 画像プレビューを設定
      if (userData.IconImageURL || userData.iconImageURL) {
        setImagePreview(userData.IconImageURL || userData.iconImageURL);
        setImageKey((prev) => prev + 1);
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
    const warningMsg =
      "画像のアップロード機能は現在準備中です。しばらくお待ちください。";
    setWarningMessage(warningMsg);
    e.target.value = "";
  };

  const handleImageButtonClick = () => {
    const warningMsg =
      "画像のアップロード機能は現在準備中です。しばらくお待ちください。";
    setWarningMessage(warningMsg);
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
      setWarningMessage(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("認証情報がありません。ログインしてください。");
        setIsSaving(false);
        return;
      }

      const imageUploaded = false;

      if (formData.iconImage) {
        setWarningMessage(
          "画像のアップロード機能は現在準備中です。他のプロフィール情報のみ更新します。",
        );
      }

      // プロフィール情報を更新
      const submitData: {
        DisplayName: string;
        TownName: string;
        Introduction: string | null;
        IconImageUrl?: string;
      } = {
        DisplayName: formData.displayName,
        TownName: formData.townName,
        Introduction: formData.introduction || null,
      };

      if (!imageUploaded && !formData.iconImage && profile?.IconImageURL) {
        submitData.IconImageUrl = profile.IconImageURL;
      }

      try {
        const updateUrl = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/profile/update`;

        const updateController = new AbortController();
        const updateTimeoutId = setTimeout(
          () => updateController.abort(),
          30000,
        );

        try {
          const updateResponse = await fetch(updateUrl, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(submitData),
            signal: updateController.signal,
          });

          clearTimeout(updateTimeoutId);

          if (!updateResponse.ok) {
            if (updateResponse.status === 401) {
              setError("認証が切れています。再度ログインしてください。");
              setIsSaving(false);
              return;
            }

            const errorText = await updateResponse.text();
            console.error("Profile update failed:", {
              status: updateResponse.status,
              statusText: updateResponse.statusText,
              responseBody: errorText,
            });
            throw new Error(
              `プロフィールの更新に失敗しました (${updateResponse.status}: ${updateResponse.statusText})`,
            );
          }

          console.log("Profile update successful");

          if ("caches" in window) {
            try {
              const cache = await caches.open("next-data");
              const profileCacheKeys = await cache.keys();
              const profileKeys = profileCacheKeys.filter(
                (key) =>
                  key.url.includes("/profile/get") ||
                  key.url.includes("/profile/update"),
              );

              for (const key of profileKeys) {
                await cache.delete(key);
              }
            } catch (err) {
              console.error("Failed to clear cache:", err);
            }
          }

          setSuccessMessage("プロフィール情報を更新しました");

          localStorage.setItem("profileUpdated", Date.now().toString());

          setTimeout(() => {
            router.push("/profile?t=" + Date.now());
          }, 2000);
        } catch (fetchError: unknown) {
          clearTimeout(updateTimeoutId);
          if (fetchError instanceof Error) {
            if (fetchError.name === "AbortError") {
              throw new Error(
                "プロフィール更新がタイムアウトしました。ネットワーク接続を確認してください。",
              );
            } else {
              throw fetchError;
            }
          } else {
            throw new Error("プロフィール更新中に不明なエラーが発生しました");
          }
        }
      } catch (updateError: unknown) {
        console.error("Profile update error:", updateError);

        if (
          updateError instanceof Error &&
          (updateError.message.includes("401") ||
            updateError.message.toLowerCase().includes("unauthorized") ||
            updateError.message.includes("認証"))
        ) {
          router.push("/login");
          return;
        }

        const errorMessage =
          updateError instanceof Error ? updateError.message : "不明なエラー";
        setError(errorMessage);
      } finally {
        setIsSaving(false);
      }
    } catch (error: unknown) {
      console.error("Overall process error:", error);

      if (
        error instanceof Error &&
        (error.message.includes("401") ||
          error.message.toLowerCase().includes("unauthorized") ||
          error.message.includes("認証"))
      ) {
        router.push("/login");
        return;
      }

      setError(
        error instanceof Error ? error.message : "不明なエラーが発生しました",
      );
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100">
      <div className="container mx-auto px-2 sm:px-4 md:px-8 py-4 sm:py-8 max-w-lg sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <div className="flex items-center mb-6 sm:mb-8">
          <button
            onClick={handleBackClick}
            className="mr-2 sm:mr-4 p-2 rounded-full bg-amber-200 hover:bg-amber-300 transition-colors"
          >
            <ArrowLeft size={24} className="text-amber-800" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-amber-900">
            プロフィール編集
          </h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-48 sm:h-64">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-amber-500"></div>
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
            <div className="bg-gradient-to-r from-amber-500 to-amber-400 p-4 sm:p-6 text-white">
              <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                  <div
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-amber-100 relative cursor-not-allowed"
                    onClick={handleImageButtonClick}
                    title="画像のアップロード機能は現在準備中です"
                  >
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="ユーザーアイコン"
                        fill
                        className="object-cover"
                        key={imageKey}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="text-amber-300 w-12 h-12 sm:w-16 sm:h-16" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Upload
                        size={20}
                        className="text-white mb-1 opacity-50"
                      />
                      <span className="text-white text-xs text-center px-1">
                        準備中
                      </span>
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

                <div className="text-center md:text-left flex-1 w-full">
                  <FormField label="表示名" htmlFor="displayName">
                    <input
                      id="displayName"
                      name="displayName"
                      type="text"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 rounded-md border border-amber-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-base sm:text-lg"
                      placeholder="表示名を入力"
                      maxLength={15}
                    />
                    <div className="text-xs text-gray-200 mt-1 text-right">
                      {formData.displayName.length}/15
                    </div>
                    {formData.displayName.length >= 13 &&
                      formData.displayName.length < 15 && (
                        <span className="text-amber-100 text-xs ml-2">
                          制限に近づいています
                        </span>
                      )}
                    {formData.displayName.length >= 15 && (
                      <span className="text-red-200 text-xs ml-2">
                        文字数制限に達しました
                      </span>
                    )}
                  </FormField>
                  <p className="text-amber-100 mt-1 break-all text-xs sm:text-sm">
                    @{profile.Username}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg sm:text-xl font-semibold text-amber-800 border-b pb-2 border-amber-200">
                  基本情報
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <FormField label="メールアドレス" htmlFor="email">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Mail className="text-amber-500" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 rounded-md border border-amber-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-90 disabled:bg-amber-50 disabled:text-gray-700 disabled:font-medium text-base"
                        placeholder="メールアドレスを入力"
                        disabled
                      />
                    </div>
                  </FormField>

                  <FormField label="街の名前" htmlFor="townName">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <MapPin className="text-amber-500" />
                      <input
                        id="townName"
                        name="townName"
                        type="text"
                        value={formData.townName}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 rounded-md border border-amber-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500 text-base"
                        placeholder="あなたの街の名前を入力"
                        maxLength={25}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1 text-right">
                      {formData.townName.length}/25
                    </div>
                    {formData.townName.length >= 22 &&
                      formData.townName.length < 25 && (
                        <span className="text-amber-500 text-xs ml-2">
                          制限に近づいています
                        </span>
                      )}
                    {formData.townName.length >= 25 && (
                      <span className="text-red-500 text-xs ml-2">
                        文字数制限に達しました
                      </span>
                    )}
                  </FormField>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg sm:text-xl font-semibold text-amber-800 border-b pb-2 border-amber-200">
                  自己紹介
                </h3>
                <textarea
                  id="introduction"
                  name="introduction"
                  value={formData.introduction}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 rounded-md border border-amber-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[100px] sm:min-h-[120px] text-base"
                  placeholder="自己紹介を入力してください"
                  maxLength={200}
                />
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {formData.introduction.length}/200
                </div>
                {formData.introduction.length >= 180 &&
                  formData.introduction.length < 200 && (
                    <span className="text-amber-500 text-xs ml-2">
                      制限に近づいています
                    </span>
                  )}
                {formData.introduction.length >= 200 && (
                  <span className="text-red-500 text-xs ml-2">
                    文字数制限に達しました
                  </span>
                )}
              </div>

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
                  <span>{successMessage}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end mt-6 gap-2 sm:gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleBackClick}
                  className="mb-2 sm:mb-0 sm:mr-4"
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
