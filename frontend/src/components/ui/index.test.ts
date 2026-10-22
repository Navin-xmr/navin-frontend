import { describe, it, expect } from "vitest";
import {
  AutosaveBanner,
  Avatar,
  ChartError,
  ChartLoading,
  Chip,
  ChipGroup,
  Combobox,
  ConfirmDialog,
  ConnectionStatusDot,
  CopyToClipboard,
  EmptyState,
  ExportDropdown,
  FileUpload,
  InlineEditField,
  PageSkeleton,
  PasswordStrengthMeter,
  PriorityBadge,
  ProgressStepper,
  PWAInstallPrompt,
  RichChartTooltip,
  RoleAccessInfo,
  RouteTransition,
  SearchInput,
  Skeleton,
  StatusBadge,
  Tag,
  Tooltip,
} from "./index";

describe("components/ui barrel export (#1119)", () => {
  it("re-exports all UI domain components", () => {
    expect(AutosaveBanner).toBeDefined();
    expect(Avatar).toBeDefined();
    expect(ChartError).toBeDefined();
    expect(ChartLoading).toBeDefined();
    expect(Chip).toBeDefined();
    expect(ChipGroup).toBeDefined();
    expect(Combobox).toBeDefined();
    expect(ConfirmDialog).toBeDefined();
    expect(ConnectionStatusDot).toBeDefined();
    expect(CopyToClipboard).toBeDefined();
    expect(EmptyState).toBeDefined();
    expect(ExportDropdown).toBeDefined();
    expect(FileUpload).toBeDefined();
    expect(InlineEditField).toBeDefined();
    expect(PageSkeleton).toBeDefined();
    expect(PasswordStrengthMeter).toBeDefined();
    expect(PriorityBadge).toBeDefined();
    expect(ProgressStepper).toBeDefined();
    expect(PWAInstallPrompt).toBeDefined();
    expect(RichChartTooltip).toBeDefined();
    expect(RoleAccessInfo).toBeDefined();
    expect(RouteTransition).toBeDefined();
    expect(SearchInput).toBeDefined();
    expect(Skeleton).toBeDefined();
    expect(StatusBadge).toBeDefined();
    expect(Tag).toBeDefined();
    expect(Tooltip).toBeDefined();
  });
});
