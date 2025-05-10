"use client";

import React from "react";
import Layout from "./components/Layout";
import Image from "next/image";

// メインコンテンツコンポーネント
const MainContent: React.FC = () => {
  return (
    <React.Fragment>
      <div
        className="flex flex-col items-center justify-center w-full h-screen overflow-hidden"
        style={{
          backgroundImage: "url('/images/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* 中央配置のためのコンテナ */}
        <div className="flex flex-col items-center justify-center w-full h-full py-4">
          {/* service.png（メインキャラ） - 見切れないように調整 */}
          <div className="flex items-center justify-center w-full">
            <Image
              src="/images/service.png"
              alt="サービスキャラクター"
              width={1800}
              height={1800}
              className="object-contain w-full max-w-[90vw] max-h-[28vh] sm:max-h-[35vh] md:max-h-[40vh] drop-shadow-2xl"
              priority
            />
          </div>

          {/* TaskTown.png（ロゴ） - 中央配置 */}
          <div className="flex items-center justify-center w-full mt-2">
            <Image
              src="/images/TaskTown.png"
              alt="Task Town ロゴ"
              width={1800}
              height={1800}
              className="object-contain w-[90vw] sm:w-[70vw] md:w-[50vw] min-w-[180px] drop-shadow-xl"
              priority
            />
          </div>
          {/* ゲーム風ボタン（シンプル＆ゲーム性のあるUI） */}
          <div className="flex flex-col sm:flex-row items-center justify-center w-full mt-8 gap-4 sm:gap-6">
            <a
              href="/register"
              className="px-6 sm:px-10 py-3 sm:py-4 text-lg sm:text-2xl font-extrabold rounded-xl border-4 border-yellow-500 bg-yellow-300 text-black shadow-lg hover:bg-yellow-400 hover:scale-105 transition-all duration-150"
            >
              新規登録
            </a>
            <a
              href="/login"
              className="px-6 sm:px-10 py-3 sm:py-4 text-lg sm:text-2xl font-extrabold rounded-xl border-4 border-blue-500 bg-blue-300 text-black shadow-lg hover:bg-blue-400 hover:scale-105 transition-all duration-150"
            >
              ログイン
            </a>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

// グローバルスタイル定義
const GlobalStyles: React.FC = () => (
  <style jsx global>{`
    @keyframes bounce {
      0% {
        transform: translateY(0);
      }
      100% {
        transform: translateY(-5px);
      }
    }

    @keyframes sway {
      0% {
        transform: rotate(0deg);
      }
      50% {
        transform: rotate(3deg);
      }
      100% {
        transform: rotate(-3deg);
      }
    }

    @keyframes float {
      0% {
        transform: translateY(0);
      }
      100% {
        transform: translateY(-5px);
      }
    }

    html,
    body {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      overflow-x: hidden;
    }

    .bubbly-text {
      font-family: sans-serif;
      display: inline-block;
      position: relative;
      color: inherit;
      text-shadow:
        2px 2px 0 rgba(255, 255, 255, 0.3),
        -1px -1px 0 rgba(0, 0, 0, 0.2);
      transform-style: preserve-3d;
      transform: perspective(500px) rotateX(10deg);
      letter-spacing: 1px;
      animation: float 2s ease-in-out infinite alternate;
    }
  `}</style>
);

// メインページコンポーネント
const Home: React.FC = () => {
  return (
    <Layout showFooter={false}>
      <GlobalStyles />
      <MainContent />
    </Layout>
  );
};

export default Home;
