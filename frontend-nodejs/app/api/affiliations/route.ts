/*
 * このエンドポイントは開発中のフロントエンドが正しく動作するかを
 * 確認するためのダミーデータを返すための実装です。
 * 本来はGo言語などのバックエンドを通じてDBから取得する想定。
 */

import { NextResponse } from "next/server";

const allAffiliations = [
  "東京大学",
  "京都大学",
  "慶應義塾大学",
  "早稲田大学",
  "42Tokyo",
];

export async function GET(request: Request) {
  // クエリパラメータを取得
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").toLowerCase();

  // 部分一致でフィルタ
  const matched = allAffiliations.filter((aff) =>
    aff.toLowerCase().includes(q),
  );

  // 上位5件を返す
  const suggestions = matched.slice(0, 5);

  // JSON レスポンス
  return NextResponse.json({ suggestions });
}
