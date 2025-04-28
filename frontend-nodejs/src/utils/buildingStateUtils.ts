import { Building } from "../types/settlement";

// ローカルストレージのキー
const UNLOCKED_BUILDINGS_KEY = "unlockedBuildings";

/**
 * 建物のアンロック状態を初期化する
 * アプリケーション起動時に呼び出す
 */
export function initializeBuildingState(buildings: Building[]): void {
  // ローカルストレージに保存されたデータがない場合のみ初期化
  if (!localStorage.getItem(UNLOCKED_BUILDINGS_KEY)) {
    // デフォルトでアンロックされている建物のIDのみを保存
    const defaultUnlockedIds = buildings
      .filter((building) => building.isUnlocked)
      .map((building) => building.id);

    localStorage.setItem(
      UNLOCKED_BUILDINGS_KEY,
      JSON.stringify(defaultUnlockedIds),
    );
  }
}

/**
 * 建物がアンロックされているかを確認する
 */
export function isBuildingUnlocked(buildingId: string): boolean {
  try {
    const unlockedIds = JSON.parse(
      localStorage.getItem(UNLOCKED_BUILDINGS_KEY) || "[]",
    );
    return unlockedIds.includes(buildingId);
  } catch (error) {
    console.error("Failed to check building unlock status:", error);
    return false;
  }
}

/**
 * 建物をアンロックする
 */
export function unlockBuilding(buildingId: string): void {
  try {
    const unlockedIds = JSON.parse(
      localStorage.getItem(UNLOCKED_BUILDINGS_KEY) || "[]",
    );
    if (!unlockedIds.includes(buildingId)) {
      unlockedIds.push(buildingId);
      localStorage.setItem(UNLOCKED_BUILDINGS_KEY, JSON.stringify(unlockedIds));
    }
  } catch (error) {
    console.error("Failed to unlock building:", error);
  }
}

/**
 * 全てのアンロック済み建物のIDを取得
 */
export function getAllUnlockedBuildingIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(UNLOCKED_BUILDINGS_KEY) || "[]");
  } catch (error) {
    console.error("Failed to get unlocked building IDs:", error);
    return [];
  }
}

/**
 * 渡された建物リストに対してアンロック状態を適用した新しいリストを返す
 */
export function applyUnlockState(buildings: Building[]): Building[] {
  const unlockedIds = getAllUnlockedBuildingIds();

  return buildings.map((building) => ({
    ...building,
    isUnlocked: unlockedIds.includes(building.id),
  }));
}
