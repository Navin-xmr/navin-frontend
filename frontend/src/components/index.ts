// Common
export { default as EmptyState } from './common/EmptyState';
export type { EmptyStateProps, EmptyStateCTA } from './common/EmptyState';

export { default as DataTable } from './common/DataTable';
export type { DataTableProps, ColumnDef, PaginationConfig, DataTableEmptyState, SortDirection } from './common/DataTable';
export { default as Pagination } from './common/Pagination';
export type { PaginationProps } from './common/Pagination';
export { default as Breadcrumb } from './common/Breadcrumb';
export type { BreadcrumbProps, BreadcrumbItem } from './common/Breadcrumb';

// Reusable UI primitives
export { default as Button } from './Button';
// UI
export { ProgressBar } from './ui/ProgressBar';
export type { ProgressBarProps, ProgressBarColor, ProgressBarSize } from './ui/ProgressBar';
export { ProgressStepper } from './ui/ProgressStepper';
export type { ProgressStepperProps, StepDef } from './ui/ProgressStepper';
export { CircularProgress } from './ui/CircularProgress';
export type { CircularProgressProps } from './ui/CircularProgress';
export { default as Avatar } from '@components/ui/Avatar';
export type { AvatarProps } from '@components/ui/Avatar';
export { default as PriorityBadge } from '@components/ui/PriorityBadge';
export type { PriorityBadgeProps } from '@components/ui/PriorityBadge';
export { default as Tag } from '@components/ui/Tag';
export type { TagProps } from '@components/ui/Tag';
export { default as MultiSelect } from './ui/MultiSelect';
export type { MultiSelectOption, MultiSelectProps } from './ui/MultiSelect';
export { default as Combobox } from '@components/ui/Combobox';
export type { ComboboxOption, ComboboxProps } from '@components/ui/Combobox';
export { default as ExportDropdown } from '@components/ui/ExportDropdown';
export type { ExportDropdownProps, ExportFormat } from '@components/ui/ExportDropdown';
export { default as Drawer } from '@components/ui/Drawer';
export type { DrawerProps, DrawerPlacement } from '@components/ui/Drawer';
export { default as StaleDataBanner } from '@components/ui/StaleDataBanner';
export type { StaleDataBannerProps } from '@components/ui/StaleDataBanner';
export { default as CopyToClipboard } from '@components/ui/CopyToClipboard';
export type { CopyToClipboardProps } from '@components/ui/CopyToClipboard';
export { default as Tooltip } from '@components/ui/Tooltip';
export type { TooltipProps } from '@components/ui/Tooltip';
export { default as SearchInput } from '@components/ui/SearchInput';
export type { SearchInputProps } from '@components/ui/SearchInput';
export { default as PasswordStrengthMeter } from '@components/ui/PasswordStrengthMeter';
export type { PasswordStrengthMeterProps } from '@components/ui/PasswordStrengthMeter';
export { default as ConnectionStatusDot } from '@components/ui/ConnectionStatusDot';
export type { ConnectionStatusDotProps } from '@components/ui/ConnectionStatusDot';
export { default as PageSkeleton } from '@components/ui/PageSkeleton';
export type { PageSkeletonProps } from '@components/ui/PageSkeleton';
export { default as PWAInstallPrompt } from '@components/ui/PWAInstallPrompt';
export type { PWAInstallPromptProps } from '@components/ui/PWAInstallPrompt';
export { default as RouteTransition } from '@components/ui/RouteTransition';
export type { RouteTransitionProps } from '@components/ui/RouteTransition';
export { default as RoleAccessInfo } from '@components/ui/RoleAccessInfo';
export type { RoleAccessInfoProps } from '@components/ui/RoleAccessInfo';
export { default as InlineEditField } from '@components/ui/InlineEditField';
export type { InlineEditFieldProps } from '@components/ui/InlineEditField';
export { default as AccessRestrictedBadge } from '@components/ui/AccessRestrictedBadge';
export type { AccessRestrictedBadgeProps } from '@components/ui/AccessRestrictedBadge';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

export { default as Card, CardHeader, CardBody, CardFooter } from './Card';
export type { CardProps } from './Card';

export { default as Navbar } from './Navbar';

// Auth
export { default as ProtectedRoute } from './auth/ProtectedRoute';
export { WalletConnectButton } from './auth/WalletConnectButton';
export type { WalletConnectButtonProps } from './auth/WalletConnectButton';

// Layout
export { default as DashboardLayout } from './layout/DashboardLayout';
export { default as TopHeader } from './layout/TopHeader';
export type { TopHeaderProps } from './layout/TopHeader';
export { default as Sidebar } from './layout/Sidebar';
export type { SidebarProps } from './layout/Sidebar';

// Notifications
export { NotificationDropdown } from './notifications/NotificationDropdown';
export type { NotificationItem } from './notifications/NotificationDropdown';

// Dashboard
export { default as StatCard } from './dashboard/StatCard';
export type { StatCardProps } from './dashboard/StatCard';
export { default as DeliverySuccessChart } from './dashboard/Charts/DeliverySuccessChart';
export { default as ShipmentVolumeChart } from './dashboard/Charts/ShipmentVolumeChart';
export { default as RevenueTargetWidget } from './dashboard/RevenueTargetWidget';
export { default as CostPerRouteWidget } from './dashboard/CostPerRouteWidget';

// Shipment
export { default as TrackingTimeline } from './shipment/TrackingTimeline';
export type { TrackingTimelineProps, Milestone } from './shipment/TrackingTimeline';
export { default as MilestoneTimeline } from './shipment/MilestoneTimeline/MilestoneTimeline';
export type { MilestoneDetail, MilestoneTimelineProps } from './shipment/MilestoneTimeline/MilestoneTimeline';
export { default as EventAnnotation } from './shipment/EventAnnotation';
export type { EventAnnotationProps, Annotation } from './shipment/EventAnnotation';
export { default as StatusUpdate } from './shipment/StatusUpdate';
export type { StatusUpdateProps, ShipmentMilestone } from './shipment/StatusUpdate';
export { default as DeliveryConfirmation } from './shipment/DeliveryConfirmation';
export type { DeliveryConfirmationProps } from './shipment/DeliveryConfirmation';
export { default as QuickActionPanel } from './shipment/QuickActionPanel';
export type { QuickActionPanelProps, ActionType } from './shipment/QuickActionPanel';
export { OverdueShipmentBadge } from './shipment/OverdueShipmentBadge';
export type { OverdueShipmentBadgeProps } from './shipment/OverdueShipmentBadge';

// Onboarding
export { OnboardingTour } from './onboarding';
export type { OnboardingTourProps, TourStep } from './onboarding';
export { isTourComplete, markTourComplete, resetTourFlag } from './onboarding';

// UI — EmptyState (#526)
export { default as EmptyStateUI } from './ui/EmptyState';
export type { EmptyStateProps as EmptyStateUIProps, EmptyStateAction } from './ui/EmptyState';

// Shipment — ShipmentActionMenu (#527)
export { default as ShipmentActionMenu } from './shipment/ShipmentActionMenu';
export type { ShipmentActionMenuProps, ShipmentActionItem, ShipmentActionMenuStatus } from './shipment/ShipmentActionMenu';

// Common — GlobalSearch (#528)
export { default as GlobalSearch } from './common/GlobalSearch';
export type { GlobalSearchProps, SearchResult, SearchResultType } from './common/GlobalSearch';
// Dashboard — Recent Activity Panel (#525)
export { RecentActivityPanel } from './dashboard/RecentActivityPanel';
export type { RecentActivityPanelProps } from './dashboard/RecentActivityPanel';
// Skeletons
export {
  Skeleton,
  ShipmentCardSkeleton,
  TableRowSkeleton,
  DashboardWidgetSkeleton,
  ProfileSkeleton,
  CardSkeleton,
  TableSkeleton,
} from './ui/Skeleton';
export type {
  SkeletonProps,
  ShipmentCardSkeletonProps,
  TableRowSkeletonProps,
  DashboardWidgetSkeletonProps,
  ProfileSkeletonProps,
  CardSkeletonProps,
  TableSkeletonProps,
} from './ui/Skeleton';
// UI — Autosave Banner (#529)
export { AutosaveBanner } from './ui/AutosaveBanner';
export type { AutosaveBannerProps } from './ui/AutosaveBanner';

// UI — Chip & ChipGroup (#530)
export { Chip, ChipGroup } from './ui/Chip';
export type { ChipProps, ChipVariant, ChipSize, ChipGroupProps, ChipOption } from './ui/Chip';

// Dashboard — Widget Refresh Indicator (#531)
export { WidgetRefreshIndicator } from './dashboard/WidgetRefreshIndicator';
export type { WidgetRefreshIndicatorProps } from './dashboard/WidgetRefreshIndicator';

// Shipment — Summary Print View (#532)
export { ShipmentSummaryPrint } from './shipment/ShipmentSummaryPrint';
export type { ShipmentSummaryPrintProps, ShipmentSummaryPrintData, PrintMilestone, PrintCostItem, PrintPaymentInfo, PrintSensorSnapshot } from './shipment/ShipmentSummaryPrint';
