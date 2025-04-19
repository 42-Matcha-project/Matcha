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

export default function ProfileEditPage() {
  const router = useRouter();
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
              "Content-Type": "application/json",
            },
            cache: "no-store", // Prevent caching
          },
        );

        if (!response.ok) {
          // 認証エラーの場合はログインページにリダイレクト
          if (response.status === 401) {
            router.push("/login");
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
          setImageKey((prev) => prev + 1); // Increment key to force image refresh
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

      // Check file size
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setWarningMessage(
          "画像サイズが大きすぎます（上限5MB）。より小さい画像を選択してください。",
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
        setImageKey((prev) => prev + 1); // Increment key to force image refresh
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

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      setWarningMessage(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("認証情報がありません");
        return;
      }

      // 画像がアップロードされた場合は、先に画像をアップロードする
      let imageUploaded = false;

      if (formData.iconImage) {
        try {
          console.log("Uploading image to /profile/upload-image...");

          // FormDataオブジェクトの作成
          const imageFormData = new FormData();
          imageFormData.append("image", formData.iconImage);

          // バックエンドのベースURLを表示
          console.log(
            "Backend base URL:",
            process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
          );
          const uploadUrl = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/profile/upload-image`;
          console.log("Full upload URL:", uploadUrl);

          // タイムアウト付きで画像アップロードエンドポイントにPOSTリクエスト
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒タイムアウト

          try {
            const uploadResponse = await fetch(uploadUrl, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                // Content-Typeはブラウザが自動設定するので指定しない
              },
              body: imageFormData,
              signal: controller.signal,
            });

            clearTimeout(timeoutId); // タイムアウトをクリア

            if (!uploadResponse.ok) {
              const errorText = await uploadResponse.text();
              console.error("Image upload failed:", {
                status: uploadResponse.status,
                statusText: uploadResponse.statusText,
                responseBody: errorText,
              });
              throw new Error(
                `画像のアップロードに失敗しました (${uploadResponse.status})`,
              );
            }

            // アップロード成功時の処理
            const uploadResult = await uploadResponse.json();
            console.log("Image upload successful:", uploadResult);
            imageUploaded = true;
          } catch (fetchError: unknown) {
            if (fetchError instanceof Error) {
              if (fetchError.name === "AbortError") {
                console.error("Image upload timed out after 30 seconds");
                throw new Error(
                  "画像のアップロードがタイムアウトしました。ネットワーク接続を確認してください。",
                );
              } else {
                console.error("Fetch error details:", fetchError);
                throw fetchError;
              }
            } else {
              console.error("Unknown fetch error:", fetchError);
              throw new Error(
                "画像のアップロード中に不明なエラーが発生しました",
              );
            }
          } finally {
            clearTimeout(timeoutId);
          }
        } catch (uploadError: unknown) {
          console.error("Image upload error:", uploadError);
          const errorMessage =
            uploadError instanceof Error ? uploadError.message : "不明なエラー";
          setWarningMessage(
            `画像のアップロードに失敗しました: ${errorMessage}。他のプロフィール情報のみ更新します。`,
          );
        }
      }

      // プロフィール情報を更新 (画像をアップロードした場合は、IconImageUrlを送信しない)
      const submitData = {
        DisplayName: formData.displayName,
        TownName: formData.townName,
        Introduction: formData.introduction || null,
      };

      // 画像をアップロードしなかった場合のみ、既存の画像URLを送信
      if (!imageUploaded && !formData.iconImage) {
        // @ts-expect-error - TypeScriptのエラーを無視（動的にプロパティを追加）
        submitData.IconImageUrl = profile?.IconImageURL || "";
      }

      console.log("Submitting profile update with data:", submitData);

      // プロフィール更新エンドポイントにPUTリクエスト
      try {
        const updateUrl = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/profile/update`;
        console.log("Profile update URL:", updateUrl);

        // タイムアウト付きでリクエスト
        const updateController = new AbortController();
        const updateTimeoutId = setTimeout(
          () => updateController.abort(),
          30000,
        ); // 30秒タイムアウト

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

          // 更新失敗時の処理
          if (!updateResponse.ok) {
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

          // Clear caches for profile data
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

          // 全ブラウザキャッシュをクリアするためにlocalStorageにタイムスタンプを保存
          localStorage.setItem("profileUpdated", Date.now().toString());

          // 少し待ってからプロフィールページに戻る
          setTimeout(() => {
            // 遷移時にキャッシュされたデータを使わないようにする
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
        const errorMessage =
          updateError instanceof Error ? updateError.message : "不明なエラー";
        setError(errorMessage);
      } finally {
        setIsSaving(false);
      }
    } catch (error: unknown) {
      console.error("Overall process error:", error);
      setError(
        error instanceof Error ? error.message : "不明なエラーが発生しました",
      );
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
                        key={imageKey}
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
