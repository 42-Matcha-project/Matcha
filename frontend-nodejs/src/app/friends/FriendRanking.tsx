"use client";
import Image from "next/image";
import { Crown } from "lucide-react";
import { RankingItem } from "./types";

interface FriendRankingProps {
  ranking: RankingItem[];
}

export default function FriendRanking({ ranking }: FriendRankingProps) {
  return (
    <div className="space-y-4">
      {ranking.length === 0 ? (
        <div className="text-center text-gray-400 py-12 flex flex-col items-center">
          <Image
            src="/images/welcome-butterfly.webp"
            alt="蝶"
            className="w-16 h-16 mb-2 opacity-70"
            aria-hidden
            width={64}
            height={64}
          />
          ランキングデータがありません。
        </div>
      ) : (
        <ol className="space-y-2">
          {ranking.map((r, i) => (
            <li
              key={r.id}
              className={`flex items-center gap-4 p-4 rounded-2xl shadow-lg border-2 ${i === 0 ? "bg-yellow-100 border-yellow-300" : "bg-green-50 border-green-200"}`}
            >
              <span className="text-2xl font-bold w-8 text-center flex items-center justify-center">
                {i + 1}
                {i === 0 && (
                  <span className="ml-1 flex items-center">
                    <Crown className="inline w-6 h-6 text-yellow-500" />
                    <Image
                      src="/images/leaf-bg.png"
                      alt="リース"
                      className="w-6 h-6 ml-1"
                      aria-hidden
                      width={24}
                      height={24}
                    />
                  </span>
                )}
              </span>
              <div className="w-12 h-12 rounded-full overflow-hidden border-4 border-green-300 bg-white shadow">
                <Image src={r.icon} alt={r.name} width={48} height={48} />
              </div>
              <span className="font-bold text-lg text-green-900">{r.name}</span>
              <span className="ml-auto text-green-700 font-semibold">
                {r.score}h
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
