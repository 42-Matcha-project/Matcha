"use client";

import Layout from "../../components/Layout";
import Link from "next/link";
import { useState } from "react";
import Button from "@/app/components/Button";
import FormField from "@/app/components/FormField";
import { normalizeString } from "@/utils/normalize";

export default function AffiliationsFilter() {
  const [inputValue, setInputValue] = useState("");
  const [affiliations, setAffiliations] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  // IME入力中かどうかのフラグ(日本語入力の確定時にEnterが押されるのを防ぐ)
  const [isComposing, setIsComposing] = useState(false);

  const handleConfirm = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue === "") return;

    // 入力値を正規化（全角英数字を半角に変換し、小文字に変換）
    const normalizedInput = normalizeString(trimmedValue);

    if (
      affiliations.some((item) => normalizeString(item) === normalizedInput)
    ) {
      setErrorMsg("すでに登録済みです");
      setInputValue("");
      return;
    }

    // 重複していない場合は、所属情報を追加
    setAffiliations([...affiliations, trimmedValue]);
    setInputValue("");
    setErrorMsg("");
  };

  const removeAffiliation = (indexToRemove: number) => {
    setAffiliations(affiliations.filter((_, index) => index !== indexToRemove));
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
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              onKeyDown={(e) => {
                if (!isComposing && e.key === "Enter") {
                  e.preventDefault();
                  handleConfirm();
                }
              }}
            />

            {/* 例　*/}
            <p className="mt-2 text-sm text-gray-500">
              例）42Tokyoを入力した場合、42Tokyoに所属している方とのマッチングが抑えられます。
            </p>
            <br />
            <br />

            {/* エラーメッセージを表示 */}
            {errorMsg && (
              <p className="mt-2 text-sm text-red-600">{errorMsg}</p>
            )}

            {/* 複数の所属情報をタグ風に表示 */}
            {affiliations.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <h1 className="text-xl font-bold text-gray-800">所属: </h1>
                {affiliations.map((item, index) => (
                  <div
                    key={index}
                    className="relative inline-flex items-center rounded-full bg-green-100 px-4 py-2 text-xl text-green-800 border border-green-200"
                  >
                    <span className="ml-1 font-bold">{item}</span>
                    <button
                      type="button"
                      onClick={() => removeAffiliation(index)}
                      className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-900 text-white text-xs"
                    >
                      ×
                    </button>
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
