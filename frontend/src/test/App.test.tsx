import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "../App";
import { ToastProvider } from "../context/ToastContext";
import { LiveRegionProvider } from "../context/LiveRegionContext";

describe("App", () => {
  it("renders without crashing", () => {
    render(
      <LiveRegionProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </LiveRegionProvider>,
    );
    expect(screen.getAllByText(/Transparent/i).length).toBeGreaterThan(0);
  });
});