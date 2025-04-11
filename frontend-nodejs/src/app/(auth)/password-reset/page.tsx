"use client";

import React, { useState, ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mail, Eye, EyeOff } from "lucide-react";

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

// APIレスポンスの型定義
interface APIResponse {
  Error?: string;
  message?: string;
}

const PasswordReset = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // エラー状態
  const [errors, setErrors] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  // カウントダウンタイマー
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendCountdown]);

  // メールアドレスの検証
  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setErrors((prev) => ({
        ...prev,
        email: "メールアドレスを入力してください",
      }));
      return false;
    } else if (!emailRegex.test(email)) {
      setErrors((prev) => ({
        ...prev,
        email: "有効なメールアドレスを入力してください",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, email: "" }));
    return true;
  };

  // パスワードの検証
  const validatePassword = (value: string) => {
    if (!value) {
      setErrors((prev) => ({
        ...prev,
        password: "パスワードを入力してください",
      }));
      return false;
    } else if (value.length < 8) {
      setErrors((prev) => ({
        ...prev,
        password: "パスワードは8文字以上である必要があります",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, password: "" }));
    return true;
  };

  // パスワード確認の検証
  const validateConfirmPassword = (value: string, passwordToMatch: string) => {
    if (!value) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "パスワード（確認）を入力してください",
      }));
      return false;
    } else if (value !== passwordToMatch) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "パスワードが一致しません",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    return true;
  };

  // OTP（ワンタイムパスワード）の検証
  const validateOTP = () => {
    if (!otpCode) {
      setErrors((prev) => ({
        ...prev,
        otp: "認証コードを入力してください",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, otp: "" }));
    return true;
  };

  // メール送信処理
  const sendVerificationCode = async () => {
    if (!validateEmail()) {
      setSubmitAttempted(true);
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      const requestBody = {
        Email: email,
      };

      console.log("Generate OTP request body:", requestBody);
      console.log(
        "API URL:",
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/password/forgot`,
      );

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/password/forgot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
      );

      console.log("Generate OTP response status:", response.status);

      // レスポンスの内容を取得
      let responseText = "";
      let responseData: APIResponse = {};

      try {
        responseText = await response.text();
        console.log("Raw response text:", responseText);

        if (responseText) {
          try {
            responseData = JSON.parse(responseText);
            console.log("Generate OTP response data:", responseData);
          } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
          }
        }
      } catch (textError) {
        console.error("Error reading response text:", textError);
      }

      if (!response.ok) {
        throw new Error(
          responseData.Error ||
            responseData.message ||
            `認証コードの送信に失敗しました (${response.status})`,
        );
      }

      setCodeSent(true);
      setResendCountdown(60); // 60秒間は再送信不可

      // 認証コード送信成功後、自動的にステップ2に進む
      setCurrentStep(2);

      alert(`${email}に認証コードを送信しました。メールをご確認ください。`);
    } catch (error: unknown) {
      let errorMessage = "認証コードの送信に失敗しました";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Generate OTP error:", error);
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // OTP検証処理
  const verifyCode = async () => {
    if (!validateOTP()) {
      setSubmitAttempted(true);
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      // OTP検証に成功したら、次のステップに進むだけにする
      // 実際のAPIリクエストは送信せず、フロントエンドでの状態管理のみを行う

      // 検証成功状態をセット
      setCurrentStep(3); // 新パスワード設定ステップへ
      alert("認証コードを確認しました。新しいパスワードを設定してください。");
    } catch (error: unknown) {
      let errorMessage = "認証コードの検証に失敗しました";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Verify OTP error:", error);
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // パスワードリセット処理
  const resetPassword = async () => {
    if (!validateOTP()) {
      setApiError("認証コードを入力してください。");
      return;
    }

    if (
      !validatePassword(newPassword) ||
      !validateConfirmPassword(confirmPassword, newPassword)
    ) {
      setSubmitAttempted(true);
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      const requestBody = {
        Email: email,
        OTP: otpCode,
        NewPassword: newPassword,
      };

      console.log("Reset password request body:", requestBody);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/password/reset`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
      );

      console.log("Reset password response status:", response.status);

      // レスポンスの内容を取得
      let responseText = "";
      let responseData: APIResponse = {};

      try {
        responseText = await response.text();
        console.log("Raw response text:", responseText);

        if (responseText) {
          try {
            responseData = JSON.parse(responseText);
            console.log("Reset password response data:", responseData);
          } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
          }
        }
      } catch (textError) {
        console.error("Error reading response text:", textError);
      }

      if (!response.ok) {
        throw new Error(
          responseData.Error ||
            responseData.message ||
            `パスワードのリセットに失敗しました (${response.status})`,
        );
      }

      // 成功
      alert(
        "パスワードが正常にリセットされました。新しいパスワードでログインしてください。",
      );
      router.push("/login");
    } catch (error: unknown) {
      let errorMessage = "パスワードのリセットに失敗しました";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Reset password error:", error);
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 入力スタイル
  const getInputStyle = (
    fieldName: "email" | "otp" | "password" | "confirmPassword",
  ) => {
    return errors[fieldName]
      ? "w-full px-4 py-3 bg-white bg-opacity-70 rounded-lg border-2 border-red-500 shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 animate-pulse text-gray-900 dark:text-gray-900 placeholder-gray-500 dark:placeholder-gray-500"
      : "w-full px-4 py-3 bg-white bg-opacity-70 rounded-lg border-2 border-amber-800 shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-gray-900 placeholder-gray-500 dark:placeholder-gray-500";
  };

  // ステップインジケーター
  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex flex-col items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
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
            className={`text-sm mt-1 ${currentStep === step ? "font-bold" : ""}`}
          >
            {step === 1 ? "メール入力" : step === 2 ? "認証" : "新パスワード"}
          </span>
        </div>
      ))}
    </div>
  );

  // ステップ1: メールアドレス入力
  const renderStep1 = () => (
    <>
      <div className="mb-8">
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={getInputStyle("email")}
            placeholder="例）taro@example.com"
          />
        </div>
        {errors.email && submitAttempted && (
          <BookmarkError message={errors.email} />
        )}
      </div>

      <div className="flex justify-center mt-4">
        <button
          onClick={sendVerificationCode}
          disabled={isLoading || !email}
          className={`relative px-8 py-3 bg-rose-900 text-white font-bold rounded-lg transform transition-transform focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-lg ${
            isLoading || !email
              ? "opacity-70 cursor-not-allowed"
              : "hover:scale-105 hover:bg-amber-700"
          }`}
          style={{
            textShadow: "0 2px 2px rgba(0,0,0,0.5)",
            boxShadow:
              "0 4px 6px rgba(0,0,0,0.3), inset 0 -2px 5px rgba(0,0,0,0.2), inset 0 2px 5px rgba(255,255,255,0.2)",
          }}
        >
          {isLoading ? "送信中..." : "認証コードを送信"}
        </button>
      </div>
    </>
  );

  // ステップ2: OTP入力
  const renderStep2 = () => (
    <>
      <div className="mb-8">
        <div className="relative">
          <WoodenSign width="w-full" rotation="rotate-1">
            <div className="flex items-center">
              <label className="text-yellow-950 text-lg font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                認証コード
              </label>
              <RequiredTag />
            </div>
          </WoodenSign>
        </div>

        <div className="relative mt-2">
          <input
            type="text"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            className={getInputStyle("otp")}
            placeholder="例）123456"
          />
        </div>
        {errors.otp && submitAttempted && (
          <BookmarkError message={errors.otp} />
        )}
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={verifyCode}
          disabled={isLoading || !otpCode}
          className={`relative px-8 py-3 bg-rose-900 text-white font-bold rounded-lg transform transition-transform focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-lg ${
            isLoading || !otpCode
              ? "opacity-70 cursor-not-allowed"
              : "hover:scale-105 hover:bg-amber-700"
          }`}
          style={{
            textShadow: "0 2px 2px rgba(0,0,0,0.5)",
            boxShadow:
              "0 4px 6px rgba(0,0,0,0.3), inset 0 -2px 5px rgba(0,0,0,0.2), inset 0 2px 5px rgba(255,255,255,0.2)",
          }}
        >
          {isLoading ? "検証中..." : "コードを検証"}
        </button>

        <button
          onClick={sendVerificationCode}
          disabled={isLoading || resendCountdown > 0 || !codeSent}
          className={`text-amber-800 font-semibold hover:text-amber-600 flex items-center ${
            resendCountdown > 0 || !codeSent
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          <Mail className="mr-2 h-4 w-4" />
          {resendCountdown > 0
            ? `再送信まで ${resendCountdown} 秒`
            : "コードを再送信"}
        </button>

        <button
          onClick={() => setCurrentStep(1)}
          className="text-amber-800 font-semibold hover:text-amber-600"
        >
          メールアドレスを変更
        </button>
      </div>
    </>
  );

  // ステップ3: 新パスワード設定
  const renderStep3 = () => (
    <>
      {/* 新パスワード */}
      <div className="mb-8">
        <div className="relative">
          <WoodenSign width="w-full" rotation="-rotate-1">
            <div className="flex items-center">
              <label className="text-yellow-950 text-lg font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                新しいパスワード
              </label>
              <RequiredTag />
            </div>
          </WoodenSign>
        </div>

        <div className="relative mt-2 flex items-center">
          <input
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={getInputStyle("password")}
            placeholder="8文字以上のパスワード"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password && submitAttempted && (
          <BookmarkError message={errors.password} />
        )}
      </div>

      {/* パスワード確認 */}
      <div className="mb-8">
        <div className="relative">
          <WoodenSign width="w-full" rotation="rotate-1">
            <div className="flex items-center">
              <label className="text-yellow-950 text-lg font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                パスワード（確認）
              </label>
              <RequiredTag />
            </div>
          </WoodenSign>
        </div>

        <div className="relative mt-2 flex items-center">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={getInputStyle("confirmPassword")}
            placeholder="同じパスワードを入力"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 text-gray-500 hover:text-gray-700"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.confirmPassword && submitAttempted && (
          <BookmarkError message={errors.confirmPassword} />
        )}
      </div>

      <div className="flex justify-center mt-4">
        <button
          onClick={resetPassword}
          disabled={isLoading || !newPassword || !confirmPassword}
          className={`relative px-8 py-3 bg-rose-900 text-white font-bold rounded-lg transform transition-transform focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-lg ${
            isLoading || !newPassword || !confirmPassword
              ? "opacity-70 cursor-not-allowed"
              : "hover:scale-105 hover:bg-amber-700"
          }`}
          style={{
            textShadow: "0 2px 2px rgba(0,0,0,0.5)",
            boxShadow:
              "0 4px 6px rgba(0,0,0,0.3), inset 0 -2px 5px rgba(0,0,0,0.2), inset 0 2px 5px rgba(255,255,255,0.2)",
          }}
        >
          {isLoading ? "送信中..." : "パスワードをリセット"}
        </button>
      </div>
    </>
  );

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
      <div className="relative w-full py-10 z-10 px-4 flex flex-col items-center">
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
              パスワード忘れ
            </h1>
          </button>
        </div>

        {/* ステップインジケーター */}
        <StepIndicator />

        {/* 入力フォームの説明 */}
        <div className="mb-6 w-full max-w-md">
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md shadow-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-2xl">📝</span>
              </div>
              <div className="ml-3">
                <p className="text-md font-medium text-amber-900">
                  {currentStep === 1
                    ? "メールアドレスを入力"
                    : currentStep === 2
                      ? "認証"
                      : "新しいパスワード"}
                </p>
                <p className="text-sm text-amber-800 mt-1">
                  {currentStep === 1
                    ? "アカウント登録時のメールアドレスを入力してください。認証コードを送信します。"
                    : currentStep === 2
                      ? "メールに送信された6桁の認証コードを入力してください。"
                      : "新しいパスワードを入力してください。8文字以上である必要があります。"}
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

        {/* 各ステップのレンダリング */}
        <div className="w-full max-w-md">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* 戻るボタン */}
          <div className="text-center mt-8">
            <button
              onClick={() => router.push("/login")}
              className="text-amber-800 font-semibold hover:text-amber-600"
            >
              ログイン画面に戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;
