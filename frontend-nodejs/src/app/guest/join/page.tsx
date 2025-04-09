"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import ParticipantsDialog from "../../components/ParticipantsDialog";
import { useRoomJoin } from "../../../hooks/useRoomJoin";

export default function GuestJoinPage() {
  const router = useRouter();
  const [showParticipants, setShowParticipants] = useState(false);

  // リファクタリングしたカスタムフックを使用
  const { roomCode, setRoomCode, isJoining, error, joinRoom } = useRoomJoin();

  // 戻るボタンの処理
  const handleGoBack = () => {
    router.back();
  };

  // 参加者を見るボタンの処理
  const handleViewParticipants = () => {
    if (!roomCode.trim()) {
      alert("参加者を後に表示");
      return;
    }

    setShowParticipants(true);
  };

  return (
    <div className="min-h-screen bg-amber-50 text-amber-900 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-amber-800 p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <button
            onClick={handleGoBack}
            className="flex items-center text-amber-100 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>ルーム一覧に戻る</span>
          </button>

          <div className="flex items-center text-white">
            <span>16:00</span>
            <span className="mx-4">3日連続</span>
            <span>12.5時間</span>
            <span className="ml-4">開拓者</span>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col items-center justify-center py-8 px-4">
        <div className="w-full max-w-lg bg-white/90 rounded-xl shadow-lg overflow-hidden border border-amber-200">
          <div className="p-8">
            <h1 className="text-2xl font-bold text-center text-amber-800 mb-4">
              自習室に参加
            </h1>
            <p className="text-center text-amber-700 mb-8">
              ルームコードを入力して自習室に参加しましょう
            </p>

            {/* 建物イラスト */}
            <div className="flex justify-center mb-6">
              <div className="relative w-52 h-52">
                <Image
                  src="/images/house.png"
                  alt="自習室"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-amber-700 font-medium mb-1">
                ルームコード
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="例: ROOM1234"
                className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600 bg-amber-50/50 text-center"
              />
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>

            {/* 参加者を見るボタン */}
            <div className="text-right mb-6">
              <button
                type="button"
                onClick={handleViewParticipants}
                className="text-amber-700 hover:text-amber-900 text-sm font-medium border border-amber-300 px-3 py-1 rounded-full hover:bg-amber-100 transition-colors"
              >
                参加者を見る
              </button>
            </div>

            {/* 参加ボタン */}
            <div className="mb-6">
              <motion.button
                onClick={joinRoom}
                className="w-full bg-amber-700 hover:bg-amber-800 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center"
                whileTap={{ scale: 0.95 }}
                disabled={isJoining}
              >
                {isJoining ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : null}
                自習室に参加
              </motion.button>
            </div>

            <div className="text-center text-sm text-amber-700">
              <p>ルームコードはホストから共有されます</p>
              <p className="mt-1">
                または
                <a
                  href="/host/building-selection"
                  className="text-amber-800 font-medium hover:underline ml-1"
                >
                  自分で自習室を作成
                </a>
                することもできます
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 参加者ダイアログ */}
      <ParticipantsDialog
        roomCode={roomCode}
        isOpen={showParticipants}
        onClose={() => setShowParticipants(false)}
      />
    </div>
  );
}
