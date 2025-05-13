"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-[url('/images/background.png')] bg-top bg-contain bg-no-repeat">
      {/* サービスアイコン */}
      <Image
        src="/images/service.png"
        alt="Service Icon"
        width={500}
        height={167}
        className="object-contain w-full max-w-md h-auto mb-8 absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none -top-3"
        priority
        aria-hidden
      />
      {/* ロゴ */}
      <Image
        src="/images/TaskTown.png"
        alt="TaskTown Logo"
        width={800}
        height={267}
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
        priority
        aria-hidden
      />
      {/* ボタン */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-auto">
        <div className="flex flex-row gap-8 justify-center">
          <Link
            href="/register"
            className="min-w-[180px] px-8 py-4 text-xl sm:text-2xl font-extrabold tracking-wider border-4 border-black bg-yellow-300 text-black shadow-[4px_4px_0_#222] hover:bg-yellow-400 hover:translate-y-1 transition-all duration-150 text-center rounded-xl whitespace-nowrap"
          >
            新規登録
          </Link>
          <Link
            href="/login"
            className="min-w-[180px] px-8 py-4 text-xl sm:text-2xl font-extrabold tracking-wider border-4 border-black bg-blue-300 text-black shadow-[4px_4px_0_#222] hover:bg-blue-400 hover:translate-y-1 transition-all duration-150 text-center rounded-xl whitespace-nowrap"
          >
            ログイン
          </Link>
        </div>
      </div>
      {/* フッター */}
      <footer className="fixed bottom-0 left-0 w-full text-center py-4 text-gray-600 text-lg bg-white/100 tracking-wider z-50">
        © 2025 TaskTown
      </footer>
    </div>
  );
}
