"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Info, CheckCircle, X } from "lucide-react";

// トースト通知コンポーネント
const Toast = ({
  message,
  type = "info",
  onClose,
}: {
  message: string;
  type?: "success" | "error" | "info" | "loading";
  onClose: () => void;
}) => {
  const bgColor =
    type === "success"
      ? "bg-green-100 border-green-500"
      : type === "error"
        ? "bg-red-100 border-red-500"
        : type === "loading"
          ? "bg-amber-100 border-amber-500"
          : "bg-blue-100 border-blue-500";

  const textColor =
    type === "success"
      ? "text-green-800"
      : type === "error"
        ? "text-red-800"
        : type === "loading"
          ? "text-amber-800"
          : "text-blue-800";

  const icon =
    type === "success" ? (
      <svg
        className="h-5 w-5 text-green-500 mr-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 13l4 4L19 7"
        ></path>
      </svg>
    ) : type === "error" ? (
      <svg
        className="h-5 w-5 text-red-500 mr-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M6 18L18 6M6 6l12 12"
        ></path>
      </svg>
    ) : type === "loading" ? (
      <svg
        className="animate-spin h-5 w-5 text-amber-500 mr-3"
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
    ) : (
      <svg
        className="h-5 w-5 text-blue-500 mr-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
      </svg>
    );

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 ${bgColor} border-l-4 p-3 rounded-md shadow-md z-50 animate-fade-in-down`}
    >
      <div className="flex items-center">
        {icon}
        <span className={textColor}>{message}</span>
        <button
          onClick={onClose}
          className="ml-3 text-gray-500 hover:text-gray-700"
          aria-label="閉じる"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

// 木の看板コンポーネント
const WoodenSign = ({
  children,
  width = "w-64",
  height = "h-12",
  rotation = "",
}: {
  children: React.ReactNode;
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
    <div className={`relative ${width} ${rotation}`}>
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
        className={`relative ${width} ${height} bg-orange-300 flex items-center justify-center px-4 transform border-2 border-yellow-900 rounded z-10`}
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
// コールバック内でのReact Hook使用エラーを修正するためにカスタムフックを作成
const useSakuraFlowers = () => {
  const [flowers, setFlowers] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    // 桜の花びらを生成
    const generateFlowers = () => {
      const elements = [];
      const flowerCount = 15;

      for (let i = 0; i < flowerCount; i++) {
        const randomTop = Math.random() * 100;
        const randomLeft = Math.random() * 100;
        const randomSize = Math.random() * 15 + 10;
        const randomDuration = Math.random() * 10 + 10;
        const randomDelay = Math.random() * 10;
        const randomOpacity = Math.random() * 0.5 + 0.5;

        elements.push(
          <div
            key={i}
            className="flower"
            style={{
              position: "absolute",
              top: `${randomTop}%`,
              left: `${randomLeft}%`,
              width: `${randomSize}px`,
              height: `${randomSize}px`,
              backgroundColor: "#ffccd8",
              borderRadius: "50%",
              opacity: randomOpacity,
              animation: `float ${randomDuration}s ease-in-out ${randomDelay}s infinite`,
              zIndex: 1,
            }}
          />,
        );
      }
      return elements;
    };

    setFlowers(generateFlowers());
  }, []);

  return flowers;
};

// アニメーション用のスタイルを追加
const toastAnimation = `
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translate3d(0, -20px, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }
  .animate-fade-in-down {
    animation: fadeInDown 0.3s ease-out;
  }
`;

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

// PasswordReset コンポーネント内にトースト状態を追加
const PasswordReset = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [errors, setErrors] = useState<{
    email: string;
    password: string;
    confirmPassword: string;
    verificationCode: string;
  }>({
    email: "",
    password: "",
    confirmPassword: "",
    verificationCode: "",
  });
  const [submitAttempted, setSubmitAttempted] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [codeSent, setCodeSent] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [resendCountdown, setResendCountdown] = useState<number>(0);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);
  // 処理ステータスを追加
  const [processingStatus, setProcessingStatus] = useState("");
  // 処理のタイムアウト検出用
  const [isProcessingTimeout, setIsProcessingTimeout] = useState(false);

  // トースト通知用の状態を追加
  const [toastState, setToastState] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error" | "info" | "loading";
  }>({
    visible: false,
    message: "",
    type: "info",
  });

  // トーストを表示する関数
  const showToast = (
    message: string,
    type: "success" | "error" | "info" | "loading",
  ) => {
    setToastState({
      visible: true,
      message,
      type,
    });
  };

  // トーストを閉じる関数
  const closeToast = () => {
    setToastState((prev) => ({ ...prev, visible: false }));
  };

  // フィールド検証関数
  const validateEmail = (): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: "メールアドレスは必須です。" }));
      return false;
    } else if (!emailRegex.test(email)) {
      setErrors((prev) => ({
        ...prev,
        email: "有効なメールアドレスを入力してください。",
      }));
      return false;
    } else {
      setErrors((prev) => ({ ...prev, email: "" }));
      return true;
    }
  };

  const validatePassword = (): boolean => {
    if (!password.trim()) {
      setErrors((prev) => ({
        ...prev,
        password: "パスワードは必須です。",
      }));
      return false;
    } else if (password.length < 8) {
      setErrors((prev) => ({
        ...prev,
        password: "パスワードは8文字以上で入力してください。",
      }));
      return false;
    } else {
      setErrors((prev) => ({ ...prev, password: "" }));
      return true;
    }
  };

  const validateConfirmPassword = (): boolean => {
    if (!confirmPassword.trim()) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "パスワード(確認)は必須です。",
      }));
      return false;
    } else if (confirmPassword !== password) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "パスワードが一致しません。",
      }));
      return false;
    } else {
      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
      return true;
    }
  };

  const validateAllFields = (): boolean => {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();
    return isEmailValid && isPasswordValid && isConfirmPasswordValid;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
  };

  // メール送信ボタンクリック時のハンドラー
  const handleSendCode = async () => {
    if (!email || isLoading) return;

    // ボタンのテキストを変更して、ボタンを無効化
    const button = document.getElementById(
      "send-code-button",
    ) as HTMLButtonElement | null;
    if (button) {
      button.innerHTML = `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    送信中...`;
      button.disabled = true;
    }

    setIsLoading(true);
    setApiError("");

    try {
      await sendVerificationCode();
    } finally {
      setIsLoading(false);
      // ボタンを元に戻す
      if (button) {
        button.innerHTML = "コードを送信";
        button.disabled = false;
      }
    }
  };

  const sendVerificationCode = async () => {
    if (!validateEmail()) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/auth/otp/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Email: email,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        setApiError(
          errorData.message ||
            "検証コードの送信に失敗しました。後でやり直してください。",
        );
        return;
      }

      setCodeSent(true);
      setApiError("");
      // カウントダウンを開始
      setResendCountdown(60);
      const interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (_) {
      setApiError(
        "サーバーとの通信中にエラーが発生しました。ネットワーク接続を確認してください。",
      );
    }
  };

  // 認証コード検証処理
  const verifyOTPAndSetCan = async () => {
    if (verificationCode.length !== 6 || isLoading) {
      return false;
    }

    setIsLoading(true);
    setApiError("");
    setIsVerifying(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/auth/otp/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Email: email,
            OTP: verificationCode,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        setApiError(
          errorData.message ||
            "検証コードの確認に失敗しました。もう一度お試しください。",
        );
        return false;
      }

      setIsVerified(true); // 認証成功フラグを設定
      showToast("認証コードの検証に成功しました", "success"); // 成功メッセージをトースト表示

      // 少し遅延させてからステップ2へ移動
      setTimeout(() => {
        setCurrentStep(2);
      }, 1500);

      return true;
    } catch (_) {
      setApiError(
        "サーバーとの通信中にエラーが発生しました。ネットワーク接続を確認してください。",
      );
      return false;
    } finally {
      setIsLoading(false);
      setIsVerifying(false);
    }
  };

  // カスタムフックを使用
  const sakuraFlowers = useSakuraFlowers();

  const renderSakuraFlowers = () => {
    return sakuraFlowers;
  };

  // ステップインジケーターを追加
  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {[1, 2].map((step) => (
        <div key={step} className="flex flex-col items-center">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
              currentStep === step
                ? "bg-amber-600"
                : currentStep > step
                  ? "bg-green-600"
                  : "bg-gray-300"
            }`}
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
            className={`text-sm mt-2 ${currentStep === step ? "font-bold" : ""}`}
          >
            {step === 1 ? "アカウント確認と認証" : "パスワード設定"}
          </span>
        </div>
      ))}
      <div
        className="absolute left-0 right-0 h-0.5 bg-gray-300 -z-10"
        style={{ top: "1.5rem" }}
      ></div>
    </div>
  );

  const floatAnimation = `
    @keyframes float {
      0% {
        transform: translateY(0) rotate(0deg);
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      90% {
        opacity: 0.7;
      }
      100% {
        transform: translateY(100vh) rotate(360deg);
        opacity: 0;
      }
    }
    .animate-float {
      animation: float 10s linear infinite;
    }
  `;

  // 入力枠のスタイル
  const getInputStyle = (
    fieldName: "email" | "password" | "confirmPassword" | "verificationCode",
  ) => {
    return errors[fieldName]
      ? "w-full px-4 py-3 bg-white bg-opacity-70 rounded-lg border-2 border-red-500 shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 animate-pulse text-gray-900 dark:text-gray-900 placeholder-gray-500 dark:placeholder-gray-500"
      : "w-full px-4 py-3 bg-white bg-opacity-70 rounded-lg border-2 border-amber-800 shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-gray-900 placeholder-gray-500 dark:placeholder-gray-500";
  };

  // パスワードリセット処理
  const handleSubmit = async (e: React.FormEvent): Promise<boolean> => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (!validateAllFields()) {
      return false;
    }

    // ステップ1が完了していない場合は処理を中止
    if (currentStep === 1 || !isVerified) {
      setApiError("認証を完了してください");
      return false;
    }

    // 処理中の状態をクリアに設定
    setIsLoading(true);
    setApiError("");
    setProcessingStatus("パスワードを再設定中です。しばらくお待ちください...");
    setIsProcessingTimeout(false);

    // 処理中トーストを表示
    showToast("パスワードを再設定中です...", "loading");

    // 処理タイムアウト検出用タイマーを設定
    const timeout = setTimeout(() => {
      setIsProcessingTimeout(true);
      setProcessingStatus("処理に時間がかかっています...");
    }, 5000);

    try {
      const baseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "";
      const cleanEmail = email.trim();
      const cleanPassword = password.trim();

      // Directly call the password reset endpoint
      const resetEndpoint = `${baseURL}/password/reset`;

      // Create payload matching backend expectations
      const payload = {
        Email: cleanEmail,
        OTP: verificationCode,
        NewPassword: cleanPassword,
      };

      // Try different approaches in case one fails
      let response = await fetch(resetEndpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // If still fails, try a third approach with /password/forgot instead
      if (!response.ok) {
        const forgotEndpoint = `${baseURL}/password/forgot`;
        response = await fetch(forgotEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Email: cleanEmail,
            NewPassword: cleanPassword,
            OTP: verificationCode,
          }),
        });
      }

      // Get the response text and parse if JSON
      const responseText = await response.text();
      let responseData = null;

      try {
        if (
          responseText &&
          (responseText.trim().startsWith("{") ||
            responseText.trim().startsWith("["))
        ) {
          responseData = JSON.parse(responseText);
        }
      } catch {
        /* パースエラーは無視 */
      }

      clearTimeout(timeout);
      if (response.ok) {
        // パスワードリセット成功
        setResetSuccess(true);
        setApiError("");
        setIsLoading(false);
        setProcessingStatus("");
        showToast(
          "パスワードが正常にリセットされました。新しいパスワードでログインできます。",
          "success",
        );

        setTimeout(() => {
          goToLoginPage();
        }, 5000); // 5秒後に自動的にログインページに移動
        return true;
      } else {
        let errorMessage = "パスワードのリセットに失敗しました。";

        if (responseData?.message) {
          errorMessage = responseData.message;
        } else if (responseData?.Error) {
          errorMessage = responseData.Error;
        }

        if (response.status === 404) {
          errorMessage += " 該当するエンドポイントが見つかりません。";
        } else if (response.status === 400) {
          errorMessage += " リクエストの形式が正しくありません。";
        } else if (response.status === 401 || response.status === 403) {
          errorMessage += " 認証コードが無効または期限切れです。";
        } else if (response.status >= 500) {
          errorMessage +=
            " サーバーエラーが発生しました。しばらく時間をおいて再度お試しください。";
        }

        setApiError(errorMessage);
        setIsLoading(false);
        setProcessingStatus("");
        showToast("パスワードのリセットに失敗しました", "error");
        return false;
      }
    } catch (_) {
      clearTimeout(timeout);
      setApiError(
        "サーバーとの通信中にエラーが発生しました。ネットワーク接続を確認してください。",
      );
      setIsLoading(false);
      setProcessingStatus("");
      showToast("サーバーエラーが発生しました", "error");
      return false;
    }
  };

  // ステップ1: メールアドレス入力と認証コード送信/検証
  const renderStep1 = () => (
    <div className="flex flex-col space-y-6 w-full max-w-md">
      {/* メールアドレスフィールド */}
      <div className="mb-6">
        <div className="relative">
          <WoodenSign width="w-full" rotation="-rotate-1">
            <div className="flex items-center">
              <label className="text-yellow-950 text-lg font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                メールアドレス
              </label>
              <RequiredTag />
            </div>
          </WoodenSign>
        </div>
        <div className="relative mt-2">
          <input
            type="email"
            id="email"
            name="email"
            placeholder="例）taro@example.com"
            value={email}
            onChange={handleEmailChange}
            onBlur={() => validateEmail()}
            className={getInputStyle("email")}
            disabled={isVerified || isLoading}
          />
          {errors.email && submitAttempted && (
            <BookmarkError message={errors.email} />
          )}
        </div>
      </div>

      {/* 認証コード送信ボタン */}
      <div className="flex justify-center mt-4">
        <button
          type="button"
          id="send-code-button"
          onClick={handleSendCode}
          className={`px-6 py-3 rounded-lg text-white font-bold transition-colors shadow-md ${
            codeSent && resendCountdown > 0
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-rose-900 hover:bg-rose-800"
          } focus:outline-none`}
          style={{
            textShadow: "0 2px 2px rgba(0,0,0,0.5)",
            boxShadow:
              "0 4px 6px rgba(0,0,0,0.3), inset 0 -2px 5px rgba(0,0,0,0.2), inset 0 2px 5px rgba(255,255,255,0.2)",
          }}
          disabled={(codeSent && resendCountdown > 0) || isLoading || !email}
        >
          {codeSent && resendCountdown > 0
            ? `再送信 (${resendCountdown}秒)`
            : codeSent
              ? "認証コードを再送信"
              : "認証コードを送信"}
        </button>
      </div>

      {/* 認証コード入力と検証 (認証コード送信後のみ表示) */}
      {codeSent && (
        <div className="mt-6">
          <div className="mb-6">
            <div className="relative">
              <WoodenSign width="w-full" rotation="rotate-1">
                <div className="flex items-center">
                  <label className="text-yellow-950 text-lg font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                    認証コード
                  </label>
                  <RequiredTag />
                  {isVerified && (
                    <span className="ml-2 px-2 py-0.5 bg-green-600 text-white text-xs font-bold rounded-full">
                      ✓ 検証済み
                    </span>
                  )}
                </div>
              </WoodenSign>
            </div>
            <div className="relative mt-2">
              <input
                type="text"
                id="verificationCode"
                name="verificationCode"
                placeholder="メールで受け取った6桁のコード"
                value={verificationCode}
                onChange={handleVerificationCode}
                className={`${getInputStyle("verificationCode")} ${
                  isVerified ? "bg-green-50 border-green-500" : ""
                }`}
                disabled={isVerified || isVerifying}
              />
              {isVerified && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              )}
            </div>
            {errors.verificationCode && submitAttempted && (
              <BookmarkError message={errors.verificationCode} />
            )}
          </div>
          <div className="flex justify-center mt-4">
            <button
              type="button"
              onClick={verifyOTPAndSetCan}
              className={`px-6 py-3 rounded-lg text-white font-bold transition-colors shadow-md ${
                isVerified
                  ? "bg-green-600 cursor-not-allowed"
                  : "bg-rose-900 hover:bg-rose-800"
              } focus:outline-none flex items-center justify-center`}
              style={{
                textShadow: "0 2px 2px rgba(0,0,0,0.5)",
                boxShadow:
                  "0 4px 6px rgba(0,0,0,0.3), inset 0 -2px 5px rgba(0,0,0,0.2), inset 0 2px 5px rgba(255,255,255,0.2)",
              }}
              disabled={isVerified || isVerifying || !verificationCode.trim()}
            >
              {isVerified ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  認証完了
                </>
              ) : isVerifying ? (
                "検証中..."
              ) : (
                "認証コードを検証"
              )}
            </button>
          </div>
        </div>
      )}

      {/* APIエラーメッセージ */}
      {apiError && (
        <div className="text-red-500 text-sm mt-4 text-center">{apiError}</div>
      )}
    </div>
  );

  const handleChangeStep = (newStep: number) => {
    // 読み込み中は遷移を防止
    if (isLoading) {
      return;
    }

    // 次のステップに進む前に現在のステップを検証
    const isValid = validateCurrentStep(currentStep);
    if (!isValid) {
      return;
    }

    // ステップ3（パスワードリセット）に移動するためのロジック
    if (currentStep === 2 && newStep === 3) {
      // handleSubmitに渡すための合成イベントオブジェクトを作成
      const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSubmit(syntheticEvent);
      return;
    }

    setCurrentStep(newStep);
  };

  // 各ステップを検証する関数を追加
  const validateCurrentStep = (step: number): boolean => {
    if (step === 1) {
      // ステップ1の場合、メールアドレスが有効で検証が完了しているか確認
      if (!validateEmail()) {
        setApiError("有効なメールアドレスを入力してください。");
        return false;
      }
      if (!isVerified) {
        setApiError("認証コードを検証してください。");
        return false;
      }
      return true;
    } else if (step === 2) {
      // ステップ2の場合、パスワードフィールドを検証
      return validatePassword() && validateConfirmPassword();
    }
    return true;
  };

  // ローディングオーバーレイをより視認性が高くなるように強化
  const LoadingOverlay = ({ message }: { message: string }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
      <div className="bg-white p-8 rounded-lg shadow-2xl flex flex-col items-center max-w-md w-full">
        <div className="w-20 h-20 mb-6 relative">
          <svg
            className="animate-spin h-20 w-20 text-amber-600"
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
        </div>
        <p className="text-xl font-bold text-gray-800 text-center mb-2">
          {message}
        </p>
        <p className="mt-2 text-sm text-gray-600 text-center mb-4">
          処理が完了するまでお待ちください...
        </p>

        {isProcessingTimeout && (
          <div className="mt-4 text-sm text-amber-600 p-4 bg-amber-50 rounded-md border border-amber-200 w-full">
            <p className="font-medium">{processingStatus}</p>
            <button
              onClick={() => {
                setIsLoading(false);
                setIsProcessingTimeout(false);
                setProcessingStatus("");
              }}
              className="mt-3 px-4 py-2 bg-white border border-amber-300 rounded-md text-amber-700 hover:bg-amber-50 font-medium w-full"
            >
              キャンセル
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // ログインページに移動する関数
  const goToLoginPage = () => {
    try {
      window.location.href = "/login";

      // ホームページが正常に読み込まれたら、ログインページに移動を試みる
      setTimeout(() => {
        try {
          window.location.href = "/login";
        } catch (_) {
          // 最終的なフォールバックとして、ページを更新
          window.location.reload();
        }
      }, 500);
    } catch (_) {
      // 最後の手段としてページを更新
      window.location.reload();
    }
  };

  // カウントダウンタイマー
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendCountdown]);

  // 認証コード入力ハンドラを追加
  const handleVerificationCode = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationCode(e.target.value);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-orange-100 flex justify-center items-center py-10 px-4">
      {/* LoadingオーバーレイはisLoadingがtrueの場合のみ表示 */}
      {isLoading && (
        <LoadingOverlay
          message={
            currentStep === 2
              ? "パスワードを再設定中です..."
              : "認証コードを送信中..."
          }
        />
      )}
      {isVerifying && <LoadingOverlay message="認証コードを検証中..." />}
      {/* 背景の羊皮紙風テクスチャ */}
      <div className="absolute inset-0 bg-cover bg-center opacity-80"></div>
      <style jsx>{floatAnimation}</style>
      <style jsx>{toastAnimation}</style>
      {renderSakuraFlowers()}

      {/* トースト通知 */}
      {toastState.visible && (
        <Toast
          message={toastState.message}
          type={toastState.type}
          onClose={closeToast}
        />
      )}

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
      <div className="relative z-10 w-full max-w-lg bg-white bg-opacity-90 rounded-xl shadow-lg p-8">
        {/* タイトル木の看板 */}
        <div className="flex justify-center -mt-16 mb-6">
          <button
            className="relative px-10 py-3 bg-rose-900 text-white font-bold rounded-md transform transition-transform focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-lg"
            style={{
              textShadow: "0 2px 2px rgba(0,0,0,0.5)",
              boxShadow:
                "0 4px 6px rgba(0,0,0,0.3), inset 0 -2px 5px rgba(0,0,0,0.2), inset 0 2px 5px rgba(255,255,255,0.2)",
            }}
          >
            <h1 className="text-2xl font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
              パスワード再設定
            </h1>
          </button>
        </div>

        {/* API エラーメッセージ */}
        {apiError && (
          <div className="mb-4 w-full">
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
        <div className="relative">
          <StepIndicator />
        </div>

        {/* フォームコンテンツ - ステップに応じて表示を切り替え */}
        <div className="space-y-6">
          {/* ステップ1: メールアドレス入力と認証コード送信/検証 */}
          {currentStep === 1 && renderStep1()}

          {/* ステップ2: パスワード設定 (旧ステップ3) */}
          {currentStep === 2 && (
            <>
              <div className="mb-6 bg-amber-50 bg-opacity-90 p-4 rounded-lg border-2 border-amber-200 shadow-md">
                <h2 className="text-lg font-bold text-amber-800 mb-2 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-amber-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  新しいパスワードの設定
                </h2>
                <p className="text-sm text-gray-700">
                  新しいパスワードを設定し、確認のために同じパスワードを再入力してください。
                </p>
              </div>

              {/* パスワードフィールド */}
              <div className="mb-6">
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
                    onChange={(e) => {
                      setPassword(e.target.value);
                      validatePassword();
                    }}
                    className={getInputStyle("password")}
                    placeholder="8文字以上の安全なパスワード"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPassword(!showPassword);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-amber-800 focus:outline-none"
                    aria-label={
                      showPassword ? "パスワードを隠す" : "パスワードを表示"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && submitAttempted && (
                  <BookmarkError message={errors.password} />
                )}
              </div>

              {/* パスワード確認フィールド */}
              <div className="mb-6">
                <div className="relative">
                  <WoodenSign width="w-full" rotation="-rotate-1">
                    <div className="flex items-center">
                      <label className="text-yellow-950 text-lg font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                        パスワード（確認）
                      </label>
                      <RequiredTag />
                    </div>
                  </WoodenSign>
                </div>
                <div className="relative mt-2">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      validateConfirmPassword();
                    }}
                    className={getInputStyle("confirmPassword")}
                    placeholder="同じパスワードを再入力"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowConfirmPassword(!showConfirmPassword);
                    }}
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
                      <li>大文字、小文字、数字を混ぜると安全です</li>
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
                onClick={(e) => {
                  e.preventDefault();
                  handleChangeStep(1);
                  setSubmitAttempted(false);
                }}
                className="px-6 py-3 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-md transition-colors"
                style={{
                  textShadow: "0 1px 1px rgba(0,0,0,0.5)",
                  boxShadow:
                    "0 4px 6px rgba(0,0,0,0.1), inset 0 -2px 5px rgba(0,0,0,0.1), inset 0 2px 5px rgba(255,255,255,0.1)",
                }}
              >
                戻る
              </button>
            ) : (
              <div>{/* 空のdivでスペースを確保 */}</div>
            )}

            {currentStep < 3 ? (
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  // ステップ2で、パスワードリセットフォームを送信しようとしている場合、
                  // handleChangeStepを呼び出し、これによりhandleSubmitがトリガーされます
                  handleChangeStep(currentStep < 2 ? currentStep + 1 : 3);
                }}
                disabled={
                  (currentStep === 1 && (!isVerified || !codeSent)) || isLoading
                }
                className={`px-6 py-3 text-white font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-transform transform shadow-lg ${
                  (currentStep === 1 && (!isVerified || !codeSent)) || isLoading
                    ? "bg-gray-400 cursor-not-allowed opacity-60"
                    : "bg-rose-900 hover:bg-rose-800 hover:scale-105"
                }`}
                style={{
                  textShadow: "0 2px 2px rgba(0,0,0,0.5)",
                  boxShadow:
                    "0 4px 6px rgba(0,0,0,0.3), inset 0 -2px 5px rgba(0,0,0,0.2), inset 0 2px 5px rgba(255,255,255,0.2)",
                }}
              >
                {isLoading && currentStep === 2 ? (
                  <span className="flex items-center justify-center">
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
                    再設定中...
                  </span>
                ) : currentStep === 2 ? (
                  "パスワードを再設定"
                ) : (
                  "次へ"
                )}
              </button>
            ) : (
              <button
                onClick={() => {
                  setResetSuccess(false);
                  handleChangeStep(-1);
                  setSubmitAttempted(false);
                  setIsVerified(false);
                  setCodeSent(false);
                  setVerificationCode("");
                }}
                disabled={isLoading || resetSuccess}
                className={`relative px-8 py-3 bg-rose-900 text-white font-bold rounded-lg transform transition-transform focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-lg ${
                  isLoading || resetSuccess
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:scale-105 hover:bg-amber-700"
                }`}
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
                    送信中...
                  </span>
                ) : (
                  <span>パスワードを再設定</span>
                )}
              </button>
            )}
          </div>

          {/* ログインリンク */}
          <div className="text-center mt-6">
            <p className="text-gray-700">
              {!resetSuccess && "パスワードの再設定が完了したら"}
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

      {/* 成功ダイアログ - より良い視認性と明確な指示のために修正 */}
      {resetSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full m-4 relative transform transition-all shadow-xl animate-bounce-once">
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button
                onClick={goToLoginPage}
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                aria-label="閉じる"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-5">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>

              <h3 className="text-2xl leading-6 font-bold text-gray-900 mb-4">
                パスワードの再設定が完了しました！
              </h3>

              <div className="mt-2">
                <p className="text-gray-700 mb-2 text-lg">
                  パスワードが正常に変更されました。
                </p>
                <p className="text-amber-700 font-medium mb-6">
                  ログインページに移動して、新しいパスワードでログインしてください。
                </p>
                <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-md mb-6">
                  <p className="text-sm text-amber-800">
                    <span className="font-bold">5秒後</span>
                    に自動的にログインページに移動します...
                  </p>
                </div>
              </div>

              <button
                onClick={goToLoginPage}
                className="w-full inline-flex justify-center rounded-md border border-transparent px-6 py-4 bg-rose-900 text-base font-medium text-white shadow-sm hover:bg-rose-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition transform hover:scale-105"
              >
                今すぐログインページへ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 成功ダイアログのアニメーションを追加 */}
      <style jsx global>{`
        @keyframes bounce-once {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        .animate-bounce-once {
          animation: bounce-once 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default PasswordReset;
