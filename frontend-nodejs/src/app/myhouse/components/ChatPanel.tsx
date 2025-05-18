"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Message } from "../types";
import {
  createRoomWebSocket,
  sendChatMessage,
  WebSocketStatus,
} from "@/utils/websocketUtils";

interface ChatPanelProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isDarkMode: boolean;
  roomCode: string;
  token: string;
}

export function ChatPanel({
  messages,
  setMessages,
  isDarkMode,
  roomCode,
  token,
}: ChatPanelProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const messageIdRef = useRef<number>(1);

  // WebSocket接続
  useEffect(() => {
    if (!roomCode || !token) return;
    const socket = createRoomWebSocket(roomCode, token);
    if (!socket) return;
    socketRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // サーバーからのメッセージ形式に応じて分岐
        if (data.Type === "MESSAGE") {
          const newMessage: Message = {
            id: messageIdRef.current++,
            sender: data.Sender || "?",
            content: data.Message || "",
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          setMessages((prev) => [...prev, newMessage]);
        }
      } catch {
        // パース失敗時は無視
      }
    };

    return () => {
      if (socket) socket.close();
    };
  }, [roomCode, token, setMessages]);

  // スクロール位置を監視
  const handleScroll = () => {
    if (!messageContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } =
      messageContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 20;
    setIsScrolledUp(!isAtBottom);
  };

  // 新しいメッセージが追加されたらスクロール
  useEffect(() => {
    if (messageContainerRef.current && messages.length > 0) {
      const needToScroll = !isScrolledUp || messages.length === 1;
      if (needToScroll) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages, isScrolledUp]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, []);

  // メッセージ送信
  const sendMessage = (event: React.FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;
    if (
      socketRef.current &&
      socketRef.current.readyState === WebSocketStatus.OPEN
    ) {
      sendChatMessage(socketRef.current, message);
    }
    setMessage("");
    setIsScrolledUp(false);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* チャットヘッダー - LINE風 */}
      <div
        className={cn(
          "p-2 border-b flex items-center justify-between",
          isDarkMode
            ? "bg-amber-900 border-amber-800"
            : "bg-amber-100 border-amber-200",
        )}
      >
        <h3 className="font-medium text-xl">メッセージ</h3>
        <span className="text-xs opacity-70">
          {messages.length}件のメッセージ
        </span>
      </div>

      {/* メッセージエリア */}
      <div
        ref={messageContainerRef}
        onScroll={handleScroll}
        className={cn(
          "flex-1 overflow-y-auto p-3 space-y-2",
          isDarkMode ? "bg-amber-900/50" : "bg-amber-50/50",
          "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          isDarkMode
            ? "[&::-webkit-scrollbar-thumb]:bg-amber-700 [&::-webkit-scrollbar-track]:bg-amber-900/30"
            : "[&::-webkit-scrollbar-thumb]:bg-amber-300 [&::-webkit-scrollbar-track]:bg-amber-100/50",
        )}
        style={{ minHeight: "50px" }}
      >
        {/* チャット履歴が空の場合のガイドメッセージ */}
        {messages.length === 0 && (
          <div
            className={cn(
              "text-center p-4 rounded-lg opacity-70",
              isDarkMode ? "bg-amber-800/50" : "bg-amber-100/50",
            )}
          >
            <p className="text-2xl">
              まだメッセージがありません。チャットを始めましょう！
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col mb-2">
            <div className="flex items-center">
              <span className="font-medium text-sm">{msg.sender}</span>
              <span className="text-xs ml-2 opacity-70">{msg.time}</span>
            </div>
            <div
              className={cn(
                "text-sm px-3 py-2 rounded-lg max-w-[80%]",
                msg.sender === "あなた"
                  ? isDarkMode
                    ? "bg-amber-700 ml-auto"
                    : "bg-amber-200 ml-auto"
                  : isDarkMode
                    ? "bg-amber-800"
                    : "bg-white",
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* 自動スクロール用の参照ポイント */}
        <div ref={messagesEndRef} />

        {/* スクロールアップ時に表示される「新しいメッセージ」インジケーター */}
        {isScrolledUp && messages.length > 0 && (
          <button
            onClick={() => {
              setIsScrolledUp(false);
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
            className={cn(
              "fixed bottom-16 left-1/2 transform -translate-x-1/2",
              "px-3 py-1 rounded-full text-xs shadow-md",
              "flex items-center animate-bounce",
              isDarkMode ? "bg-amber-700" : "bg-amber-300",
            )}
          >
            <span>↓ 新しいメッセージ</span>
          </button>
        )}
      </div>

      <form
        onSubmit={sendMessage}
        className={cn(
          "p-2 flex space-x-2 border-t",
          isDarkMode
            ? "bg-amber-900 border-amber-800"
            : "bg-amber-50 border-amber-200",
        )}
      >
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="メッセージを入力..."
          className={cn(
            "flex-1 text-sm",
            isDarkMode
              ? "bg-amber-800 border-amber-700"
              : "bg-white border-amber-200",
          )}
        />
        <Button
          type="submit"
          size="icon"
          className={cn(
            "h-9 w-9",
            isDarkMode
              ? "bg-amber-700 hover:bg-amber-600"
              : "bg-amber-600 hover:bg-amber-500",
          )}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
