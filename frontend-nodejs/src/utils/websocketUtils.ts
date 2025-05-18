/**
 * WebSocketの接続や通信を扱うユーティリティ関数
 */

/**
 * WebSocketの接続状態
 */
export enum WebSocketStatus {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
  ERROR = 4,
}

/**
 * WebSocketメッセージの種類
 */
export enum MessageType {
  JOIN = "JOIN",
  CHAT = "CHAT",
  STATUS = "STATUS",
  EXIT = "EXIT",
}

/**
 * WebSocketメッセージの基本形
 */
export interface WebSocketMessage {
  type: MessageType;
  payload?: {
    token?: string;
    status?: string;
    content?: string;
    [key: string]: unknown;
  };
}

/**
 * ルームの参加者情報
 */
export interface RoomParticipant {
  id: number;
  name: string;
  avatar: string;
  status: string;
  isHost?: boolean;
}

/**
 * ルームに接続するためのWebSocketを作成する
 * @param roomCode 接続するルームのコード
 * @param token 認証トークン
 * @returns WebSocketインスタンス
 */
export function createRoomWebSocket(
  roomCode: string,
  token: string,
): WebSocket | null {
  // クライアントサイドでのみ実行されるようにチェック
  if (typeof window === "undefined") {
    console.warn("WebSocketはクライアントサイドでのみ利用可能です");
    return null;
  }

  // 無効なルームコードをチェック
  if (!roomCode) {
    console.error("無効なルームコードが指定されました:", roomCode);
    return null;
  }

  // バックエンドの直接URLを常に使用する
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "";

  // バックエンドURLがhttpsで始まる場合は必ずwssを使用する
  const wsProtocol = baseUrl.startsWith("https") ? "wss" : "ws";

  // HTTP URLからWebSocket URLに変換
  const wsBaseUrl = baseUrl.replace(/^http(s?):\/\//, `${wsProtocol}://`);
  const wsUrl = `${wsBaseUrl}/study-room/join/${roomCode}?token=${token}`;

  console.log("WebSocket接続URL:", wsUrl);

  try {
    // WebSocketの作成
    console.log("WebSocket接続を開始します:", wsUrl);
    const socket = new WebSocket(wsUrl);

    // エラーログを強化
    socket.onerror = (error) => {
      console.error("WebSocket接続エラー:", error);
    };

    // 接続時のヘッダーにトークンを含める方法がないため、
    // 最初のメッセージでトークンを送信する
    socket.onopen = () => {
      console.log("WebSocket接続が確立されました、認証メッセージを送信します");
      const authMessage: WebSocketMessage = {
        type: MessageType.JOIN,
        payload: { token },
      };
      socket.send(JSON.stringify(authMessage));
    };

    // メッセージ受信ログ
    socket.onmessage = (event) => {
      console.log("WebSocketメッセージを受信:", event.data);
    };

    // 切断ログ
    socket.onclose = (event) => {
      console.log(
        `WebSocket接続が閉じられました: コード=${event.code}, 理由=${event.reason || "理由なし"}`,
      );
    };

    return socket;
  } catch (error) {
    console.error("WebSocket接続の作成に失敗しました:", error);
    return null;
  }
}

/**
 * WebSocketにステータス変更メッセージを送信する
 * @param socket WebSocketインスタンス
 * @param status 新しいステータス（"studying", "break", "away"など）
 */
export function sendStatusChange(
  socket: WebSocket | null,
  status: string,
): void {
  if (socket && socket.readyState === WebSocketStatus.OPEN) {
    const message: WebSocketMessage = {
      type: MessageType.STATUS,
      payload: { status },
    };
    socket.send(JSON.stringify(message));
  }
}

/**
 * WebSocketにチャットメッセージを送信する
 * @param socket WebSocketインスタンス
 * @param content メッセージ内容
 */
export function sendChatMessage(
  socket: WebSocket | null,
  content: string,
): void {
  if (socket && socket.readyState === WebSocketStatus.OPEN) {
    const message: WebSocketMessage = {
      type: MessageType.CHAT,
      payload: { content },
    };
    socket.send(JSON.stringify(message));
  }
}

/**
 * WebSocketから切断する
 * @param socket WebSocketインスタンス
 */
export function disconnectFromRoom(socket: WebSocket | null): void {
  if (socket && socket.readyState === WebSocketStatus.OPEN) {
    try {
      const message: WebSocketMessage = {
        type: MessageType.EXIT,
      };
      socket.send(JSON.stringify(message));
      console.log("退出メッセージを送信しました");
    } catch (error) {
      console.error("退出メッセージの送信に失敗しました:", error);
    }
    socket.close();
    console.log("WebSocket接続を閉じました");
  }
}
