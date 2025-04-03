"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import ThemeToggle from "../../components/ThemeToggle";

export default function JoinRoomAlt2() {
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleJoin = async () => {
    if (!roomCode.trim()) {
      setError("ルームコードを入力してください");
      return;
    }

    try {
      router.push(`/room/${roomCode}`);
    } catch (error) {
      console.error("参加エラー:", error);
      setError("ルームへの参加に失敗しました");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center transition-colors duration-300 bg-gradient-to-r from-rose-100 to-teal-100 dark:bg-gradient-to-r dark:from-gray-900 dark:to-gray-800">
      <div className="relative w-full max-w-md mx-4">
        {/* 装飾的な背景要素 */}
        <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl transform rotate-3 opacity-50"></div>
        <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl transform -rotate-3 opacity-50"></div>

        <div className="relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold dark:text-white">
                自習室に参加
              </h1>
            </div>
            <ThemeToggle />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roomCode" className="text-lg dark:text-gray-200">
                ルームコード
              </Label>
              <Input
                id="roomCode"
                placeholder="例）123456"
                value={roomCode}
                onChange={(e) => {
                  setError("");
                  setRoomCode(e.target.value.toUpperCase());
                }}
                className="text-lg tracking-wider h-14 text-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-400 placeholder-gray-500"
              />
              {error && (
                <p className="text-sm text-destructive dark:text-red-400 animate-shake">
                  {error}
                </p>
              )}
            </div>
          </div>

          <Button
            className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-primary to-primary-foreground hover:opacity-90 transition-opacity"
            onClick={handleJoin}
          >
            入室する
            <ArrowRight className="w-5 h-5" />
          </Button>

          <p className="text-sm text-center text-muted-foreground dark:text-gray-400">
            ホストから共有された6桁コードを入力してください
          </p>
        </div>
      </div>
    </div>
  );
}
