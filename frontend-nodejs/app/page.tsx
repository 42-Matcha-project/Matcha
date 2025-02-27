"use client";

import Link from "next/link";
import Layout from "./components/Layout";

const WoodenSignButton = ({
  href,
  children,
  primary = false,
  direction = "left",
}: {
  href: string;
  children: React.ReactNode;
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

  return (
    <div className="relative">
      {/* 影の要素 - ボタンの下に配置 */}
      <div
        className={`absolute inset-0 bg-black opacity-80 rounded blur-md ${directionClass} transform translate-y-3 translate-x-0`}
      ></div>

      <Link
        href={href}
        className={`
        ${baseClasses} ${colorClasses} ${directionClass}
        block border-2 rounded relative z-10
      `}
      >
        {/* 左上の釘 */}
        <div
          className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-gray-500 border border-gray-500 shadow-inner"
          style={{ boxShadow: "inset 0 0 2px rgba(255,255,255,0.5)" }}
        ></div>

        {/* 右上の釘 */}
        <div
          className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-gray-500 border border-gray-500 shadow-inner"
          style={{ boxShadow: "inset 0 0 2px rgba(255,255,255,0.5)" }}
        ></div>

        {/* 左下の釘 */}
        <div
          className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-gray-500 border border-gray-500 shadow-inner"
          style={{ boxShadow: "inset 0 0 2px rgba(255,255,255,0.5)" }}
        ></div>

        {/* 右下の釘 */}
        <div
          className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-gray-500 border border-gray-500 shadow-inner"
          style={{ boxShadow: "inset 0 0 2px rgba(255,255,255,0.5)" }}
        ></div>

        <span className="bubbly-text relative z-10">{children}</span>
      </Link>
    </div>
  );
};

const MainContent = () => (
  <main className="relative z-10 flex flex-col items-center justify-center p-8 gap-6 text-center">
    <div className="flex space-x-3 mb-6">
      {["P", "R", "I", "V", "Y"].map((letter, index) => {
        // P, I, Y だけ黒色のテキストにする
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

    <p className="text-gray-800">
      ここにアプリの紹介文などを入れる
      <br />
    </p>

    <div className="flex flex-col gap-10 mt-12 w-50 mx-auto">
      <WoodenSignButton href="/register" primary direction="left">
        登録
      </WoodenSignButton>
      <WoodenSignButton href="/login" direction="right">
        ログイン
      </WoodenSignButton>
    </div>
  </main>
);

export default function Home() {
  return (
    <Layout>
      <style jsx global>{`
        @keyframes bounce {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-5px);
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
      <MainContent />
    </Layout>
  );
}
