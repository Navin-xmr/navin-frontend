import { describe, it, expect } from "vitest";
import { AnimatedPage, DashboardLayout, TopHeader } from "./index";
import DirectAnimatedPage from "./AnimatedPage";
import DirectDashboardLayout from "./DashboardLayout";
import DirectTopHeader from "./TopHeader";

describe("components/layout barrel export (#1117)", () => {
  it("re-exports AnimatedPage, DashboardLayout, and TopHeader", () => {
    expect(AnimatedPage).toBe(DirectAnimatedPage);
    expect(DashboardLayout).toBe(DirectDashboardLayout);
    expect(TopHeader).toBe(DirectTopHeader);
  });
});
