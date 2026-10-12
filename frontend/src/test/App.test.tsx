import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "../App";
import { ToastProvider } from "../context/ToastContext";
import { LiveRegionProvider } from "../context/LiveRegionContext";
import { WalletProvider } from "../context/WalletContext";
import { ThemeProvider } from "../hooks/useTheme";

describe("App", () => {
  // Same provider tree as main.tsx: AuthProvider (inside App) needs the wallet.
  it("renders the landing page without crashing", () => {
    render(
      <LiveRegionProvider>
        <ToastProvider>
          <WalletProvider>
            <ThemeProvider>
              <App />
            </ThemeProvider>
          </WalletProvider>
        </ToastProvider>
      </LiveRegionProvider>,
    );
    expect(screen.getAllByText(/Transparent/i).length).toBeGreaterThan(0);
  });
});
