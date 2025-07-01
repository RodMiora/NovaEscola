/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public', // Onde o service worker e o manifest serão gerados
  register: true, // Registra o service worker automaticamente
  skipWaiting: true, // Ativa o novo service worker imediatamente após a instalação
  disable: process.env.NODE_ENV === 'development', // Desabilita o PWA em desenvolvimento para facilitar o debug
});

const nextConfig = {
  images: {
    domains: ['localhost', 'source.unsplash.com'],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        pathname: '**',
      },
    ],
  },
}

module.exports = withPWA(nextConfig)