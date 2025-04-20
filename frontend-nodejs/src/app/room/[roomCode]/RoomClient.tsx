"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import StudyRoomBase, {
  Participant,
  Achievement,
  Event,
  ThemeSettings,
} from "@/app/components/study-room-base";
import { useRoomWebSocket } from "../../../hooks/useRoomWebSocket";
import { RoomParticipant } from "@/utils/websocketUtils";
import toast from "react-hot-toast";

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

// WebSocketの参加者情報をStudyRoomBaseのParticipant形式に変換
function convertParticipants(wsParticipants: RoomParticipant[]): Participant[] {
  return wsParticipants.map((p) => ({
    id: p.id,
    name: p.name,
    avatar: p.avatar || "/placeholder.svg",
    status: p.status as "集中モード" | "勉強中" | "休憩中",
    studyTime: 0, // 必要に応じて設定
    totalTime: "0:00:00", // 必要に応じて設定
    level: 1, // 必要に応じて設定
  }));
}

// クライアントコンポーネントのprops
interface RoomClientProps {
  roomCode: string;
}

export default function RoomClient({ roomCode }: RoomClientProps) {
  const { isAuthenticated, token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // ルームコードのバリデーション
  useEffect(() => {
    console.log("Received room code:", roomCode);

    if (!roomCode) {
      console.error("Invalid room code:", roomCode);
      setError(
        "有効なルームコードが指定されていません。正しいルームコードを使用してください。",
      );
      setLoading(false);
    }
  }, [roomCode]);

  // WebSocket接続の状態管理
  const {
    isConnected,
    participants: wsParticipants,
    lastError,
    disconnect,
    connect,
  } = useRoomWebSocket({
    roomCode,
    token: token || "", // トークンをuseAuthから取得
    onConnectionChange: (connected) => {
      console.log(
        "WebSocket connection changed:",
        connected ? "connected" : "disconnected",
      );
      if (connected) {
        setError(null);
        toast.success(`ルーム ${roomCode} に接続しました！`);
      } else {
        // 切断時の処理
        toast.error("ルームから切断されました");
      }
    },
    onError: (errorMsg) => {
      console.error("WebSocket error:", errorMsg);
      setError(errorMsg);
      toast.error(errorMsg);
    },
  });

  // ルームデータ状態
  const [roomData, setRoomData] = useState<{
    theme: ThemeSettings;
    participants: Participant[];
    achievements: Achievement[];
    events: Event[];
    goal: string;
    todayStudyTime: number;
  } | null>(null);

  // WebSocketの参加者情報が更新されたらルームデータも更新
  useEffect(() => {
    if (wsParticipants.length > 0 && isConnected) {
      setRoomData({
        theme: defaultTheme,
        participants: convertParticipants(wsParticipants),
        achievements: defaultAchievements,
        events: defaultEvents,
        goal: "毎日3時間の勉強を継続する",
        todayStudyTime: 120, // 分単位
      });
      setLoading(false);
      setReady(true);
    }
  }, [wsParticipants, isConnected]);

  // 認証状態に応じた初期化
  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window === "undefined") return;

    // 認証が完了していなければ早期リターン
    if (!isAuthenticated || !token) {
      console.error(
        "Authentication failed. Token:",
        token ? "exists" : "missing",
      );
      setError("認証情報がありません。ログインしてください。");
      setLoading(false);
      return;
    }

    // トークンがある場合は有効なルームコードでのみ接続を試みる
    if (token && roomCode) {
      console.log("Attempting to connect to room:", roomCode);
      connect();
    } else {
      console.warn("Not connecting due to invalid room code or missing token");
    }

    // WebSocketが接続していない場合はロード中
    if (!isConnected) {
      setLoading(true);
    }

    // WebSocketエラーがある場合はエラー表示
    if (lastError) {
      console.error("WebSocket last error:", lastError);
      setError(lastError);
      setLoading(false);
    }
  }, [isAuthenticated, token, roomCode, isConnected, lastError, connect]);

  // コンポーネントのアンマウント時に切断
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // ローディング状態
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // エラー状態
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">⚠️</div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
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

  // ルームデータがまだ準備できていない
  if (!roomData || !ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Study Room Baseコンポーネントに必要なプロパティだけを渡す
  // StudyRoomBaseコンポーネントの実際のプロパティ定義に合わせて調整
  return (
    <StudyRoomBase
      roomCode={roomCode}
      theme={roomData.theme}
      participants={roomData.participants}
      achievements={roomData.achievements}
      events={roomData.events}
      goal={roomData.goal}
      todayStudyTime={roomData.todayStudyTime}
    />
  );
}
