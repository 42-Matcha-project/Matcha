"use client";

import Link from "next/link";
import Layout from "./components/Layout";

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

    <div className="flex gap-4 mt-4">
      <Link
        href="/register"
        className="bg-emerald-700 text-white px-6 py-2 rounded shadow hover:bg-emerald-900 transition duration-200"
      >
        登録
      </Link>
      <Link
        href="/login"
        className="border border-emerald-700 text-emerald-800 px-6 py-2 rounded hover:bg-emerald-900 hover:text-white transition duration-200"
      >
        ログイン
      </Link>
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
      `}</style>
      <MainContent />
    </Layout>
  );
}
