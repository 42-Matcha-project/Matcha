import { Participant, Note, Message } from "../types";

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

// 初期メモデータ
export const initialNotes: Note[] = [
  {
    id: 1,
    title: "今日の学習計画",
    content:
      "1. 数学の問題集 p.25-30\n2. 英語の単語50個\n3. 歴史の年表を覚える",
    date: "2025/3/24",
  },
];

// 初期チャットメッセージ
export const initialMessages: Message[] = [
  {
    id: 1,
    sender: "システム",
    content: "こたつルームへようこそ！一緒に勉強しましょう。",
    time: "16:30",
  },
  {
    id: 2,
    sender: "ユウキ",
    content: "こんにちは！今日も頑張りましょう！",
    time: "16:45",
  },
];
