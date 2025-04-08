import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * セトルメントページのナビゲーション管理のためのカスタムフック
 * ページ遷移とツールチップ表示を管理
 * @returns ナビゲーションに関する状態とハンドラ
 */
export function useSettlementNavigation() {
  const router = useRouter();
  const [showStoreTooltip, setShowStoreTooltip] = useState(false);
  const [showGiftTooltip, setShowGiftTooltip] = useState(false);

  /**
   * マイハウスページへ移動
   */
  const goToMyHouse = () => {
    router.push("/myhouse");
  };

  /**
   * ルーム作成ページへ移動
   */
  const goToCreateRoom = () => {
    router.push("/host/building-selection");
  };

  /**
   * ルーム参加ページへ移動
   */
  const goToJoinRoom = () => {
    router.push("/guest/join");
  };

  /**
   * ストアページへ移動（現在は開発中メッセージを表示）
   */
  const goToStore = () => {
    // 将来的にはストアページへのルーティングを実装
    alert(
      "ストアは開発中です！今後さまざまな建物やアイテムを購入できるようになります。",
    );
  };

  /**
   * プレゼントページへ移動（現在は開発中メッセージを表示）
   */
  const goToGifts = () => {
    // 将来的にはプレゼントページへのルーティングを実装
    alert(
      "プレゼントボックスは開発中です！今後様々な報酬を受け取れるようになります。",
    );
  };

  return {
    showStoreTooltip,
    showGiftTooltip,
    setShowStoreTooltip,
    setShowGiftTooltip,
    goToMyHouse,
    goToCreateRoom,
    goToJoinRoom,
    goToStore,
    goToGifts,
  };
}
