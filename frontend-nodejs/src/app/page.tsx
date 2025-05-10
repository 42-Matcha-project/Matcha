"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full relative">
      {/* 背景画像 */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/images/background.png')",
          backgroundSize: "contain", // 画像全体が表示されるよう調整
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* コンテンツ部分 */}
      <div className="flex flex-col items-center z-10 px-4 w-full">
        {/* service.png（メインキャラクター） */}
        <div className="mb-8">
          <Image
            src="/images/service.png"
            alt="サービスキャラクター"
            width={500}
            height={500}
            className="object-contain w-auto max-w-full h-auto max-h-[50vh] drop-shadow-xl"
            priority
          />
        </div>

        {/* TaskTown.png（ロゴ） */}
        <div className="mb-12">
          <Image
            src="/images/TaskTown.png"
            alt="TaskTown Logo"
            width={600}
            height={200}
            className="object-contain w-auto max-w-[90vw] h-auto max-h-[20vh] drop-shadow-lg"
            priority
          />
        </div>

        {/* ボタン部分 - 中央に配置 */}
        <div className="flex flex-col sm:flex-row gap-6 mt-8 w-full max-w-md justify-center">
          <Link
            href="/register"
            className="px-8 py-3 text-lg font-bold tracking-wider border-4 border-black bg-yellow-300 text-black shadow-[4px_4px_0_#222] hover:bg-yellow-400 hover:translate-y-1 transition-all duration-150 text-center rounded-lg"
            style={{
              fontFamily: "'DotGothic16', sans-serif",
              letterSpacing: "0.1em",
            }}
          >
            新規登録
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 text-lg font-bold tracking-wider border-4 border-black bg-blue-300 text-black shadow-[4px_4px_0_#222] hover:bg-blue-400 hover:translate-y-1 transition-all duration-150 text-center rounded-lg"
            style={{
              fontFamily: "'DotGothic16', sans-serif",
              letterSpacing: "0.1em",
            }}
          >
            ログイン
          </Link>
        </div>
      </div>
    </div>
  );
}
