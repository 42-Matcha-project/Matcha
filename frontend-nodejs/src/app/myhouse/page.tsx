"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Book, MessageSquare, ChevronUp, ChevronDown } from "lucide-react";
import Image from "next/image";

// コンポーネントをインポート
import { Header } from "./components/Header";
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
        "min-h-screen transition-colors duration-300 relative",
        isDarkMode
          ? "bg-amber-950 text-amber-50"
          : "bg-amber-50 text-amber-950",
      )}
      style={{
        backgroundImage: `url('/images/new-house.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: isDarkMode
          ? "rgba(120, 53, 15, 0.85)"
          : "rgba(245, 225, 180, 0.5)",
        backgroundBlendMode: isDarkMode ? "overlay" : "soft-light",
      }}
    >
      {/* ヘッダー */}
      <Header
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        currentTime={currentTime}
      />

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-6 flex flex-col h-[calc(100vh-56px)]">
        {/* 参加者の表示領域 */}
        <div className="flex-1 mb-4 relative">
          {/* 座布団 - 背景に合わせた配置 */}
          {participants.map((user, index) => {
            // 背景画像の特定の位置に合わせて座布団を配置
            let posX, posY;

            // 参加者の数に応じて位置を調整
            if (participants.length <= 4) {
              // 少人数の場合は特定の位置に配置
              if (index === 0) {
                // 左側のソファ
                posX = 25;
                posY = 55;
              } else if (index === 1) {
                // 右側のソファ
                posX = 75;
                posY = 55;
              } else if (index === 2) {
                // 下側のソファ/椅子
                posX = 50;
                posY = 70;
              } else {
                // 上側の椅子
                posX = 50;
                posY = 40;
              }
            } else {
              // 参加者が多い場合は適切に分散
              const positions = [
                { x: 25, y: 55 }, // 左側のソファ
                { x: 75, y: 55 }, // 右側のソファ
                { x: 50, y: 70 }, // 下側のソファ/椅子
                { x: 50, y: 40 }, // 上側の椅子
                { x: 35, y: 45 }, // 左上の椅子
                { x: 65, y: 45 }, // 右上の椅子
                { x: 35, y: 65 }, // 左下の椅子
                { x: 65, y: 65 }, // 右下の椅子
              ];

              const pos = positions[index % positions.length];
              posX = pos.x;
              posY = pos.y;
            }

            return (
              <div
                key={`cushion-${user.id}`}
                className="absolute"
                style={{
                  left: `${posX}%`,
                  top: `${posY}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: 5,
                }}
              >
                <div
                  className={cn(
                    "w-20 h-5 rounded-full transform transition-all opacity-0", // 座布団を非表示に（背景に椅子やソファがあるため）
                    isDarkMode
                      ? "bg-amber-700/60 border border-amber-600/40"
                      : "bg-amber-300/60 border border-amber-400/40",
                  )}
                ></div>
              </div>
            );
          })}

          {/* 参加者アバター - 背景に合わせた配置 */}
          {participants.map((user, index) => {
            // 背景画像の特定の位置に合わせてアバターを配置
            let posX, posY;

            // 参加者の数に応じて位置を調整
            if (participants.length <= 4) {
              // 少人数の場合は特定の位置に配置
              if (index === 0) {
                // 左側のソファ
                posX = 25;
                posY = 53;
              } else if (index === 1) {
                // 右側のソファ
                posX = 75;
                posY = 53;
              } else if (index === 2) {
                // 下側のソファ/椅子
                posX = 50;
                posY = 67;
              } else {
                // 上側の椅子
                posX = 50;
                posY = 38;
              }
            } else {
              // 参加者が多い場合は適切に分散
              const positions = [
                { x: 25, y: 53 }, // 左側のソファ
                { x: 75, y: 53 }, // 右側のソファ
                { x: 50, y: 67 }, // 下側のソファ/椅子
                { x: 50, y: 38 }, // 上側の椅子
                { x: 35, y: 43 }, // 左上の椅子
                { x: 65, y: 43 }, // 右上の椅子
                { x: 35, y: 63 }, // 左下の椅子
                { x: 65, y: 63 }, // 右下の椅子
              ];

              const pos = positions[index % positions.length];
              posX = pos.x;
              posY = pos.y;
            }

            return (
              <div
                key={user.id}
                className="absolute"
                style={{
                  left: `${posX}%`,
                  top: `${posY}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: user.id === 1 ? 20 : 10,
                }}
              >
                {/* 影 */}
                <div className="absolute bottom-[-3px] left-1/2 transform -translate-x-1/2 w-10 h-1 bg-black/20 rounded-full blur-sm"></div>

                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "relative w-16 h-16 rounded-full overflow-hidden border-2",
                      user.id === 1
                        ? isDarkMode
                          ? "border-amber-500"
                          : "border-amber-600"
                        : isDarkMode
                          ? "border-amber-700"
                          : "border-amber-300",
                    )}
                  >
                    <Image
                      src={user.avatar || "/images/user1.png"}
                      alt={user.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 64px"
                      className="object-cover"
                    />
                  </div>
                  <span
                    className={cn(
                      "mt-1 px-2 py-0.5 rounded-full text-xs font-medium",
                      isDarkMode
                        ? "bg-amber-800/80 text-amber-50"
                        : "bg-white/85 text-amber-950 border border-amber-400/50",
                    )}
                  >
                    {user.name}
                  </span>

                  {/* ステータスインジケーター */}
                  <div
                    className={cn(
                      "mt-1 w-2 h-2 rounded-full",
                      user.status === "studying"
                        ? "bg-green-500"
                        : user.status === "break"
                          ? "bg-amber-500"
                          : "bg-slate-500",
                    )}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

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
                  ? "bg-amber-700/90 text-amber-50 hover:bg-amber-600 border-amber-600"
                  : "bg-amber-400/90 text-amber-950 hover:bg-amber-500 border-amber-500/80 backdrop-blur-sm",
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
                ? "bg-amber-900/90 border-amber-800 shadow-lg"
                : "bg-amber-50/95 border-amber-200 shadow-md",
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
