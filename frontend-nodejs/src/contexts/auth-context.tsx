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
  const router = useRouter();

  // 認証状態を確認する関数（シンプル化）
  const checkAuth = async (): Promise<boolean> => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        setIsLoading(false);
        return false;
      }

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
    } catch (error) {
      console.error("Authentication check failed:", error);
      setUser(null);
      setIsLoading(false);
      return false;
    }
  };

  // ログイン時の処理
  const login = (tokenValue: string) => {
    localStorage.setItem("token", tokenValue);
    checkAuth();
  };

  // ログアウト時の処理
  const logout = async () => {
    try {
      // バックエンドのログアウトAPIがある場合はここで呼び出し
      // const token = localStorage.getItem("token");
      // await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/auth/logout`, {
      //   method: "POST",
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      //   credentials: "include",
      // });

      // ローカルストレージからトークンを削除
      localStorage.removeItem("token");

      // ユーザー情報をクリア
      setUser(null);

      // ホームページにリダイレクト
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // 初回マウント時に認証状態を確認
  useEffect(() => {
    checkAuth();
  }, []);

  // コンテキスト値
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
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
