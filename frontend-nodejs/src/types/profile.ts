// ユーザープロファイルの型定義
export interface UserProfile {
  ID: number;
  Username: string;
  DisplayName: string;
  Email: string;
  TownName?: string;
  Introduction?: string;
  IconImageURL?: string;
  CoinCount: number;
  Tags?: string[];
  CreatedAt: string;
  UpdatedAt: string;
}
