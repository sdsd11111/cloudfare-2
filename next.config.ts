import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: false, 
  register: true,
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  fallbacks: {
    document: "/offline" 
  },
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
  }
});

const nextConfig: NextConfig = {
  // Se deshabilita Turbopack por el momento debido a incompatibilidad con plugins de Webpack (PWA)
  webpack: (config) => {
    return config;
  },
  // Configuración de Turbopack si se llegara a usar (silencia advertencias de root)
  turbopack: {
    root: "D:/Abel paginas/Aquatech/Crm Aquatech"
  },
  experimental: {
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default withPWA(nextConfig);
