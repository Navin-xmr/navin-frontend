/// <reference types="vitest" />
/// <reference types="node" />
import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { VitePWA } from "vite-plugin-pwa";
// import tailwindcss from '@tailwindcss/vite'

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "images/**/*"],
      manifest: {
        name: "Navin — Blockchain Logistics",
        short_name: "Navin",
        description: "Track shipments and settlements on Stellar",
        theme_color: "#0d1117",
        background_color: "#0d1117",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: "/dashboard",
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
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /\/api\/shipments\/[^/]+\/telemetry\/latest/,
            handler: "NetworkFirst",
            options: {
              cacheName: "telemetry-latest",
              expiration: { maxEntries: 20, maxAgeSeconds: 300 },
            },
          },
          {
            urlPattern: /\/api\/shipments\/[^/]+$/,
            handler: "CacheFirst",
            options: {
              cacheName: "shipment-detail",
              expiration: { maxEntries: 20, maxAgeSeconds: 43200 },
            },
          },
          {
            urlPattern: /\/api\/shipments/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "shipments-list",
              expiration: { maxEntries: 50, maxAgeSeconds: 86400 },
            },
          },
          {
            urlPattern: /\/api\/notifications/,
            handler: "NetworkFirst",
            options: {
              cacheName: "notifications",
              expiration: { maxEntries: 1, maxAgeSeconds: 300 },
            },
          },
          {
            urlPattern: /\/api\/settlements/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "settlements",
              expiration: { maxEntries: 20, maxAgeSeconds: 3600 },
            },
          },
        ],
      },
    }),
  ], // tailwindcss() removed temporarily for CI
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
    ],
  },
});
