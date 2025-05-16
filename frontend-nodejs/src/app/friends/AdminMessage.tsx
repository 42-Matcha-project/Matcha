"use client";
import { useState } from "react";
import Image from "next/image";
import { ADMIN_MESSAGE_EXAMPLE } from "./types";

interface AdminMessageProps {
  message: { text: string; date: string };
}

export default function AdminMessage({ message }: AdminMessageProps) {
  const EXAMPLE = ADMIN_MESSAGE_EXAMPLE;
  const [customMsg, setCustomMsg] = useState(message.text);
  const [editMode, setEditMode] = useState(false);
  const [input, setInput] = useState(customMsg);

  const handleSave = () => {
    setCustomMsg(input.trim() === "" ? EXAMPLE : input);
    setEditMode(false);
  };
  const handleCancel = () => {
    setInput(customMsg);
    setEditMode(false);
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* 豪華な掲示板風装飾（バッジ） */}
      <div className="absolute -top-4 sm:-top-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        <div className="rounded-full bg-yellow-200 border-4 border-amber-400 shadow-xl text-lg sm:text-2xl font-extrabold text-amber-900 px-4 py-2 sm:px-6 sm:py-3 flex flex-col items-center min-w-[80px] min-h-[80px] sm:min-w-[120px] sm:min-h-[120px] max-w-[120px] max-h-[120px] sm:max-w-[160px] sm:max-h-[160px] flex justify-center">
          <span className="flex flex-col items-center">
            <span className="text-base sm:text-xl">今日の</span>
            <span className="text-base sm:text-xl">一言</span>
            <span className="flex gap-1 justify-center mt-1">
              <span>🌟</span>
              <span>🌟</span>
            </span>
          </span>
        </div>
      </div>
      {/* 下のカード */}
      <div className="bg-amber-50 rounded-3xl shadow-2xl p-4 sm:p-8 pt-16 sm:pt-24 text-center border-4 border-amber-300 relative mt-8 w-full">
        {editMode ? (
          <div className="flex flex-col items-center gap-3">
            <textarea
              className="w-full max-w-md rounded-xl border-2 border-amber-200 p-2 text-lg text-amber-900 focus:ring-2 focus:ring-amber-300 shadow-inner resize-none"
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={60}
              autoFocus
              placeholder={EXAMPLE}
            />
            <div className="flex gap-2 justify-center">
              <button
                className="px-4 py-1 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow"
                onClick={handleSave}
              >
                保存
              </button>
              <button
                className="px-4 py-1 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-colors shadow"
                onClick={handleCancel}
              >
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-2xl text-amber-900 mb-2 font-bold drop-shadow-sm animate-pulse break-words">
              {customMsg || EXAMPLE}
            </div>
            <div className="text-sm text-gray-500">{message.date}</div>
            <button
              className="absolute top-2 right-2 px-3 py-1 text-xs bg-yellow-200 text-amber-900 rounded-xl border border-amber-300 hover:bg-yellow-300 transition-colors shadow"
              onClick={() => {
                setEditMode(true);
                setInput(customMsg === EXAMPLE ? "" : customMsg);
              }}
            >
              編集
            </button>
          </>
        )}
        {/* 装飾イラスト */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          <Image
            src="/images/welcome-hiyoko.webp"
            alt="鳥"
            className="w-18 h-18 opacity-100"
            aria-hidden
            width={72}
            height={72}
          />
        </div>
      </div>
    </div>
  );
}
