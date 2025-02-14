"use client";

import Layout from "../../components/Layout";
import Link from "next/link";

export default function Register() {
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen p-4">
        <form className="w-full max-w-4xl bg-white p-8 rounded-md shadow flex flex-col gap-8">
          <h2 className="text-base/7 font-semibold text-gray-900 text-center">
            Personal Information
          </h2>

          {/* username */}
          <div>
            <label
              htmlFor="username"
              className="block text-lg/6 font-medium text-gray-900"
            >
              username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="given-name"
              className="mt-1 block w-full rounded-md bg-gray-100 px-3 py-1.5 text-gray-900 focus:outline-indigo-600"
            />
          </div>

          {/* gender */}
          <div>
            <label
              htmlFor="gender"
              className="block text-lg/6 font-medium text-gray-900"
            >
              Gender
            </label>
            <div className="mt-1 flex items-center gap-4">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  id="gender-male"
                  name="gender"
                  value="male"
                  className="h-4 w-4 text-indigo-600"
                />
                <span className="text-gray-700">Male</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  id="gender-female"
                  name="gender"
                  value="female"
                  className="h-4 w-4 text-indigo-600"
                />
                <span className="text-gray-700">Female</span>
              </label>
            </div>
          </div>

          {/* email */}
          <div>
            <label
              htmlFor="email"
              className="block text-lg/6 font-medium text-gray-900"
            >
              email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="mt-1 block w-full rounded-md bg-gray-100 px-3 py-1.5 text-gray-900 focus:outline-indigo-600"
            />
          </div>

          {/* password */}
          <div>
            <label
              htmlFor="password"
              className="block text-lg/6 font-medium text-gray-900"
            >
              password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="mt-1 block w-full rounded-md bg-gray-100 px-3 py-1.5 text-gray-900 focus:outline-indigo-600"
            />
          </div>

          {/* confirm password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-lg/6 font-medium text-gray-900"
            >
              confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="mt-1 block w-full rounded-md bg-gray-100 px-3 py-1.5 text-gray-900 focus:outline-indigo-600"
            />
          </div>

          {/* ボタン */}
          <div className="flex items-center justify-end gap-4">
            <Link href="/">
              <button
                type="button"
                className="border border-emerald-700 text-emerald-800 px-6 py-2 rounded hover:bg-emerald-900 hover:text-white transition duration-200"
              >
                Cancel
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
