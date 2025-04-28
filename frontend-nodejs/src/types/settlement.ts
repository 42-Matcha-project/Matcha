// 建物の型定義
export interface Building {
  id: string;
  name: string;
  level: number;
  isUnlocked: boolean;
  requiredLevel: number;
  price: number;
  position: {
    x: number;
    y: number;
  };
  image: string;
  description?: string; // 建物の説明
}

// 雲のアニメーション効果の型定義
export interface CloudEffect {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  scale: number;
}

// ユーザー統計情報の型定義
export interface UserStats {
  level: number;
  dayStreak: number;
  totalStudyHours: number;
  username: string;
  coins: number;
}

// 購入成功情報の型定義
export interface PurchaseSuccess {
  buildingId: string;
  name: string;
}
