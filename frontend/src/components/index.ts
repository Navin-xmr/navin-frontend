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
export { CircularProgress } from './ui/CircularProgress';
export type { CircularProgressProps } from './ui/CircularProgress';
export { default as Avatar } from './ui/Avatar';
export type { AvatarProps } from './ui/Avatar';
export { default as PriorityBadge } from './ui/PriorityBadge';
export type { PriorityBadgeProps } from './ui/PriorityBadge';
export { default as Tag } from './ui/Tag';
export type { TagProps } from './ui/Tag';
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
export { default as StatusUpdate } from './shipment/StatusUpdate';
export type { StatusUpdateProps, ShipmentMilestone } from './shipment/StatusUpdate';
export { default as DeliveryConfirmation } from './shipment/DeliveryConfirmation/DeliveryConfirmation';
export type { DeliveryConfirmationProps } from './shipment/DeliveryConfirmation/DeliveryConfirmation';

// Onboarding
export { OnboardingTour } from './onboarding';
export type { OnboardingTourProps, TourStep } from './onboarding';
export { isTourComplete, markTourComplete, resetTourFlag } from './onboarding';
