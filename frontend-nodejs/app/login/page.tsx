"use client";

import { useRouter } from "next/navigation";
import Button from "@/app/components/Button";
import FormField from "@/app/components/FormField";

export default function Login() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push("/timeline");
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-4xl bg-white p-8 rounded-md shadow flex flex-col gap-8"
      >
        <h2 className="text-base font-semibold text-gray-900 text-center">
          ログイン
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
            戻る
          </Button>
          <Button variant="primary" type="submit">
            
          </Button>
        </div>
      </form>
    </div>
  );
}
