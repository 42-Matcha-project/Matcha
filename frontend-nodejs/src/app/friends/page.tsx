"use client";

import { useState } from "react";
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

const dummyFriends = [
  {
    id: 1,
    name: "Taro",
    icon: "/images/macha-neko2.png",
    message: "今日もがんばる！",
  },
  {
    id: 2,
    name: "Hanako",
    icon: "/images/macha-neko2.png",
    message: "集中！",
  },
];
const dummyRanking = [
  { id: 1, name: "Taro", icon: "/images/macha-neko2.png", score: 120 },
  { id: 2, name: "Hanako", icon: "/images/macha-neko2.png", score: 100 },
];
const adminMessage = {
  text: "今日も自分のペースでがんばろう！",
  date: "2024/06/01",
};

export default function FriendsPage() {
  const [tab, setTab] = useState<"list" | "ranking" | "request">("list");

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
          {tab === "list" && <FriendList friends={dummyFriends} />}
          {tab === "ranking" && <FriendRanking ranking={dummyRanking} />}
          {tab === "request" && <FriendRequest />}
        </div>
      </div>
    </div>
  );
}

function FriendList({ friends }: { friends: typeof dummyFriends }) {
  return (
    <div>
      {friends.length === 0 ? (
        <div className="text-center text-gray-400 py-12 flex flex-col items-center">
          <Image
            src="/images/leaf-bg.png"
            alt="葉っぱ"
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
              key={f.id}
              className="bg-green-50 rounded-2xl shadow-lg p-4 flex items-center gap-4 border-2 border-green-200 relative"
            >
              {/* 木の看板風ラベル */}
              <div className="absolute -top-4 left-4 bg-amber-200 border-2 border-amber-400 rounded-xl px-3 py-1 text-xs font-bold text-amber-900 shadow drop-shadow-sm z-10 flex items-center gap-1">
                <Leaf className="w-4 h-4 text-green-600" /> フレンド
              </div>
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-green-300 bg-white shadow">
                <Image
                  src={f.icon}
                  alt={f.name}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg text-green-900 flex items-center gap-1">
                  {f.name}
                  <span className="ml-1 text-xs text-green-600 bg-green-100 rounded px-2 py-0.5">
                    ともだち
                  </span>
                </div>
                <div className="text-green-700 text-sm flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {f.message}
                </div>
              </div>
              <button
                className="ml-2 p-2 rounded-full bg-amber-100 hover:bg-red-200 transition-colors shadow"
                title="削除"
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

function FriendRanking({ ranking }: { ranking: typeof dummyRanking }) {
  return (
    <div className="space-y-4">
      {ranking.length === 0 ? (
        <div className="text-center text-gray-400 py-12 flex flex-col items-center">
          <Image
            src="/images/flower-bg.png"
            alt="花"
            className="w-16 h-16 mb-2 opacity-70"
            aria-hidden
          />
          ランキングデータがありません。
        </div>
      ) : (
        <ol className="space-y-2">
          {ranking.map((r, i) => (
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
                <Image
                  src={r.icon}
                  alt={r.name}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                />
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
          src="/images/board-pin.png"
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
          src="/images/board-pin.png"
          alt="ピン"
          className="w-8 h-8 drop-shadow-lg animate-bounce"
          style={{ animationDelay: "0.5s" }}
          aria-hidden
          width={32}
          height={32}
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
            src="/images/leaf-bg.png"
            alt="葉っぱ"
            className="w-10 h-10 opacity-80"
            aria-hidden
            width={40}
            height={40}
          />
          <Image
            src="/images/flower-bg.png"
            alt="花"
            className="w-10 h-10 opacity-80"
            aria-hidden
            width={40}
            height={40}
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
      {/* 検索結果ダミー */}
      <div className="flex items-center gap-4 bg-white rounded-xl p-3 mb-2 border-2 border-green-200 shadow">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-300">
          <Image
            src="/images/macha-neko2.png"
            alt="dummy"
            width={40}
            height={40}
            className="object-cover w-full h-full"
          />
        </div>
        <span className="font-bold text-green-900">dummy_user</span>
        <button className="ml-auto px-3 py-1 bg-yellow-400 text-white rounded-xl hover:bg-yellow-500 transition-colors shadow">
          申請
        </button>
      </div>
      {/* 申請中・承認待ちなどの表示も今後追加 */}
      <div className="mt-6 text-center text-green-700 text-sm flex flex-col items-center">
        <Image
          src="/images/flower-bg.png"
          alt="花"
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
