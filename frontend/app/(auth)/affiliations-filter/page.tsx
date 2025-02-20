"use client";

import Layout from "../../components/Layout";
import Link from "next/link";
import { useState } from "react";
import Button from "@/app/components/Button";
import FormField from "@/app/components/FormField";

export default function AffiliationsFilter() {
  // 入力中の値と、確定した所属情報（配列）を管理
  const [inputValue, setInputValue] = useState("");
  const [affiliations, setAffiliations] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const handleConfirm = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue === "") return;

    if (affiliations.includes(trimmedValue)) {
      setErrorMsg("すでに登録済みです");
      setInputValue("");
      return;
    }

    // 重複していない場合は、所属情報を追加
    setAffiliations([...affiliations, trimmedValue]);
    setInputValue("");
    setErrorMsg("");
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen p-4">
        <form className="w-full max-w-4xl bg-white p-8 rounded-md shadow flex flex-col gap-8">
          <h2 className="text-base/7 font-semibold text-gray-900 text-center">
            プロフィール情報
          </h2>

          {/* 絞り込み */}
          <FormField label="絞り込み (複数可)" htmlFor="filtering">
            <p className="mt-1 text-sm font-bold text-yellow-800 bg-yellow-50 p-4 rounded border border-yellow-300">
              ※
              これまでの経歴やご所属を入力いただくと、同じコミュニティに属する方とのマッチングが抑えられ、
              よりプライベートな出会いが期待できます。
            </p>
            <br />
            <textarea
              id="filtering"
              name="filtering"
              placeholder="例）42Tokyo"
              rows={1}
              className="mt-2 w-full rounded-full bg-gray-100 px-4 py-2 text-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-900 placeholder:text-gray-400"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleConfirm();
                }
              }}
            />
            {/* 例　*/}
            <p className="mt-2 text-sm text-gray-500">
              例）42Tokyoを入力した場合、42Tokyoに所属している方とのマッチングが抑えられます。
            </p>
            {/* エラーメッセージを表示 */}
            {errorMsg && (
              <p className="mt-2 text-sm text-red-600">{errorMsg}</p>
            )}

            {/* 複数の所属情報をタグ風に表示 */}
            {affiliations.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {affiliations.map((item, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm text-green-800 border border-green-200"
                  >
                    所属: <span className="ml-1 font-bold">{item}</span>
                  </div>
                ))}
              </div>
            )}
          </FormField>

          {/* ボタン */}
          <div className="flex items-center justify-end gap-4">
            <Link href="/profile-detail">
              <Button variant="secondary" type="button">
                戻る
              </Button>
            </Link>
            <Link href="/affiliations-filter">
              <Button variant="primary" type="button">
                確定
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </Layout>
  );
}
