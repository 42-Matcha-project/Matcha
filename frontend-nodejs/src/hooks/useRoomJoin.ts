import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  formatRoomCode,
  isValidRoomCode as validateRoomCode,
} from "../utils/roomUtils";

/**
 * 部屋参加のためのカスタムフック
 * @returns 部屋参加関連の状態と関数
 */
export function useRoomJoin() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState<string>("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ルームコードの設定
  const handleSetRoomCode = (code: string) => {
    setRoomCode(formatRoomCode(code));
    setError(null);
  };

  // 部屋参加処理
  const joinRoom = async () => {
    // 入力検証
    if (!roomCode.trim()) {
      setError("ルームコードを入力してください");
      return;
    }

    if (!validateRoomCode(roomCode)) {
      setError("有効なルームコードを入力してください");
      return;
    }

    try {
      setIsJoining(true);
      setError(null);

      // 実際のシステムではAPIリクエストなどでルーム存在確認や参加処理を行う
      // ここではモック処理
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 成功したら部屋ページへ遷移
      router.push(`/room/${roomCode}`);
    } catch (err) {
      setError("部屋に参加できませんでした");
      console.error("部屋参加エラー:", err);
    } finally {
      setIsJoining(false);
    }
  };

  return {
    roomCode,
    setRoomCode: handleSetRoomCode,
    isJoining,
    error,
    joinRoom,
    isValidRoomCode: validateRoomCode,
  };
}
