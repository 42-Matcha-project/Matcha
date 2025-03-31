import { useState, useEffect } from "react";

/**
 * アニメーション状態管理のためのカスタムフック
 * ロード時のアニメーション、表示状態、LocalStorage保存を管理
 * @param isMounted コンポーネントがマウントされているかどうか
 * @returns アニメーション状態のオブジェクト
 */
export function useAnimationState(isMounted: boolean) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [showClouds, setShowClouds] = useState(false);
  const [shouldShowAnimation, setShouldShowAnimation] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  // ローカルストレージのキー
  const ANIMATION_STORAGE_KEY = "hasSeenCloudAnimation";

  /**
   * アニメーション表示済みフラグを取得
   */
  const getHasSeenAnimation = (): boolean => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(ANIMATION_STORAGE_KEY) === "true";
  };

  /**
   * アニメーション表示済みフラグを設定
   */
  const setHasSeenAnimation = (value: boolean): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(ANIMATION_STORAGE_KEY, value ? "true" : "false");
  };

  // 初期ロード時の処理
  useEffect(() => {
    if (!isMounted) return;

    // ロード状態を確認するために少し遅延を入れる
    setTimeout(() => {
      // LocalStorageをチェックして初回訪問かどうか確認
      const hasSeenAnimation = getHasSeenAnimation();

      if (!hasSeenAnimation) {
        // 初回訪問時は演出を表示
        setShouldShowAnimation(true);
        setShowClouds(true);

        // 少し遅延を入れてからコンテンツを表示
        setTimeout(() => {
          setContentVisible(true);
        }, 300);
      } else {
        // 2回目以降は演出をスキップして直接コンテンツを表示
        setIsLoaded(true);
        setShowButtons(true);

        // 少し遅延を入れてからコンテンツを表示
        setTimeout(() => {
          setContentVisible(true);
        }, 300);
      }
    }, 200);
  }, [isMounted]);

  // ページロード時のアニメーション
  useEffect(() => {
    if (!isMounted || !shouldShowAnimation) return;

    // ページロード時のアニメーションシーケンス
    const sequence = async () => {
      // 最初に少し待機
      await new Promise((resolve) => setTimeout(resolve, 800));

      // ページがロードされたことを示す
      setIsLoaded(true);

      // 雲が消えるまで待機
      await new Promise((resolve) => setTimeout(resolve, 2500));

      // 雲を消す
      setShowClouds(false);

      // ボタンを表示
      await new Promise((resolve) => setTimeout(resolve, 800));
      setShowButtons(true);

      // アニメーションを見たことをローカルストレージに記録
      setHasSeenAnimation(true);
    };

    sequence();
  }, [isMounted, shouldShowAnimation]);

  return {
    isLoaded,
    showButtons,
    showClouds,
    shouldShowAnimation,
    contentVisible,
  };
}
