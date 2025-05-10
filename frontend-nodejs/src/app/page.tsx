"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{
        backgroundImage: "url('/images/background.png')",
        backgroundSize: "contain",
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat",
        top: "-60px",
        position: "relative",
      }}
    >
      {/* service.png（サービスアイコン）絶対配置で上部中央 */}
      <Image
        src="/images/service.png"
        alt="Service Icon"
        width={500}
        height={167}
        className="object-contain w-full max-w-md h-auto mb-8 absolute top-0 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
        priority
      />
      {/* TaskTown.png（ロゴ）絶対配置：ボタンの上に */}
      <Image
        src="/images/TaskTown.png"
        alt="TaskTown Logo"
        width={800}
        height={267}
        style={{
          position: "absolute",
          bottom: "50px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
        priority
      />
      {/* ボタン絶対配置 */}
      <div
        style={{
          position: "absolute",
          bottom: "90px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "auto",
        }}
      >
        <div className="flex flex-row gap-8 justify-center">
          <Link
            href="/register"
            className="min-w-[140px] px-8 py-4 text-xl sm:text-2xl font-extrabold tracking-wider border-4 border-black bg-yellow-300 text-black shadow-[4px_4px_0_#222] hover:bg-yellow-400 hover:translate-y-1 transition-all duration-150 text-center rounded-xl"
          >
            新規登録
          </Link>
          <Link
            href="/login"
            className="min-w-[140px] px-8 py-4 text-xl sm:text-2xl font-extrabold tracking-wider border-4 border-black bg-blue-300 text-black shadow-[4px_4px_0_#222] hover:bg-blue-400 hover:translate-y-1 transition-all duration-150 text-center rounded-xl"
          >
            ログイン
          </Link>
        </div>
      </div>
    </div>
  );
}
