"use client";

import StudyRoomBase, {
  type Participant,
  type Achievement,
  type Event,
  type ThemeSettings,
} from "../../components/study-room-base";

// 参加者データ
const participants: Participant[] = [
  {
    id: 1,
    name: "ユウキ",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "集中モード",
    studyTime: 165, // 分
    totalTime: "2:45:00",
    streak: 5,
    streakText: "5日連続で学習中",
    level: 5,
  },
  {
    id: 2,
    name: "タロウ",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "勉強中",
    studyTime: 90, // 分
    totalTime: "1:30:00",
    remainingTime: "40分",
    level: 3,
  },
  {
    id: 3,
    name: "ハナ",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "休憩中",
    studyTime: 45, // 分
    totalTime: "0:45:00",
    level: 2,
  },
];

// 達成項目
const achievements: Achievement[] = [
  { id: 1, name: "初めての勉強", icon: "🌱", completed: true },
  { id: 2, name: "1時間連続", icon: "⏱️", completed: true },
  { id: 3, name: "3日連続", icon: "🏆", completed: true },
  { id: 4, name: "春の勉強マラソン", icon: "🌸", completed: false },
];

// イベント
const events: Event[] = [
  {
    id: 1,
    name: "春の勉強祭り",
    icon: "🌸",
    description: "4月中に25時間の学習で特別桜バッジをゲット！",
  },
];

// 春テーマの設定
const springTheme: ThemeSettings = {
  id: "spring",
  name: "春",
  emoji: "🌸",
  colors: {
    primary: "bg-pink-500 dark:bg-pink-700",
    secondary: "bg-pink-100 dark:bg-pink-900",
    accent: "bg-pink-200 dark:bg-pink-800",
    background:
      "bg-gradient-to-br from-pink-50 to-pink-100 dark:from-slate-900 dark:to-pink-950",
    text: "text-pink-800 dark:text-pink-200",
    border: "border-pink-200 dark:border-pink-800",
    cardHeader: "bg-pink-500 dark:bg-pink-700 text-white",
    cardHeaderText: "text-white",
    sidebarBg: "bg-white/80 dark:bg-slate-800/80",
    headerBg: "bg-white/70 dark:bg-slate-800/70",
  },
  backgroundImage: "/placeholder.svg?height=1080&width=1920",
};

export default function SpringRoomPage() {
  // StudyRoomBaseコンポーネントに必要なプロパティ
  const roomCode = "0001";
  const goal = "英語の単語を50個覚える";
  const todayStudyTime = 239; // 今日の学習時間（分）

  return (
    <StudyRoomBase
      theme={springTheme}
      participants={participants}
      achievements={achievements}
      events={events}
      roomCode={roomCode}
      goal={goal}
      todayStudyTime={todayStudyTime}
    />
  );
}
