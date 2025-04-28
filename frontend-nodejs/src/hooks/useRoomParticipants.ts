import { useState, useEffect } from "react";
import { Participant } from "../types/room";
import { dummyParticipants } from "../data/roomData";

/**
 * 部屋の参加者情報を取得するカスタムフック
 * @param roomCode 部屋コード
 * @param enabled フック有効化フラグ
 * @returns 参加者データと読み込み状態
 */
export function useRoomParticipants(roomCode: string, enabled: boolean = true) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || !roomCode) {
      setParticipants([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // データ取得を模擬
    // 実際のアプリケーションではAPIリクエストなどで取得
    const fetchParticipants = async () => {
      try {
        // 非同期処理を模擬
        await new Promise((resolve) => setTimeout(resolve, 800));

        // ダミーデータを設定
        setParticipants(dummyParticipants);
        setIsLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("不明なエラーが発生しました"),
        );
        setIsLoading(false);
      }
    };

    fetchParticipants();

    return () => {
      // クリーンアップ
      setParticipants([]);
      setIsLoading(true);
    };
  }, [roomCode, enabled]);

  return {
    participants,
    isLoading,
    error,
    // 参加者が一人でもいるかどうか
    hasParticipants: participants.length > 0,
    // ホストの情報
    host: participants.find((p) => p.role === "host"),
    // オンライン参加者の数
    onlineCount: participants.filter((p) => p.status === "online").length,
  };
}
