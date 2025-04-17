"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  User,
  Mail,
  MapPin,
  Edit,
  Settings,
  LogOut,
} from "lucide-react";
import { UserProfile } from "@/types/profile";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleBackClick = () => {
    router.back();
  };

  const handleEditClick = () => {
    router.push("/profile/edit");
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
          <h1 className="text-2xl font-bold text-amber-900">プロフィール</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">エラー: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : profile ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* プロフィールヘッダー */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-400 p-6 text-white">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-amber-100">
                  {profile.IconImageURL ? (
                    <Image
                      src={profile.IconImageURL}
                      alt={profile.DisplayName || "ユーザー"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={64} className="text-amber-300" />
                    </div>
                  )}
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-bold">
                    {profile.DisplayName || "名前未設定"}
                  </h2>
                  <p className="text-amber-100">@{profile.Username}</p>
                </div>
              </div>
            </div>

            {/* プロフィール情報 */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 基本情報 */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-amber-800 border-b pb-2 border-amber-200">
                    基本情報
                  </h3>

                  <div className="flex items-center gap-3">
                    <Mail className="text-amber-500" />
                    <div>
                      <p className="text-sm text-gray-500">メールアドレス</p>
                      <p>{profile.Email}</p>
                    </div>
                  </div>

                  {profile.TownName && (
                    <div className="flex items-center gap-3">
                      <MapPin className="text-amber-500" />
                      <div>
                        <p className="text-sm text-gray-500">街の名前</p>
                        <p>{profile.TownName}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 自己紹介 */}
                <div>
                  <h3 className="text-xl font-semibold text-amber-800 border-b pb-2 border-amber-200">
                    自己紹介
                  </h3>
                  <p className="mt-3 text-gray-700">
                    {profile.Introduction || "自己紹介は設定されていません"}
                  </p>
                </div>
              </div>

              {/* コイン */}
              <div className="mt-8 p-4 bg-amber-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-amber-800">
                      コイン
                    </h3>
                    <p className="text-gray-600">学習で獲得したコイン数</p>
                  </div>
                  <div className="text-2xl font-bold text-amber-600">
                    {profile.CoinCount || 0} コイン
                  </div>
                </div>
              </div>

              {/* アクションボタン */}
              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={handleEditClick}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                >
                  <Edit size={18} />
                  プロフィール編集
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors">
                  <Settings size={18} />
                  設定
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors">
                  <LogOut size={18} />
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-100 p-6 rounded-lg text-center">
            <p>プロフィール情報が見つかりません</p>
          </div>
        )}
      </div>
    </div>
  );
}
