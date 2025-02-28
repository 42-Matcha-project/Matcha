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
    "relative px-9 py-4 font-bold text-lg transform transition-transform duration-300";
  const directionClass =
    direction === "left"
      ? "rotate-[-5deg] hover:rotate-0"
      : "rotate-[5deg] hover:rotate-0";
  const colorClasses = primary
    ? "bg-orange-300 text-yellow-950 border-yellow-900"
    : "bg-orange-300 text-yellow-900 border-yellow-300";

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
    <div className="relative">
      {/* 影の要素 */}
      <div
        className={`absolute inset-0 bg-black opacity-80 rounded blur-md ${directionClass} transform translate-y-3 translate-x-0`}
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
    <div className="flex space-x-3 mb-6">
      {["P", "R", "I", "V", "Y"].map((letter, index) => {
        const isBlackText = letter === "P" || letter === "I" || letter === "Y";
        return (
          <div
            key={index}
            className="inline-block border-2 border-emerald-600 rounded-lg p-2 sm:p-3 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-110 transition-all duration-300"
            style={{
              animation: `bounce 1s ease-in-out ${index * 0.7}s infinite alternate`,
              backgroundColor: `rgba(16, 185, 129, ${(index + 1) * 0.05 + 0.1})`,
            }}
          >
            <span
              className={`text-2xl sm:text-3xl font-bold ${isBlackText ? "text-black" : "text-white"}`}
            >
              {letter}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// 装飾画像コンポーネント
const DecorativeImage = ({
  src,
  alt,
  width,
  height,
  className,
  style,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className: string;
  style?: React.CSSProperties;
}) => {
  return (
    <div className={className} style={style}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="object-contain pointer-events-none"
        priority={src.includes("flying")} // 蝶のアニメーションは優先度高く
      />
    </div>
  );
};

// 重なり合う花のコンポーネント
const LayeredFlowers = () => {
  const flowers = [
    {
      className: "fixed right-0 top-0 w-24 md:w-32 lg:w-40 z-30",
      style: {
        animation: "sway 4s ease-in-out infinite alternate",
        transformOrigin: "center bottom",
      },
      width: 300,
      height: 300,
      alt: "花 (前面)",
    },
    {
      className: "fixed right-4 top-3 w-22 md:w-30 lg:w-38 z-20 opacity-90",
      style: {
        animation: "sway 5s ease-in-out 0.7s infinite alternate-reverse",
        transformOrigin: "center bottom",
      },
      width: 280,
      height: 280,
      alt: "花 (中間)",
    },
    {
      className: "fixed right-8 top-6 w-20 md:w-28 lg:w-36 z-10 opacity-80",
      style: {
        animation: "sway 6s ease-in-out 1.4s infinite alternate",
        transformOrigin: "center bottom",
      },
      width: 260,
      height: 260,
      alt: "花 (背面)",
    },
  ];

  return (
    <>
      {flowers.map((flower, index) => (
        <DecorativeImage
          key={index}
          src="/images/welcome-flower.webp"
          alt={flower.alt}
          width={flower.width}
          height={flower.height}
          className={flower.className}
          style={flower.style}
        />
      ))}
    </>
  );
};

// メインコンテンツコンポーネント
const MainContent = () => (
  <main className="relative z-10 flex flex-col items-center justify-center p-8 gap-6 text-center">
    <LetterBox />

    <p className="text-gray-800">
      ここにアプリの紹介文などを入れる
      <br />
    </p>

    <div className="flex flex-row items-center justify-center w-full gap-20 px-5">
      <div className="flex flex-col gap-10 mt-12 w-50 mx-auto">
        <WoodenSignButton href="/register" primary direction="left">
          登録
        </WoodenSignButton>
        <WoodenSignButton href="/login" direction="right">
          ログイン
        </WoodenSignButton>
      </div>

      {/* 蝶のアニメーション */}
      <DecorativeImage
        src="/images/welcome-butterfly.webp"
        alt="蝶が飛んでいるアニメーション"
        width={120}
        height={120}
        className="absolute right-8 md:right-16 lg:right-24 top-1/2 transform -translate-y-1/2 w-20 md:w-24 lg:w-32"
      />
    </div>

    {/* 装飾画像群 */}
    <DecorativeImage
      src="/images/welcome-red-flower.webp"
      alt="赤い花"
      width={300}
      height={300}
      className="fixed right-0 bottom-10 w-24 md:w-32 lg:w-64 z-10"
    />

    <DecorativeImage
      src="/images/welcome-hiyoko.webp"
      alt="ひよこ"
      width={160}
      height={160}
      className="fixed right-40 bottom-10 w-24 md:w-32 lg:w-40 z-10"
    />

    <DecorativeImage
      src="/images/welcome-fox.webp"
      alt="狐"
      width={350}
      height={350}
      className="fixed left-20 md:left-32 lg:left-80 bottom-20 w-30 md:w-32 lg:w-64 z-10"
    />

    {/* 重なり合う花の装飾 */}
    <LayeredFlowers />
  </main>
);

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

    @import url("https://fonts.googleapis.com/css2?family=Kosugi+Maru&display=swap");

    .bubbly-text {
      font-family: "Kosugi Maru", sans-serif;
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

    @keyframes float {
      0% {
        transform: perspective(500px) rotateX(10deg) translateY(0);
      }
      100% {
        transform: perspective(500px) rotateX(10deg) translateY(-3px);
      }
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
