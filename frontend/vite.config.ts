/// <reference types="vitest" />
/// <reference types="node" />
import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { VitePWA } from "vite-plugin-pwa";
import { loadEnv } from "vite";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const apiBaseUrl = env.VITE_API_BASE_URL;
  const apiBase = apiBaseUrl ? new URL(apiBaseUrl) : null;
  const apiPrefix = apiBase
    ? `${apiBase.origin}${apiBase.pathname.replace(/\/+$/, "")}`
    : "";
  const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const apiRoutePattern = (path: string) =>
    new RegExp(
      apiPrefix
        ? `^${escapeRegExp(apiPrefix)}${path}(?:\\?.*)?$`
        : `^https?://[^/]+/api${path}(?:\\?.*)?$`,
    );

  return ({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["navin-logo.svg", "images/**/*"],
      manifest: {
        name: "Navin — Blockchain Logistics",
        short_name: "Navin",
        description: "Track shipments and settlements on Stellar",
        theme_color: "#0d1117",
        background_color: "#0d1117",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/images/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/images/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/images/maskable-icon.png",
            sizes: "1x1",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,woff2}"],
        globIgnores: ["**/html2pdf*", "**/*-*.png", "**/*-*.svg"],
        runtimeCaching: [
          {
            urlPattern: /^.*\.png$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: { maxEntries: 50, maxAgeSeconds: 604800 },
            },
          },
          {
            urlPattern: /^.*\.svg$/,
            handler: "CacheFirst",
            options: {
              cacheName: "vectors",
              expiration: { maxEntries: 50, maxAgeSeconds: 604800 },
            },
          },
          {
            urlPattern: apiRoutePattern("/shipments/[^/?]+/telemetry/latest"),
            handler: "NetworkFirst",
            options: {
              cacheName: "telemetry-latest",
              expiration: { maxEntries: 20, maxAgeSeconds: 300 },
            },
          },
          {
            urlPattern: apiRoutePattern("/shipments/[^/?]+"),
            handler: "NetworkFirst",
            options: {
              cacheName: "shipment-detail",
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 20, maxAgeSeconds: 43200 },
            },
          },
          {
            urlPattern: apiRoutePattern("/shipments(?:/.*)?"),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "shipments-list",
              expiration: { maxEntries: 50, maxAgeSeconds: 86400 },
            },
          },
          {
            urlPattern: apiRoutePattern("/notifications(?:/.*)?"),
            handler: "NetworkFirst",
            options: {
              cacheName: "notifications",
              expiration: { maxEntries: 1, maxAgeSeconds: 300 },
            },
          },
          {
            urlPattern: apiRoutePattern("/settlements(?:/.*)?"),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "settlements",
              expiration: { maxEntries: 20, maxAgeSeconds: 3600 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      // Backend mounts its routers under /api, so the prefix is preserved.
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-dom/client'],
          'i18n': ['i18next', 'react-i18next'],
          'sentry': ['@sentry/react'],
          'react-router': ['react-router-dom'],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@components": resolve(__dirname, "./src/components"),
      "@pages": resolve(__dirname, "./src/pages"),
      "@services": resolve(__dirname, "./src/services"),
      "@context": resolve(__dirname, "./src/context"),
      "@hooks": resolve(__dirname, "./src/hooks"),
      "@utils": resolve(__dirname, "./src/utils"),
      "@types": resolve(__dirname, "./src/types"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    environmentOptions: {
      jsdom: {
        url: "http://localhost:3000",
      },
    },
    testTimeout: 10000,
    setupFiles: ["./src/test/setup.ts"],
    exclude: [
      ...configDefaults.exclude,
      "e2e/**",
    ],
  },
  });
});
