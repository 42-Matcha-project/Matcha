"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import useWebSocket, { MessageType } from "@/hooks/useWebSocket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";

export default function WebSocketTestPage() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<
    { sender: string; content: string; time: string }[]
  >([]);
  const [inputMessage, setInputMessage] = useState("");
  const [roomCode, setRoomCode] = useState("test-room");
  const [wsUrl, setWsUrl] = useState("");

  // バックエンドのURLからWebSocket URLを構築
  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "";
    if (baseUrl) {
      const wsProtocol = baseUrl.startsWith("https") ? "wss" : "ws";
      const wsBaseUrl = baseUrl.replace(/^http(s?):\/\//, `${wsProtocol}://`);
      setWsUrl(`${wsBaseUrl}/study-room/join/${roomCode}`);
    }
  }, [roomCode]);

  // WebSocketメッセージを受信したときのハンドラー
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      if (
        data.type === "CHAT" &&
        data.payload &&
        data.payload.sender &&
        data.payload.content
      ) {
        setMessages((prev) => [
          ...prev,
          {
            sender: data.payload.sender,
            content: data.payload.content,
            time: new Date().toLocaleTimeString(),
          },
        ]);
      } else if (
        data.type === "JOIN" &&
        data.payload &&
        data.payload.participants
      ) {
        toast.success(
          `参加者が更新されました: ${data.payload.participants.length}人`,
        );
      }
    } catch (e) {
      console.error("メッセージの解析に失敗:", e);
    }
  }, []);

  // WebSocketフックを使用
  const { isConnected, error, sendMessage, connect, disconnect } = useWebSocket(
    {
      url: wsUrl,
      token: token || "",
      onOpen: () => {
        toast.success("WebSocketに接続しました！");
        setMessages((prev) => [
          ...prev,
          {
            sender: "System",
            content: "接続しました",
            time: new Date().toLocaleTimeString(),
          },
        ]);
      },
      onMessage: handleMessage,
      onClose: () => {
        toast.success("WebSocketから切断されました");
        setMessages((prev) => [
          ...prev,
          {
            sender: "System",
            content: "切断されました",
            time: new Date().toLocaleTimeString(),
          },
        ]);
      },
      onError: () => {
        toast.error("WebSocket接続でエラーが発生しました");
      },
      autoConnect: false, // 手動で接続するためfalse
    },
  );

  // チャットメッセージを送信
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const result = sendMessage({
      type: MessageType.CHAT,
      payload: { content: inputMessage },
    });

    if (result) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "あなた",
          content: inputMessage,
          time: new Date().toLocaleTimeString(),
        },
      ]);
      setInputMessage("");
    } else {
      toast.error(
        "メッセージを送信できませんでした。接続状態を確認してください。",
      );
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">WebSocket通信テスト</h1>

      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              ルームコード
            </label>
            <Input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="room-code"
              className="w-full"
            />
          </div>

          <div className="flex items-end gap-2">
            <Button
              onClick={connect}
              disabled={isConnected || !token || !roomCode}
              className="bg-green-600 hover:bg-green-700"
            >
              接続
            </Button>
            <Button
              onClick={disconnect}
              disabled={!isConnected}
              variant="destructive"
            >
              切断
            </Button>
          </div>
        </div>

        <div className="text-sm mb-2">
          <p>
            接続状態:{" "}
            <Badge className={isConnected ? "bg-green-500" : "bg-red-500"}>
              {isConnected ? "接続中" : "未接続"}
            </Badge>
          </p>
          {error && <p className="text-red-500 mt-1">エラー: {error}</p>}
          <p className="mt-1">WebSocket URL: {wsUrl}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>チャットメッセージ</CardTitle>
            <CardDescription>
              WebSocketを使ったリアルタイムチャット
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 overflow-y-auto border rounded-md p-3 mb-4">
              {messages.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  メッセージはありません
                </p>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className="mb-2">
                    <p>
                      <span className="font-bold">{msg.sender}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {msg.time}
                      </span>
                    </p>
                    <p className="text-gray-700">{msg.content}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="メッセージを入力..."
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={!isConnected}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!isConnected}>
              送信
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
