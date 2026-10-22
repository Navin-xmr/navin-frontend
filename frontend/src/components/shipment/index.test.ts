import { describe, it, expect } from "vitest";
import {
  BulkActionBar,
  BulkStatusModal,
  CostBreakdown,
  DeliveryConfirmation,
  EventAnnotation,
  MilestoneTimeline,
  SaveTemplateModal,
  ShipmentComparison,
  ShipmentSummaryPrint,
  StatusUpdate,
} from "./index";

describe("components/shipment barrel export (#1123)", () => {
  it("re-exports all shipment domain components", () => {
    expect(BulkActionBar).toBeDefined();
    expect(BulkStatusModal).toBeDefined();
    expect(CostBreakdown).toBeDefined();
    expect(DeliveryConfirmation).toBeDefined();
    expect(EventAnnotation).toBeDefined();
    expect(MilestoneTimeline).toBeDefined();
    expect(SaveTemplateModal).toBeDefined();
    expect(ShipmentComparison).toBeDefined();
    expect(ShipmentSummaryPrint).toBeDefined();
    expect(StatusUpdate).toBeDefined();
  });
});
