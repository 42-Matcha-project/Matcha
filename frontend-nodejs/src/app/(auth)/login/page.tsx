"use client";

import React, { useState, ReactNode, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";

// 木の看板コンポーネント
const WoodenSign = ({
  children,
  width = "w-64",
  height = "h-12",
  rotation = "",
}: {
  children: ReactNode;
  width?: string;
  height?: string;
  rotation?: string;
}) => {
  // 釘コンポーネント
  const Nail = ({
    position,
  }: {
    position: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  }) => {
    const positionClasses = {
      topLeft: "top-1 left-1",
      topRight: "top-1 right-1",
      bottomLeft: "bottom-1 left-1",
      bottomRight: "bottom-1 right-1",
    };

    return (
      <div
        className={`absolute ${positionClasses[position]} w-1.5 h-1.5 rounded-full bg-gray-500 border border-gray-500 shadow-inner`}
        style={{ boxShadow: "inset 0 0 2px rgba(255,255,255,0.5)" }}
      />
    );
  };

  return (
    <div className={`relative ${width}`}>
      {/* 影の要素 - 看板とサイズを合わせる */}
      <div
        className={`absolute w-full ${height} top-[5px] left-[6px] rounded`}
        style={{
          backgroundColor: "rgba(0,0,0,0.7)",
          filter: "blur(2px)",
          zIndex: 5,
        }}
      />

      <div
        className={`relative ${width} ${height} bg-orange-300 flex items-center justify-center px-4 transform ${rotation} border-2 border-yellow-900 rounded z-10`}
      >
        <Nail position="topLeft" />
        <Nail position="topRight" />
        <Nail position="bottomLeft" />
        <Nail position="bottomRight" />
        {children}
      </div>
    </div>
  );
};

// しおり型のエラーメッセージコンポーネント
const BookmarkError = ({ message }: { message: string }) => {
  return (
    <div className="relative mt-1 mx-auto animate-bounce">
      <div className="absolute w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[15px] border-t-red-500 left-4 -top-1 z-10" />
      <div className="bg-red-500 text-white px-4 py-1 rounded text-sm font-bold shadow-md">
        {message}
      </div>
    </div>
  );
};

// 必須タグコンポーネント
const RequiredTag = () => {
  return (
    <span className="ml-2 px-2 py-0.5 bg-amber-600 text-white text-xs font-bold rounded-full animate-pulse">
      必須
    </span>
  );
};

const Login = () => {
  const router = useRouter();
  const { login } = useAuth(); // 認証コンテキストからlogin関数を取得
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  // 送信中かどうかを示す状態
  const [isLoading, setIsLoading] = useState(false);
  // APIエラーを管理
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // 送信が試行されたかどうか
  const [submitAttempted, setSubmitAttempted] = useState(false);
  // フォームのエラー状態を管理
  const [errors, setErrors] = useState<{
    usernameOrEmail: boolean;
    password: boolean;
  }>({ usernameOrEmail: false, password: false });

  // URLパラメータからメールアドレスを取得して入力欄に設定
  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get("email");

      if (emailParam) {
        console.log("URLパラメータからメールアドレスを取得:", emailParam);
        setUsernameOrEmail(emailParam);
      }
    }
  }, []);

  const handleUsernameOrEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsernameOrEmail(e.target.value);
    if (submitAttempted) {
      validateField("usernameOrEmail", e.target.value);
    }
  };

  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (submitAttempted) {
      validateField("password", e.target.value);
    }
  };

  // フィールドの検証
  const validateField = (field: string, value: string) => {
    setErrors((prev: { usernameOrEmail: boolean; password: boolean }) => ({
      ...prev,
      [field]: value.trim() === "",
    }));
  };

  // 全フィールドの検証
  const validateAllFields = () => {
    const newErrors = {
      usernameOrEmail: usernameOrEmail.trim() === "",
      password: password.trim() === "",
    };

    setErrors(newErrors);
    return !Object.values(newErrors).includes(true);
  };

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    setApiError("");

    if (validateAllFields()) {
      try {
        setIsLoading(true);

        // リクエストのボディを準備
        const requestBody: {
          Username?: string;
          Email?: string;
          Password: string;
        } = {
          Password: password,
        };

        // ユーザー名かメールアドレスを判別して設定
        if (usernameOrEmail.includes("@")) {
          requestBody.Email = usernameOrEmail;
        } else {
          requestBody.Username = usernameOrEmail;
        }

        // ログインAPIリクエストを送信
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
            credentials: "include",
          },
        );

        let data;
        try {
          // レスポンスのテキストを取得してJSONとしてパース
          const responseText = await response.text();

          // 空のレスポンスチェック
          if (!responseText.trim()) {
            console.error("空のレスポンスを受信しました");
            if (!response.ok) {
              throw new Error("ログインに失敗しました");
            }
            data = {}; // 空のオブジェクトをデフォルト値として使用
          } else {
            // JSONとしてパース
            data = JSON.parse(responseText);
          }

          // エラーレスポンスの場合
          if (!response.ok) {
            console.error("詳細エラー情報:", data);
            throw new Error("ログインに失敗しました");
          }

          // 成功レスポンスの処理
          console.log("Login successful:", data);
          const token = data.Token;

          if (!token) {
            throw new Error("トークンが見つかりません");
          }

          // 認証コンテキストのlogin関数を呼び出してトークンを保存
          login(token);

          // 少し遅延を入れて認証状態が更新されるのを待つ
          setTimeout(() => {
            // Next.jsのルーターを使用してリダイレクト
            router.push("/settlement");
          }, 100);
        } catch (error) {
          // JSONパースエラーまたはその他のエラー
          console.error("Login error:", error);
          throw new Error("ログインに失敗しました");
        } finally {
          setIsLoading(false);
        }
      } catch (error: unknown) {
        console.log("Login error:", error);
        let errorMessage = "ログインに失敗しました";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        setApiError(errorMessage);
      }
    } else {
      // エラーがある場合は、フォームへスクロール
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // 入力枠のスタイル
  const getInputStyle = (
    fieldName: "usernameOrEmail" | "password",
    value: string,
  ) => {
    return errors[fieldName] && (!value || value.trim() === "")
      ? "w-full px-4 py-3 bg-white bg-opacity-70 rounded-lg border-2 border-red-500 shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 animate-pulse text-gray-900 dark:text-gray-900 placeholder-gray-500 dark:placeholder-gray-500"
      : "w-full px-4 py-3 bg-white bg-opacity-70 rounded-lg border-2 border-amber-800 shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-gray-900 placeholder-gray-500 dark:placeholder-gray-500";
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-orange-100 flex justify-center items-center">
      {/* 背景の羊皮紙風テクスチャ */}
      <div className="absolute inset-0 bg-cover bg-center opacity-80"></div>

      {/* 桜の枝 - 左上 */}
      <div className="absolute top-0 left-0 w-64 h-64">
        <Image
          src="/images/welcome-flower.webp"
          alt="桜の枝"
          width={300}
          height={300}
          className="object-contain"
        />
      </div>

      {/* 桜の花びら - 右下 */}
      <div className="absolute bottom-0 right-0 w-64 h-64">
        <Image
          src="/images/welcome-flower.webp"
          alt="桜の花びら"
          width={300}
          height={300}
          className="object-contain"
        />
      </div>

      {/* メインコンテンツ */}
      <div className="relative  w-full py-10 z-10 px-4 flex flex-col items-center">
        {/* タイトル木の看板 */}
        <div className="flex justify-center mt-4 mb-8">
          <button
            className="relative px-10 py-3 bg-rose-900 text-white font-bold rounded-md transform transition-transform focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-lg"
            style={{
              textShadow: "0 2px 2px rgba(0,0,0,0.5)",
              boxShadow:
                "0 4px 6px rgba(0,0,0,0.3), inset 0 -2px 5px rgba(0,0,0,0.2), inset 0 2px 5px rgba(255,255,255,0.2)",
            }}
          >
            <h1 className="text-2xl font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
              入室ログイン
            </h1>
          </button>
        </div>

        {/* 入力フォームの説明 */}
        <div className="mb-6 w-full max-w-md">
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md shadow-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-2xl">📝</span>
              </div>
              <div className="ml-3">
                <p className="text-md font-medium text-amber-900">
                  入室に必要な情報
                </p>
                <p className="text-sm text-amber-800 mt-1">
                  ユーザー名かメールアドレスのどちらか一方と、パスワードを入力してください。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* API エラーメッセージ */}
        {apiError && (
          <div className="mb-4 w-full max-w-md">
            <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-md shadow-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <p className="text-md font-medium text-red-900">
                    エラーが発生しました
                  </p>
                  <p className="text-sm text-red-800 mt-1">{apiError}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 共通エラーメッセージ */}
        {submitAttempted && Object.values(errors).includes(true) && (
          <div className="mb-4 w-full max-w-md">
            <div className="bg-amber-100 border-l-4 border-amber-500 p-4 rounded-md shadow-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-2xl">📝</span>
                </div>
                <div className="ml-3">
                  <p className="text-md font-medium text-amber-900">
                    まだ終わってないよ！
                  </p>
                  <p className="text-sm text-amber-800 mt-1">
                    赤くなっている必須項目を入力してね。入力すると色が変わるよ！
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-md">
          {/* ユーザー名/メールアドレスフィールド */}
          <div className="mb-8">
            <div className="relative">
              <WoodenSign width="w-full" rotation="-rotate-1">
                <div className="flex items-center">
                  <label className="text-yellow-950 text-lg font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                    ユーザー名 または メールアドレス
                  </label>
                  <RequiredTag />
                </div>
              </WoodenSign>
            </div>

            <div className="relative mt-2">
              <input
                type="text"
                value={usernameOrEmail}
                onChange={handleUsernameOrEmail}
                onKeyDown={handleKeyDown}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                className={getInputStyle("usernameOrEmail", usernameOrEmail)}
                placeholder="例）taro または taro@example.com"
                maxLength={100}
              />
              <div className="text-xs text-gray-600 mt-1 mb-2 text-right">
                {usernameOrEmail.length}/100
                {usernameOrEmail.length >= 90 &&
                  usernameOrEmail.length < 100 && (
                    <span className="text-amber-500 ml-2">
                      制限に近づいています
                    </span>
                  )}
                {usernameOrEmail.length >= 100 && (
                  <span className="text-red-500 ml-2">
                    文字数制限に達しました
                  </span>
                )}
              </div>
            </div>
            {errors.usernameOrEmail && submitAttempted && (
              <BookmarkError message="ユーザー名またはメールアドレスを入力してね！" />
            )}
          </div>

          {/* パスワードフィールド */}
          <div className="mb-8">
            <div className="relative">
              <WoodenSign width="w-full" rotation="rotate-1">
                <div className="flex items-center">
                  <label className="text-yellow-950 text-lg font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                    パスワード
                  </label>
                  <RequiredTag />
                </div>
              </WoodenSign>
            </div>

            <div className="relative mt-2">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePassword}
                onKeyDown={handleKeyDown}
                className={getInputStyle("password", password)}
                placeholder="例）taro1234"
                maxLength={50}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? "パスワードを隠す" : "パスワードを表示する"
                }
                style={{ top: "calc(50% - 10px)" }}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
              <div className="text-xs text-gray-600 mt-1 text-right">
                {password.length}/50
                {password.length >= 45 && password.length < 50 && (
                  <span className="text-amber-500 ml-2">
                    制限に近づいています
                  </span>
                )}
                {password.length >= 50 && (
                  <span className="text-red-500 ml-2">
                    文字数制限に達しました
                  </span>
                )}
              </div>
            </div>
            {errors.password && submitAttempted && (
              <BookmarkError message="パスワードを入力してね！" />
            )}
          </div>

          {/* 登録ボタン */}
          <div className="flex justify-center mt-4 mb-16">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`relative px-8 py-3 bg-rose-900 text-white font-bold rounded-lg transform transition-transform focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-lg ${
                isLoading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:scale-105 hover:bg-amber-700"
              }`}
              style={{
                textShadow: "0 2px 2px rgba(0,0,0,0.5)",
                boxShadow:
                  "0 4px 6px rgba(0,0,0,0.3), inset 0 -2px 5px rgba(0,0,0,0.2), inset 0 2px 5px rgba(255,255,255,0.2)",
              }}
            >
              {isLoading ? "送信中..." : "入室する"}
            </button>
          </div>

          {/* パスワード忘れボタン */}
          <div className="text-right mt-1">
            <button
              className="px-4 py-2 bg-amber-50 text-amber-800 text-sm rounded-full shadow-md hover:bg-amber-100 transition-colors duration-200 border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300"
              style={{
                boxShadow:
                  "0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.2)",
              }}
              onClick={() => router.push("/password-reset")}
            >
              パスワードを忘れた方はこちら
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
