"use client";
import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import FriendList from "./FriendList";
import FriendRanking from "./FriendRanking";
import FriendRequest from "./FriendRequest";
import AdminMessage from "./AdminMessage";
import { ADMIN_MESSAGE_EXAMPLE, APIFriend } from "./types";

// 今日の日付と曜日を生成
const getTodayWithWeekday = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const week = ["日", "月", "火", "水", "木", "金", "土"];
  const w = week[d.getDay()];
  return `${y}/${m}/${day}(${w})`;
};

const adminMessage = {
  text: ADMIN_MESSAGE_EXAMPLE,
  date: getTodayWithWeekday(),
};

export default function FriendsClient() {
  const [tab, setTab] = useState<"list" | "ranking" | "request">("list");
  const [friends, setFriends] = useState<APIFriend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // フレンド一覧取得
  const fetchFriends = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/friends/get`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const data = await res.json();
      if (!res.ok || !data.Friends) throw new Error(data.Error || "取得失敗");
      setFriends(data.Friends);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "フレンド取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  // フレンド削除
  const handleDelete = async (username: string) => {
    if (!confirm(`${username} をフレンドから削除しますか？`)) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/friends/delete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ FriendNameToDelete: username }),
        },
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.Error || "削除に失敗しました");
      }
      setFriends((prev) => prev.filter((f) => f.Username !== username));
      setSuccessMsg("フレンドを削除しました");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "削除に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-amber-50 to-blue-100 py-4 px-1 sm:py-8 sm:px-2 md:px-6 relative overflow-x-hidden">
      {/* 草や花のイラスト背景（装飾） */}
      <div className="absolute left-0 bottom-0 w-24 h-24 sm:w-40 sm:h-40 opacity-60 select-none pointer-events-none z-0">
        <img
          src="/images/welcome-flower.webp"
          alt="葉っぱ"
          width={160}
          height={160}
          className="w-full h-full object-contain"
          aria-hidden
        />
      </div>
      <div className="absolute right-0 top-0 w-20 h-20 sm:w-32 sm:h-32 opacity-50 select-none pointer-events-none z-0">
        <img
          src="/images/flower-bg.png"
          alt="花"
          width={128}
          height={128}
          className="w-full h-full object-contain"
          aria-hidden
        />
      </div>
      <div className="max-w-3xl mx-auto bg-white/90 rounded-2xl sm:rounded-3xl shadow-2xl p-2 sm:p-4 md:p-6 relative z-10 border-2 sm:border-4 border-amber-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-green-900 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 drop-shadow-[0_2px_2px_rgba(0,0,0,0.08)]">
          <Users className="w-7 h-7 sm:w-8 sm:h-8 text-green-700" /> フレンド
        </h1>
        {/* 今日の一言（特別枠） */}
        <div className="mb-6 sm:mb-8">
          <AdminMessage message={adminMessage} />
        </div>
        {/* フィードバック表示 */}
        {loading && (
          <div className="text-center text-green-700 mb-2 text-sm sm:text-base">
            読み込み中...
          </div>
        )}
        {error && (
          <div className="text-center text-red-500 mb-2 text-sm sm:text-base">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="text-center text-green-600 mb-2 text-sm sm:text-base">
            {successMsg}
          </div>
        )}
        {/* タブ切り替え */}
        <div className="flex gap-1 sm:gap-2 mb-6 sm:mb-8 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setTab("list")}
            className={`flex-1 min-w-[80px] px-2 sm:px-6 py-1.5 sm:py-2 rounded-t-xl sm:rounded-t-2xl font-bold border-b-4 transition-colors shadow text-xs sm:text-base ${tab === "list" ? "border-green-400 bg-green-100 text-green-900" : "border-transparent bg-transparent text-gray-400"}`}
          >
            一覧
          </button>
          <button
            onClick={() => setTab("ranking")}
            className={`flex-1 min-w-[80px] px-2 sm:px-6 py-1.5 sm:py-2 rounded-t-xl sm:rounded-t-2xl font-bold border-b-4 transition-colors shadow text-xs sm:text-base ${tab === "ranking" ? "border-yellow-400 bg-yellow-100 text-yellow-900" : "border-transparent bg-transparent text-gray-400"}`}
          >
            ランキング
          </button>
          <button
            onClick={() => setTab("request")}
            className={`flex-1 min-w-[80px] px-2 sm:px-6 py-1.5 sm:py-2 rounded-t-xl sm:rounded-t-2xl font-bold border-b-4 transition-colors shadow text-xs sm:text-base ${tab === "request" ? "border-blue-400 bg-blue-100 text-blue-900" : "border-transparent bg-transparent text-gray-400"}`}
          >
            申請
          </button>
        </div>
        {/* タブ内容 */}
        <div>
          {tab === "list" && (
            <FriendList
              friends={friends}
              onDelete={handleDelete}
              loading={loading}
            />
          )}
          {tab === "ranking" && <FriendRanking ranking={[]} />}
          {tab === "request" && <FriendRequest />}
        </div>
      </div>
    </div>
  );
}
