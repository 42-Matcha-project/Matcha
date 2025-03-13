"use client";

import React, { useState, ReactNode } from "react";
import Image from "next/image";

// 木の看板コンポーネント
const WoodenSign = ({
  children,
  width = "w-64",
  height = "h-12",
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

const JapaneseLogin = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isComposing, setIsComposing] = useState(false);

  // 入力エラー状態を管理
  const [errors, setErrors] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
    passwordMismatch: false,
  });
  // 送信が試行されたかどうか
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const handleUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (submitAttempted) {
      validateField("username", e.target.value);
    }
  };

  const handleEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (submitAttempted) {
      validateField("email", e.target.value);
    }
  };

  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (submitAttempted) {
      validateField("password", e.target.value);
      if (confirmPassword) {
        validatePasswordMatch(e.target.value, confirmPassword);
      }
    }
  };

  const handleConfirmPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (submitAttempted) {
      validateField("confirmPassword", e.target.value);
      validatePasswordMatch(password, e.target.value);
    }
  };

  // フィールドの検証
  const validateField = (field: string, value: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: value.trim() === "",
    }));
  };

  // パスワード一致の検証
  const validatePasswordMatch = (pass: string, confirm: string) => {
    setErrors((prev) => ({
      ...prev,
      passwordMismatch: pass !== confirm && confirm !== "",
    }));
  };

  // 全フィールドの検証
  const validateAllFields = () => {
    const newErrors = {
      username: username.trim() === "",
      email: email.trim() === "",
      password: password.trim() === "",
      confirmPassword: confirmPassword.trim() === "",
      passwordMismatch: password !== confirmPassword && confirmPassword !== "",
    };

    setErrors(newErrors);
    return !Object.values(newErrors).includes(true);
  };

  const handleSubmit = async () => {
    setSubmitAttempted(true);

    if (validateAllFields()) {
      console.log("Registration submitted:", { username, email, password });
      alert(`${username}として登録しました`);
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
    fieldName: "username" | "email" | "password" | "confirmPassword",
  ) => {
    return errors[fieldName]
      ? "w-full px-4 py-3 bg-white bg-opacity-70 rounded-lg border-2 border-red-500 shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 animate-pulse"
      : "w-full px-4 py-3 bg-white bg-opacity-70 rounded-lg border-2 border-amber-800 shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500";
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
              入室受付フォーム
            </h1>
          </button>
        </div>

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
                    赤くなっている部分を入力してね。入力すると色が変わるよ！
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-md">
          {/* ユーザー名フィールド */}
          <div className="mb-6">
            <div className="relative">
              <WoodenSign width="w-full">
                <label className="text-yellow-950 text-lg font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                  ユーザー名
                </label>
              </WoodenSign>
            </div>

            <div className="relative mt-2 flex items-center">
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

            <div className="relative mt-2 flex items-center">
              <input
                type="password"
                value={password}
                onChange={handlePassword}
                onKeyDown={handleKeyDown}
                className={getInputStyle("password")}
                placeholder="例）taro1234"
              />
            </div>
            {errors.password && submitAttempted && (
              <BookmarkError message="パスワードを入力してね！" />
            )}
          </div>

          {/* パスワード確認フィールド */}
          <div className="mb-8">
            <div className="relative">
              <WoodenSign width="w-full" rotation="-rotate-1">
                <label className="text-yellow-950 text-lg font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                  パスワード再入力
                </label>
              </WoodenSign>
            </div>

            <div className="relative mt-2 flex items-center">
              <input
                type="password"
                value={confirmPassword}
                onChange={handleConfirmPassword}
                onKeyDown={handleKeyDown}
                className={getInputStyle("confirmPassword")}
                placeholder="例）taro1234"
              />
            </div>
            {errors.confirmPassword && submitAttempted && (
              <BookmarkError message="パスワードをもう一度入力してね！" />
            )}
            {errors.passwordMismatch && submitAttempted && (
              <BookmarkError message="パスワードが一致していないよ！" />
            )}
          </div>

          {/* 登録ボタン */}
          <div className="flex justify-center mt-4 mb-16">
            <button
              onClick={handleSubmit}
              className="relative px-8 py-3 bg-rose-900 text-white font-bold rounded-lg transform hover:scale-105 transition-transform hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-lg"
              style={{
                textShadow: "0 2px 2px rgba(0,0,0,0.5)",
                boxShadow:
                  "0 4px 6px rgba(0,0,0,0.3), inset 0 -2px 5px rgba(0,0,0,0.2), inset 0 2px 5px rgba(255,255,255,0.2)",
              }}
            >
              参加する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JapaneseLogin;