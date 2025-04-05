// 参加者の型定義
export interface Participant {
  id: string;
  name: string;
  role: "host" | "participant";
  status: "online" | "away" | "offline";
  joinedAt: string;
}

// 部屋のコード形式
export interface RoomCode {
  code: string;
  isValid: boolean;
}

// 部屋の情報
export interface Room {
  id: string;
  code: string;
  name: string;
  buildingId: string;
  hostId: string;
  createdAt: string;
  participantsCount: number;
  status: "active" | "ended";
}
