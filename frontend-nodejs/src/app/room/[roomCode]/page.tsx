"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import StudyRoomBase, {
  Participant,
  Achievement,
  Event,
  ThemeSettings,
} from "@/app/components/study-room-base";

// デフォルトのテーマ設定
const defaultTheme: ThemeSettings = {
  id: "default",
  name: "デフォルト",
  emoji: "📚",
  colors: {
    primary: "bg-emerald-500",
    secondary: "bg-emerald-100",
    accent: "bg-emerald-300",
    background: "bg-emerald-50 dark:bg-slate-900",
    text: "text-emerald-950 dark:text-emerald-100",
    border: "border-emerald-200 dark:border-emerald-800",
    cardHeader: "bg-emerald-600 text-white",
    cardHeaderText: "text-white",
    sidebarBg: "bg-white dark:bg-slate-800",
    headerBg: "bg-white dark:bg-slate-800",
  },
};

// デフォルトの参加者データ
const defaultParticipants: Participant[] = [
  {
    id: 1,
    name: "あなた",
    avatar: "/placeholder.svg",
    status: "集中モード",
    studyTime: 120, // 2時間（分単位）
    totalTime: "2:00:00",
    streak: 5,
    streakText: "5日連続達成中",
    level: 3,
  },
  {
    id: 2,
    name: "ユーザー2",
    avatar: "/placeholder.svg",
    status: "勉強中",
    studyTime: 45,
    totalTime: "0:45:00",
    remainingTime: "00:15:00",
    level: 2,
  },
];

// デフォルトの達成項目
const defaultAchievements: Achievement[] = [
  {
    id: 1,
    name: "1時間達成",
    icon: "⏱️",
    completed: true,
  },
  {
    id: 2,
    name: "3時間達成",
    icon: "⏱️",
    completed: false,
  },
  {
    id: 3,
    name: "5日連続学習",
    icon: "📅",
    completed: true,
  },
];

// デフォルトのイベント
const defaultEvents: Event[] = [
  {
    id: 1,
    name: "特別勉強会",
    icon: "🎓",
    description: "明日20:00から特別勉強会が開催されます！",
  },
];

interface RoomPageProps {
  params: {
    roomCode: string;
  };
}

export default function RoomPage({ params }: RoomPageProps) {
  const { roomCode } = params;
  const { user } = useAuth();
  const router = useRouter();
  const [roomData, setRoomData] = useState<{
    theme: ThemeSettings;
    participants: Participant[];
    achievements: Achievement[];
    events: Event[];
    goal: string;
    todayStudyTime: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // APIが実装されるまでは、テストデータを使用
        // 実際のAPIが実装されたら、以下のコメントを解除
        /*
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/study-room/${roomCode}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("自習室データの取得に失敗しました");
        }

        const data = await response.json();
        setRoomData(data);
        */

        // テスト用データ
        // APIが実装されるまでの仮実装
        setTimeout(() => {
          setRoomData({
            theme: defaultTheme,
            participants: user
              ? [
                  {
                    ...defaultParticipants[0],
                    name: user.displayName || user.username || "ユーザー",
                  },
                  ...defaultParticipants.slice(1),
                ]
              : defaultParticipants,
            achievements: defaultAchievements,
            events: defaultEvents,
            goal: "毎日3時間の勉強を継続する",
            todayStudyTime: 120, // 分単位
          });
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        console.error("Room data fetch error:", err);
        setError(
          err instanceof Error ? err.message : "データの取得に失敗しました",
        );
        setIsLoading(false);
      }
    };

    fetchRoomData();
  }, [roomCode, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error || !roomData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">⚠️</div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error || "データの取得に失敗しました。再度お試しください。"}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => router.push("/")}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          ホームに戻る
        </button>
      </div>
    );
  }

  return (
    <StudyRoomBase
      theme={roomData.theme}
      participants={roomData.participants}
      achievements={roomData.achievements}
      events={roomData.events}
      roomCode={roomCode}
      goal={roomData.goal}
      todayStudyTime={roomData.todayStudyTime}
    />
  );
}
