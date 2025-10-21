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
  api: {
    bodyParser: {
      sizeLimit: '2gb',
    },
  },
  experimental: {
    serverComponentsExternalPackages: ['@aws-sdk/client-s3'],
  },
};

export default nextConfig;
