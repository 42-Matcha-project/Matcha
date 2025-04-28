import { Participant, Message } from "../types";

// 初期参加者データ
export const initialParticipants: Participant[] = [
  {
    id: 1,
    name: "あなた",
    avatar: "/placeholder.svg?height=80&width=80",
    status: "studying",
    position: { x: 50, y: 70 },
  },
  {
    id: 2,
    name: "ユウキ",
    avatar: "/placeholder.svg?height=80&width=80",
    status: "studying",
    position: { x: 30, y: 50 },
  },
  {
    id: 3,
    name: "ハナ",
    avatar: "/placeholder.svg?height=80&width=80",
    status: "break",
    position: { x: 70, y: 50 },
  },
];

// 初期チャットメッセージ
export const initialMessages: Message[] = [
  {
    id: 1,
    sender: "システム",
    content: "マイルームへようこそ！一緒に勉強しましょう。",
    time: new Date().toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  },
];
