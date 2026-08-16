/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 这是给 App Store 打包的必须配置
  images: {
    unoptimized: true, // App 内无法使用动态图片优化
  },
};

export default nextConfig;