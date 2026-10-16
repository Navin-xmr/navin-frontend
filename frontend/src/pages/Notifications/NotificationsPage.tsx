import { Check } from "lucide-react";
import { useBulkSelection } from "@hooks/useBulkSelection";
import NotificationBulkActionBar from "@components/notifications/NotificationBulkActionBar";
import ConfirmDialog from "@components/ui/ConfirmDialog/ConfirmDialog";
import NotificationsHeader from "./NotificationsHeader";
import NotificationFilters from "./NotificationFilters";
import NotificationList from "./NotificationList";
import { useNotificationPreferences } from "./hooks/useNotificationPreferences";
import { useNotifications } from "./hooks/useNotifications";
import { useNotificationView } from "./hooks/useNotificationView";
import { useNotificationBulkActions } from "./hooks/useNotificationBulkActions";

const NotificationsPage = () => {
  const preferences = useNotificationPreferences();
  const selection = useBulkSelection("notifications-bulk-selection");
  const {
    notificationsList,
    setNotificationsList,
    meta,
    isLoading,
    isLoadingMore,
    isMarkAllLoading,
    error,
    unreadCount,
    setUnreadCount,
    handleLoadMore,
    handleMarkAllAsRead,
    handleNotificationClick,
    handleDeleteNotification,
  } = useNotifications({
    activeFilter: preferences.activeFilter,
    searchQuery: preferences.searchQuery,
    setSearchParams: preferences.setSearchParams,
    selection,
  });
  const view = useNotificationView({
    notificationsList,
    readStateFilter: preferences.readStateFilter,
    sortMode: preferences.sortMode,
    unreadCount,
    isSelected: selection.isSelected,
  });
  const { selectedCount, clearSelection, toggleAll } = selection;
  const { readStateFilteredNotifications, allVisibleSelected, someVisibleSelected, currentUnreadCount } = view;
  const {
    isBulkDeleteOpen,
    setIsBulkDeleteOpen,
    isBulkProcessing,
    handleBulkMarkAsRead,
    handleBulkDeleteConfirm,
  } = useNotificationBulkActions({ notificationsList, setNotificationsList, setUnreadCount, selection });

  const handleToggleSelectAll = () => {
    toggleAll(view.visibleIds);
  };

  return (
    <div className="bg-[#101922] min-h-screen text-white">
      <NotificationsHeader />

      <div className="max-w-[1200px] mx-auto px-8 py-12">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-[32px] font-semibold m-0 mb-2">
              Notifications
            </h1>
            <p className="text-text-secondary text-sm m-0">
              Stay updated with your supply chain events and settlements.
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2.5 bg-[#283039] border border-[#374151] rounded-lg text-white text-sm cursor-pointer transition-all hover:bg-[#1f2937] hover:border-[#4b5563] disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleMarkAllAsRead}
            disabled={isMarkAllLoading || currentUnreadCount === 0}
          >
            <Check size={16} /> Mark all as read
          </button>
        </div>

        <NotificationFilters
          preferences={preferences}
          filterCounts={view.filterCounts}
          readStateCounts={view.readStateCounts}
          isLoading={isLoading}
        />

        {!isLoading && readStateFilteredNotifications.length > 0 && (
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="select-all-notifications"
              aria-label="Select all visible notifications"
              checked={allVisibleSelected}
              ref={(el) => {
                if (el) el.indeterminate = someVisibleSelected;
              }}
              onChange={handleToggleSelectAll}
              className="w-4 h-4 rounded border-[#374151] bg-transparent text-[#2563eb] focus:ring-2 focus:ring-[#2563eb] cursor-pointer"
            />
            <label
              htmlFor="select-all-notifications"
              className="text-sm text-text-secondary cursor-pointer select-none"
            >
              {selectedCount > 0
                ? `${selectedCount} selected`
                : "Select all"}
            </label>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-2xl border border-[#7f1d1d] bg-[#1f1f22] px-5 py-4 text-sm text-[#fca5a5]">
            {error}
          </div>
        )}

        <NotificationList
          isLoading={isLoading}
          notificationsCount={notificationsList.length}
          readStateFilteredNotifications={readStateFilteredNotifications}
          searchQuery={preferences.searchQuery}
          readStateFilter={preferences.readStateFilter}
          isGrouped={preferences.isGrouped}
          groupedNotifications={view.groupedNotifications}
          expandedGroups={preferences.expandedGroups}
          toggleGroupExpansion={preferences.toggleGroupExpansion}
          notifDensity={preferences.notifDensity}
          sortedUnreadNotifications={view.sortedUnreadNotifications}
          sortedReadNotifications={view.sortedReadNotifications}
          cardActions={{
            isSelected: selection.isSelected,
            toggleOne: selection.toggleOne,
            onOpen: handleNotificationClick,
            onDelete: handleDeleteNotification,
          }}
        />

        {!isLoading && meta?.hasMore && (
          <div className="flex flex-col items-center justify-center mt-8 gap-3">
            <button
              className="px-6 py-3 rounded-[18px] bg-[#2563eb] text-white text-sm font-medium hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? "Loading more..." : "Load more notifications"}
            </button>
            <span className="text-xs text-text-secondary">
              Showing {notificationsList.length} of {meta.total} notifications
            </span>
          </div>
        )}
      </div>

      <NotificationBulkActionBar
        count={selectedCount}
        onMarkRead={handleBulkMarkAsRead}
        onDelete={() => setIsBulkDeleteOpen(true)}
        onClear={clearSelection}
        isProcessing={isBulkProcessing}
      />

      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
        title="Delete selected notifications?"
        message={`This will permanently delete ${selectedCount} notification${selectedCount === 1 ? "" : "s"}. This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={isBulkProcessing}
      />
    </div>
  );
};

export default NotificationsPage;
