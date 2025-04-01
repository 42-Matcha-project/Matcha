"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Book, MessageSquare } from "lucide-react";

// コンポーネントをインポート
import { Header } from "./components/Header";
import { Room } from "./components/Room";
import { NotesPanel } from "./components/NotesPanel";
import { ChatPanel } from "./components/ChatPanel";

// 初期データをインポート
import { initialParticipants, initialNotes, initialMessages } from "./data";

export default function CozyRoomPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("memo");

  // 参加者データ
  const [participants] = useState(initialParticipants);

  // メモデータ
  const [notes, setNotes] = useState(initialNotes);

  // チャットメッセージ
  const [messages, setMessages] = useState(initialMessages);

  // 時計の更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ダークモードの切り替え
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-300",
        isDarkMode
          ? "bg-amber-950 text-amber-50"
          : "bg-amber-50 text-amber-950",
      )}
    >
      {/* ヘッダー */}
      <Header
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        currentTime={currentTime}
      />

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-6 flex flex-col h-[calc(100vh-56px)]">
        {/* 部屋エリア */}
        <Room participants={participants} isDarkMode={isDarkMode} />

        {/* メモ・チャットエリア */}
        <div
          className={cn(
            "h-64 rounded-xl overflow-hidden border",
            isDarkMode
              ? "bg-amber-900/80 border-amber-800"
              : "bg-white/80 border-amber-200",
          )}
        >
          <Tabs
            defaultValue="memo"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList
              className={cn(
                "w-full grid grid-cols-2",
                isDarkMode ? "bg-amber-800" : "bg-amber-100",
              )}
            >
              <TabsTrigger value="memo" className="flex items-center">
                <Book className="h-4 w-4 mr-2" />
                メモ
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                チャット
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="memo"
              className="p-4 h-[calc(100%-40px)] overflow-y-auto"
            >
              <NotesPanel
                notes={notes}
                setNotes={setNotes}
                isDarkMode={isDarkMode}
              />
            </TabsContent>

            <TabsContent value="chat" className="h-[calc(100%-40px)]">
              <ChatPanel
                messages={messages}
                setMessages={setMessages}
                isDarkMode={isDarkMode}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
