import React from "react";
import Image from "next/image";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="relative z-10 container mx-auto flex items-center justify-between py-4 px-6">
          <div className="sitetitle_area flex items-center">
            <Image
              src="/images/logo_cat.png"
              alt="Matcha Logo"
              width={75}
              height={75}
              className="object-contain"
            />
            <p className="site_title text-2xl font-bold ml-2 text-gray-600">
              Matcha
            </p>
          </div>
        </div>
      </header>

      {/* メインコンテンツ：flex-grow で残りのスペースを埋め、中央に配置 */}
      <main className="flex-grow relative flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('/images/background.png')] bg-cover bg-center bg-no-repeat" />
        <div className="absolute inset-0 bg-white bg-opacity-40" />
        <div className="relative z-10 w-full">{children}</div>
      </main>

      {/* フッター */}
      <footer className="bg-white shadow">
        <div className="container mx-auto py-4 px-6 flex items-center justify-center">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} Matcha
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
