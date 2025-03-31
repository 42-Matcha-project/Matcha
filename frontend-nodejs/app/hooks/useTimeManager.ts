import { useState, useEffect } from "react";

/**
 * 時間管理のためのカスタムフック
 * 現在時刻の更新と管理、マウント状態の監視
 * @param updateInterval 時間更新の間隔（ミリ秒）
 * @returns 現在時刻とマウント状態のオブジェクト
 */
export function useTimeManager(updateInterval: number = 1000) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);

  // コンポーネントのマウント状態を設定
  useEffect(() => {
    setIsMounted(true);

    return () => {
      setIsMounted(false);
    };
  }, []);

  // 時計の更新
  useEffect(() => {
    if (!isMounted) return;

    // 指定された間隔で時間を更新
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, updateInterval);

    // クリーンアップ関数でタイマーをクリア
    return () => clearInterval(timer);
  }, [isMounted, updateInterval]);

  return {
    currentTime,
    isMounted,
  };
}
