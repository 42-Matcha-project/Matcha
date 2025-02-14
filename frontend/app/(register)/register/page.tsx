"use client";

import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";

export default function Register() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // ここでカスタムバリデーションが必要なら実施
    // 例: 各必須項目が正しく入力されているかなど
    // バリデーションが通った場合のみ次のページへ遷移
    router.push("/profile-detail");
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen p-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-4xl bg-white p-8 rounded-md shadow flex flex-col gap-8"
        >
          <h2 className="text-base/7 font-semibold text-gray-900 text-center">
            プロフィール情報
          </h2>

          {/* ユーザー名 */}
          <div>
            <label
              htmlFor="username"
              className="block text-lg/6 font-medium text-gray-900"
            >
              名前
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="given-name"
              required
              className="mt-1 block w-full rounded-md bg-gray-100 px-3 py-1.5 text-gray-900 focus:outline-indigo-600"
            />
          </div>

          {/* ニックネーム */}
          <div>
            <label
              htmlFor="nickname"
              className="block text-lg/6 font-medium text-gray-900"
            >
              ニックネーム（アプリ内で表示される名前）
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              autoComplete="nickname"
              required
              placeholder="例）太郎、あき、みっちゃんなど"
              className="mt-1 block w-full rounded-md bg-gray-100 px-3 py-1.5 text-gray-900 focus:outline-indigo-600"
            />
          </div>

          {/* 性別 */}
          <div>
            <label
              htmlFor="gender"
              className="block text-lg/6 font-medium text-gray-900"
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
                  className="h-4 w-4 text-indigo-600"
                />
                <span className="text-gray-700">男性</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  id="gender-female"
                  name="gender"
                  value="female"
                  required
                  className="h-4 w-4 text-indigo-600"
                />
                <span className="text-gray-700">女性</span>
              </label>
            </div>
          </div>

          {/* メールアドレス */}
          <div>
            <label
              htmlFor="email"
              className="block text-lg/6 font-medium text-gray-900"
            >
              メールアドレス
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-md bg-gray-100 px-3 py-1.5 text-gray-900 focus:outline-indigo-600"
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
              className="mt-1 block w-full rounded-md bg-gray-100 px-3 py-1.5 text-gray-900 focus:outline-indigo-600"
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
              className="mt-1 block w-full rounded-md bg-gray-100 px-3 py-1.5 text-gray-900 focus:outline-indigo-600"
            />
          </div>

          {/* ボタン */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="border border-emerald-700 text-emerald-800 px-6 py-2 rounded hover:bg-emerald-900 hover:text-white transition duration-200"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="bg-emerald-700 text-white px-6 py-2 rounded shadow hover:bg-emerald-900 transition duration-200"
            >
              次へ
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
