// frontend/src/pages/ShipmentDetail/ShipmentMap/ShipmentMap.tsx
import React from 'react';
import './ShipmentMap.css';

interface Coords {
  lat: number;
  lng: number;
}

interface ShipmentMapProps {
  origin: string;
  destination: string;
  originCoords?: Coords;
  destinationCoords?: Coords;
}

const ShipmentMap: React.FC<ShipmentMapProps> = ({ origin, destination }) => {
  return (
    <div className="shipment-map-container">
      <div className="map-header">
        <h3 className="map-title">MAP <span className="highlight">VIEW</span></h3>
        <div className="map-stats">
          <div className="stat">
            <span className="label">ORIGIN:</span>
            <span className="value">{origin}</span>
          </div>
          <div className="stat">
            <span className="label">DESTINATION:</span>
            <span className="value">{destination}</span>
          </div>
        </div>
      </div>
      
      <div className="map-placeholder">
        <img 
          src="/images/map-placeholder.png" 
          alt="Shipment Route Map" 
          className="map-image"
        />
        <div className="map-overlay">
          <div className="route-glow"></div>
          <button aria-label="View full map" className="view-full-map-btn" onClick={() => {}}>
            VIEW FULL MAP
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShipmentMap;
