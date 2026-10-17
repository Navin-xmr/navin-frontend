import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ThemeToggleDefault, { ThemeToggle } from "./index";

const mockToggleTheme = vi.fn();
vi.mock("../../hooks/useTheme", () => ({
  useTheme: () => ({
    theme: "dark",
    toggleTheme: mockToggleTheme,
  }),
}));

describe("ThemeToggle barrel and component (#1135)", () => {
  it("re-exports default and named ThemeToggle from the index.ts barrel", () => {
    expect(ThemeToggleDefault).toBe(ThemeToggle);
  });

  it("renders toggle button and calls toggleTheme when clicked", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /switch to light mode/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(mockToggleTheme).toHaveBeenCalledOnce();
  });
});
