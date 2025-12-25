/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/sowonee-gallery' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/sowonee-gallery/' : '',
};

module.exports = nextConfig;
