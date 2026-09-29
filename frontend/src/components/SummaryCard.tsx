import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon }) => {
  return (
    <div className="summary-card">
      <div className="card-icon">{icon}</div>
      <div className="card-title">{title}</div>
      <div className="card-value">{value}</div>
    </div>
  );
};