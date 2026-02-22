import React from 'react';
import ActiveShipments from './ActiveShipments/ActiveShipments';

const CustomerDashboard: React.FC = () => {
  return (
    <div className="customer-dashboard">
      <ActiveShipments />
    </div>
  );
};

export default CustomerDashboard;
