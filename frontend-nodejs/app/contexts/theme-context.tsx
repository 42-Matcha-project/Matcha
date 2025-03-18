"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 初期ロード時に設定を読み込む
  useEffect(() => {
    // まずlocalStorageからダークモード設定を取得
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) {
      setIsDarkMode(savedMode === "true");
    } else {
      // 保存されていない場合はライトモードをデフォルトに設定
      setIsDarkMode(false);
      localStorage.setItem("darkMode", "false");
    }
  }, []);

  // ダークモードの切り替え
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("darkMode", String(!isDarkMode));
  };

  // ダークモード設定が変更されたらbodyのclassを更新
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

// カスタムフック
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
