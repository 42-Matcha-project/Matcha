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
    "relative px-5 py-4 font-bold text-lg transform transition-transform duration-300 w-32 sm:w-40 md:w-48 mx-auto flex items-center justify-center";
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
    <div className="relative w-32 sm:w-40 md:w-48 mx-auto">
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
    <div className="flex justify-center w-full mb-8">
      <div className="flex space-x-2 sm:space-x-3 md:space-x-4">
        {["P", "R", "I", "V", "Y"].map((letter, index) => {
          const isBlackText =
            letter === "P" || letter === "I" || letter === "Y";
          return (
            <div
              key={index}
              className="inline-block border-2 border-emerald-600 rounded-lg p-2 sm:p-3 md:p-4 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-110 transition-all duration-300"
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
          priority={src.includes("flying") || src.includes("butterfly")}
          unoptimized={shouldNotOptimize}
        />
      </div>
    </div>
  );
};

// 複数の花を表示する汎用コンポーネント
const FlowerLayer = ({
  position = "top-right",
  flowerImage = "/images/welcome-flower.webp",
}: {
  position: "top-right" | "bottom-left";
  flowerImage?: string;
}) => {
  // 花の設定の型を定義
  type FlowerConfig = {
    containerClassName: string;
    imageClassName?: string;
    style?: React.CSSProperties;
    width: number;
    height: number;
    alt: string;
  };

  // 位置設定の型を定義
  type PositionConfig = {
    flowers: FlowerConfig[];
  };
  // 位置に基づく設定を定義
  const positionSettings: Record<string, PositionConfig> = {
    "top-right": {
      flowers: [
        {
          containerClassName:
            "absolute top-0 right-0 w-[15%] max-w-[180px] z-30",
          imageClassName: "w-full",
          style: {
            animation: "sway 4s ease-in-out infinite alternate",
            transformOrigin: "center bottom",
          },
          width: 300,
          height: 300,
          alt: "花 (前面)",
        },
        {
          containerClassName:
            "absolute top-[2%] right-[5%] w-[13%] max-w-[160px] z-20",
          imageClassName: "w-full opacity-90",
          style: {
            animation: "sway 5s ease-in-out 0.7s infinite alternate-reverse",
            transformOrigin: "center bottom",
          },
          width: 280,
          height: 280,
          alt: "花 (中間)",
        },
        {
          containerClassName:
            "absolute top-[4%] right-[10%] w-[11%] max-w-[140px] z-10",
          imageClassName: "w-full opacity-80",
          style: {
            animation: "sway 6s ease-in-out 1.4s infinite alternate",
            transformOrigin: "center bottom",
          },
          width: 260,
          height: 260,
          alt: "花 (背面)",
        },
      ],
    },
    "bottom-left": {
      flowers: [
        {
          containerClassName:
            "absolute bottom-0 left-0 w-[15%] max-w-[180px] z-30",
          imageClassName: "w-full",
          style: {
            animation: "sway 4.5s ease-in-out 0.2s infinite alternate-reverse",
            transformOrigin: "center bottom",
          },
          width: 300,
          height: 300,
          alt: "花 (左下前面)",
        },
        {
          containerClassName:
            "absolute bottom-[2%] left-[5%] w-[13%] max-w-[160px] z-20",
          imageClassName: "w-full opacity-90",
          style: {
            animation: "sway 5.2s ease-in-out 0.9s infinite alternate",
            transformOrigin: "center bottom",
          },
          width: 280,
          height: 280,
          alt: "花 (左下中間)",
        },
        {
          containerClassName:
            "absolute bottom-[4%] left-[10%] w-[11%] max-w-[140px] z-10",
          imageClassName: "w-full opacity-80",
          style: {
            animation: "sway 6.5s ease-in-out 1.6s infinite alternate-reverse",
            transformOrigin: "center bottom",
          },
          width: 260,
          height: 260,
          alt: "花 (左下背面)",
        },
      ],
    },
  };

  const flowers: FlowerConfig[] = positionSettings[position]?.flowers || [];

  return (
    <>
      {flowers.map((flower: FlowerConfig, index: number) => (
        <DecorativeImage
          key={index}
          src={flowerImage}
          alt={flower.alt}
          width={flower.width}
          height={flower.height}
          containerClassName={flower.containerClassName}
          imageClassName={flower.imageClassName}
          style={flower.style}
        />
      ))}
    </>
  );
};

// メインコンテンツコンポーネント
const MainContent = () => {
  // 装飾画像の設定を一元管理
  const decorations = [
    {
      src: "/images/welcome-red-flower.webp",
      alt: "赤い花",
      width: 300,
      height: 300,
      containerClassName:
        "absolute bottom-[5%] left-[5%] w-[12%] max-w-[180px] z-10",
    },
    {
      src: "/images/welcome-hiyoko.webp",
      alt: "ひよこ",
      width: 160,
      height: 160,
      containerClassName:
        "absolute bottom-0 right-[20%] w-[8%] max-w-[100px] z-10",
    },
    {
      src: "/images/welcome-fox.webp",
      alt: "狐",
      width: 350,
      height: 350,
      containerClassName:
        "absolute bottom-[8%] left-[15%] w-[14%] max-w-[200px] z-10",
    },
    {
      src: "/images/welcome-flower&butterfly.webp",
      alt: "花と蝶",
      width: 250,
      height: 250,
      containerClassName:
        "absolute bottom-0 right-0 w-[15%] max-w-[200px] z-10",
    },
    {
      src: "/images/macha-neko2.png",
      alt: "ロゴネコ",
      width: 400,
      height: 400,
      containerClassName:
        "absolute bottom-[10%] right-[25%] w-[18%] max-w-[280px] z-20",
    },
    {
      src: "/images/welcome-butterfly.webp",
      alt: "蝶が飛んでいるアニメーション",
      width: 120,
      height: 120,
      containerClassName:
        "absolute top-1/2 right-[8%] w-[10%] max-w-[100px] z-30 transform -translate-y-1/2",
      imageClassName: "w-full",
      style: {
        animation: "float 3s ease-in-out infinite alternate",
      },
    },
    {
      src: "/images/welcome-bird.webp",
      alt: "飛んでいる鳥のアニメーション",
      width: 300,
      height: 300,
      containerClassName:
        "absolute top-1/3 left-[10%] w-[12%] max-w-[180px] z-20 transform -translate-y-1/2",
      imageClassName: "w-full",
      style: {
        animation: "float 3s ease-in-out infinite alternate",
      },
    },
    {
      src: "/images/welcome-emmyu.webp",
      alt: "エミュー",
      width: 200,
      height: 200,
      containerClassName:
        "absolute bottom-[10%] right-[40%] w-[10%] max-w-[120px] z-5",
      imageClassName: "w-full opacity-80",
      style: {
        animation: "float 3s ease-in-out infinite alternate",
        filter: "blur(0.5px)",
        transform: "scale(0.9)",
      },
    },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* 背景画像 - 画面全体にフィット */}
      <div className="fixed inset-0 w-full h-full z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100" />
        <Image
          src="/images/Welcome-background.png"
          alt="背景画像"
          fill
          className="object-cover opacity-90 pointer-events-none"
          priority
        />
      </div>

      {/* メインコンテンツ */}
      <div className="relative min-h-screen w-full flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-10 z-10">
        <LetterBox />

        <div className="w-full max-w-lg mx-auto mb-6 md:mb-8">
          <p className="text-gray-800 text-sm sm:text-base md:text-lg">
            ここにアプリの紹介文などを入れる
            <br />
          </p>
        </div>

        <div className="w-full max-w-md mx-auto mb-8">
          <div className="flex flex-col gap-10 ">
            <WoodenSignButton href="/register" primary direction="left">
              登録
            </WoodenSignButton>
            <WoodenSignButton href="/login" direction="right">
              ログイン
            </WoodenSignButton>
          </div>
        </div>

        {/* 装飾画像群 - パーセンテージベースの位置で配置 */}
        {decorations.map((decoration, index) => (
          <DecorativeImage
            key={index}
            src={decoration.src}
            alt={decoration.alt}
            width={decoration.width}
            height={decoration.height}
            containerClassName={decoration.containerClassName}
            imageClassName={decoration.imageClassName}
            style={decoration.style}
          />
        ))}

        {/* 重なり合う花の装飾 */}
        <FlowerLayer position="top-right" />
        <FlowerLayer position="bottom-left" />
      </div>
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

    @import url("https://fonts.googleapis.com/css2?family=Kosugi+Maru&display=swap");

    html,
    body {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      overflow-x: hidden;
    }

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
