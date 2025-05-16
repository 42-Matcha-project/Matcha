import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative w-full min-h-screen h-auto overflow-hidden bg-[url('/images/background.png')] bg-top bg-contain bg-no-repeat">
      {/* サービスアイコン */}
      <Image
        src="/images/service.png"
        alt="このタスクはあと⚪︎時間で終わらせなければならない!!"
        width={500}
        height={167}
        className="object-contain w-full max-w-xs sm:max-w-md h-auto mb-4 sm:mb-8 absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none -top-6 sm:-top-9"
        priority
      />
      {/* ロゴ */}
      <Image
        src="/images/TaskTown.png"
        alt="TaskTown"
        width={800}
        height={267}
        className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 w-4/5 max-w-xs sm:max-w-lg"
        priority
      />
      {/* ボタン */}
      <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 w-auto">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center items-center">
          <Link
            href="/register"
            className="min-w-[140px] sm:min-w-[180px] px-6 sm:px-8 py-3 sm:py-4 text-lg sm:text-xl md:text-2xl font-extrabold tracking-wider border-4 border-black bg-yellow-300 text-black shadow-[4px_4px_0_#222] hover:bg-yellow-400 hover:translate-y-1 transition-all duration-150 text-center rounded-xl whitespace-nowrap mb-3 sm:mb-0"
          >
            新規登録
          </Link>
          <Link
            href="/login"
            className="min-w-[140px] sm:min-w-[180px] px-6 sm:px-8 py-3 sm:py-4 text-lg sm:text-xl md:text-2xl font-extrabold tracking-wider border-4 border-black bg-blue-300 text-black shadow-[4px_4px_0_#222] hover:bg-blue-400 hover:translate-y-1 transition-all duration-150 text-center rounded-xl whitespace-nowrap"
          >
            ログイン
          </Link>
        </div>
      </div>
      {/* フッター */}
      <footer className="fixed bottom-0 left-0 w-full text-center py-2 sm:py-4 text-gray-600 text-base sm:text-lg bg-white/100 tracking-wider z-50">
        © 2025 TaskTown
      </footer>
    </div>
  );
}
