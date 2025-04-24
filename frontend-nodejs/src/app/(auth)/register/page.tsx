"use client";

import type React from "react";
import { useState, type ReactNode, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Shield, Info, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
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

// 情報メッセージコンポーネント
const InfoMessage = ({ children }: { children: ReactNode }) => {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-md shadow-md mt-2 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <Info size={20} className="text-amber-500" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-amber-800">{children}</p>
        </div>
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

// APIレスポンスの型定義
interface APIResponse {
  Error?: string;
  message?: string;
}

interface RegisterResponse extends APIResponse {
  User?: {
    ID?: string;
    Username?: string;
    DisplayName?: string;
    Email?: string;
  };
}

const Register = () => {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({
    username: "",
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // ステップベースのフォーム用の状態
  const [currentStep, setCurrentStep] = useState(1);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // パスワード表示/非表示の状態
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  // フィールドの検証
  const validateField = useCallback((field: string, value: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: value.trim() === "",
    }));
  }, []);

  // 全フィールドの検証
  const validateAllFields = () => {
    const isUsernameValid = validateUsername(username);
    const isDisplayNameValid = validateDisplayName(displayName);
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(
      confirmPassword,
      password,
    );

    return (
      isUsernameValid &&
      isDisplayNameValid &&
      isEmailValid &&
      isPasswordValid &&
      isConfirmPasswordValid
    );
  };

  // フィールドのバリデーション関数を修正
  const validateUsername = (value: string) => {
    if (!value) {
      setErrors((prev) => ({ ...prev, username: "ユーザー名は必須です" }));
      return false;
    }
    if (value.length < 3) {
      setErrors((prev) => ({
        ...prev,
        username: "ユーザー名は3文字以上必要です",
      }));
      return false;
    }
    if (value.length > 20) {
      setErrors((prev) => ({
        ...prev,
        username: "ユーザー名は20文字以内で入力してください",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, username: "" }));
    return true;
  };

  const validateDisplayName = (value: string) => {
    if (!value) {
      setErrors((prev) => ({ ...prev, displayName: "表示名は必須です" }));
      return false;
    }
    if (value.length > 15) {
      setErrors((prev) => ({
        ...prev,
        displayName: "表示名は15文字以内で入力してください",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, displayName: "" }));
    return true;
  };

  // バリデーション関数
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

  const handleUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (submitAttempted) {
      validateField("username", e.target.value);
    }
  };

  const handleDisplayName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(e.target.value);
    if (submitAttempted) {
      validateField("displayName", e.target.value);
    }
  };

  const handleEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (submitAttempted) {
      validateField("email", e.target.value);
    }
    if (codeSent) {
      setCodeSent(false);
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

  // 認証コード検証関数を追加
  const verifyCode = async () => {
    if (!verificationCode.trim()) {
      setApiError("認証コードを入力してください");
      return false;
    }

    try {
      setIsVerifying(true);
      setApiError("");

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

      // レスポンスボディが空かどうかをチェック
      let responseData: APIResponse = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          responseData = await response.json();
        } catch {}
      }

      if (!response.ok) {
        throw new Error(responseData.Error || "認証コードの検証に失敗しました");
      }

      // 検証成功
      setIsVerified(true);
      return true;
    } catch (error: unknown) {
      let errorMessage = "認証コードの検証中にエラーが発生しました";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setApiError(errorMessage);
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  // パスワード関連のハンドラーを追加
  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    validatePassword(e.target.value);
  };

  const handleConfirmPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    validateConfirmPassword(e.target.value, password);
  };

  // パスワード表示/非表示の切り替え
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // 確認用パスワード表示/非表示の切り替え
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validatePassword = (value: string) => {
    if (!value) {
      setErrors((prev) => ({ ...prev, password: "パスワードは必須です" }));
      return false;
    }
    if (value.length < 8) {
      setErrors((prev) => ({
        ...prev,
        password: "パスワードは8文字以上必要です",
      }));
      return false;
    }
    if (value.length > 50) {
      setErrors((prev) => ({
        ...prev,
        password: "パスワードは50文字以内で入力してください",
      }));
      return false;
    }
    // 大文字・小文字、数字、記号を含むかどうか検証
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

    if (!(hasUppercase && hasLowercase && hasNumber && hasSymbol)) {
      setErrors((prev) => ({
        ...prev,
        password:
          "パスワードは大文字・小文字、数字、記号をそれぞれ1つ以上含む必要があります",
      }));
      return false;
    }

    setErrors((prev) => ({ ...prev, password: "" }));
    return true;
  };

  const validateConfirmPassword = (value: string, passwordToMatch: string) => {
    if (!value) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "パスワード(確認)は必須です",
      }));
      return false;
    }
    if (value !== passwordToMatch) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "パスワードが一致しません",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    return true;
  };

  const validateUsernameAndDisplayName = () => {
    let isValid = true;

    if (!username.trim()) {
      setErrors((prev) => ({
        ...prev,
        username: "ユーザー名を入力してください",
      }));
      isValid = false;
    } else {
      setErrors((prev) => ({ ...prev, username: "" }));
    }

    if (!displayName.trim()) {
      setErrors((prev) => ({
        ...prev,
        displayName: "ニックネームを入力してください",
      }));
      isValid = false;
    } else {
      setErrors((prev) => ({ ...prev, displayName: "" }));
    }

    return isValid;
  };

  const validateEmailAndCode = () => {
    let isValid = true;

    if (!validateEmail()) {
      isValid = false;
    }

    if (!codeSent) {
      setApiError("メールアドレスに認証コードを送信してください");
      isValid = false;
    } else if (!isVerified) {
      setApiError("認証コードを検証してください");
      isValid = false;
    }

    return isValid;
  };

  // メール送信処理
  const sendVerificationCode = async () => {
    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);
    setApiError("");

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

      // レスポンスボディが空かどうかをチェック
      let responseData: APIResponse = {};
      try {
        responseData = await response.json();
      } catch {
        // レスポンスがJSONでない場合（空のボディなど）はスキップ
      }

      if (!response.ok) {
        throw new Error(responseData.Error || "認証コードの送信に失敗しました");
      }

      setCodeSent(true);
      setResendCountdown(60); // 60秒間は再送信不可
      alert(`${email}に認証コードを送信しました。メールをご確認ください。`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "認証コードの送信に失敗しました";
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 登録を完了する
  const handleSubmit = async () => {
    if (!validateAllFields()) {
      setSubmitAttempted(true);
      return;
    }

    // ローディング状態を設定
    setIsLoading(true);
    setApiError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Username: username,
            DisplayName: displayName,
            Email: email,
            Password: password,
          }),
        },
      );

      let responseData: RegisterResponse = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          responseData = await response.json();
        } catch {}
      }

      if (!response.ok) {
        throw new Error(
          responseData.Error || responseData.message || "登録に失敗しました",
        );
      }

      // 登録成功したことをコンソールに記録
      console.log("アカウント登録が完了しました。");

      try {
        // 自動ログインを試みる
        console.log("自動ログインを試行中...");
        const loginResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              Email: email,
              Password: password,
            }),
            credentials: "include",
          },
        );

        // レスポンスを取得
        const loginResponseText = await loginResponse.text();
        console.log("自動ログインレスポンス:", loginResponseText);

        if (loginResponse.ok && loginResponseText) {
          try {
            const loginData = JSON.parse(loginResponseText);
            if (loginData.Token) {
              // 認証コンテキストのlogin関数を使用してトークンを保存
              login(loginData.Token);

              // ホームページにリダイレクト
              console.log(
                "自動ログインに成功しました。ホームページにリダイレクトします。",
              );
              // 少し遅延を入れて認証状態が更新されるのを待つ
              setTimeout(() => {
                router.push("/settlement");
              }, 100);
              return;
            }
          } catch (parseError) {
            console.error("ログインレスポンスのJSONパースに失敗:", parseError);
          }
        }
      } catch (loginError) {
        console.error("自動ログイン中にエラーが発生:", loginError);
      }

      // 自動ログインに失敗した場合、ログインページに入力済みの情報を渡す
      // URLパラメータ経由でemailを渡す
      router.push(`/login?email=${encodeURIComponent(email)}`);
    } catch (error: unknown) {
      let errorMessage = "登録に失敗しました。もう一度お試しください。";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Register error:", error);
      setApiError(errorMessage);
      setIsLoading(false); // エラー時はローディング状態を解除
    }
  };

  // ステップを進める
  const nextStep = () => {
    if (currentStep === 1 && !validateUsernameAndDisplayName()) {
      setSubmitAttempted(true);
      return;
    }

    if (currentStep === 2 && !validateEmailAndCode()) {
      setSubmitAttempted(true);
      return;
    }

    setCurrentStep((prev) => prev + 1);
    setSubmitAttempted(false);
  };

  // ステップを戻る
  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
    setSubmitAttempted(false);
  };

  // カスタムフックを使用
  const sakuraFlowers = useSakuraFlowers();

  const renderSakuraFlowers = () => {
    return sakuraFlowers;
  };

  // ステップインジケーターを追加
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
            {step === 1 ? "プロフィール" : step === 2 ? "認証" : "パスワード"}
          </span>
        </div>
      ))}
      <div
        className="absolute left-0 right-0 h-0.5 bg-gray-300 -z-10"
        style={{ top: "1.25rem" }}
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
  const getInputStyle = (fieldName: "username" | "displayName" | "email") => {
    return errors[fieldName]
      ? "w-full px-4 py-3 bg-white bg-opacity-70 rounded-lg border-2 border-red-500 shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 animate-pulse text-gray-900 dark:text-gray-900 placeholder-gray-500 dark:placeholder-gray-500"
      : "w-full px-4 py-3 bg-white bg-opacity-70 rounded-lg border-2 border-amber-800 shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-gray-900 placeholder-gray-500 dark:placeholder-gray-500";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Add a component for the full-page loading overlay
  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center max-w-sm w-full">
        <svg
          className="animate-spin h-16 w-16 text-amber-600 mb-4"
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
        <h3 className="text-xl font-bold text-amber-800 mb-2">登録処理中...</h3>
        <p className="text-sm text-gray-600 text-center">
          アカウントを作成しています。
          <br />
          このまましばらくお待ちください。
        </p>
      </div>
    </div>
  );

  // リアルタイムで入力フィールドの検証を行う
  useEffect(() => {
    if (submitAttempted && currentStep === 1) {
      validateUsername(username);
      validateDisplayName(displayName);
    }
  }, [username, displayName, submitAttempted, currentStep]);

  // リアルタイムでパスワードフィールドの検証を行う
  useEffect(() => {
    if (submitAttempted && currentStep === 3) {
      validatePassword(password);
      validateConfirmPassword(confirmPassword, password);
    }
  }, [password, confirmPassword, submitAttempted, currentStep]);

  // ユーザー名とニックネームが入力されているかチェックする
  const areBasicFieldsValid = () => {
    return username.trim().length > 0 && displayName.trim().length > 0;
  };

  // パスワードフィールドが有効かチェックする
  const arePasswordFieldsValid = () => {
    return password.length >= 8 && password === confirmPassword;
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-orange-100 flex justify-center items-center py-10 px-4">
      {/* Loading overlay - show only when isLoading is true */}
      {isLoading && <LoadingOverlay />}
      {/* 背景の羊皮紙風テクスチャ */}
      <div className="absolute inset-0 bg-cover bg-center opacity-80"></div>
      <style jsx>{floatAnimation}</style>
      {renderSakuraFlowers()}

      {/* 桜の枝 - 左上 */}
      <div className="absolute top-0 left-0 w-64 h-64">
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
      <div className="absolute bottom-0 right-0 w-64 h-64">
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
              入学受付フォーム
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
          {/* ステップ1: ユーザー情報 */}
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

              {/* ユーザー名フィールド */}
              <div className="mb-6">
                <WoodenSign width="w-full" rotation="rotate-1">
                  <label
                    htmlFor="username"
                    className="text-yellow-950 text-lg font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]"
                  >
                    ユーザー名
                  </label>
                </WoodenSign>
                <div className="relative mt-2">
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={handleUsername}
                    className={getInputStyle("username")}
                    placeholder="ユーザー名を設定"
                    maxLength={100}
                  />
                  <div className="text-xs text-gray-600 mt-1 mb-2 text-right">
                    {username.length}/100
                    {username.length >= 90 && username.length < 100 && (
                      <span className="text-amber-500 ml-2">
                        制限に近づいています
                      </span>
                    )}
                    {username.length >= 100 && (
                      <span className="text-red-500 ml-2">
                        文字数制限に達しました
                      </span>
                    )}
                  </div>
                </div>
                {errors.username && <BookmarkError message={errors.username} />}
              </div>

              {/* 表示名フィールド */}
              <div className="mb-6">
                <WoodenSign width="w-full" rotation="-rotate-1">
                  <label
                    htmlFor="displayName"
                    className="text-yellow-950 text-lg font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]"
                  >
                    ニックネーム
                  </label>
                </WoodenSign>
                <div className="relative mt-2">
                  <input
                    type="text"
                    id="displayName"
                    value={displayName}
                    onChange={handleDisplayName}
                    className={getInputStyle("displayName")}
                    placeholder="表示される名前を設定"
                    maxLength={100}
                  />
                  <div className="text-xs text-gray-600 mt-1 mb-2 text-right">
                    {displayName.length}/100
                    {displayName.length >= 90 && displayName.length < 100 && (
                      <span className="text-amber-500 ml-2">
                        制限に近づいています
                      </span>
                    )}
                    {displayName.length >= 100 && (
                      <span className="text-red-500 ml-2">
                        文字数制限に達しました
                      </span>
                    )}
                  </div>
                </div>
                {errors.displayName && (
                  <BookmarkError message={errors.displayName} />
                )}
              </div>
            </>
          )}

          {/* ステップ2: メールとOTP認証 */}
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

              {/* メールアドレスフィールド */}
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
                    onChange={handleEmail}
                    className={getInputStyle("email")}
                    placeholder="認証に使用するメールアドレス"
                    maxLength={100}
                  />
                  <div className="text-xs text-gray-600 mt-1 mb-2 text-right">
                    {email.length}/100
                    {email.length >= 90 && email.length < 100 && (
                      <span className="text-amber-500 ml-2">
                        制限に近づいています
                      </span>
                    )}
                    {email.length >= 100 && (
                      <span className="text-red-500 ml-2">
                        文字数制限に達しました
                      </span>
                    )}
                  </div>
                </div>
                {errors.email && <BookmarkError message={errors.email} />}
              </div>

              <div className="mt-2">
                <button
                  type="button"
                  onClick={sendVerificationCode}
                  disabled={resendCountdown > 0 || !email}
                  className={`relative w-full py-2 px-4 flex items-center justify-center ${
                    codeSent
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-amber-600 hover:bg-amber-700"
                  } text-white font-medium rounded-md transform transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-md ${
                    resendCountdown > 0 || !email
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:scale-[1.02]"
                  }`}
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
                登録を完了するには、メールアドレスの確認が必要です。
                「メールに認証コードを送信」ボタンをクリックして、
                メールに届いた認証コードを確認してください。
              </InfoMessage>

              {/* 認証コード入力フィールド */}
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
                      onChange={handleVerificationCode}
                      onKeyDown={handleKeyDown}
                      className={`w-full px-4 py-3 bg-white bg-opacity-70 rounded-lg border-2 ${
                        isVerified ? "border-green-500" : "border-amber-800"
                      } shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-gray-900 placeholder-gray-500 dark:placeholder-gray-500`}
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
                      className={`relative mt-2 py-2 px-4 flex items-center justify-center ${
                        isVerifying
                          ? "bg-gray-400"
                          : "bg-blue-600 hover:bg-blue-700"
                      } text-white font-medium rounded-md transform transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md ${
                        isVerifying || !verificationCode.trim()
                          ? "opacity-70 cursor-not-allowed"
                          : "hover:scale-[1.02]"
                      }`}
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

              {/* パスワードフィールド */}
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
                    onChange={handlePassword}
                    onKeyDown={handleKeyDown}
                    className={`${
                      errors.password && submitAttempted
                        ? "bg-white border-red-500"
                        : "bg-white"
                    } h-10 block px-3 w-full border border-brown-300 rounded text-sm shadow-sm placeholder-brown-400 focus:outline-none focus:border-brown-500 focus:ring-1 focus:ring-brown-500`}
                    placeholder="例）taro1234"
                    maxLength={50}
                  />
                  <div className="text-xs text-gray-600 mt-1 mb-2 text-right">
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
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900"
                    onClick={togglePasswordVisibility}
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
                </div>
                {errors.password && (
                  <div className="mt-2 text-red-500">{errors.password}</div>
                )}
              </div>

              {/* パスワード確認フィールド */}
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
                    onChange={handleConfirmPassword}
                    className="w-full px-4 py-3 pr-12 bg-white bg-opacity-70 rounded-lg border-2 border-amber-800 shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-gray-900 placeholder-gray-500 dark:placeholder-gray-500"
                    placeholder="同じパスワードを再入力"
                    maxLength={50}
                  />
                  <div className="text-xs text-gray-600 mt-1 mb-2 text-right">
                    {confirmPassword.length}/50
                    {confirmPassword.length >= 45 &&
                      confirmPassword.length < 50 && (
                        <span className="text-amber-500 ml-2">
                          制限に近づいています
                        </span>
                      )}
                    {confirmPassword.length >= 50 && (
                      <span className="text-red-500 ml-2">
                        文字数制限に達しました
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
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
                {errors.confirmPassword && (
                  <div className="mt-2 text-red-500">
                    {errors.confirmPassword}
                  </div>
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
                onClick={prevStep}
                className="px-6 py-2 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                戻る
              </button>
            ) : (
              <div></div> // 空のdivでスペースを確保
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && !areBasicFieldsValid()) ||
                  (currentStep === 2 && (!isVerified || !codeSent))
                }
                className={`px-6 py-2 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  (currentStep === 1 && !areBasicFieldsValid()) ||
                  (currentStep === 2 && (!isVerified || !codeSent))
                    ? "bg-gray-400 cursor-not-allowed opacity-60"
                    : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                次へ
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading || !arePasswordFieldsValid()}
                className={`relative px-8 py-3 bg-rose-900 text-white font-bold rounded-lg transform transition-transform focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-lg ${
                  isLoading || !arePasswordFieldsValid()
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
    </div>
  );
};

export default Register;
