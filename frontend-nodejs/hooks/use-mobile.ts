"use client";

import { useState, useEffect } from "react";

export function useMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // 初期チェック
    checkIsMobile();

    // リサイズイベントにリスナーを追加
    window.addEventListener("resize", checkIsMobile);

    // クリーンアップ
    return () => window.removeEventListener("resize", checkIsMobile);
  }, [breakpoint]);

  return isMobile;
}
