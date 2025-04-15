import { useEffect, useState, useCallback, useRef } from "react";

export enum MessageType {
  JOIN = "JOIN",
  CHAT = "CHAT",
  STATUS = "STATUS",
  EXIT = "EXIT",
}

export interface WebSocketMessage {
  type: MessageType;
  payload?: {
    token?: string;
    status?: string;
    content?: string;
    [key: string]: unknown;
  };
}

interface UseWebSocketOptions {
  url: string;
  token?: string;
  onOpen?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  autoConnect?: boolean;
}

/**
 * WebSocket接続を管理するカスタムフック
 */
export function useWebSocket({
  url,
  token,
  onOpen,
  onMessage,
  onClose,
  onError,
  autoConnect = true,
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // WebSocketを作成する関数
  const connect = useCallback(() => {
    // クライアントサイドでのみ実行
    if (typeof window === "undefined") {
      console.warn("WebSocketはクライアントサイドでのみ利用可能です");
      return;
    }

    // 既存の接続がある場合はクローズする
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }

    try {
      console.log("WebSocketに接続しています:", url);
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = (event) => {
        console.log("WebSocket接続が開きました");
        setIsConnected(true);
        setError(null);

        // トークンがある場合は認証メッセージを送信
        if (token) {
          const authMessage: WebSocketMessage = {
            type: MessageType.JOIN,
            payload: { token },
          };
          socket.send(JSON.stringify(authMessage));
        }

        // カスタムonOpenハンドラーがあれば呼び出す
        if (onOpen) onOpen(event);
      };

      socket.onmessage = (event) => {
        console.log("WebSocketメッセージを受信:", event.data);
        // カスタムonMessageハンドラーがあれば呼び出す
        if (onMessage) onMessage(event);
      };

      socket.onerror = (event) => {
        console.error("WebSocketエラー:", event);
        setError("WebSocket接続でエラーが発生しました");
        // カスタムonErrorハンドラーがあれば呼び出す
        if (onError) onError(event);
      };

      socket.onclose = (event) => {
        console.log("WebSocket接続が閉じられました:", event.code, event.reason);
        setIsConnected(false);

        // 異常終了の場合はエラーを設定
        if (event.code !== 1000) {
          setError(
            `WebSocket接続が切断されました: ${event.reason || "Unknown reason"}`,
          );
        }

        // カスタムonCloseハンドラーがあれば呼び出す
        if (onClose) onClose(event);
      };
    } catch (err) {
      console.error("WebSocket接続の作成に失敗しました:", err);
      setError("WebSocketの初期化に失敗しました");
      setIsConnected(false);
    }
  }, [url, token, onOpen, onMessage, onClose, onError]);

  // メッセージ送信関数
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  // 明示的な切断関数
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        // EXIT メッセージを送る
        const exitMessage: WebSocketMessage = {
          type: MessageType.EXIT,
        };
        socketRef.current.send(JSON.stringify(exitMessage));
      }
      socketRef.current.close();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // URLやトークンが変更されたとき、または初回マウント時に自動接続
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // クリーンアップ関数：コンポーネントのアンマウント時にWebSocketを閉じる
    return () => {
      disconnect();
    };
  }, [url, token, connect, disconnect, autoConnect]);

  return {
    isConnected,
    error,
    sendMessage,
    connect,
    disconnect,
    socket: socketRef.current,
  };
}

export default useWebSocket;
