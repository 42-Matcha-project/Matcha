/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  typescript: {
    // ビルド時の型チェックをスキップ
    ignoreBuildErrors: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.render.com",
      },
    ],
  },
  // 開発環境用のリライトルール（APIリクエストをバックエンドにプロキシする）
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://matcha-hwg6.onrender.com/api/:path*",
      },
      {
        source: "/study-room/:path*",
        destination: "https://matcha-hwg6.onrender.com/study-room/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
