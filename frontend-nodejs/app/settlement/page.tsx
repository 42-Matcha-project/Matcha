"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Clock,
  Home,
  BookOpen,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Calendar,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// 開拓状態の型定義
interface SettlementState {
  level: number;
  dayStreak: number;
  totalStudyHours: number;
  username: string;
}

// タイルサイズ
const TILE_SIZE = 80;
// タイルの高さオフセット (アイソメトリック表示用)
const TILE_HEIGHT = TILE_SIZE / 2;

export default function SettlementPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [settlementState] = useState<SettlementState>({
    level: 1,
    dayStreak: 3,
    totalStudyHours: 12.5,
    username: "開拓者",
  });
  const [isMobile, setIsMobile] = useState(false);

  // モバイル検出
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // 初期チェック
    checkIsMobile();

    // リサイズイベントにリスナーを追加
    window.addEventListener("resize", checkIsMobile);

    // クリーンアップ
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // 時計の更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // タイルの表示位置を計算 (アイソメトリックビュー)
  const getTilePosition = (x: number, y: number) => {
    // アイソメトリック変換
    const isoX = ((x - y) * TILE_SIZE) / 2;
    const isoY = ((x + y) * TILE_HEIGHT) / 2;

    return {
      left: `calc(50% + ${isoX}px)`,
      top: `calc(50% + ${isoY}px)`,
    };
  };

  return (
    <div className="min-h-screen bg-amber-50 overflow-hidden relative">
      {/* ヘッダー */}
      <header className="bg-amber-800/90 text-amber-50 p-3 flex items-center justify-between shadow-md z-50 relative">
        <div className="flex items-center">
          <Home className="h-6 w-6 mr-2" />
          <h1 className="text-lg font-bold">マイ開拓地</h1>
          <span className="ml-2 bg-amber-700 px-2 py-0.5 rounded text-xs">
            Lv.{settlementState.level}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-sm">
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="hidden md:flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span className="text-sm">{settlementState.dayStreak}日連続</span>
          </div>

          <div className="hidden md:flex items-center">
            <BookOpen className="h-4 w-4 mr-1" />
            <span className="text-sm">
              {settlementState.totalStudyHours}時間
            </span>
          </div>

          {isMobile ? (
            <Button
              variant="ghost"
              size="icon"
              className="text-amber-50 hover:bg-amber-700"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-amber-50 hover:bg-amber-700"
            >
              <User className="h-4 w-4 mr-2" />
              {settlementState.username}
            </Button>
          )}
        </div>
      </header>

      {/* モバイルメニュー */}
      {showMobileMenu && (
        <div className="absolute top-14 right-0 bg-amber-800 text-amber-50 p-4 z-50 w-48 shadow-lg rounded-bl-lg">
          <div className="space-y-3">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span className="text-sm">
                {currentTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="text-sm">{settlementState.dayStreak}日連続</span>
            </div>
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              <span className="text-sm">
                {settlementState.totalStudyHours}時間
              </span>
            </div>
            <hr className="border-amber-700" />
            <button className="flex items-center w-full hover:bg-amber-700 p-2 rounded">
              <User className="h-4 w-4 mr-2" />
              マイページ
            </button>
            <button className="flex items-center w-full hover:bg-amber-700 p-2 rounded">
              <Settings className="h-4 w-4 mr-2" />
              設定
            </button>
            <button className="flex items-center w-full hover:bg-amber-700 p-2 rounded">
              <LogOut className="h-4 w-4 mr-2" />
              ログアウト
            </button>
          </div>
        </div>
      )}

      {/* ステータス表示 */}
      <div className="absolute top-16 left-4 bg-amber-100/90 p-3 rounded-lg shadow-md z-40 border border-amber-200">
        <h2 className="text-amber-800 font-medium text-sm mb-2 flex items-center">
          <Award className="h-4 w-4 mr-1" />
          ステータス
        </h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-900">レベル</span>
            <span className="text-xs font-medium text-amber-900">
              {settlementState.level}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-900">連続学習</span>
            <span className="text-xs font-medium text-amber-900">
              {settlementState.dayStreak}日
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-900">総学習時間</span>
            <span className="text-xs font-medium text-amber-900">
              {settlementState.totalStudyHours}時間
            </span>
          </div>
        </div>
      </div>

      {/* メインの開拓エリア */}
      <main className="relative w-full h-[calc(100vh-60px)] overflow-hidden">
        {/* 背景 */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-100 to-amber-200 z-0"></div>

        {/* 中央の家 */}
        <div className="absolute w-32 h-32 z-20" style={getTilePosition(0, 0)}>
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute mt-[-40px]">
              <Image
                src="/placeholder.svg?height=120&width=120"
                alt="家"
                width={120}
                height={120}
                className="object-contain"
              />
              <div className="text-center mt-2 text-amber-800 text-sm font-medium">
                マイハウス
              </div>
            </div>
          </div>
        </div>

        {/* 説明テキスト */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/80 p-4 rounded-lg shadow-md z-30 max-w-md text-center">
          <h2 className="text-amber-800 font-bold mb-2">開拓前の土地</h2>
          <p className="text-amber-700 text-sm">
            ここはあなたの開拓地です。学習を進めて、この土地を開拓していきましょう。
          </p>
        </div>
      </main>
    </div>
  );
}
