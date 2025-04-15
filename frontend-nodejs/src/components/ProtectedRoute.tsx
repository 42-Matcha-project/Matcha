"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, user, checkAuth } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // 既に認証チェックが完了していれば早期リターン
    if (!isLoading && isAuthenticated && user) {
      setIsChecking(false);
      return;
    }

    const verifyAuth = async () => {
      // まだローディング中であれば早期リターン
      if (isLoading) return;

      // すでに認証されていれば早期リターン
      if (isAuthenticated && user) {
        setIsChecking(false);
        return;
      }

      // 認証状態を確認
      const authenticated = await checkAuth();

      if (!authenticated) {
        // 認証されていない場合はログインページにリダイレクト
        router.push("/login");
      }

      setIsChecking(false);
    };

    verifyAuth();
    // checkAuthを依存配列から削除して無限ループを防ぐ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated, user, router]);

  // ローディング中は何も表示しない（またはローディングインジケータを表示）
  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // 認証が確認できたら子コンポーネントを表示
  return <>{children}</>;
}
