"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Message } from "../types";

interface ChatPanelProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isDarkMode: boolean;
}

export function ChatPanel({
  messages,
  setMessages,
  isDarkMode,
}: ChatPanelProps) {
  const [message, setMessage] = useState("");

  // メッセージ送信
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: "あなた",
      content: message,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, newMessage]);
    setMessage("");
  };

  return (
    <div className="h-full flex flex-col">
      <div
        className={cn(
          "flex-1 overflow-y-auto p-3 space-y-2",
          isDarkMode ? "bg-amber-900/50" : "bg-amber-50/50",
        )}
      >
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col">
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
      </div>

      <form onSubmit={sendMessage} className="p-2 flex space-x-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="メッセージを入力..."
          className={cn(
            "flex-1",
            isDarkMode
              ? "bg-amber-800 border-amber-700"
              : "bg-white border-amber-200",
          )}
        />
        <Button
          type="submit"
          size="icon"
          className={cn(isDarkMode ? "bg-amber-700" : "bg-amber-600")}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
