import React, { useState } from 'react';
import './MilestoneTimeline.css';

export interface MilestoneDetail {
  id: string;
  name: string;
  timestamp: string;
  location: string;
  blockchainAddress: string;
  status: 'completed' | 'current' | 'upcoming';
  notes?: string;
  sensorReadings?: {
    temperature?: string;
    humidity?: string;
    pressure?: string;
    [key: string]: string | undefined;
  };
}

export interface MilestoneTimelineProps {
  milestones: MilestoneDetail[];
}

const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({ milestones }) => {
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedMilestones((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const truncateAddress = (address: string): string => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 5)}...${address.slice(-4)}`;
  };

  const getStatusIcon = (status: MilestoneDetail['status']) => {
    switch (status) {
      case 'completed':
        return (
          <svg
            className="milestone-icon milestone-icon-completed"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Completed"
          >
            <circle cx="16" cy="16" r="14" fill="currentColor" />
            <path
              d="M10 16l5 5 7-9"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'current':
        return (
          <svg
            className="milestone-icon milestone-icon-current"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Current"
          >
            <circle cx="16" cy="16" r="14" fill="currentColor" />
            <circle cx="16" cy="16" r="6" fill="white" />
          </svg>
        );
      case 'upcoming':
        return (
          <svg
            className="milestone-icon milestone-icon-upcoming"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Upcoming"
          >
            <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2.5" fill="none" />
          </svg>
        );
    }
  };

  const hasExpandableContent = (milestone: MilestoneDetail): boolean => {
    return !!(milestone.notes || milestone.sensorReadings);
  };

  return (
    <div className="milestone-timeline" role="list" aria-label="Detailed shipment milestone timeline">
      {milestones.map((milestone, index) => {
        const isExpanded = expandedMilestones.has(milestone.id);
        const canExpand = hasExpandableContent(milestone);

        return (
          <div
            key={milestone.id}
            className={`milestone-item milestone-item-${milestone.status}`}
            role="listitem"
          >
            <div className="milestone-marker">
              {getStatusIcon(milestone.status)}
              {index < milestones.length - 1 && (
                <div
                  className={`milestone-connector ${
                    milestone.status === 'completed'
                      ? 'milestone-connector-solid'
                      : 'milestone-connector-dashed'
                  }`}
                  aria-hidden="true"
                />
              )}
            </div>
            <div className="milestone-content-wrapper">
              <div className="milestone-content">
                <div className="milestone-header">
                  <h3 className="milestone-name">{milestone.name}</h3>
                  {canExpand && (
                    <button
                      className="milestone-expand-btn"
                      onClick={() => toggleExpanded(milestone.id)}
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`expand-icon ${isExpanded ? 'expanded' : ''}`}
                      >
                        <path
                          d="M5 7.5L10 12.5L15 7.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="milestone-info">
                  <p className="milestone-timestamp">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="info-icon"
                      aria-hidden="true"
                    >
                      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M8 4v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    {milestone.timestamp}
                  </p>
                  <p className="milestone-location">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="info-icon"
                      aria-hidden="true"
                    >
                      <path
                        d="M8 1C5.79 1 4 2.79 4 5c0 3 4 8 4 8s4-5 4-8c0-2.21-1.79-4-4-4z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                      />
                      <circle cx="8" cy="5" r="1.5" fill="currentColor" />
                    </svg>
                    {milestone.location}
                  </p>
                  <p className="milestone-address">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="info-icon"
                      aria-hidden="true"
                    >
                      <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                      <path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span className="address-label">Blockchain:</span>
                    <code className="address-code">{truncateAddress(milestone.blockchainAddress)}</code>
                  </p>
                </div>

                {canExpand && isExpanded && (
                  <div className="milestone-details">
                    {milestone.notes && (
                      <div className="detail-section">
                        <h4 className="detail-title">Notes</h4>
                        <p className="detail-text">{milestone.notes}</p>
                      </div>
                    )}
                    {milestone.sensorReadings && (
                      <div className="detail-section">
                        <h4 className="detail-title">Sensor Readings</h4>
                        <div className="sensor-grid">
                          {Object.entries(milestone.sensorReadings).map(([key, value]) => (
                            value && (
                              <div key={key} className="sensor-item">
                                <span className="sensor-label">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                                <span className="sensor-value">{value}</span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MilestoneTimeline;
