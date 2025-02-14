"use client";

import Layout from "../../components/Layout";
import Link from "next/link";
import { useRef, useState, ChangeEvent } from "react";

export default function NextPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // 選択可能なタグ一覧
  const availableTags = ["Sports", "Animals", "Movies", "Music", "Travel"];

  const handleFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      if (previewUrls.length + files.length > 5) {
        alert("You can only upload up to 5 photos.");
        e.target.value = "";
        return;
      }

      const newUrls: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            newUrls.push(reader.result as string);
          }
          if (newUrls.length === files.length) {
            setPreviewUrls((prev) => [...prev, ...newUrls]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // タグをクリックしたときの処理（選択状態のトグル）
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
            Personal Information
          </h2>

          {/* Preference */}
          <div className="col-span-full">
            <label
              htmlFor="preference"
              className="block text-lg/6 font-medium text-gray-900"
            >
              Preference
            </label>
            <div className="mt-2">
              <textarea
                id="preference"
                name="preference"
                placeholder="例）動物が好きな人、お酒が好きな人、映画鑑賞が好きな人"
                rows={3}
                className="block w-full rounded-md bg-gray-100 px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                defaultValue={""}
              />
            </div>
            <p className="mt-3 text-sm/6 text-gray-600">
              Please write down your favorite person's preferences.
            </p>
          </div>

          {/* About you */}
          <div className="col-span-full">
            <label
              htmlFor="about you"
              className="block text-lg/6 font-medium text-gray-900"
            >
              About you
            </label>
            <div className="mt-2">
              <textarea
                id="about you"
                name="about you"
                placeholder="例）ねこが大好きで、休みの日はよく猫カフェに行きます。動物が好きな人と出会えたら嬉しいです！"
                rows={3}
                className="block w-full rounded-md bg-gray-100 px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                defaultValue={""}
              />
            </div>
            <p className="mt-3 text-sm/6 text-gray-600">
              Please write a few sentences about yourself.
            </p>
          </div>

          {/* タグ選択 */}
          <div className="col-span-full">
            <label className="block text-lg/6 font-medium text-gray-900">
              Interests
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className={`px-3 py-1 rounded-full border transition-all ${
                    selectedTags.includes(tag)
                      ? "bg-emerald-700 text-white border-emerald-700"
                      : "bg-white text-gray-900 border-gray-300"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm/6 text-gray-600">
              Choose your interests (e.g. Sports, Animals, Movies, etc.)
            </p>
          </div>

          {/* 写真アップロード */}
          <div>
            <label
              htmlFor="photos"
              className="block text-lg/9 font-medium text-gray-900"
            >
              Your photos
            </label>
            <button
              type="button"
              onClick={handleButtonClick}
              className="rounded-md bg-emerald-700 text-white px-4 py-2"
            >
              Select Files
            </button>
            <input
              type="file"
              id="photos"
              ref={fileInputRef}
              onChange={handleFilesChange}
              accept="image/*"
              multiple
              className="hidden"
            />
            <p className="mt-3 text-sm/6 text-gray-600">
              Please upload up to 5 photos.
            </p>
            {/* プレビュー表示 */}
            <div className="mt-4 flex gap-4">
              {Array.from({ length: 5 }).map((_, index) => {
                const url = previewUrls[index];
                return url ? (
                  <img
                    key={index}
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-32 h-32 object-cover rounded-md"
                  />
                ) : (
                  <div
                    key={index}
                    className="w-32 h-32 border border-dashed border-gray-400 flex items-center justify-center rounded-md"
                  >
                    <span className="text-sm text-gray-500">No Image</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ボタン */}
          <div className="flex items-center justify-end gap-4">
            <Link href="/register">
              <button
                type="button"
                className="border border-emerald-700 text-emerald-800 px-6 py-2 rounded hover:bg-emerald-900 hover:text-white transition duration-200"
              >
                戻る
              </button>
            </Link>
            <Link href="/nextpage">
              <button
                type="button"
                className="bg-emerald-700 text-white px-6 py-2 rounded shadow hover:bg-emerald-900 transition duration-200"
              >
                次へ
              </button>
            </Link>
          </div>
        </form>
      </div>
    </Layout>
  );
}
