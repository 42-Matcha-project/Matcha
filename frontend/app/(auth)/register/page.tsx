"use client";

import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import { useRef, useState, ChangeEvent } from "react";
import FileInputButton from "@/app/components/ FileInputButton";
import ImagePreview from "@/app/components/ImagePreview";
import Button from "@/app/components/Button";

export default function Register() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push("/profile-detail");
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrls, setPreviewUrl] = useState<string[]>([]);
  const [fileError, setFileError] = useState<string>("");

  const handleFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // 複数ファイル選択された場合はエラー表示
    if (files.length > 1) {
      setFileError("ファイルは一つのみアップロード可能です。");
      e.target.value = "";
      return;
    }

    setFileError("");
    const file = files[0];

    // ファイルのプレビュー表示用にFileReaderを使用
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setPreviewUrl([reader.result as string]);
      }
    };
    reader.readAsDataURL(file);
    // inputの値をリセット
    e.target.value = "";
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen p-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-4xl bg-white p-8 rounded-md shadow flex flex-col gap-8"
        >
          <h2 className="text-base font-semibold text-gray-900 text-center">
            プロフィール情報
          </h2>

          {/* ユーザー名 */}
          <div>
            <label
              htmlFor="username"
              className="block text-lg font-medium text-gray-900"
            >
              ユーザー名
            </label>
            <div className="mt-1 flex shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-gray-300 bg-gray-50 text-gray-500">
                @
              </span>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="given-name"
                required
                placeholder="例）taro123、akiko、michanなど"
                className="flex-1 block w-full rounded-none rounded-r-md border border-gray-300 bg-gray-100 px-3 py-1.5 text-gray-900 focus:border-indigo-600 focus:outline-green-900"
              />
            </div>
          </div>

          {/* ニックネーム */}
          <div>
            <label
              htmlFor="nickname"
              className="block text-lg font-medium text-gray-900"
            >
              ニックネーム
              <p className="mt-1 text-sm text-gray-600">
                他のユーザーさんに表示されるあなたの名前です。
              </p>
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              autoComplete="nickname"
              required
              placeholder="例）太郎、あき、みっちゃんなど"
              className="mt-1 block w-full rounded-md bg-gray-100 px-3 py-1.5 text-gray-900 focus:outline-green-900 border border-gray-300"
            />
          </div>

          {/* アイコン */}
          <div>
            <label
              htmlFor="photo"
              className="block text-lg font-medium text-gray-900"
            >
              アイコン
              <p className="m-1 text-sm text-gray-600">
                いつでも画像を変更できます。
              </p>
            </label>
            <FileInputButton onClick={handleButtonClick} />
            <input
              type="file"
              id="photo"
              ref={fileInputRef}
              onChange={handleFilesChange}
              accept="image/*"
              className="hidden"
            />

            {/* エラーメッセージ表示 */}
            {fileError && (
              <p className="mt-2 text-sm text-red-600">{fileError}</p>
            )}

            {/* プレビュー表示 */}
            <ImagePreview previewUrls={previewUrls} maxFiles={1} />
          </div>

          {/* 性別 */}
          <div>
            <label
              htmlFor="gender"
              className="block text-lg font-medium text-gray-900"
            >
              性別
            </label>
            <div className="mt-1 flex items-center gap-4">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  id="gender-male"
                  name="gender"
                  value="male"
                  required
                  className="peer h-4 w-4 appearance-none rounded-full border border-gray-300 bg-white checked:bg-green-800 focus:outline-none"
                />
                <span className="text-gray-700 peer-checked:text-green-900">
                  男性
                </span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  id="gender-female"
                  name="gender"
                  value="female"
                  required
                  className="peer h-4 w-4 appearance-none rounded-full border border-gray-300 bg-white checked:bg-green-800 focus:outline-none"
                />
                <span className="text-gray-700 peer-checked:text-green-900">
                  女性
                </span>
              </label>
            </div>
          </div>

          {/* メールアドレス */}
          <div>
            <label
              htmlFor="email"
              className="block text-lg font-medium text-gray-900"
            >
              メールアドレス
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-md bg-gray-100 px-3 py-1.5 text-gray-900 focus:outline-green-900 border border-gray-300"
            />
          </div>

          {/* パスワード */}
          <div>
            <label
              htmlFor="password"
              className="block text-lg/6 font-medium text-gray-900"
            >
              パスワード
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full rounded-md bg-gray-100 px-3 py-1.5 text-gray-900 focus:outline-green-900 border border-gray-300"
            />
          </div>

          {/* パスワード確認 */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-lg/6 font-medium text-gray-900"
            >
              パスワード確認
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="mt-1 block w-full rounded-md bg-gray-100 px-3 py-1.5 text-gray-900 focus:outline-green-900 border border-gray-300"
            />
          </div>

          {/* ボタン */}
          <div className="flex items-center justify-end gap-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => router.push("/")}
            >
              キャンセル
            </Button>
            <Button variant="primary" type="submit">
              次へ
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
