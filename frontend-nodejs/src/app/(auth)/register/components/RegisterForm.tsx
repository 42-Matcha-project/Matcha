"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Shield, Info, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../contexts/AuthContext";
import { WoodenSign } from "@/app/components/WoodenSign";
import { BookmarkError } from "@/app/components/BookmarkError";
import { InfoMessage } from "@/app/components/InfoMessage";
import { SakuraFlowers } from "./SakuraFlowers";

// --- RegisterForm本体 ---
export const RegisterForm = () => {
  // ステップ管理
  const [currentStep, setCurrentStep] = useState(1);
  // プロフィール
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  // メール認証
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  // パスワード
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // 共通
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  // バリデーション関数
  const validateUsername = (value: string) => {
    if (!value) return "ユーザー名は必須です";
    return "";
  };
  const validateDisplayName = (value: string) => {
    if (!value) return "ニックネームは必須です";
    return "";
  };
  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return "メールアドレスは必須です";
    if (!emailRegex.test(value))
      return "有効なメールアドレスを入力してください";
    return "";
  };
  const validatePassword = (value: string) => {
    if (!value) return "パスワードは必須です";
    if (value.length < 8) return "パスワードは8文字以上必要です";
    if (value.length > 50) return "パスワードは50文字以内で入力してください";
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
    if (!(hasUppercase && hasLowercase && hasNumber && hasSymbol)) {
      return "大文字・小文字・数字・記号を含めてください";
    }
    return "";
  };
  const validateConfirmPassword = (value: string, password: string) => {
    if (!value) return "パスワード(確認)は必須です";
    if (value !== password) return "パスワードが一致しません";
    return "";
  };

  // メール認証コード送信
  const sendVerificationCode = async () => {
    const emailError = validateEmail(email);
    setErrors((prev) => ({ ...prev, email: emailError }));
    if (emailError) return;
    setIsLoading(true);
    setApiError("");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/auth/otp/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Email: email }),
        },
      );
      if (!response.ok) throw new Error("認証コードの送信に失敗しました");
      setCodeSent(true);
      setResendCountdown(60);
      alert(`${email}に認証コードを送信しました。メールをご確認ください。`);
    } catch (e: unknown) {
      const err = e as Error;
      setApiError(err.message || "認証コードの送信に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };
  // 認証コード検証
  const verifyCode = async () => {
    if (!verificationCode.trim()) {
      setApiError("認証コードを入力してください");
      return;
    }
    setIsVerifying(true);
    setApiError("");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/auth/otp/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Email: email, OTP: verificationCode }),
        },
      );
      if (!response.ok) throw new Error("認証コードの検証に失敗しました");
      setIsVerified(true);
    } catch (e: unknown) {
      const err = e as Error;
      setApiError(err.message || "認証コードの検証に失敗しました");
    } finally {
      setIsVerifying(false);
    }
  };
  // カウントダウン
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(
        () => setResendCountdown(resendCountdown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // ステップ進行
  const nextStep = () => {
    if (currentStep === 1) {
      const usernameError = validateUsername(username);
      const displayNameError = validateDisplayName(displayName);
      setErrors((prev) => ({
        ...prev,
        username: usernameError,
        displayName: displayNameError,
      }));
      if (usernameError || displayNameError) {
        setSubmitAttempted(true);
        return;
      }
    }
    if (currentStep === 2) {
      const emailError = validateEmail(email);
      setErrors((prev) => ({ ...prev, email: emailError }));
      if (emailError || !isVerified) return setSubmitAttempted(true);
    }
    setCurrentStep((prev) => prev + 1);
    setSubmitAttempted(false);
  };
  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
    setSubmitAttempted(false);
  };

  // 登録処理
  const handleSubmit = async () => {
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(
      confirmPassword,
      password,
    );
    setErrors((prev) => ({
      ...prev,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    }));
    if (passwordError || confirmPasswordError) return setSubmitAttempted(true);
    setIsLoading(true);
    setApiError("");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Username: username,
            DisplayName: displayName,
            Email: email,
            Password: password,
          }),
        },
      );
      if (!response.ok) throw new Error("登録に失敗しました");
      // 自動ログイン
      const loginResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Email: email, Password: password }),
          credentials: "include",
        },
      );
      const loginData = await loginResponse.json();
      if (loginData.Token) {
        login(loginData.Token);
        setTimeout(() => router.push("/settlement"), 100);
        return;
      }
      router.push(`/login?email=${encodeURIComponent(email)}`);
    } catch (e: unknown) {
      const err = e as Error;
      setApiError(err.message || "登録に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // 入力スタイル
  const getInputStyle = (field: string) =>
    errors[field]
      ? "w-full px-4 py-3 bg-white bg-opacity-70 rounded-lg border-2 border-red-500 shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 animate-pulse text-gray-900 placeholder-gray-500"
      : "w-full px-4 py-3 bg-white bg-opacity-70 rounded-lg border-2 border-amber-800 shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 placeholder-gray-500";

  // UI
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex justify-center items-center py-6 px-2 sm:py-10 sm:px-4">
      <SakuraFlowers />
      {/* 背景の羊皮紙風テクスチャ */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-80 z-0"
        style={{ backgroundImage: "url('/images/background2.png')" }}
      />
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
      {/* メインコンテンツ */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto bg-white bg-opacity-90 rounded-2xl shadow-2xl p-3 sm:p-6 md:p-10 border-2 border-yellow-900">
        {/* タイトル木の看板 */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <WoodenSign width="w-full" height="h-10 sm:h-14 md:h-16" rotation="">
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xl sm:text-2xl md:text-4xl">🏛️</span>
              <span className="text-base sm:text-xl md:text-2xl font-extrabold text-yellow-950 tracking-wide">
                町長受付フォーム
              </span>
            </div>
          </WoodenSign>
        </div>
        {/* エラー表示 */}
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
        {/* ステップインジケーター */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${currentStep === step ? "bg-amber-600" : currentStep > step ? "bg-green-600" : "bg-gray-300"}`}
              >
                {currentStep > step ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <span
                className={`text-sm mt-1 ${currentStep === step ? "font-bold" : ""}`}
              >
                {step === 1
                  ? "プロフィール"
                  : step === 2
                    ? "認証"
                    : "パスワード"}
              </span>
            </div>
          ))}
        </div>
        {/* ステップ1: プロフィール */}
        {currentStep === 1 && (
          <>
            <div className="mb-6 bg-white bg-opacity-90 p-4 rounded-lg border-2 border-amber-200 shadow-md">
              <h2 className="text-lg font-bold text-amber-800 mb-2">
                基本情報の入力
              </h2>
              <p className="text-sm text-gray-700">
                アカウント作成に必要な基本情報を入力してください。
              </p>
            </div>
            {/* ユーザー名 */}
            <div className="mb-6">
              <WoodenSign width="w-full" rotation="rotate-1">
                <label className="text-yellow-950 text-lg font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                  ユーザー名
                </label>
              </WoodenSign>
              <div className="relative mt-2">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={getInputStyle("username")}
                  placeholder="ユーザー名を設定"
                  maxLength={100}
                />
                <div className="text-xs text-gray-600 mt-1 mb-2 text-right">
                  {username.length}/100
                </div>
              </div>
              {errors.username && submitAttempted && (
                <BookmarkError message={errors.username} />
              )}
            </div>
            {/* ニックネーム */}
            <div className="mb-6">
              <WoodenSign width="w-full" rotation="-rotate-1">
                <label className="text-yellow-950 text-lg font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                  ニックネーム
                </label>
              </WoodenSign>
              <div className="relative mt-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={getInputStyle("displayName")}
                  placeholder="表示される名前を設定"
                  maxLength={100}
                />
                <div className="text-xs text-gray-600 mt-1 mb-2 text-right">
                  {displayName.length}/100
                </div>
              </div>
              {errors.displayName && submitAttempted && (
                <BookmarkError message={errors.displayName} />
              )}
            </div>
          </>
        )}
        {/* ステップ2: メール認証 */}
        {currentStep === 2 && (
          <>
            <div className="mb-6 bg-white bg-opacity-90 p-4 rounded-lg border-2 border-amber-200 shadow-md">
              <h2 className="text-lg font-bold text-amber-800 mb-2">
                メール認証
              </h2>
              <p className="text-sm text-gray-700">
                メールアドレスを入力し、送信される認証コードを確認してください。
              </p>
            </div>
            {/* メールアドレス */}
            <div className="mb-6">
              <WoodenSign width="w-full" rotation="rotate-1">
                <label className="text-yellow-950 text-lg font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                  メールアドレス
                </label>
              </WoodenSign>
              <div className="relative mt-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={getInputStyle("email")}
                  placeholder="認証に使用するメールアドレス"
                  maxLength={100}
                />
                <div className="text-xs text-gray-600 mt-1 mb-2 text-right">
                  {email.length}/100
                </div>
              </div>
              {errors.email && submitAttempted && (
                <BookmarkError message={errors.email} />
              )}
            </div>
            <div className="mt-2">
              <button
                type="button"
                onClick={sendVerificationCode}
                disabled={resendCountdown > 0 || !email}
                className={`relative w-full py-2 px-4 flex items-center justify-center ${codeSent ? "bg-green-600 hover:bg-green-700" : "bg-amber-600 hover:bg-amber-700"} text-white font-medium rounded-md transform transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-md ${resendCountdown > 0 || !email ? "opacity-70 cursor-not-allowed" : "hover:scale-[1.02]"}`}
                style={{
                  textShadow: "0 1px 1px rgba(0,0,0,0.3)",
                  boxShadow:
                    "0 2px 4px rgba(0,0,0,0.2), inset 0 -1px 2px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.2)",
                }}
              >
                {resendCountdown > 0 ? (
                  <span className="flex items-center">
                    <Mail className="mr-2 h-4 w-4" />
                    {resendCountdown}秒後に再送信可能
                  </span>
                ) : codeSent ? (
                  <span className="flex items-center">
                    <Shield className="mr-2 h-4 w-4" />
                    認証コード送信済み（再送信する）
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Mail className="mr-2 h-4 w-4" />
                    メールに認証コードを送信
                  </span>
                )}
              </button>
            </div>
            <InfoMessage>
              登録を完了するには、メールアドレスの確認が必要です。「メールに認証コードを送信」ボタンをクリックして、メールに届いた認証コードを確認してください。
            </InfoMessage>
            {/* 認証コード入力 */}
            {codeSent && (
              <div className="mt-4">
                <WoodenSign width="w-full" rotation="rotate-1">
                  <label className="text-yellow-950 text-lg font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                    認証コード
                  </label>
                </WoodenSign>
                <div className="relative mt-2">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className={`w-full px-4 py-3 bg-white bg-opacity-70 rounded-lg border-2 ${isVerified ? "border-green-500" : "border-amber-800"} shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 placeholder-gray-500`}
                    placeholder="例）123456"
                    disabled={isVerified}
                    maxLength={6}
                  />
                  <div className="text-xs text-gray-600 mt-1 mb-2 text-right">
                    {verificationCode.length}/6
                  </div>
                  {isVerified && (
                    <div className="absolute right-3 top-3 text-green-500">
                      <Shield className="h-6 w-6" />
                    </div>
                  )}
                </div>
                {!isVerified && (
                  <button
                    type="button"
                    onClick={verifyCode}
                    disabled={isVerifying || !verificationCode.trim()}
                    className={`relative mt-2 py-2 px-4 flex items-center justify-center ${isVerifying ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"} text-white font-medium rounded-md transform transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md ${isVerifying || !verificationCode.trim() ? "opacity-70 cursor-not-allowed" : "hover:scale-[1.02]"}`}
                    style={{
                      textShadow: "0 1px 1px rgba(0,0,0,0.3)",
                      boxShadow:
                        "0 2px 4px rgba(0,0,0,0.2), inset 0 -1px 2px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.2)",
                    }}
                  >
                    {isVerifying ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        検証中...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Shield className="mr-2 h-4 w-4" />
                        認証コードを検証
                      </span>
                    )}
                  </button>
                )}
                {isVerified && (
                  <div className="mt-2 text-green-600 font-medium flex items-center">
                    <Shield className="mr-2 h-4 w-4" />
                    認証が完了しました
                  </div>
                )}
              </div>
            )}
          </>
        )}
        {/* ステップ3: パスワード設定 */}
        {currentStep === 3 && (
          <>
            <div className="mb-6 bg-white bg-opacity-90 p-4 rounded-lg border-2 border-amber-200 shadow-md">
              <h2 className="text-lg font-bold text-amber-800 mb-2">
                パスワード設定
              </h2>
              <p className="text-sm text-gray-700">
                安全なパスワードを設定し、確認のために同じパスワードを再入力してください。
              </p>
            </div>
            {/* パスワード */}
            <div className="mb-6">
              <div className="relative">
                <WoodenSign width="w-full" rotation="rotate-1">
                  <label className="text-yellow-950 text-lg font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                    パスワード
                  </label>
                </WoodenSign>
              </div>
              <div className="relative mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={getInputStyle("password")}
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
                <div className="text-xs text-gray-600 mt-1 mb-2 text-right">
                  {password.length}/50
                </div>
              </div>
              {errors.password && submitAttempted && (
                <BookmarkError message={errors.password} />
              )}
            </div>
            {/* パスワード確認 */}
            <div className="mb-6">
              <div className="relative">
                <WoodenSign width="w-full" rotation="-rotate-1">
                  <label className="text-yellow-950 text-lg font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                    パスワード（確認）
                  </label>
                </WoodenSign>
              </div>
              <div className="relative mt-2">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={getInputStyle("confirmPassword")}
                  placeholder="同じパスワードを再入力"
                  maxLength={50}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-amber-800 focus:outline-none"
                  aria-label={
                    showConfirmPassword
                      ? "パスワードを隠す"
                      : "パスワードを表示"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
                <div className="text-xs text-gray-600 mt-1 mb-2 text-right">
                  {confirmPassword.length}/50
                </div>
              </div>
              {errors.confirmPassword && submitAttempted && (
                <BookmarkError message={errors.confirmPassword} />
              )}
            </div>
            <div className="my-4 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-md">
              <div className="flex">
                <Info className="flex-shrink-0 h-5 w-5 text-amber-500" />
                <div className="ml-3">
                  <p className="text-sm text-amber-800">
                    安全なパスワードのために：
                  </p>
                  <ul className="list-disc list-inside text-xs text-amber-700 mt-1">
                    <li>8文字以上の長さにしてください</li>
                    <li>大文字、小文字、数字、記号を混ぜると安全です</li>
                    <li>
                      覚えやすく、他では使っていないパスワードを使用しましょう
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
        {/* ナビゲーションボタン */}
        <div className="flex justify-between mt-8">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-6 py-2 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              戻る
            </button>
          ) : (
            <div></div>
          )}
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={
                (currentStep === 1 && (!username || !displayName)) ||
                (currentStep === 2 && (!isVerified || !codeSent))
              }
              className={`px-6 py-2 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${(currentStep === 1 && (!username || !displayName)) || (currentStep === 2 && (!isVerified || !codeSent)) ? "bg-gray-400 cursor-not-allowed opacity-60" : "bg-amber-600 hover:bg-amber-700"}`}
            >
              次へ
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading || !password || !confirmPassword}
              className={`relative px-8 py-3 bg-rose-900 text-white font-bold rounded-lg transform transition-transform focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-lg ${isLoading || !password || !confirmPassword ? "opacity-70 cursor-not-allowed" : "hover:scale-105 hover:bg-amber-700"}`}
              style={{
                textShadow: "0 2px 2px rgba(0,0,0,0.5)",
                boxShadow:
                  "0 4px 6px rgba(0,0,0,0.3), inset 0 -2px 5px rgba(0,0,0,0.2), inset 0 2px 5px rgba(255,255,255,0.2)",
              }}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  登録中...
                </span>
              ) : (
                <span>登録する</span>
              )}
            </button>
          )}
        </div>
        {/* ログインリンク */}
        <div className="text-center mt-4">
          <p className="text-gray-700">
            すでにアカウントをお持ちの方は
            <Link
              href="/login"
              className="text-amber-800 hover:underline ml-1 font-medium"
            >
              こちらからログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
