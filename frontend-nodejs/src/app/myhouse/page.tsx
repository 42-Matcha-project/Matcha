"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Book, MessageSquare, ChevronUp, ChevronDown } from "lucide-react";

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
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);

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

  // パネルの展開・収納を切り替え
  const togglePanel = () => setIsPanelExpanded(!isPanelExpanded);

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
        <div className="relative">
          {/* 開閉ボタン - タブの外に移動 */}
          <div className="absolute -top-4 left-0 right-0 flex justify-center z-10">
            <button
              onClick={togglePanel}
              className={cn(
                "px-6 py-1 rounded-full flex items-center justify-center text-xs font-medium",
                "transform transition-all duration-300 hover:scale-105",
                "border shadow-md",
                isDarkMode
                  ? "bg-amber-700 text-amber-50 hover:bg-amber-600 border-amber-600"
                  : "bg-amber-300 text-amber-950 hover:bg-amber-400 border-amber-400",
              )}
            >
              {isPanelExpanded ? (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  <span>パネルを閉じる</span>
                </>
              ) : (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  <span>パネルを開く</span>
                </>
              )}
            </button>
          </div>

          <div
            className={cn(
              "rounded-xl overflow-hidden border transition-all duration-300",
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
              {/* タブナビゲーション - 常に表示 */}
              <div className="flex items-center justify-between">
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
              </div>

              {/* パネルの内容 - 開閉可能 */}
              <div
                className={cn(
                  "transition-all duration-300 overflow-hidden",
                  isPanelExpanded
                    ? "h-[40vh] min-h-[250px] max-h-[500px]"
                    : "h-0",
                )}
              >
                <TabsContent value="memo" className="h-full overflow-hidden">
                  <NotesPanel
                    notes={notes}
                    setNotes={setNotes}
                    isDarkMode={isDarkMode}
                  />
                </TabsContent>

                <TabsContent value="chat" className="h-full overflow-hidden">
                  <ChatPanel
                    messages={messages}
                    setMessages={setMessages}
                    isDarkMode={isDarkMode}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
