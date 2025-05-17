"use client";
import Image from "next/image";
import { MessageCircle, Leaf, Trash2 } from "lucide-react";
import { APIFriend } from "./types";

interface FriendListProps {
  friends: APIFriend[];
  onDelete: (username: string) => void;
  loading: boolean;
}

export default function FriendList({
  friends,
  onDelete,
  loading,
}: FriendListProps) {
  return (
    <div>
      {friends.length === 0 && !loading ? (
        <div className="text-center text-gray-400 py-8 sm:py-12 flex flex-col items-center">
          <Image
            src="/images/welcome-bird.webp"
            alt="鳥"
            className="w-12 h-12 sm:w-16 sm:h-16 mb-2 opacity-70"
            aria-hidden
            width={64}
            height={64}
          />
          フレンドがいません。右上の申請ボタンから追加しましょう！
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {friends.map((f) => (
            <div
              key={f.ID}
              className="bg-green-50 rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 flex items-center gap-3 sm:gap-4 border-2 border-green-200 relative"
            >
              {/* 木の看板風ラベル */}
              <div className="absolute -top-3 sm:-top-4 left-3 sm:left-4 bg-amber-200 border-2 border-amber-400 rounded-xl px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-bold text-amber-900 shadow drop-shadow-sm z-10 flex items-center gap-1">
                <Leaf className="w-4 h-4 text-green-600" /> フレンド
              </div>
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-4 border-green-300 bg-white shadow">
                <Image
                  src={f.IconImageURL || "/images/macha-neko2.png"}
                  alt={f.DisplayName || f.Username}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-base sm:text-lg text-green-900 flex items-center gap-1 truncate">
                  {f.DisplayName || f.Username}
                  <span className="ml-1 text-xs text-green-600 bg-green-100 rounded px-2 py-0.5">
                    ともだち
                  </span>
                </div>
                <div className="text-green-700 text-xs sm:text-sm flex items-center gap-1 truncate">
                  <MessageCircle className="w-4 h-4" />
                  {/* メッセージは今はダミー */}
                  よろしくね！
                </div>
              </div>
              <button
                className="ml-1 sm:ml-2 p-2 rounded-full bg-amber-100 hover:bg-red-200 transition-colors shadow"
                title="削除"
                onClick={() => onDelete(f.Username)}
                disabled={loading}
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
