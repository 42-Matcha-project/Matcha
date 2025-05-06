"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Participant } from "../types";

interface RoomProps {
  participants: Participant[];
  isDarkMode: boolean;
}

export function Room({ participants, isDarkMode }: RoomProps) {
  return (
    <div className="relative flex-1 mb-4">
      {/* 背景 - 和室 */}
      <div
        className={cn(
          "absolute inset-0 rounded-xl overflow-hidden",
          isDarkMode ? "bg-amber-900/50" : "bg-amber-100/50",
        )}
      >
        {/* 畳模様の背景 */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23a47f53' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* こたつ */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[200px]">
        <div
          className={cn(
            "w-full h-full rounded-lg border-4",
            isDarkMode
              ? "bg-amber-800 border-amber-700"
              : "bg-amber-300 border-amber-400",
          )}
        >
          {/* こたつ布団 */}
          <div
            className={cn(
              "absolute -top-4 -left-4 -right-4 -bottom-4 rounded-lg border-8 z-0",
              isDarkMode
                ? "bg-amber-700/70 border-amber-600/70"
                : "bg-amber-200/70 border-amber-300/70",
            )}
          ></div>

          {/* こたつ天板 */}
          <div
            className={cn(
              "absolute top-0 left-0 right-0 h-10 rounded-t-lg z-10",
              isDarkMode ? "bg-amber-950" : "bg-amber-800",
            )}
          ></div>
        </div>
      </div>

      {/* 参加者アバター */}
      {participants.map((user) => (
        <div
          key={user.id}
          className="absolute"
          style={{
            left: `${user.position.x}%`,
            top: `${user.position.y}%`,
            transform: "translate(-50%, -50%)",
            zIndex: user.id === 1 ? 20 : 10,
          }}
        >
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "relative w-16 h-16 rounded-full overflow-hidden border-2",
                user.id === 1
                  ? isDarkMode
                    ? "border-amber-500"
                    : "border-amber-600"
                  : isDarkMode
                    ? "border-amber-700"
                    : "border-amber-300",
              )}
            >
              <Image
                src={user.avatar || "/images/no-image.png"}
                alt={user.name}
                fill
                sizes="(max-width: 768px) 100vw, 64px"
                className="object-cover"
              />
            </div>
            <span
              className={cn(
                "mt-1 px-2 py-0.5 rounded-full text-xs",
                isDarkMode ? "bg-amber-800" : "bg-white",
              )}
            >
              {user.name}
            </span>

            {/* ステータスインジケーター */}
            <div
              className={cn(
                "mt-1 w-2 h-2 rounded-full",
                user.status === "studying"
                  ? "bg-green-500"
                  : user.status === "break"
                    ? "bg-amber-500"
                    : "bg-slate-500",
              )}
            ></div>
          </div>
        </div>
      ))}

      {/* 観葉植物 - 左側 */}
      <div className="absolute top-10 left-10">
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32">
            <Image
              src="/images/no-image.png"
              alt="観葉植物"
              width={128}
              height={128}
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* 観葉植物 - 左下 */}
      <div className="absolute bottom-10 left-20">
        <div className="relative w-24 h-24">
          <Image
            src="/images/no-image.png"
            alt="観葉植物"
            width={96}
            height={96}
            className="object-contain"
          />
        </div>
      </div>

      {/* 本棚 - 右側 */}
      <div className="absolute top-10 right-10">
        <div className="relative w-40 h-64">
          <Image
            src="/images/no-image.png"
            alt="本棚"
            width={160}
            height={256}
            className="object-contain"
          />
        </div>
      </div>

      {/* タンス - 右側 */}
      <div className="absolute bottom-10 right-20">
        <div className="relative w-32 h-40">
          <Image
            src="/images/no-image.png"
            alt="タンス"
            width={128}
            height={160}
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
