import { describe, it, expect } from "vitest";
import {
  DeliverySuccessChart,
  ShipmentVolumeChart,
  CostPerRouteWidget,
  RevenueTargetWidget,
  ShipmentVolumeTrendWidget,
  StatCard,
  WidgetRefreshIndicator,
} from "./index";

describe("components/dashboard barrel export (#1129)", () => {
  it("re-exports all dashboard domain components", () => {
    expect(DeliverySuccessChart).toBeDefined();
    expect(ShipmentVolumeChart).toBeDefined();
    expect(CostPerRouteWidget).toBeDefined();
    expect(RevenueTargetWidget).toBeDefined();
    expect(ShipmentVolumeTrendWidget).toBeDefined();
    expect(StatCard).toBeDefined();
    expect(WidgetRefreshIndicator).toBeDefined();
  });
});
