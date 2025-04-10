"use client";

import type React from "react";
import { useState, type ReactNode, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Shield, Info, AlertTriangle } from "lucide-react";

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

const Register = () => {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [apiError, setApiError] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);

  // 入力エラー状態を管理
  const [errors, setErrors] = useState({
    username: false,
    displayName: false,
    email: false,
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // 認証コード用の状態を追加
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // フィールドの検証
  const validateField = useCallback((field: string, value: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: value.trim() === "",
    }));
  }, []);

  // 全フィールドの検証
  const validateAllFields = useCallback(() => {
    const newErrors = {
      username: username.trim() === "",
      displayName: displayName.trim() === "",
      email: email.trim() === "",
    };

    setErrors(newErrors);
    return !Object.values(newErrors).includes(true);
  }, [username, displayName, email]);

  // メールアドレスの検証
  const validateEmail = useCallback(() => {
    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: true }));
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setApiError("有効なメールアドレスを入力してください");
      return false;
    }
    return true;
  }, [email]);

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
            OTPCode: verificationCode,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "認証コードの検証に失敗しました");
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

  // 登録時の検証を修正
  const handleSubmit = async () => {
    setSubmitAttempted(true);
    setApiError("");

    if (!validateAllFields()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // 認証コードが送信されていない場合は送信を促す
    if (!codeSent) {
      setApiError("登録を完了するには、まず認証コードを送信してください");
      return;
    }

    // 認証コードが検証されていない場合は検証を実行
    if (!isVerified) {
      const verified = await verifyCode();
      if (!verified) return;
    }

    try {
      setIsLoading(true);

      // API request for registration without password
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Username: username,
            Email: email,
            DisplayName: displayName,
            IconImageUrl: "", // Optional field, initial value is an empty string
          }),
          credentials: "include",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "登録処理に失敗しました");
      }

      const data = await response.json();
      console.log("Registration successful:", data);

      // Success message
      alert(`${username}として登録しました。ログイン画面に移動します。`);

      // Redirect to login page
      window.location.href = "/login";
    } catch (error: unknown) {
      console.log("BACKEND_BASE_URL:", process.env.BACKEND_BASE_URL);
      console.error("Registration error:", error);
      let errorMessage = "登録処理中にエラーが発生しました";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // 入力枠のスタイル
  const getInputStyle = (fieldName: "username" | "displayName" | "email") => {
    return errors[fieldName]
      ? "w-full px-4 py-3 bg-white bg-opacity-70 rounded-lg border-2 border-red-500 shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 animate-pulse text-gray-900 dark:text-gray-900 placeholder-gray-500 dark:placeholder-gray-500"
      : "w-full px-4 py-3 bg-white bg-opacity-70 rounded-lg border-2 border-amber-800 shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-gray-900 placeholder-gray-500 dark:placeholder-gray-500";
  };

  const handleSendVerificationCode = async () => {
    // メールアドレスの検証
    if (!validateEmail()) {
      return;
    }

    try {
      setIsSendingCode(true);
      setApiError("");

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
        throw new Error(errorData.error || "認証コードの送信に失敗しました");
      }

      // 成功
      setCodeSent(true);
      setResendCountdown(60); // 60秒間は再送信不可
      alert(`${email}に認証コードを送信しました。メールをご確認ください。`);
    } catch (error: any) {
      setApiError(error.message || "認証コードの送信に失敗しました");
    } finally {
      setIsSendingCode(false);
    }
  };

  const renderSakuraFlowers = useCallback(() => {
    const [flowers, setFlowers] = useState<React.ReactNode[]>([]);

    useEffect(() => {
      const newFlowers = [];
      for (let i = 0; i < 20; i++) {
        const size = Math.random() * 20 + 10;
        const startPositionX = Math.random() * 100;
        const duration = Math.random() * 10 + 10;
        const delay = Math.random() * 10;

        newFlowers.push(
          <div
            key={i}
            className="absolute animate-float opacity-70"
            style={{
              top: `-${size}px`,
              left: `${startPositionX}%`,
              width: `${size}px`,
              height: `${size}px`,
              animation: `float ${duration}s linear ${delay}s infinite`,
            }}
          >
            <div
              className="w-full h-full bg-pink-200 rounded-full"
              style={{
                boxShadow: "0 0 5px rgba(255, 192, 203, 0.7)",
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          </div>,
        );
      }
      setFlowers(newFlowers);
    }, []);

    return flowers;
  }, []);

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

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-orange-100 flex justify-center items-center py-10 px-4">
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

        {/* 共通エラーメッセージ */}
        {submitAttempted && Object.values(errors).includes(true) && (
          <div className="mb-4 w-full">
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
                    赤くなっている部分を入力してね。入力すると色が変わるよ！
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 登録手順の説明 */}
        <div className="mb-6 bg-white bg-opacity-90 p-4 rounded-lg border-2 border-amber-200 shadow-md">
          <h2 className="text-lg font-bold text-amber-800 mb-2">登録の流れ</h2>
          <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
            <li>必要な情報を入力</li>
            <li>
              <span className="font-medium">
                メールアドレスに認証コードを送信
              </span>
            </li>
            <li>メールに届いた認証コードを確認</li>
            <li>「参加する」ボタンで登録完了</li>
          </ol>
        </div>

        {/* フォーム */}
        <div className="space-y-6">
          {/* ユーザー名フィールド */}
          <div className="mb-6">
            <div className="relative">
              <WoodenSign width="w-full">
                <label className="text-yellow-950 text-lg font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                  ユーザー名
                </label>
              </WoodenSign>
            </div>
            <div className="relative mt-2">
              <input
                type="text"
                value={username}
                onChange={handleUsername}
                onKeyDown={handleKeyDown}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                className={getInputStyle("username")}
                placeholder="例）taro"
              />
            </div>
            {errors.username && submitAttempted && (
              <BookmarkError message="ユーザー名を入力してね！" />
            )}
          </div>

          {/* 表示名フィールド */}
          <div className="mb-6">
            <div className="relative">
              <WoodenSign width="w-full">
                <label className="text-yellow-950 text-lg font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                  ニックネーム
                </label>
              </WoodenSign>
            </div>
            <div className="relative mt-2">
              <input
                type="text"
                value={displayName}
                onChange={handleDisplayName}
                onKeyDown={handleKeyDown}
                className={getInputStyle("displayName")}
                placeholder="例）たっちゃん"
              />
            </div>
            {errors.displayName && submitAttempted && (
              <BookmarkError message="ニックネームを入力してね！" />
            )}
          </div>

          {/* メールアドレスフィールド */}
          <div className="mb-6">
            <div className="relative">
              <WoodenSign width="w-full" rotation="-rotate-1">
                <label className="text-yellow-950 text-lg font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                  メールアドレス
                </label>
              </WoodenSign>
            </div>
            <div className="relative mt-2">
              <input
                type="email"
                value={email}
                onChange={handleEmail}
                onKeyDown={handleKeyDown}
                className={getInputStyle("email")}
                placeholder="例）taro@example.com"
              />
            </div>
            {errors.email && submitAttempted && (
              <BookmarkError message="メールアドレスを入力してね！" />
            )}

            <div className="mt-2">
              <button
                type="button"
                onClick={handleSendVerificationCode}
                disabled={isSendingCode || resendCountdown > 0 || !email}
                className={`relative w-full py-2 px-4 flex items-center justify-center ${
                  codeSent
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-amber-600 hover:bg-amber-700"
                } text-white font-medium rounded-md transform transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-md ${
                  isSendingCode || resendCountdown > 0 || !email
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:scale-[1.02]"
                }`}
                style={{
                  textShadow: "0 1px 1px rgba(0,0,0,0.3)",
                  boxShadow:
                    "0 2px 4px rgba(0,0,0,0.2), inset 0 -1px 2px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.2)",
                }}
              >
                {isSendingCode ? (
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
                    送信中...
                  </span>
                ) : resendCountdown > 0 ? (
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

            {/* 認証コードの説明 */}
            <InfoMessage>
              登録を完了するには、メールアドレスの確認が必要です。
              「メールに認証コードを送信」ボタンをクリックして、
              メールに届いた認証コードを確認してください。
            </InfoMessage>
          </div>

          {/* 認証コード入力フィールドを追加 */}
          {codeSent && (
            <div className="mt-4">
              <div className="relative">
                <WoodenSign width="w-full" rotation="rotate-1">
                  <label className="text-yellow-950 text-lg font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                    認証コード
                  </label>
                </WoodenSign>
              </div>
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
                />
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

          {/* 登録ボタン */}
          <div className="flex justify-center mt-6 mb-6">
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
                <span>参加する</span>
              )}
            </button>
          </div>

          {/* ログインリンク */}
          <div className="text-center">
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
