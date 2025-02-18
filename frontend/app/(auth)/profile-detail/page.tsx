"use client";

import Layout from "../../components/Layout";
import Link from "next/link";
import { useRef, useState } from "react";
import FileInputButton from "@/app/components/FileInputButton";
import ImagePreview from "@/app/components/ImagePreview";
import Button from "@/app/components/Button";
import FormField from "@/app/components/FormField";
import TagSelector from "@/app/components/TagSelector";
import useFileUploader from "@/app/hooks/useFileUploader";

export default function ProfileDetails() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { previewUrls, fileError, handleFilesChange } = useFileUploader(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const availableTags = ["スポーツ", "動物", "映画", "音楽", "旅行"];

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen p-4">
        <form className="w-full max-w-4xl  p-8 rounded-md  flex flex-col gap-8l">
          <h2 className="text-base/7 font-semibold text-gray-900 text-center">
            プロフィール情報
          </h2>

          {/* 好み */}
          <FormField
            label="好み"
            htmlFor="preference"
            description="あなたが理想とする相手のタイプや、求める特徴を教えてください。"
          >
            <textarea
              id="preference"
              name="preference"
              placeholder="例）優しい人、メガネをかけている人、音楽が好きな人など"
              rows={3}
              className="block w-full rounded-md bg-gray-100 px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 focus:outline-green-900 border border-gray-300"
              defaultValue={""}
            />
          </FormField>

          {/* 自己紹介 */}
          <FormField
            label="自己紹介"
            htmlFor="about-you"
            description="あなたの好きなことやこだわりを教えてください。"
          >
            <textarea
              id="about-you"
              name="about-you"
              placeholder="例）ねこが大好きで、休みの日はよく猫カフェに行きます。"
              rows={3}
              className="block w-full rounded-md bg-gray-100 px-3 py-1.5 text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-green-900"
            />
          </FormField>

          {/* タグ選択 */}
          <FormField label="趣味・興味" htmlFor="">
            <p className="mt-1 text-sm/6 text-gray-600">
              興味のあるタグを選んでください。 (複数選択可)
            </p>
            <TagSelector
              availableTags={availableTags}
              selectedTags={selectedTags}
              onChange={setSelectedTags}
            />
          </FormField>

          {/* 写真アップロード */}
          <div>
            <FormField label="あなたの写真" htmlFor="photos">
              <FileInputButton onClick={handleButtonClick} />
              <input
                type="file"
                id="photos"
                ref={fileInputRef}
                onChange={handleFilesChange}
                accept="image/*"
                multiple
                className="hidden"
              />
              <p className="mt-2 text-sm text-gray-600">
                写真は最大5枚までアップロードしてください。
                <br />
              </p>
              <p className="mt-1 text-sm font-bold text-yellow-800 bg-yellow-50 p-2 rounded border border-yellow-300">
                ※
                1枚目の画像は、他のユーザーさんにあなたの顔写真として最初に見られる大切なものになります。
                <br />
                そのため、できればお顔がはっきり写ったものをおすすめします。
                <br />
                残りの4枚は、趣味の写真など、あなたらしさが伝わるお気に入りの写真をどうぞお選びください。
              </p>
              {/* エラーメッセージ表示 */}
              {fileError && (
                <p className="mt-2 text-sm text-red-600">{fileError}</p>
              )}
            </FormField>

            {/* プレビュー表示 */}
            <ImagePreview previewUrls={previewUrls} maxFiles={5} />
          </div>

          {/* ボタン */}
          <div className="flex items-center justify-end gap-4">
            <Link href="/register">
              <Button variant="secondary" type="button">
                戻る
              </Button>
            </Link>
            <Link href="/affiliations-filter">
              <Button variant="primary" type="button">
                次へ
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </Layout>
  );
}
