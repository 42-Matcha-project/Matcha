"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Crown,
  UserPlus,
  Search,
  Trash2,
  MessageCircle,
  Leaf,
} from "lucide-react";
import Image from "next/image";

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
  text: "今日も自分のペースでがんばろう！",
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
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-amber-50 to-blue-100 py-8 px-2 sm:px-6 relative overflow-x-hidden">
      {/* 草や花のイラスト背景（装飾） */}
      <div className="absolute left-0 bottom-0 w-40 h-40 opacity-60 select-none pointer-events-none z-0">
        <Image
          src="/images/welcome-flower.webp"
          alt="葉っぱ"
          width={160}
          height={160}
          className="w-full h-full object-contain"
          aria-hidden
        />
      </div>
      <div className="absolute right-0 top-0 w-32 h-32 opacity-50 select-none pointer-events-none z-0">
        <Image
          src="/images/flower-bg.png"
          alt="花"
          width={128}
          height={128}
          className="w-full h-full object-contain"
          aria-hidden
        />
      </div>
      <div className="max-w-3xl mx-auto bg-white/90 rounded-3xl shadow-2xl p-6 relative z-10 border-4 border-amber-200">
        <h1 className="text-3xl font-extrabold text-green-900 mb-4 flex items-center gap-3 drop-shadow-[0_2px_2px_rgba(0,0,0,0.08)]">
          <Users className="w-8 h-8 text-green-700" /> フレンド
        </h1>
        {/* 今日の一言（特別枠） */}
        <div className="mb-8">
          <AdminMessage message={adminMessage} />
        </div>
        {/* フィードバック表示 */}
        {loading && (
          <div className="text-center text-green-700 mb-2">読み込み中...</div>
        )}
        {error && <div className="text-center text-red-500 mb-2">{error}</div>}
        {successMsg && (
          <div className="text-center text-green-600 mb-2">{successMsg}</div>
        )}
        {/* タブ切り替え */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setTab("list")}
            className={`px-6 py-2 rounded-t-2xl font-bold border-b-4 transition-colors shadow ${tab === "list" ? "border-green-400 bg-green-100 text-green-900" : "border-transparent bg-transparent text-gray-400"}`}
          >
            一覧
          </button>
          <button
            onClick={() => setTab("ranking")}
            className={`px-6 py-2 rounded-t-2xl font-bold border-b-4 transition-colors shadow ${tab === "ranking" ? "border-yellow-400 bg-yellow-100 text-yellow-900" : "border-transparent bg-transparent text-gray-400"}`}
          >
            ランキング
          </button>
          <button
            onClick={() => setTab("request")}
            className={`px-6 py-2 rounded-t-2xl font-bold border-b-4 transition-colors shadow ${tab === "request" ? "border-blue-400 bg-blue-100 text-blue-900" : "border-transparent bg-transparent text-gray-400"}`}
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

// フレンド一覧
function FriendList({
  friends,
  onDelete,
  loading,
}: {
  friends: APIFriend[];
  onDelete: (username: string) => void;
  loading: boolean;
}) {
  return (
    <div>
      {friends.length === 0 && !loading ? (
        <div className="text-center text-gray-400 py-12 flex flex-col items-center">
          <Image
            src="/images/welcome-bird.webp"
            alt="鳥"
            className="w-16 h-16 mb-2 opacity-70"
            aria-hidden
            width={64}
            height={64}
          />
          フレンドがいません。右上の申請ボタンから追加しましょう！
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {friends.map((f) => (
            <div
              key={f.ID}
              className="bg-green-50 rounded-2xl shadow-lg p-4 flex items-center gap-4 border-2 border-green-200 relative"
            >
              {/* 木の看板風ラベル */}
              <div className="absolute -top-4 left-4 bg-amber-200 border-2 border-amber-400 rounded-xl px-3 py-1 text-xs font-bold text-amber-900 shadow drop-shadow-sm z-10 flex items-center gap-1">
                <Leaf className="w-4 h-4 text-green-600" /> フレンド
              </div>
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-green-300 bg-white shadow">
                <Image
                  src={f.IconImageURL || "/images/macha-neko2.png"}
                  alt={f.DisplayName || f.Username}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg text-green-900 flex items-center gap-1">
                  {f.DisplayName || f.Username}
                  <span className="ml-1 text-xs text-green-600 bg-green-100 rounded px-2 py-0.5">
                    ともだち
                  </span>
                </div>
                <div className="text-green-700 text-sm flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {/* メッセージは今はダミー */}
                  よろしくね！
                </div>
              </div>
              <button
                className="ml-2 p-2 rounded-full bg-amber-100 hover:bg-red-200 transition-colors shadow"
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

interface RankingItem {
  id: number;
  name: string;
  icon: string;
  score: number;
}

function FriendRanking({ ranking }: { ranking: RankingItem[] }) {
  return (
    <div className="space-y-4">
      {ranking.length === 0 ? (
        <div className="text-center text-gray-400 py-12 flex flex-col items-center">
          <Image
            src="/images/welcome-butterfly.webp"
            alt="蝶"
            className="w-16 h-16 mb-2 opacity-70"
            aria-hidden
            width={64}
            height={64}
          />
          ランキングデータがありません。
        </div>
      ) : (
        <ol className="space-y-2">
          {ranking.map((r: RankingItem, i: number) => (
            <li
              key={r.id}
              className={`flex items-center gap-4 p-4 rounded-2xl shadow-lg border-2 ${i === 0 ? "bg-yellow-100 border-yellow-300" : "bg-green-50 border-green-200"}`}
            >
              <span className="text-2xl font-bold w-8 text-center flex items-center justify-center">
                {i + 1}
                {i === 0 && (
                  <span className="ml-1 flex items-center">
                    <Crown className="inline w-6 h-6 text-yellow-500" />
                    <Image
                      src="/images/leaf-bg.png"
                      alt="リース"
                      className="w-6 h-6 ml-1"
                      aria-hidden
                      width={24}
                      height={24}
                    />
                  </span>
                )}
              </span>
              <div className="w-12 h-12 rounded-full overflow-hidden border-4 border-green-300 bg-white shadow">
                <Image src={r.icon} alt={r.name} width={48} height={48} />
              </div>
              <span className="font-bold text-lg text-green-900">{r.name}</span>
              <span className="ml-auto text-green-700 font-semibold">
                {r.score}h
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function AdminMessage({ message }: { message: typeof adminMessage }) {
  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* 豪華な掲示板風装飾 */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        <Image
          src="/images/welcome-red-flower.webp"
          alt="ピン"
          className="w-8 h-8 drop-shadow-lg animate-bounce"
          aria-hidden
          width={32}
          height={32}
        />
        <span className="bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 px-6 py-2 rounded-full border-4 border-amber-400 shadow-xl text-2xl font-extrabold text-amber-900 tracking-wide flex items-center gap-2">
          <span className="mr-2">🌟</span>今日の一言
          <span className="ml-2">🌟</span>
        </span>
        <Image
          src="/images/welcome-red-flower.webp"
          alt="red flower"
          className="w-10 h-10 drop-shadow-lg animate-bounce"
          style={{ animationDelay: "0.8s" }}
          aria-hidden
          width={48}
          height={48}
        />
      </div>
      <div className="bg-amber-50 rounded-3xl shadow-2xl p-8 pt-16 text-center border-4 border-amber-300 relative mt-8 w-full">
        <div className="text-2xl text-amber-900 mb-2 font-bold drop-shadow-sm animate-pulse">
          {message.text}
        </div>
        <div className="text-sm text-gray-500">
          {message.date} <span className="ml-2">運営より</span>
        </div>
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
