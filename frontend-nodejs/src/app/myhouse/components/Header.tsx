"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Settings, LogOut, Moon, Sun, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  currentTime: Date | null;
}

// ルームコードを生成する関数
function generateRandomCode(length: number = 6): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function Header({
  isDarkMode,
  toggleDarkMode,
  currentTime,
}: HeaderProps) {
  const router = useRouter();
  const [showInviteTooltip, setShowInviteTooltip] = useState(false);
  const [roomCode, setRoomCode] = useState<string>("");
  const [showRoomCode, setShowRoomCode] = useState(false);

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

  // Format time with safety check for null
  const formattedTime = currentTime
    ? currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "--:--";

  // 招待リンクをコピー
  const copyInviteLink = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      // ルームコードのみをコピー
      const codeToShare = roomCode || "ルームコードがありません";

      navigator.clipboard
        .writeText(codeToShare)
        .then(() => {
          setShowInviteTooltip(true);
          setShowRoomCode(true);
          setTimeout(() => setShowInviteTooltip(false), 2000);
        })
        .catch((err) => {
          console.error("クリップボードへのコピーに失敗しました:", err);
        });
    } else {
      // フォールバック: テキストエリアを使用してコピーを試みる
      try {
        const textArea = document.createElement("textarea");
        // ルームコードのみをコピー
        const codeToShare = roomCode || "ルームコードがありません";
        textArea.value = codeToShare;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setShowInviteTooltip(true);
        setShowRoomCode(true);
        setTimeout(() => setShowInviteTooltip(false), 2000);
      } catch (err) {
        console.error("代替コピー方法も失敗しました:", err);
      }
    }
  };

  return (
    <header
      className={cn(
        "px-4 py-2 flex items-center justify-between border-b",
        isDarkMode
          ? "bg-amber-900 border-amber-800"
          : "bg-amber-100 border-amber-200",
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
            <Button
              variant="ghost"
              size="icon"
              onClick={regenerateRoomCode}
              className="h-5 w-5 rounded-full"
              title="新しいコードを生成"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          className={cn(
            "relative",
            isDarkMode
              ? "bg-amber-800 border-amber-700 hover:bg-amber-700"
              : "bg-amber-200 border-amber-300 hover:bg-amber-300",
          )}
          onClick={copyInviteLink}
        >
          招待する
          {/* ツールチップ */}
          <AnimatePresence>
            {showInviteTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs rounded whitespace-nowrap",
                  isDarkMode ? "bg-amber-700" : "bg-amber-300",
                )}
              >
                ルームコードをコピーしました
              </motion.div>
            )}
          </AnimatePresence>
        </Button>

        <div
          className={cn(
            "flex items-center px-2 py-1 rounded",
            isDarkMode ? "bg-amber-800" : "bg-amber-200",
          )}
        >
          <Clock className="h-4 w-4 mr-1" />
          <span>{formattedTime}</span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className={isDarkMode ? "text-amber-50" : "text-amber-950"}
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={isDarkMode ? "text-amber-50" : "text-amber-950"}
        >
          <Settings className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={isDarkMode ? "text-amber-50" : "text-amber-950"}
          onClick={() => router.push("/settlement")}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
