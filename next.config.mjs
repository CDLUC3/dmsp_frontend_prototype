import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  //output: "standalone",
  experimental: {
    serverActions: {
      allowedOrigins: [
        process.env.NEXT_PUBLIC_BASE_URL
      ],
    },
  },
};

export default withNextIntl(nextConfig);