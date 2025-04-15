import { useCallback, useEffect, useRef, useState } from "react";
import {
  MessageType,
  RoomParticipant,
  createRoomWebSocket,
  disconnectFromRoom as disconnectFromRoom,
  sendChatMessage as sendWSChatMessage,
  sendStatusChange as sendWSStatusChange,
} from "@/utils/websocketUtils";

/**
 * チャットメッセージの形式
 */
export interface ChatMessage {
  id: number;
  sender: string;
  content: string;
  time: string;
}

/**
 * useRoomWebSocketフックの引数
 */
export interface UseRoomWebSocketProps {
  roomCode: string;
  token: string;
  onConnectionChange?: (isConnected: boolean) => void;
  onMessageReceive?: (message: ChatMessage) => void;
  onParticipantsChange?: (participants: RoomParticipant[]) => void;
  onError?: (error: string) => void;
}

/**
 * ルームのWebSocket接続を管理するカスタムフック
 */
export function useRoomWebSocket({
  roomCode,
  token,
  onConnectionChange,
  onMessageReceive,
  onParticipantsChange,
  onError,
}: UseRoomWebSocketProps) {
  // 接続状態
  const [isConnected, setIsConnected] = useState(false);

  // 参加者リスト
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);

  // チャットメッセージ
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // 最後のエラー
  const [lastError, setLastError] = useState<string | null>(null);

  // WebSocketの参照
  const socketRef = useRef<WebSocket | null>(null);

  // メッセージIDのカウンター
  const messageIdCounterRef = useRef<number>(1);

  // 接続処理
  const connect = useCallback(() => {
    // クライアントサイドでない場合は早期リターン
    if (typeof window === "undefined") {
      return;
    }

    try {
      // 既存の接続があれば閉じる
      if (socketRef.current) {
        disconnectFromRoom(socketRef.current);
        socketRef.current = null;
      }

      // WebSocket接続を作成
      const socket = createRoomWebSocket(roomCode, token);
      socketRef.current = socket;

      // 接続がnullの場合（作成に失敗した場合）は早期リターン
      if (!socket) {
        const errorMsg = "WebSocket接続を作成できませんでした";
        setLastError(errorMsg);
        if (onError) onError(errorMsg);
        return;
      }

      // 接続が開いた時の処理
      socket.onopen = () => {
        console.log("WebSocket接続が確立されました");
        setIsConnected(true);
        if (onConnectionChange) onConnectionChange(true);
      };

      // メッセージ受信時の処理
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as {
            type: MessageType;
            payload?: {
              participants?: RoomParticipant[];
              sender?: string;
              content?: string;
              [key: string]: unknown;
            };
          };

          switch (data.type) {
            case MessageType.JOIN:
              // 初期データの受信
              if (data.payload) {
                if (data.payload.participants) {
                  const newParticipants = data.payload
                    .participants as RoomParticipant[];
                  setParticipants(newParticipants);
                  if (onParticipantsChange)
                    onParticipantsChange(newParticipants);
                }
              }
              break;

            case MessageType.CHAT:
              // チャットメッセージの受信
              if (data.payload && data.payload.sender && data.payload.content) {
                const newMessage: ChatMessage = {
                  id: messageIdCounterRef.current++,
                  sender: data.payload.sender,
                  content: data.payload.content,
                  time: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                };
                setMessages((prev) => [...prev, newMessage]);
                if (onMessageReceive) onMessageReceive(newMessage);
              }
              break;

            case MessageType.STATUS:
              // ステータス変更メッセージの受信
              if (data.payload && data.payload.participants) {
                const updatedParticipants = data.payload
                  .participants as RoomParticipant[];
                setParticipants(updatedParticipants);
                if (onParticipantsChange)
                  onParticipantsChange(updatedParticipants);
              }
              break;

            default:
              console.log("未処理のメッセージタイプ:", data.type);
          }
        } catch (e) {
          console.error("WebSocketメッセージの解析に失敗:", e);
        }
      };

      // エラー発生時の処理
      socket.onerror = (error) => {
        console.error("WebSocketエラー:", error);
        const errorMsg = "ルームとの接続中にエラーが発生しました";
        setLastError(errorMsg);
        if (onError) onError(errorMsg);
      };

      // 接続が閉じられた時の処理
      socket.onclose = (event) => {
        console.log("WebSocket接続が閉じられました:", event);
        setIsConnected(false);
        if (onConnectionChange) onConnectionChange(false);

        if (event.code !== 1000) {
          // 1000は正常終了
          const errorMsg = "ルームとの接続が切断されました";
          setLastError(errorMsg);
          if (onError) onError(errorMsg);
        }
      };
    } catch (err) {
      console.error("WebSocket接続の確立に失敗:", err);
      const errorMsg = "ルームへの接続に失敗しました";
      setLastError(errorMsg);
      if (onError) onError(errorMsg);
    }
  }, [
    roomCode,
    token,
    onConnectionChange,
    onError,
    onMessageReceive,
    onParticipantsChange,
  ]);

  // 切断処理
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      disconnectFromRoom(socketRef.current);
      socketRef.current = null;
      setIsConnected(false);
      if (onConnectionChange) onConnectionChange(false);
    }
  }, [onConnectionChange]);

  // チャットメッセージ送信
  const sendChatMessage = useCallback(
    (content: string) => {
      if (socketRef.current && isConnected) {
        sendWSChatMessage(socketRef.current, content);

        // ローカルに自分のメッセージを追加（オプション）
        const selfMessage: ChatMessage = {
          id: messageIdCounterRef.current++,
          sender: "あなた", // または実際のユーザー名
          content,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, selfMessage]);

        return true;
      }
      return false;
    },
    [isConnected],
  );

  // ステータス変更
  const sendStatusChange = useCallback(
    (status: string) => {
      if (socketRef.current && isConnected) {
        sendWSStatusChange(socketRef.current, status);
        return true;
      }
      return false;
    },
    [isConnected],
  );

  // コンポーネントのマウント/アンマウント時に接続/切断を行う
  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== "undefined" && roomCode) {
      connect();
    }

    // クリーンアップ関数でWebSocket接続を閉じる
    return () => {
      disconnect();
    };
  }, [roomCode, connect, disconnect]);

  return {
    isConnected,
    participants,
    messages,
    lastError,
    connect,
    disconnect,
    sendChatMessage,
    sendStatusChange,
  };
}
