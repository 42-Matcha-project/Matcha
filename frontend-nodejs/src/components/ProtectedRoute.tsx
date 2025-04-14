"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoading, checkAuth } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      // 認証状態を確認
      const authenticated = await checkAuth();

      if (!authenticated) {
        // 認証されていない場合はログインページにリダイレクト
        router.push("/login");
      }

      setIsChecking(false);
    };

    verifyAuth();
  }, [checkAuth, router]);

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
