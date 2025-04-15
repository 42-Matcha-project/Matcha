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
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // 認証状態を確認する関数（シンプル化）
  const checkAuth = async (): Promise<boolean> => {
    // すでにユーザーが設定されている場合は認証済みとみなす
    if (user && token) {
      return true;
    }

    // 読み込み中でなければ読み込み状態に設定
    if (!isLoading) {
      setIsLoading(true);
    }

    try {
      // クライアントサイドでのみlocalStorageにアクセス
      if (typeof window !== "undefined") {
        const storedToken = localStorage.getItem("token");

        if (!storedToken) {
          setUser(null);
          setToken(null);
          setIsLoading(false);
          return false;
        }

        // トークンをコンテキストに保存
        setToken(storedToken);

        // トークンがある場合は認証されているとみなす
        // 実際のユーザー情報はダミーデータで代用
        setUser({
          id: 1,
          username: "user",
          displayName: "ユーザー",
          email: "user@example.com",
        });
        setIsLoading(false);
        return true;
      } else {
        // サーバーサイドでの実行時は認証なしとする
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return false;
    }
  };

  // ログイン時の処理
  const login = (tokenValue: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", tokenValue);
      setToken(tokenValue);
      checkAuth();
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
  }, []);

  // コンテキスト値
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
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
