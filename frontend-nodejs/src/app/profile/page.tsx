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
  AlertTriangle,
  Bug,
  RefreshCw,
} from "lucide-react";
import { UserProfile } from "@/types/profile";
import {
  decodeJwtToken,
  testAuthentication,
  tryAlternativeAuth,
} from "../login";

// グローバルでデバッグ情報を出力 - ページがロードされたことを確認
console.log("ProfilePage component loaded");
// トークンの存在を即座に確認
const initialToken =
  typeof window !== "undefined" ? localStorage.getItem("token") : null;
console.log("Initial token check:", !!initialToken);
if (initialToken) {
  console.log("Token first chars:", initialToken.substring(0, 20) + "...");
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [advancedDebug, setAdvancedDebug] = useState(false);
  const [authTestResult, setAuthTestResult] = useState<any>(null);

  // コンポーネントマウント時にも確認
  console.log("ProfilePage rendering, isLoading:", isLoading);

  useEffect(() => {
    console.log("ProfilePage useEffect running");

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        console.log("Token exists:", !!token);
        if (token) {
          console.log("Token first 20 chars:", token.substring(0, 20) + "...");
          // トークンの形式をチェック（有効なJWTか）
          const tokenParts = token.split(".");
          if (tokenParts.length !== 3) {
            console.error(
              "Invalid JWT format - should have 3 parts separated by dots",
            );
            setDebugInfo("無効なJWT形式：正しい形式ではありません");
          }
        }

        if (!token) {
          setError("認証情報がありません");
          setDebugInfo("トークンがLocalStorageに存在しません");
          setIsLoading(false);
          return;
        }

        // APIエンドポイントURLのチェック
        const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/profile/get`;
        console.log("API URL:", apiUrl);
        if (!apiUrl.startsWith("http")) {
          console.warn("API URL may be misconfigured:", apiUrl);
          setDebugInfo(`APIのURL形式が不正かもしれません: ${apiUrl}`);
        }

        // トークンの設定方法を試してみる
        // バージョン1: 標準的な方法
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        console.log("Request headers:", headers);

        try {
          const response = await fetch(apiUrl, {
            method: "GET",
            headers: headers,
            credentials: "include", // Cookieを含める
          });

          console.log("Response status:", response.status);
          console.log(
            "Response headers:",
            Object.fromEntries([...response.headers.entries()]),
          );

          if (!response.ok) {
            let errorDetail = "";
            try {
              const errorText = await response.text();
              console.log("Error response body:", errorText);
              errorDetail = errorText;

              try {
                const errorJson = JSON.parse(errorText);
                errorDetail = errorJson.message || errorJson.error || errorText;
              } catch {
                // JSONとして解析できない場合はそのままテキストを使用
                console.log("Error response is not JSON");
              }
            } catch (e) {
              console.error("Failed to read error response:", e);
            }

            if (response.status === 401) {
              const debugMessage = `認証エラー (401): ${errorDetail}`;
              setDebugInfo(debugMessage);
              console.error(debugMessage);

              // トークンが無効かもしれないので削除を検討
              // localStorage.removeItem("token");

              throw new Error(`認証エラー: ${errorDetail}`);
            }

            throw new Error(`プロフィールの取得に失敗しました: ${errorDetail}`);
          }

          const responseText = await response.text();
          console.log("Response body text:", responseText);

          if (!responseText || responseText.trim() === "") {
            throw new Error("サーバーから空のレスポンスが返されました");
          }

          try {
            const data = JSON.parse(responseText);
            console.log("Parsed profile data:", data);

            if (!data.User) {
              throw new Error("プロフィールデータが見つかりません");
            }

            setProfile(data.User);
          } catch (parseError: unknown) {
            console.error("JSON parse error:", parseError);
            throw new Error(
              `レスポンスの解析に失敗しました: ${(parseError as Error).message}`,
            );
          }
        } catch (fetchError) {
          console.error("Fetch operation failed:", fetchError);
          throw fetchError;
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
  }, []); // routerを依存配列から削除

  const handleBackClick = () => {
    router.back();
  };

  const handleEditClick = () => {
    router.push("/profile/edit");
  };

  // デバッグ機能

  // トークン詳細を表示
  const showTokenDetails = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setDebugInfo("トークンがありません");
      return;
    }

    try {
      const decoded = decodeJwtToken(token);
      if (!decoded) {
        setDebugInfo("トークンのデコードに失敗しました");
        return;
      }

      setAdvancedDebug(true);
      setDebugInfo(JSON.stringify(decoded, null, 2));
    } catch (error) {
      console.error("トークン解析エラー:", error);
      setDebugInfo(
        `トークン解析エラー: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  // 直接APIをテスト
  const testAuthAPI = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setDebugInfo("トークンがありません");
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "";
      if (!baseUrl) {
        setDebugInfo("APIのベースURLが設定されていません");
        return;
      }

      const result = await testAuthentication(baseUrl, token);
      setAuthTestResult(result);
      setAdvancedDebug(true);
      console.log("Auth test result:", result);
    } catch (error) {
      console.error("認証テストエラー:", error);
      setDebugInfo(
        `認証テストエラー: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 代替認証方法を試す
  const tryAltAuth = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setDebugInfo("トークンがありません");
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "";
      if (!baseUrl) {
        setDebugInfo("APIのベースURLが設定されていません");
        return;
      }

      const result = await tryAlternativeAuth(baseUrl, token);
      setAuthTestResult(result);
      setAdvancedDebug(true);
      console.log("Alternative auth result:", result);

      if (result.success) {
        setDebugInfo(`代替認証成功! 方法: ${result.method}`);
      } else {
        setDebugInfo("すべての代替認証方法が失敗しました");
      }
    } catch (error) {
      console.error("代替認証テストエラー:", error);
      setDebugInfo(
        `代替認証テストエラー: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setIsLoading(false);
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
          <h1 className="text-2xl font-bold text-amber-900">プロフィール</h1>

          {/* デバッグ用ボタンエリア */}
          <div className="ml-auto flex gap-2">
            <button
              onClick={showTokenDetails}
              className="p-2 bg-blue-500 text-white rounded flex items-center gap-1"
              title="JWT詳細を表示"
            >
              <Bug size={18} />
              <span className="hidden sm:inline">トークン詳細</span>
            </button>
            <button
              onClick={testAuthAPI}
              className="p-2 bg-purple-500 text-white rounded flex items-center gap-1"
              title="認証APIをテスト"
            >
              <AlertTriangle size={18} />
              <span className="hidden sm:inline">API認証テスト</span>
            </button>
            <button
              onClick={tryAltAuth}
              className="p-2 bg-green-500 text-white rounded flex items-center gap-1"
              title="代替認証方法を試す"
            >
              <RefreshCw size={18} />
              <span className="hidden sm:inline">代替認証</span>
            </button>
          </div>
        </div>

        {/* 環境情報表示 */}
        <div className="bg-gray-100 p-4 mb-4 rounded text-sm">
          <p>
            API Base URL: {process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "未設定"}
          </p>
        </div>

        {/* デバッグ情報表示エリア */}
        {debugInfo && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">デバッグ情報: </strong>
            {advancedDebug ? (
              <pre className="mt-2 whitespace-pre-wrap text-xs bg-blue-50 p-2 rounded overflow-auto max-h-80">
                {debugInfo}
              </pre>
            ) : (
              <span className="block sm:inline">{debugInfo}</span>
            )}
          </div>
        )}

        {/* 認証テスト結果表示 */}
        {authTestResult && (
          <div className="bg-purple-100 border border-purple-400 text-purple-700 px-4 py-3 rounded relative mb-4">
            <div className="flex justify-between items-center">
              <strong className="font-bold">認証テスト結果: </strong>
              <span
                className={`px-2 py-1 rounded text-white ${authTestResult.ok ? "bg-green-500" : "bg-red-500"}`}
              >
                {authTestResult.status} {authTestResult.ok ? "成功" : "失敗"}
              </span>
            </div>
            <pre className="mt-2 whitespace-pre-wrap text-xs bg-purple-50 p-2 rounded overflow-auto max-h-80">
              {JSON.stringify(authTestResult, null, 2)}
            </pre>
          </div>
        )}

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
