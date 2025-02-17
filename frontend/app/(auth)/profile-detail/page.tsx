"use client";

import Layout from "../../components/Layout";
import Link from "next/link";
import { useRef, useState, ChangeEvent } from "react";
import FileInputButton from "@/app/components/ FileInputButton";
import ImagePreview from "@/app/components/ImagePreview";
import Button from "@/app/components/Button";

export default function ProfileDetails() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string>("");

  const availableTags = ["スポーツ", "動物", "映画", "音楽", "旅行"];

  const handleFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      if (previewUrls.length + files.length > 5) {
        setFileError("写真はすでに5枚アップロードされています。");
        e.target.value = "";
        return;
      }

      const newUrls: string[] = [];
      const newFiles: File[] = [];

      Array.from(files).forEach((file) => {
        const duplicate = [...uploadedFiles, ...newFiles].some(
          (uploaded) =>
            uploaded.name === file.name && uploaded.size === file.size,
        );
        if (duplicate) {
          setFileError(`"${file.name}" はすでにアップロードされています。`);
          return;
        }

        newFiles.push(file);

        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            newUrls.push(reader.result as string);
          }
          if (newUrls.length === newFiles.length) {
            setPreviewUrls((prev) => [...prev, ...newUrls]);
            setUploadedFiles((prev) => [...prev, ...newFiles]);
          }
        };
        reader.readAsDataURL(file);
      });
      e.target.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen p-4">
        <form className="w-full max-w-4xl bg-white p-8 rounded-md shadow flex flex-col gap-8">
          <h2 className="text-base/7 font-semibold text-gray-900 text-center">
            プロフィール情報
          </h2>

          {/* 好み */}
          <div className="col-span-full">
            <label
              htmlFor="preference"
              className="block text-lg/6 font-medium text-gray-900"
            >
              好み
            </label>
            <p className="mt-1 text-sm/6 text-gray-600">
              あなたが理想とする相手のタイプや、求める特徴を教えてください。
            </p>
            <div className="mt-2">
              <textarea
                id="preference"
                name="preference"
                placeholder="例）優しい人、メガネをかけている人、音楽が好きな人など"
                rows={3}
                className="block w-full rounded-md bg-gray-100 px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 focus:outline-green-900 border border-gray-300"
                defaultValue={""}
              />
            </div>
          </div>

          {/* 自己紹介 */}
          <div className="col-span-full">
            <label
              htmlFor="about-you"
              className="block text-lg/6 font-medium text-gray-900"
            >
              自己紹介
            </label>
            <p className="mt-1 text-sm/6 text-gray-600">
              あなたの好きなことやこだわりを教えてください。
            </p>
            <div className="mt-2">
              <textarea
                id="about-you"
                name="about-you"
                placeholder="例）ねこが大好きで、休みの日はよく猫カフェに行きます。動物が好きな人と出会えたら嬉しいです！"
                rows={3}
                className="block w-full rounded-md bg-gray-100 px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-green-900 focus:-outline-offset-2 outline-gray-300"
                defaultValue={""}
              />
            </div>
          </div>

          {/* タグ選択 */}
          <div className="col-span-full">
            <label className="block text-lg/6 font-medium text-gray-900">
              趣味・興味
            </label>
            <p className="mt-1 text-sm/6 text-gray-600">
              興味のあるタグを選んでください。 (複数選択可)
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className={`px-3 py-1 rounded-full border transition-all ${
                    selectedTags.includes(tag)
                      ? "bg-emerald-700 text-white border-emerald-700 hover:bg-emerald-600"
                      : "bg-white text-gray-900 border-gray-300 hover:bg-emerald-600"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 写真アップロード */}
          <div>
            <label
              htmlFor="photos"
              className="block text-lg/9 font-medium text-gray-900"
            >
              あなたの写真
            </label>
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
