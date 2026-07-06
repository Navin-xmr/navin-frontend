import { StrictMode } from "react";
import "./i18n";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import "./index.css";
import App from "./App.tsx";
import { ToastProvider } from "./context/ToastContext.tsx";
import { LiveRegionProvider } from "./context/LiveRegionContext.tsx";
import { WalletProvider } from "./context/WalletContext.tsx";

if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_APP_ENV || "production",
    release: import.meta.env.VITE_APP_VERSION || undefined,
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
    tracesSampleRate: 0.1,
  });
}

const storedTheme = localStorage.getItem('navin-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LiveRegionProvider>
      <ToastProvider>
        <WalletProvider>
          <App />
        </WalletProvider>
      </ToastProvider>
    </LiveRegionProvider>
  </StrictMode>,
);
