"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// 認証状態の型定義
type User = {
  id?: number;
  username?: string;
  displayName?: string;
  email?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null; // JWTトークンをコンテキストで利用可能にする
  login: (tokenValue: string) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
};

// 認証コンテキスト作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 認証プロバイダーコンポーネント
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // 認証状態を確認する関数（APIからユーザー情報を取得）
  const checkAuth = async (): Promise<boolean> => {
    if (typeof window !== "undefined") {
      const tokenValue = localStorage.getItem("token");
      if (tokenValue) {
        setToken(tokenValue);
        // TODO: 必要ならここでユーザー情報も取得してsetUserする
        // 例: const userInfo = await fetchUserInfo(tokenValue); setUser(userInfo);
        return true;
      }
    }
    setToken(null);
    setUser(null);
    return false;
  };

  // ログイン時の処理
  const login = (tokenValue: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", tokenValue);
      setToken(tokenValue);
      // 少し遅延させてからcheckAuthを呼び出す（ローカルストレージの反映を待つ）
      setTimeout(() => {
        checkAuth();
      }, 100);
    }
  };

  // ログアウト時の処理
  const logout = async () => {
    try {
      // バックエンドのログアウトAPIがある場合はここで呼び出し
      // const currentToken = token || localStorage.getItem("token");
      // await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/auth/logout`, {
      //   method: "POST",
      //   headers: {
      //     Authorization: `Bearer ${currentToken}`,
      //   },
      //   credentials: "include",
      // });

      if (typeof window !== "undefined") {
        // ローカルストレージからトークンを削除
        localStorage.removeItem("token");
      }

      // ユーザー情報とトークンをクリア
      setUser(null);
      setToken(null);

      // ホームページにリダイレクト
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // 初回マウント時に認証状態を確認
  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== "undefined") {
      checkAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // コンテキスト値
  const value = {
    user,
    isLoading: false,
    isAuthenticated: !!token,
    token,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 認証コンテキストを使用するためのカスタムフック
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
