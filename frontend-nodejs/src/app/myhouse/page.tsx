"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  ChevronUp,
  ChevronDown,
  LogOut,
  Moon,
  Sun,
  Settings,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

// コンポーネントをインポート
import { ChatPanel } from "./components/ChatPanel";
import { StudyStats } from "./components/StudyStats";
import { initialParticipants } from "./data";
import { Participant, Message } from "./types";

// 初期データをインポート
import { initialMessages } from "./data";

export default function CozyRoomPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [participants, setParticipants] =
    useState<Participant[]>(initialParticipants);
  const [guestInfo, setGuestInfo] = useState<{
    name: string;
    avatar: string;
    status: "studying" | "break" | "away";
    position: { x: number; y: number };
  } | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoggingWork, setIsLoggingWork] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEndSessionDialog, setShowEndSessionDialog] = useState(false);
  const [showRoomCode, setShowRoomCode] = useState(false);
  const [roomCode, setRoomCode] = useState("");

  // キーボードショートカットを登録
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+L: 作業ログダイアログを表示 (MacではOption+L)
      if (
        e.altKey &&
        e.key === "l" &&
        !isLoggingWork &&
        !showEndSessionDialog
      ) {
        e.preventDefault(); // デフォルトの挙動を防止
        setIsLoggingWork(true);
      }

      // Escape: 各種ダイアログを閉じる
      if (e.key === "Escape") {
        if (isLoggingWork) {
          setIsLoggingWork(false);
        }
        if (showEndSessionDialog) {
          setShowEndSessionDialog(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoggingWork, showEndSessionDialog]);

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
          avatar: "/placeholder.svg?height=80&width=80",
          status: "studying" as "studying" | "break" | "away",
          position: { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 },
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

  // コンポーネントマウント時にルームコードを読み取る
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRoomCode = localStorage.getItem("myRoomCode");
      if (savedRoomCode) {
        setRoomCode(savedRoomCode);
      } else {
        // 初回訪問時は新しいコードを生成して保存
        const newCode = generateRandomCode();
        setRoomCode(newCode);
        localStorage.setItem("myRoomCode", newCode);
      }
    }
  }, []);

  // 新しいルームコードを生成する
  const regenerateRoomCode = () => {
    const newCode = generateRandomCode();
    setRoomCode(newCode);
    localStorage.setItem("myRoomCode", newCode);
    setShowRoomCode(true);
  };

  // ルームコードを生成する関数
  function generateRandomCode(length: number = 6): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // 招待リンクをコピー
  const copyInviteLink = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      // ルームコードのみをコピー
      const codeToShare = roomCode || "ルームコードがありません";

      navigator.clipboard
        .writeText(codeToShare)
        .then(() => {
          toast.success("招待コードをコピーしました");
          setShowRoomCode(true);
        })
        .catch((err) => {
          console.error("クリップボードへのコピーに失敗しました:", err);
        });
    }
  };

  // ダークモードの切り替え
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // パネルの展開・収納を切り替え
  const togglePanel = () => setIsPanelExpanded(!isPanelExpanded);

  // End study session function
  const endStudySession = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("認証情報がありません。再ログインしてください。");
        // ログイン画面へリダイレクト
        setTimeout(() => {
          router.push("/login");
        }, 1500); // トーストメッセージを表示した後、1.5秒後にリダイレクト
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/study-room/delete`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        // 認証エラーの場合
        if (response.status === 401) {
          toast.error(
            "認証情報がありません。またあとでためしてみるか、運営に相談してみよう！",
          );
          setTimeout(() => {
            router.push("/login");
          }, 2000); // メッセージ表示後、2秒後にリダイレクト
          return;
        }
        throw new Error(`タスクの終了に失敗しました (${response.status})`);
      }

      toast.success("タスクを終了しました");
      // リダイレクトをsettlementページに
      router.push("/settlement");
    } catch (error) {
      console.error("タスク終了エラー:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "タスクの終了中にエラーが発生しました",
      );
    } finally {
      setIsLoading(false);
      setShowEndSessionDialog(false);
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen overflow-hidden",
        isDarkMode
          ? "bg-amber-950 text-amber-50"
          : "bg-amber-100 text-amber-950",
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
      <header
        className={cn(
          "px-4 py-2 flex items-center justify-between border-b backdrop-blur-sm",
          isDarkMode
            ? "bg-amber-900/90 border-amber-800"
            : "bg-amber-100/90 border-amber-200",
        )}
      >
        <div className="flex items-center space-x-2">
          <h1 className="font-bold text-lg">マイハウス</h1>
          <span
            className={cn(
              "px-2 py-0.5 text-xs rounded-md",
              isDarkMode ? "bg-amber-800" : "bg-amber-200",
            )}
          >
            マイルーム
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {showRoomCode && (
            <div
              className={cn(
                "px-3 py-1 rounded-md text-sm font-mono flex items-center gap-2",
                isDarkMode ? "bg-amber-800" : "bg-amber-200",
              )}
            >
              <span>招待コード: {roomCode}</span>
              <button
                onClick={regenerateRoomCode}
                className="h-5 w-5 rounded-full flex items-center justify-center hover:bg-amber-700/20"
                title="新しいコードを生成"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-refresh-cw"
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M3 21v-5h5" />
                </svg>
              </button>
            </div>
          )}

          <button
            className={cn(
              "text-sm py-1.5 px-3 rounded-md flex items-center",
              isDarkMode
                ? "bg-amber-800 border-amber-700 hover:bg-amber-700"
                : "bg-amber-200 border-amber-300 hover:bg-amber-300",
            )}
            onClick={copyInviteLink}
          >
            招待する
          </button>

          {/* End Study Session Button */}
          <button
            onClick={() => setShowEndSessionDialog(true)}
            disabled={isLoading}
            className={cn(
              "flex items-center text-sm rounded-md py-1.5 px-3 transition-all",
              isDarkMode
                ? "bg-amber-800 hover:bg-amber-700 text-amber-50"
                : "bg-amber-200 hover:bg-amber-300 text-amber-950",
              isLoading && "opacity-70 cursor-not-allowed",
            )}
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            タスク終了
          </button>

          {/* Custom theme toggle button */}
          <button
            onClick={toggleDarkMode}
            className={cn(
              "flex items-center justify-center rounded-full p-2 transition-colors",
              isDarkMode
                ? "bg-amber-800 hover:bg-amber-700 text-amber-50"
                : "bg-amber-200 hover:bg-amber-300 text-amber-950",
            )}
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          <button
            className={cn(
              "flex items-center justify-center rounded-full p-2 transition-colors",
              isDarkMode
                ? "bg-amber-800 hover:bg-amber-700 text-amber-50"
                : "bg-amber-200 hover:bg-amber-300 text-amber-950",
            )}
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="relative h-[calc(100vh-3rem)] overflow-hidden">
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

        {/* End Study Session Dialog */}
        <Dialog
          open={showEndSessionDialog}
          onOpenChange={setShowEndSessionDialog}
        >
          <DialogContent
            className={cn(
              "sm:max-w-xl w-[90%] p-6",
              isDarkMode
                ? "bg-amber-900 border-amber-800 text-amber-50 border-2"
                : "bg-amber-50 border-amber-200 text-amber-950 border-2",
            )}
          >
            <DialogHeader className="p-2">
              <DialogTitle className="flex items-center gap-3 text-xl mb-2">
                <LogOut className="h-6 w-6" />
                タスクを終了しますか？
              </DialogTitle>
              <DialogDescription
                className={cn(
                  "text-base",
                  isDarkMode ? "text-amber-300" : "text-amber-700",
                )}
              >
                タスクを終了すると、現在の作業タイマーがリセットされます。タイマーの進捗はプロフィールに記録されます。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-between flex-row gap-3 mt-6 mb-2">
              <button
                onClick={() => setShowEndSessionDialog(false)}
                disabled={isLoading}
                className={cn(
                  "flex-1 py-3 px-5 rounded-lg text-base font-medium transition-colors",
                  isDarkMode
                    ? "bg-amber-800 hover:bg-amber-700"
                    : "bg-amber-100 hover:bg-amber-200",
                )}
              >
                キャンセル
              </button>
              <button
                onClick={endStudySession}
                disabled={isLoading}
                className={cn(
                  "flex-1 py-3 px-5 rounded-lg text-base font-medium transition-colors flex justify-center items-center",
                  isDarkMode
                    ? "bg-red-800 hover:bg-red-700 text-red-50"
                    : "bg-red-100 hover:bg-red-200 text-red-800",
                  isLoading && "opacity-70 cursor-not-allowed",
                )}
              >
                {isLoading ? (
                  "処理中..."
                ) : (
                  <>
                    <LogOut className="h-5 w-5 mr-2" />
                    終了する
                  </>
                )}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* メモ・チャット・作業状態エリア - 画面最下部に固定 */}
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
                      作業状況
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
