/**
 * resolveNotificationLink.test.ts
 *
 * Unit tests for the resolveNotificationLink utility (issue #225).
 * Covers all resolution priority branches described in the function's JSDoc.
 */

import { describe, it, expect } from "vitest";
import { resolveNotificationLink } from "./resolveNotificationLink";

describe("resolveNotificationLink", () => {
  // ---------------------------------------------------------------------------
  // Priority 1: shipmentId (_id)
  // ---------------------------------------------------------------------------
  describe("when shipmentId is present", () => {
    it("returns a path using shipmentId regardless of other fields", () => {
      const result = resolveNotificationLink({
        shipmentId: "6641abc123def",
        trackingNumber: "NV-9920",
        link: "/dashboard/shipments/NV-9920",
      });
      expect(result).toBe("/dashboard/shipments/6641abc123def");
    });

    it("returns a path using shipmentId even when trackingNumber is missing", () => {
      const result = resolveNotificationLink({
        shipmentId: "6641abc123def",
      });
      expect(result).toBe("/dashboard/shipments/6641abc123def");
    });

    it("encodes special characters in shipmentId", () => {
      const result = resolveNotificationLink({ shipmentId: "id with space" });
      expect(result).toBe("/dashboard/shipments/id%20with%20space");
    });

    it("ignores a whitespace-only shipmentId and falls through", () => {
      const result = resolveNotificationLink({
        shipmentId: "   ",
        trackingNumber: "NV-1234",
      });
      expect(result).toBe("/dashboard/shipments/NV-1234");
    });
  });

  // ---------------------------------------------------------------------------
  // Priority 2: trackingNumber
  // ---------------------------------------------------------------------------
  describe("when shipmentId is absent but trackingNumber is present", () => {
    it("returns a path using trackingNumber", () => {
      const result = resolveNotificationLink({
        trackingNumber: "NV-9920",
        link: "/dashboard/shipments/NV-9920",
      });
      expect(result).toBe("/dashboard/shipments/NV-9920");
    });

    it("returns a path using trackingNumber when only that field is provided", () => {
      const result = resolveNotificationLink({ trackingNumber: "NV-0001" });
      expect(result).toBe("/dashboard/shipments/NV-0001");
    });

    it("encodes special characters in trackingNumber", () => {
      const result = resolveNotificationLink({ trackingNumber: "NV/0001" });
      expect(result).toBe("/dashboard/shipments/NV%2F0001");
    });

    it("ignores a whitespace-only trackingNumber and falls through", () => {
      const result = resolveNotificationLink({
        trackingNumber: "\t",
        link: "/dashboard/notifications",
      });
      expect(result).toBe("/dashboard/notifications");
    });
  });

  // ---------------------------------------------------------------------------
  // Priority 3: raw link
  // ---------------------------------------------------------------------------
  describe("when only a raw link is present", () => {
    it("returns the link if it starts with /dashboard/", () => {
      const result = resolveNotificationLink({
        link: "/dashboard/settlements/abc",
      });
      expect(result).toBe("/dashboard/settlements/abc");
    });

    it("returns the link for the notifications page itself", () => {
      const result = resolveNotificationLink({
        link: "/dashboard/notifications",
      });
      expect(result).toBe("/dashboard/notifications");
    });

    it("trims whitespace from the link", () => {
      const result = resolveNotificationLink({
        link: "  /dashboard/shipments/foo  ",
      });
      expect(result).toBe("/dashboard/shipments/foo");
    });

    it("returns null for a link that does not start with /dashboard/", () => {
      const result = resolveNotificationLink({
        link: "https://malicious.example.com/steal",
      });
      expect(result).toBeNull();
    });

    it("returns null for a relative non-dashboard link", () => {
      const result = resolveNotificationLink({ link: "/public/track/NV-001" });
      expect(result).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // Priority 4: no usable path
  // ---------------------------------------------------------------------------
  describe("when no usable field is present", () => {
    it("returns null when all fields are empty", () => {
      expect(resolveNotificationLink({})).toBeNull();
    });

    it("returns null when all fields are undefined", () => {
      expect(
        resolveNotificationLink({
          shipmentId: undefined,
          trackingNumber: undefined,
          link: undefined,
        }),
      ).toBeNull();
    });

    it("returns null when all fields are whitespace", () => {
      expect(
        resolveNotificationLink({
          shipmentId: "  ",
          trackingNumber: "  ",
          link: "  ",
        }),
      ).toBeNull();
    });
  });
});
