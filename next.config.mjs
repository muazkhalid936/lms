/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@aws-sdk/client-s3'],
  },
  api: {
    bodyParser: {
      sizeLimit: '4.5mb', // Maximum allowed by Vercel
    },
  },
};

export default nextConfig;
