"use client";

import { useEffect } from "react";
import { buildings } from "../../data/buildings";
import { initializeBuildingState } from "../../utils/buildingStateUtils";

/**
 * クライアントサイドでの初期化を行うコンポーネント
 * 画面には何も表示されない
 */
export default function ClientInitializer() {
  useEffect(() => {
    // ローカルストレージの初期化
    initializeBuildingState(buildings);
  }, []);

  // 画面に何も表示しない
  return null;
}
