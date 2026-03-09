import type { NextConfig } from 'next';
import path from 'path';
import { fileURLToPath } from 'url';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:8000';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  turbopack: {
    // This repo contains multiple lockfiles; without an explicit root Turbopack may
    // infer the monorepo root incorrectly and miss file-watching for frontend assets.
    root: currentDir,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.paypal.com",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://www.paypal.com https://www.sandbox.paypal.com",
              "connect-src 'self' https://api.stripe.com https://api.paypal.com https://api.sandbox.paypal.com https://ipapi.co http://localhost:8000 http://127.0.0.1:8000",
              "img-src 'self' data: blob: https://files.cdn.printful.com http://localhost:8000 http://127.0.0.1:8000 https://*.stripe.com",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'payment=(self "https://js.stripe.com" "https://www.paypal.com"), camera=(), microphone=()',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        // Proxy /backend-api/:path* → Django backend
        source: '/backend-api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        // Proxy /media/:path* → Django media files
        source: '/media/:path*',
        destination: `${BACKEND_URL}/media/:path*`,
      },
    ];
  },
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'https',            // Use https if Printful serves images over HTTPS
        hostname: 'files.cdn.printful.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
    ],
  },
};

export default nextConfig;
