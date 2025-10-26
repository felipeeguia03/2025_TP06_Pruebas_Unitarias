/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Configuración para desarrollo en Docker
  devIndicators: {
    buildActivity: false,
  },
  // Configurar webpack para Docker
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
