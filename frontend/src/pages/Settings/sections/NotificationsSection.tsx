import React from 'react';
import SettingsSection from '@components/settings/SettingsSection';
import NotificationPreferences from '../NotificationPreferences/NotificationPreferences';

const NotificationsSection: React.FC = () => (
  <SettingsSection
    title="Notifications"
    description="Configure which events trigger notifications and how you receive them."
  >
    <NotificationPreferences />
  </SettingsSection>
);

export default NotificationsSection;
