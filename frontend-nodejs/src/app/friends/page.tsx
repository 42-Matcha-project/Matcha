"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, Search } from "lucide-react";
import Image from "next/image";
import { ADMIN_MESSAGE_EXAMPLE } from "./types";
import FriendList from "./FriendList";
import FriendRanking from "./FriendRanking";

// API型
interface APIFriend {
  ID: number;
  Username: string;
  DisplayName: string;
  IconImageURL: string;
  // message等は今はダミーでOK
}

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

export default function FriendsPage() {
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
        <Image
          src="/images/welcome-flower.webp"
          alt="葉っぱ"
          width={160}
          height={160}
          className="w-full h-full object-contain"
          aria-hidden
        />
      </div>
      <div className="absolute right-0 top-0 w-20 h-20 sm:w-32 sm:h-32 opacity-50 select-none pointer-events-none z-0">
        <Image
          src="/images/welcome-flower.webp"
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

function AdminMessage({ message }: { message: typeof adminMessage }) {
  // ユーザーごとの一言をstateで管理
  const EXAMPLE = "今日も自分のペースでがんばろう！";
  const [customMsg, setCustomMsg] = useState(message.text);
  const [editMode, setEditMode] = useState(false);
  const [input, setInput] = useState(customMsg);

  const handleSave = () => {
    setCustomMsg(input.trim() === "" ? EXAMPLE : input);
    setEditMode(false);
  };
  const handleCancel = () => {
    setInput(customMsg);
    setEditMode(false);
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* 豪華な掲示板風装飾（バッジ） */}
      <div className="absolute -top-4 sm:-top-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        <div className="rounded-full bg-yellow-200 border-4 border-amber-400 shadow-xl text-lg sm:text-2xl font-extrabold text-amber-900 px-4 py-2 sm:px-6 sm:py-3 flex flex-col items-center min-w-[80px] min-h-[80px] sm:min-w-[120px] sm:min-h-[120px] max-w-[120px] max-h-[120px] sm:max-w-[160px] sm:max-h-[160px] flex justify-center">
          <span className="flex flex-col items-center">
            <span className="text-base sm:text-xl">今日の</span>
            <span className="text-base sm:text-xl">一言</span>
            <span className="flex gap-1 justify-center mt-1">
              <span>🌟</span>
              <span>🌟</span>
            </span>
          </span>
        </div>
      </div>
      {/* 下のカード */}
      <div className="bg-amber-50 rounded-3xl shadow-2xl p-4 sm:p-8 pt-16 sm:pt-24 text-center border-4 border-amber-300 relative mt-8 w-full">
        {editMode ? (
          <div className="flex flex-col items-center gap-3">
            <textarea
              className="w-full max-w-md rounded-xl border-2 border-amber-200 p-2 text-lg text-amber-900 focus:ring-2 focus:ring-amber-300 shadow-inner resize-none"
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={60}
              autoFocus
              placeholder={EXAMPLE}
            />
            <div className="flex gap-2 justify-center">
              <button
                className="px-4 py-1 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow"
                onClick={handleSave}
              >
                保存
              </button>
              <button
                className="px-4 py-1 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-colors shadow"
                onClick={handleCancel}
              >
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-2xl text-amber-900 mb-2 font-bold drop-shadow-sm animate-pulse break-words">
              {customMsg || EXAMPLE}
            </div>
            <div className="text-sm text-gray-500">{message.date}</div>
            <button
              className="absolute top-2 right-2 px-3 py-1 text-xs bg-yellow-200 text-amber-900 rounded-xl border border-amber-300 hover:bg-yellow-300 transition-colors shadow"
              onClick={() => {
                setEditMode(true);
                setInput(customMsg === EXAMPLE ? "" : customMsg);
              }}
            >
              編集
            </button>
          </>
        )}
        {/* 装飾イラスト */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          <Image
            src="/images/welcome-hiyoko.webp"
            alt="鳥"
            className="w-18 h-18 opacity-100"
            aria-hidden
            width={72}
            height={72}
          />
        </div>
      </div>
    </div>
  );
}

function FriendRequest() {
  return (
    <div className="bg-blue-50 rounded-2xl shadow-lg p-6 border-2 border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <UserPlus className="w-6 h-6 text-green-600" />
        <span className="font-bold text-lg text-green-900">フレンド申請</span>
      </div>
      <form className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="ユーザー名またはIDで検索"
          className="flex-1 px-4 py-2 rounded-xl border-2 border-green-200 bg-green-50 focus:ring-2 focus:ring-green-300 shadow-inner"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors flex items-center gap-1 shadow"
        >
          <Search className="w-4 h-4" />
          検索
        </button>
      </form>
      <div className="mt-6 text-center text-green-700 text-sm flex flex-col items-center">
        <Image
          src="/images/welcome-fox.webp"
          alt="狐"
          className="w-10 h-10 mb-2 opacity-70"
          aria-hidden
          width={40}
          height={40}
        />
        フレンド申請で新しい出会いを楽しもう！
      </div>
    </div>
  );
}
