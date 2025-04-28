// 参加者の型定義
export interface Participant {
  id: number;
  name: string;
  avatar: string;
  status: "studying" | "break" | "away";
  position: { x: number; y: number };
}

// メモの型定義
export interface Note {
  id: number;
  title: string;
  content: string;
  date: string;
}

// チャットメッセージの型定義
export interface Message {
  id: number;
  sender: string;
  content: string;
  time: string;
}
