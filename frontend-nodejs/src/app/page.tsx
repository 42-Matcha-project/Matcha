"use client";

import Link from "next/link";
import Layout from "./components/Layout";
import Image from "next/image";
import { ReactNode } from "react";

// 木の看板ボタンコンポーネント
const WoodenSignButton = ({
  href,
  children,
  primary = false,
  direction = "left",
}: {
  href: string;
  children: ReactNode;
  primary?: boolean;
  direction?: "left" | "right";
}) => {
  const baseClasses =
    "relative px-4 py-3 sm:px-5 sm:py-4 font-bold text-base sm:text-lg transform transition-transform duration-300 w-full sm:w-40 md:w-48 mx-auto flex items-center justify-center";
  const directionClass =
    direction === "left"
      ? "rotate-[-5deg] hover:rotate-0"
      : "rotate-[5deg] hover:rotate-0";
  const colorClasses = primary
    ? "bg-orange-300 text-yellow-950 border-yellow-900"
    : "bg-orange-300 text-yellow-900 border-yellow-600";

  // 釘コンポーネント
  const Nail = ({
    position,
  }: {
    position: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  }) => {
    const positionClasses = {
      topLeft: "top-1 left-1",
      topRight: "top-1 right-1",
      bottomLeft: "bottom-1 left-1",
      bottomRight: "bottom-1 right-1",
    };

    return (
      <div
        className={`absolute ${positionClasses[position]} w-1.5 h-1.5 rounded-full bg-gray-500 border border-gray-500 shadow-inner`}
        style={{ boxShadow: "inset 0 0 2px rgba(255,255,255,0.5)" }}
      />
    );
  };

  return (
    <div className="relative w-full sm:w-40 md:w-48 mx-auto">
      {/* 影の要素 - 看板とサイズを合わせる */}
      <div
        className={`absolute w-full h-full top-[5px] left-[6px] rounded ${directionClass}`}
        style={{
          backgroundColor: "rgba(0,0,0,0.7)",
          filter: "blur(2px)",
          transform: `${direction === "left" ? "rotate(-5deg)" : "rotate(5deg)"} translateY(3px)`,
          zIndex: 5,
        }}
      />

      <Link
        href={href}
        className={`
        ${baseClasses} ${colorClasses} ${directionClass}
        block border-2 rounded relative z-10
      `}
      >
        <Nail position="topLeft" />
        <Nail position="topRight" />
        <Nail position="bottomLeft" />
        <Nail position="bottomRight" />
        <span className="bubbly-text relative z-10">{children}</span>
      </Link>
    </div>
  );
};

// LetterBox コンポーネント - PRIVYの文字を表示
const LetterBox = () => {
  return (
    <div className="flex justify-center w-full mb-6 sm:mb-8">
      <div className="flex space-x-2 sm:space-x-3 md:space-x-4">
        {["P", "R", "I", "V", "Y"].map((letter, index) => {
          const isBlackText =
            letter === "P" || letter === "I" || letter === "Y";
          return (
            <div
              key={index}
              className="inline-block border-2 border-emerald-600 rounded-lg p-2 sm:p-3 md:p-4 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-110 transition-all duration-300 text-center"
              style={{
                animation: `bounce 1s ease-in-out ${index * 0.7}s infinite alternate`,
                backgroundColor: `rgba(16, 185, 129, ${(index + 1) * 0.05 + 0.1})`,
              }}
            >
              <span
                className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold ${isBlackText ? "text-black" : "text-white"}`}
              >
                {letter}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 装飾画像コンポーネント
const DecorativeImage = ({
  src,
  alt,
  width,
  height,
  containerClassName,
  imageClassName = "",
  style,
  unoptimized,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  containerClassName: string;
  imageClassName?: string;
  style?: React.CSSProperties;
  unoptimized?: boolean;
}) => {
  // アニメーション画像かどうかを判定
  const isWebP = src.toLowerCase().endsWith(".webp");

  // 明示的に指定された場合はその値を使用、そうでなければWebPファイルではunoptimizedをtrueに
  const shouldNotOptimize = unoptimized !== undefined ? unoptimized : isWebP;

  return (
    <div className={containerClassName}>
      <div className={imageClassName} style={style}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="object-contain pointer-events-none w-full h-auto"
          priority={
            src.includes("flying") ||
            src.includes("butterfly") ||
            src.includes("welcome-flower") ||
            src.includes("macha-neko2.png")
          }
          unoptimized={shouldNotOptimize}
        />
      </div>
    </div>
  );
};

// メインコンテンツコンポーネント
const MainContent = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 to-amber-50 flex flex-col items-center justify-center px-2 sm:px-4 md:px-8 lg:px-16 py-6 sm:py-10">
      {/* レターボックス */}
      <LetterBox />

      {/* メインコンテンツ */}
      <main className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto flex flex-col gap-8 sm:gap-10 md:gap-14">
        {/* ボタン群 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <WoodenSignButton href="/profile" primary direction="left">
            プロフィール
          </WoodenSignButton>
          <WoodenSignButton href="/myhouse" direction="right">
            マイハウス
          </WoodenSignButton>
          <WoodenSignButton href="/buildings" direction="left">
            建物一覧
          </WoodenSignButton>
          <WoodenSignButton href="/settlement" direction="right">
            精算ページ
          </WoodenSignButton>
          <WoodenSignButton href="/login" direction="left">
            ログイン
          </WoodenSignButton>
          <WoodenSignButton href="/register" direction="right">
            新規登録
          </WoodenSignButton>
        </div>
        {/* 装飾画像や説明文も同様にレスポンシブクラスを追加 */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
          <DecorativeImage
            src="/images/welcome-flower.webp"
            alt="花"
            width={200}
            height={200}
            containerClassName="w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 lg:w-60 lg:h-60"
          />
          <p className="text-base sm:text-lg md:text-xl text-center md:text-left max-w-md">
            ようこそ！Matchaへ。
            <br />
            あなたの学びと成長を応援します。
          </p>
        </div>
      </main>
    </div>
  );
};

// グローバルスタイル定義
const GlobalStyles = () => (
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
export default function Home() {
  return (
    <Layout>
      <GlobalStyles />
      <MainContent />
    </Layout>
  );
}
