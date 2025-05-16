// フレンドAPIレスポンス型
export interface APIFriend {
  ID: number;
  Username: string;
  DisplayName: string;
  IconImageURL: string;
}

export interface RankingItem {
  id: number;
  name: string;
  icon: string;
  score: number;
}

export const ADMIN_MESSAGE_EXAMPLE = "今日も自分のペースでがんばるぞ";

// フレンド一覧APIレスポンス型
export interface APIGetFriendsResponse {
  Friends: APIFriend[];
  Error?: string;
}
