"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { MessageSquare, ChevronUp, ChevronDown } from "lucide-react";
import Image from "next/image";

// コンポーネントをインポート
import { Header } from "./components/Header";
import { ChatPanel } from "./components/ChatPanel";
import { StudyStats } from "./components/StudyStats";

// 初期データをインポート
import { initialParticipants, initialMessages } from "./data";

export default function CozyRoomPage() {
  // Initialize currentTime as null to avoid hydration mismatch
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);

  // 参加者データ
  const [participants, setParticipants] = useState(initialParticipants);

  // 最後に参加したゲストの情報
  const [guestInfo, setGuestInfo] = useState<{
    name: string;
    joinTime: Date;
  } | null>(null);

  // チャットメッセージ
  const [messages, setMessages] = useState(initialMessages);

  // 時計の更新 - クライアントサイドでのみ実行
  useEffect(() => {
    // Set initial time immediately once we're on the client
    setCurrentTime(new Date());

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ゲスト参加を検知して参加者リストを更新
  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== "undefined") {
      // 最後に参加したコードを確認
      const lastJoinedCode = localStorage.getItem("lastJoinedCode");
      const myRoomCode = localStorage.getItem("myRoomCode");

      // 最後に参加したコードがマイルームコードと一致し、かつゲスト情報がまだない場合
      if (
        lastJoinedCode &&
        myRoomCode &&
        lastJoinedCode === myRoomCode &&
        !guestInfo
      ) {
        // ゲスト名（実際には認証情報から取得すべき）
        const guestName = "ゲスト" + Math.floor(Math.random() * 1000);

        // ゲスト情報を設定
        setGuestInfo({
          name: guestName,
          joinTime: new Date(),
        });

        // ゲストを参加者リストに追加
        const newGuest = {
          id: participants.length + 1,
          name: guestName,
          avatar: "/placeholder.svg?height=80&width=80",
          status: "studying" as "studying" | "break" | "away",
          position: { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 },
        };

        setParticipants([...participants, newGuest]);

        // 入室メッセージをチャットに追加
        const newMessage = {
          id: messages.length + 1,
          sender: "システム",
          content: `${guestName} さんが入室しました。`,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setMessages([...messages, newMessage]);

        // パネルを自動的に開く
        setIsPanelExpanded(true);
        setActiveTab("chat");
      }
    }
  }, [guestInfo, messages, participants]);

  // ダークモードの切り替え
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // パネルの展開・収納を切り替え
  const togglePanel = () => setIsPanelExpanded(!isPanelExpanded);

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-300 relative overflow-auto",
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
      <main className="container mx-auto px-4 py-6 flex flex-col min-h-[calc(100vh-56px)] relative">
        {/* 参加者の表示領域 - 固定位置に */}
        <div
          className={cn(
            "flex-1 relative min-h-[60vh] mb-20",
            "transition-all duration-500 ease-in-out",
          )}
        >
          {/* 参加者アバター - 背景に合わせた配置 */}
          {participants.map((user, index) => {
            // より自然な位置に配置 - 部屋の背景に合わせて調整
            let posX, posY, scale;

            // 参加者の数と位置に応じて調整 - 部屋の家具に合わせた位置
            switch (index) {
              case 0: // 左側のソファ
                posX = 24;
                posY = 50;
                scale = 1.1;
                break;
              case 1: // 右側のソファ
                posX = 76;
                posY = 50;
                scale = 1.1;
                break;
              case 2: // 床の座布団（中央下）
                posX = 50;
                posY = 74;
                scale = 1;
                break;
              case 3: // テーブル前の椅子（上側）
                posX = 50;
                posY = 35;
                scale = 0.9;
                break;
              case 4: // 左上の椅子（窓側）
                posX = 32;
                posY = 37;
                scale = 0.85;
                break;
              case 5: // 右上の椅子
                posX = 68;
                posY = 37;
                scale = 0.85;
                break;
              case 6: // 左下の座布団
                posX = 32;
                posY = 68;
                scale = 0.9;
                break;
              case 7: // 右下の座布団
                posX = 68;
                posY = 68;
                scale = 0.9;
                break;
              default: // その他の人は端に配置
                const angle = (index * Math.PI * 2) / participants.length;
                posX = 50 + 40 * Math.cos(angle);
                posY = 50 + 30 * Math.sin(angle);
                scale = 0.8;
            }

            return (
              <div
                key={user.id}
                className="absolute"
                style={{
                  left: `${posX}%`,
                  top: `${posY}%`,
                  transform: `translate(-50%, -50%) scale(${scale})`,
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

        {/* メモ・チャット・学習状態エリア - 画面最下部に固定 */}
        <div className="fixed bottom-0 left-0 right-0 z-30">
          <div className="container mx-auto px-4">
            {/* 開閉ボタン - タブの外に移動 */}
            <div className="absolute -top-10 left-0 right-0 flex justify-center">
              <button
                onClick={togglePanel}
                className={cn(
                  "px-6 py-1 rounded-full flex items-center justify-center text-xs font-medium",
                  "transform transition-all duration-500 ease-in-out hover:scale-110",
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
                "rounded-t-xl overflow-hidden border transform origin-bottom",
                "transition-colors duration-500 ease-in-out",
                isPanelExpanded ? "scale-y-100" : "scale-y-95",
                isDarkMode
                  ? "bg-amber-900/90 border-amber-800 shadow-lg"
                  : "bg-amber-50/95 border-amber-200 shadow-md",
              )}
            >
              <Tabs
                defaultValue="chat"
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
                    <TabsTrigger value="chat" className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      チャット
                    </TabsTrigger>
                    <TabsTrigger value="stats" className="flex items-center">
                      <span className="mr-2">📊</span>
                      学習状況
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* パネルの内容 - 開閉可能（トランジションなし） */}
                <div
                  className={cn(
                    "w-full",
                    isPanelExpanded
                      ? "h-[70vh] min-h-[600px] max-h-[800px] opacity-100 visible"
                      : "h-0 opacity-0 invisible",
                  )}
                >
                  <TabsContent value="chat" className="h-full overflow-hidden">
                    <ChatPanel
                      messages={messages}
                      setMessages={setMessages}
                      isDarkMode={isDarkMode}
                    />
                  </TabsContent>

                  <TabsContent
                    value="stats"
                    className="h-full overflow-auto py-4"
                  >
                    <div className="h-full flex flex-col justify-start">
                      <div className="w-full max-w-4xl mx-auto px-4 py-4 transform transition-all duration-300 hover:scale-[1.005]">
                        <StudyStats isDarkMode={isDarkMode} />
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
