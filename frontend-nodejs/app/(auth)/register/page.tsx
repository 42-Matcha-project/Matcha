"use client";

import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import { useState, useRef } from "react";
import FileInputButton from "@/app/components/FileInputButton";
import ImagePreview from "@/app/components/ImagePreview";
import Button from "@/app/components/Button";
import FormField from "@/app/components/FormField";
import useFileUploader from "@/app/hooks/useFileUploader";
import { registerUser, uploadUserImage } from "@/lib/api";

export default function Register() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);

    // フォームデータ取得
    const formData = new FormData(e.currentTarget);

    // パスワード一致確認
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setFormError("パスワードが一致しません。");
      setIsLoading(false);
      return;
    }

    // APIに送信するデータを準備
    const userData = {
      username: formData.get("username"),
      nickname: formData.get("nickname"),
      gender: formData.get("gender"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    // ユーザーデータを取得
    try {
      const data = await registerUser(userData);

      // 登録成功 - アイコン画像がある場合はアップロード
      if (previewUrls.length > 0 && fileInputRef.current?.files?.length) {
        await uploadUserImage(data.user.ID, fileInputRef.current.files[0]);
      }

      // 次のページへ
      router.push("/profile-detail");
    } catch (error) {
      console.error("登録エラー:", error);
      setFormError(
        error instanceof Error
          ? error.message
          : "登録処理中にエラーが発生しました。",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  // 最大アップロード枚数を1に設定（アイコンなので1枚のみ）
  const { previewUrls, fileError, handleFilesChange } = useFileUploader(1);

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
          <FormField label="ユーザー名" htmlFor="username">
            <div className="flex shadow-sm">
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
          </FormField>

          {/* ニックネーム */}
          <FormField
            label="ニックネーム"
            htmlFor="nickname"
            description="他のユーザーさんに表示されるあなたの名前です。"
          >
            <input
              id="nickname"
              name="nickname"
              type="text"
              autoComplete="nickname"
              required
              placeholder="例）太郎、あき、みっちゃんなど"
              className="mt-1 block w-full rounded-md bg-gray-100 px-3 py-1.5 text-gray-900 focus:outline-green-900 border border-gray-300"
            />
          </FormField>

          {/* アイコン */}
          <div>
            <FormField
              label="アイコン"
              htmlFor="photo"
              description="いつでも画像を変更できます。"
            >
              <FileInputButton onClick={handleButtonClick} />
              <input
                type="file"
                id="photo"
                ref={fileInputRef}
                onChange={handleFilesChange}
                accept="image/*"
                // 複数アップロードは不可（アイコンなので1枚のみ）
                className="hidden"
              />
              {fileError && (
                <p className="mt-2 text-sm text-red-600">{fileError}</p>
              )}
            </FormField>

            {/* プレビュー表示 */}
            <ImagePreview previewUrls={previewUrls} maxFiles={1} />
          </div>

          {/* 性別 */}
          <FormField label="性別" htmlFor="">
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
          </FormField>

          {/* メールアドレス */}
          <FormField label="メールアドレス" htmlFor="email">
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-md bg-gray-100 px-3 py-1.5 text-gray-900 focus:outline-green-900 border border-gray-300"
            />
          </FormField>

          {/* パスワード */}
          <FormField label="パスワード" htmlFor="password">
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full rounded-md bg-gray-100 px-3 py-1.5 text-gray-900 focus:outline-green-900 border border-gray-300"
            />
          </FormField>

          {/* パスワード確認 */}
          <FormField label="パスワード確認" htmlFor="confirmPassword">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="mt-1 block w-full rounded-md bg-gray-100 px-3 py-1.5 text-gray-900 focus:outline-green-900 border border-gray-300"
            />
          </FormField>

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
