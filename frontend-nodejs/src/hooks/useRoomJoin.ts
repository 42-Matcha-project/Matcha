import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  formatRoomCode,
  isValidRoomCode as validateRoomCode,
} from "../utils/roomUtils";
import { createRoomWebSocket } from "../utils/websocketUtils";

/**
 * 部屋参加のためのカスタムフック
 * @returns 部屋参加関連の状態と関数
 */
export function useRoomJoin() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState<string>("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // タイムアウトタイマーの参照を保持
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    // ルームコードの形式を検証
    if (!validateRoomCode(roomCode)) {
      setError("有効なルームコードを入力してください");
      return;
    }

    try {
      setIsJoining(true);
      setError(null);

      console.log("ルームコードを処理中: ", roomCode);

      // 既存のタイムアウトがあればクリア
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // 認証トークンを取得
      const token = localStorage.getItem("token");
      if (!token) {
        setError("認証情報がありません。ログインしてください。");
        setIsJoining(false);
        return;
      }

      // ルームコードが保存されているマイハウスのコードと一致するか確認
      const myRoomCode = localStorage.getItem("myRoomCode");

      if (myRoomCode && roomCode === myRoomCode) {
        // マイハウスのコードと一致する場合は/myhouseに遷移
        console.log("マイハウスコードと一致しました。マイハウスに遷移します。");
        localStorage.setItem("lastJoinedCode", roomCode);
        router.push("/myhouse");
      } else {
        // WebSocket接続を事前に試みて、ルームが存在するか確認
        try {
          console.log(`WebSocket接続を試みます: ${roomCode}`);

          // WebSocketを作成
          const socket = createRoomWebSocket(roomCode, token);

          if (!socket) {
            setError("WebSocketの作成に失敗しました");
            setIsJoining(false);
            return;
          }

          // 接続エラーの処理
          socket.onerror = (event) => {
            console.error("WebSocket接続エラー:", event);
            setError("ルームへの接続に失敗しました");
            setIsJoining(false);

            // タイムアウトをクリア
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }

            if (
              socket.readyState !== WebSocket.CLOSED &&
              socket.readyState !== WebSocket.CLOSING
            ) {
              socket.close();
            }
          };

          // 接続成功時の処理
          socket.onopen = () => {
            console.log("WebSocket接続が確立されました");

            // タイムアウトをクリア
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }

            // ルームページに遷移する前にローカルストレージに保存
            localStorage.setItem("lastJoinedCode", roomCode);
            localStorage.setItem("activeRoomCode", roomCode);

            // ルームページに遷移
            router.push(`/room/${roomCode}`);
          };

          // 接続時メッセージの処理
          socket.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              console.log("WebSocketからメッセージを受信:", data);

              // エラーメッセージの処理
              if (data.error) {
                setError(data.error);
                setIsJoining(false);

                // タイムアウトをクリア
                if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current);
                  timeoutRef.current = null;
                }

                if (
                  socket.readyState !== WebSocket.CLOSED &&
                  socket.readyState !== WebSocket.CLOSING
                ) {
                  socket.close();
                }
              }
            } catch (e) {
              console.error("WebSocketメッセージの解析に失敗:", e);
            }
          };

          // タイムアウト処理（5秒以内に接続できない場合）
          timeoutRef.current = setTimeout(() => {
            // socket.readyStateを確認してからcloseする
            if (socket.readyState !== WebSocket.OPEN) {
              console.log("WebSocket接続がタイムアウトしました");
              setError("接続がタイムアウトしました。再度お試しください。");
              setIsJoining(false);

              // まだ接続処理中（CONNECTING状態）なら閉じる
              if (socket.readyState === WebSocket.CONNECTING) {
                socket.close();
              }
            }
            timeoutRef.current = null;
          }, 5000);
        } catch (err) {
          console.error("WebSocket接続エラー:", err);
          setError("部屋に接続できませんでした");
          setIsJoining(false);
        }
      }
    } catch (err) {
      setError("部屋に参加できませんでした");
      console.error("部屋参加エラー:", err);
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
