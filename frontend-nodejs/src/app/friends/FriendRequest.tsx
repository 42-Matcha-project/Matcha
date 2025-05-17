"use client";
import Image from "next/image";
import { UserPlus, Search } from "lucide-react";

export default function FriendRequest() {
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
