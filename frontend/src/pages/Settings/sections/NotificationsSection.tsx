import React from 'react';
import NotificationPreferences from '../NotificationPreferences/NotificationPreferences';

const NotificationsSection: React.FC = () => (
  <div className="space-y-4">
    <h2 className="text-lg font-semibold">Notifications</h2>
    <NotificationPreferences />
  </div>
);

export default NotificationsSection;
