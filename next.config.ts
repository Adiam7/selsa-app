import type { NextConfig } from 'next';
import path from 'path';
import { fileURLToPath } from 'url';
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:8000';
const IS_VERCEL = !!process.env.VERCEL;

const nextConfig: NextConfig = {
  // Vercel has its own optimised build pipeline; standalone is for Docker/Render
  ...(IS_VERCEL ? {} : { output: 'standalone' as const }),
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
              "script-src 'self' 'unsafe-inline' https://js.stripe.com https://www.paypal.com",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://www.paypal.com https://www.sandbox.paypal.com",
              `connect-src 'self' https://api.stripe.com https://api.paypal.com https://api.sandbox.paypal.com https://ipapi.co ${BACKEND_URL}`,
              `img-src 'self' data: blob: https://files.cdn.printful.com https://res.cloudinary.com ${BACKEND_URL} https://*.stripe.com`,
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
      // Only proxy media when NOT using Cloudinary (local dev)
      ...(!process.env.CLOUDINARY_CLOUD_NAME ? [{
        source: '/media/:path*',
        destination: `${BACKEND_URL}/media/:path*`,
      }] : []),
    ];
  },
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'files.cdn.printful.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      // Production backend — reads domain from env
      ...(process.env.NEXT_PUBLIC_BACKEND_URL
        ? [{
            protocol: new URL(process.env.NEXT_PUBLIC_BACKEND_URL).protocol.replace(':', '') as 'http' | 'https',
            hostname: new URL(process.env.NEXT_PUBLIC_BACKEND_URL).hostname,
            ...(new URL(process.env.NEXT_PUBLIC_BACKEND_URL).port ? { port: new URL(process.env.NEXT_PUBLIC_BACKEND_URL).port } : {}),
            pathname: '/media/**',
          }]
        : []),
      // Dev fallbacks
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

export default withBundleAnalyzer(nextConfig);
