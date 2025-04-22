"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Task } from "./TaskManagement";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface StudyTimeChartProps {
  isDarkMode: boolean;
  tasks: Task[];
}

// チャートデータの型定義
interface ChartDataItem {
  name: string;
  value: number;
  seconds: number;
}

// ツールチップの型定義
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataItem;
  }>;
}

// ラベルの型定義
interface PieLabelProps {
  name: string;
  percent: number;
}

// 色のパレット
const COLORS = [
  "#FF8042", // オレンジ
  "#0088FE", // ブルー
  "#00C49F", // グリーン
  "#FFBB28", // イエロー
  "#FF6B6B", // レッド
  "#845EC2", // パープル
  "#D65DB1", // ピンク
  "#008F7A", // ターコイズ
];

export function StudyTimeChart({ isDarkMode, tasks }: StudyTimeChartProps) {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);

  // タスクの作業時間からチャートデータを生成
  useEffect(() => {
    // タスクを科目ごとにグループ化
    const subjectMap = new Map<string, number>();

    tasks.forEach((task) => {
      if (task.timeSpent > 0) {
        const current = subjectMap.get(task.subject) || 0;
        subjectMap.set(task.subject, current + task.timeSpent);
      }
    });

    // チャートデータを生成
    const data = Array.from(subjectMap.entries()).map(([name, seconds]) => ({
      name,
      value: Math.round(seconds / 60), // 分単位に変換
      seconds,
    }));

    // 合計時間でソート（降順）
    data.sort((a, b) => b.value - a.value);

    setChartData(data);
  }, [tasks]);

  // 分を「時間：分」形式に変換する関数
  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}時間${mins}分`;
    }
    return `${mins}分`;
  };

  // 合計時間を計算
  const totalTime = chartData.reduce((sum, item) => sum + item.value, 0);

  // チャートのカスタムツールチップ
  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className={cn(
            "p-2 rounded-md shadow-lg border",
            isDarkMode
              ? "bg-amber-900 border-amber-700 text-amber-50"
              : "bg-white border-amber-200 text-amber-950",
          )}
        >
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">{formatMinutes(data.value)}</p>
          <p className="text-xs opacity-80">
            {Math.round((data.value / totalTime) * 100)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={cn(
        "rounded-2xl p-6 mb-8 shadow-md",
        isDarkMode
          ? "bg-amber-800/90 border border-amber-700 text-amber-50"
          : "bg-white border border-amber-200 text-amber-900",
      )}
    >
      <h3 className="text-xl font-bold mb-4 border-b pb-2 border-amber-200">
        作業時間分析
      </h3>

      {chartData.length === 0 ? (
        <div
          className={cn(
            "p-4 text-center rounded-lg",
            isDarkMode
              ? "bg-amber-700/80 text-amber-200"
              : "bg-amber-100/70 text-amber-800",
          )}
        >
          まだ記録された作業時間がありません。タスクに取り組んで記録を作成してください。
        </div>
      ) : (
        <div className="space-y-8">
          {/* 合計時間の表示 */}
          <div className="text-center mb-4">
            <span className="text-sm font-medium opacity-80">合計作業時間</span>
            <p className="text-2xl font-bold">{formatMinutes(totalTime)}</p>
          </div>

          {/* 円グラフ */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }: PieLabelProps) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 棒グラフ */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  interval={0}
                  tickFormatter={(value: string) =>
                    value.length > 8 ? `${value.substring(0, 8)}...` : value
                  }
                />
                <YAxis tickFormatter={(value: number) => `${value}分`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="作業時間">
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 詳細データ */}
          <div className="mt-4 space-y-2">
            <h4 className="font-medium text-sm mb-2">詳細</h4>
            {chartData.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center justify-between p-2 rounded-md",
                  isDarkMode ? "bg-amber-800/40" : "bg-white",
                )}
              >
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span>{item.name}</span>
                </div>
                <div className="font-medium">{formatMinutes(item.value)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
