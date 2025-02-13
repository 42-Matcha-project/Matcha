import Link from "next/link";

const MainContent = () => (
  <main className="flex flex-col items-center justify-center p-8 gap-6 text-center">
    <h1 className="text-3xl font-bold sm:text-4xl">
      ここにキャッチコピー
    </h1>
    <p className="text-gray-600">
      ここにアプリの紹介文などを入れる
      <br/>
    </p>

    <div className="flex gap-4 mt-4">
      <Link 
        href="/register" 
        className="bg-emerald-800 text-white px-6 py-2 rounded shadow hover:bg-emerald-950 transition duration-200"
      >
        登録
      </Link>
      <Link 
        href="/login" 
        className="border border-emerald-800 text-emerald-900 px-6 py-2 rounded hover:bg-emerald-950 hover:text-white transition duration-200"
      >
        ログイン
      </Link>
    </div>
  </main>
);

export default function Home() {
  return (
    <div className="flex items-center justify-center bg-gray-100 min-h-screen">
      <MainContent />
    </div>
  );
}
