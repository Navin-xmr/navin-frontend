import { describe, it, expect } from "vitest";
import {
  BulkActionBar,
  BulkStatusModal,
  CostBreakdown,
  DeliveryConfirmation,
  EventAnnotation,
  MilestoneTimeline,
  PriorityBadge,
  QuickActionPanel,
  SaveTemplateModal,
  ShipmentActionMenu,
  ShipmentComparison,
  ShipmentSummaryPrint,
  StatusUpdate,
  TrackingTimeline,
} from "./index";

describe("components/shipment barrel export (#1123)", () => {
  it("re-exports all shipment domain components", () => {
    expect(BulkActionBar).toBeDefined();
    expect(BulkStatusModal).toBeDefined();
    expect(CostBreakdown).toBeDefined();
    expect(DeliveryConfirmation).toBeDefined();
    expect(EventAnnotation).toBeDefined();
    expect(MilestoneTimeline).toBeDefined();
    expect(PriorityBadge).toBeDefined();
    expect(QuickActionPanel).toBeDefined();
    expect(SaveTemplateModal).toBeDefined();
    expect(ShipmentActionMenu).toBeDefined();
    expect(ShipmentComparison).toBeDefined();
    expect(ShipmentSummaryPrint).toBeDefined();
    expect(StatusUpdate).toBeDefined();
    expect(TrackingTimeline).toBeDefined();
  });
});
