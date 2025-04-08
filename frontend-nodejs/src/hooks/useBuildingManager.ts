import { useState, useEffect } from "react";
import { Building, PurchaseSuccess } from "../types/settlement";
import { unlockBuilding, applyUnlockState } from "../utils/buildingStateUtils";

/**
 * 建物管理のためのカスタムフック
 * 建物の選択、詳細表示、購入処理の状態とロジックを管理
 * @param buildings 建物データの配列
 * @param userCoins ユーザーの所持コイン
 * @returns 建物管理に関する状態とハンドラ
 */
export function useBuildingManager(buildings: Building[], userCoins: number) {
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState<Building | null>(
    null,
  );
  const [showBuildingDetails, setShowBuildingDetails] =
    useState<Building | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] =
    useState<PurchaseSuccess | null>(null);
  // ローカルストレージから状態を復元した建物のリスト
  const [managedBuildings, setManagedBuildings] =
    useState<Building[]>(buildings);

  // 初期化時に建物のアンロック状態を適用
  useEffect(() => {
    const updatedBuildings = applyUnlockState(buildings);
    setManagedBuildings(updatedBuildings);
  }, [buildings]);

  /**
   * 建物クリックのハンドラ
   * 建物の選択、詳細表示、購入ダイアログの表示を管理
   */
  const handleBuildingClick = (buildingId: string, e: React.MouseEvent) => {
    // イベントの伝播を停止して、親要素のクリックイベントが発火しないようにする
    e.stopPropagation();

    const building = managedBuildings.find((b) => b.id === buildingId);
    if (!building) return;

    if (building.isUnlocked) {
      // 既に選択されている建物をクリックした場合は選択解除
      if (selectedBuilding === buildingId) {
        setSelectedBuilding(null);
        setShowBuildingDetails(null);
      } else {
        // 他の建物が選択されていても、新しい建物を選択したら即座に切り替える
        setSelectedBuilding(buildingId);
        setShowBuildingDetails(building);
      }
    } else {
      // 未購入の建物の場合は選択状態をクリアして購入ダイアログを表示
      setSelectedBuilding(null);
      setShowBuildingDetails(null);
      setShowPurchaseDialog(building);
    }
  };

  /**
   * 建物購入処理のハンドラ
   * コインの確認と購入成功通知を管理
   */
  const purchaseBuilding = (building: Building) => {
    // 十分なコインがあるか確認
    if (userCoins >= building.price) {
      // 建物をアンロック状態に設定
      unlockBuilding(building.id);

      // 管理中の建物リストを更新
      const updatedBuildings = managedBuildings.map((b) =>
        b.id === building.id ? { ...b, isUnlocked: true } : b,
      );
      setManagedBuildings(updatedBuildings);

      // 疑似的な購入成功の処理
      setPurchaseSuccess({ buildingId: building.id, name: building.name });
      setShowPurchaseDialog(null);

      // 3秒後に成功メッセージを消す
      setTimeout(() => {
        setPurchaseSuccess(null);
      }, 3000);

      return true;
    } else {
      // コインが足りない場合は購入失敗
      setShowPurchaseDialog(null);
      return false;
    }
  };

  /**
   * 選択状態のクリア
   * 背景クリックなどのイベントで呼び出す
   */
  const clearSelection = () => {
    setSelectedBuilding(null);
    setShowBuildingDetails(null);
  };

  /**
   * 購入ダイアログを閉じる
   */
  const closePurchaseDialog = () => {
    setShowPurchaseDialog(null);
  };

  /**
   * 建物詳細ダイアログを閉じる
   */
  const closeBuildingDetails = () => {
    setShowBuildingDetails(null);
    setSelectedBuilding(null);
  };

  return {
    selectedBuilding,
    showPurchaseDialog,
    showBuildingDetails,
    purchaseSuccess,
    managedBuildings,
    handleBuildingClick,
    purchaseBuilding,
    clearSelection,
    closePurchaseDialog,
    closeBuildingDetails,
  };
}
