import React from 'react';
import { Link } from 'react-router-dom';
import './Shipments.css';

const Shipments: React.FC = () => {
  return (
    <section className="shipments-page">
      <h1>Shipments</h1>
      <p>Select a shipment to view its detail header section:</p>
      <div className="shipments-links">
        <Link to="/dashboard/shipments/SHP001">Open SHP001 (Company)</Link>
        <Link to="/dashboard/shipments/SHP001?role=customer">Open SHP001 (Customer)</Link>
      </div>
    </section>
  );
};

export default Shipments;
