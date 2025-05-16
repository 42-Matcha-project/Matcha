"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../../../contexts/AuthContext";
import { WoodenSign } from "@/app/components/WoodenSign";
import { BookmarkError } from "@/app/components/BookmarkError";
import { RequiredTag } from "./RequiredTag";
import Image from "next/image";

export const LoginForm = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [errors, setErrors] = useState<{
    usernameOrEmail: boolean;
    password: boolean;
  }>({ usernameOrEmail: false, password: false });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get("email");
      if (emailParam) {
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

  const validateField = (field: string, value: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: value.trim() === "",
    }));
  };

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
        const requestBody: {
          Username?: string;
          Email?: string;
          Password: string;
        } = {
          Password: password,
        };
        if (usernameOrEmail.includes("@")) {
          requestBody.Email = usernameOrEmail;
        } else {
          requestBody.Username = usernameOrEmail;
        }
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
          const responseText = await response.text();
          if (!responseText.trim()) {
            if (!response.ok) {
              throw new Error("ログインに失敗しました");
            }
            data = {};
          } else {
            data = JSON.parse(responseText);
          }
          if (!response.ok) {
            throw new Error("ログインに失敗しました");
          }
          const token = data.Token;
          if (!token) {
            throw new Error("トークンが見つかりません");
          }
          login(token);
          setTimeout(() => {
            router.push("/settlement");
          }, 100);
        } catch {
          throw new Error("ログインに失敗しました");
        } finally {
          setIsLoading(false);
        }
      } catch (error: unknown) {
        let errorMessage = "ログインに失敗しました";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        setApiError(errorMessage);
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getInputStyle = (
    fieldName: "usernameOrEmail" | "password",
    value: string,
  ) => {
    return errors[fieldName] && (!value || value.trim() === "")
      ? "w-full px-4 py-3 bg-white bg-opacity-70 rounded-lg border-2 border-red-500 shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 animate-pulse text-gray-900 dark:text-gray-900 placeholder-gray-500 dark:placeholder-gray-500"
      : "w-full px-4 py-3 bg-white bg-opacity-70 rounded-lg border-2 border-amber-800 shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-gray-900 placeholder-gray-500 dark:placeholder-gray-500";
  };

  return (
    <div className="flex justify-center items-center min-h-screen relative w-full overflow-hidden">
      {/* 背景の羊皮紙風テクスチャ */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-80 z-0"
        style={{ backgroundImage: "url('/images/background2.png')" }}
      ></div>
      {/* 桜の枝 - 左上 */}
      <div className="absolute top-0 left-0 w-24 h-24 sm:w-40 sm:h-40 md:w-64 md:h-64 z-5 pointer-events-none select-none">
        <Image
          src="/images/welcome-flower.webp"
          alt="桜の枝"
          width={300}
          height={300}
          className="object-contain"
          priority
        />
      </div>
      {/* 桜の花びら - 右下 */}
      <div className="absolute bottom-0 right-0 w-24 h-24 sm:w-40 sm:h-40 md:w-64 md:h-64 z-5 pointer-events-none select-none">
        <Image
          src="/images/welcome-flower.webp"
          alt="桜の花びら"
          width={300}
          height={300}
          className="object-contain"
          priority
        />
      </div>
      {/* メインコンテンツ（白い枠・影・余白強調） */}
      <div className="relative z-10 w-full max-w-xs sm:max-w-md mx-auto bg-white bg-opacity-90 rounded-2xl shadow-2xl p-4 sm:p-8 md:p-10 border-2 border-yellow-900">
        {/* タイトル木の看板（大きめ・余白多め） */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <WoodenSign width="w-full" height="h-10 sm:h-14 md:h-16" rotation="">
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xl sm:text-2xl md:text-4xl">👤</span>
              <span className="text-base sm:text-xl md:text-2xl font-extrabold text-yellow-950 tracking-wide">
                町長ログイン
              </span>
            </div>
          </WoodenSign>
        </div>
        {/* 入力フォームの説明 */}
        <div className="mb-6 w-full max-w-md mx-auto">
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md shadow-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-2xl">📝</span>
              </div>
              <div className="ml-3">
                <p className="text-md font-medium text-amber-900">
                  町長のログインに必要な情報
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
          <div className="mb-4 w-full max-w-md mx-auto">
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
          <div className="mb-4 w-full max-w-md mx-auto">
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
        <div className="w-full max-w-md mx-auto">
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
              className={`relative px-8 py-3 bg-green-600 text-white font-bold rounded-lg transform transition-transform focus:outline-none focus:ring-2 focus:ring-green-400 shadow-lg ${
                isLoading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:scale-105 hover:bg-green-700"
              }`}
              style={{
                textShadow: "0 2px 2px rgba(0,0,0,0.5)",
                boxShadow:
                  "0 4px 6px rgba(0,0,0,0.3), inset 0 -2px 5px rgba(0,0,0,0.2), inset 0 2px 5px rgba(255,255,255,0.2)",
              }}
            >
              {isLoading ? "送信中..." : "ログインする"}
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
