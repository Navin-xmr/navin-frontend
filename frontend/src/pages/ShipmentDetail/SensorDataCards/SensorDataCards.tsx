import React from "react";
import { Thermometer, Droplets, MapPin, AlertTriangle } from "lucide-react";

export interface SensorData {
  temperature?: {
    value: number;
    unit: string;
    lastUpdated: string;
  };
  humidity?: {
    value: number;
    unit: string;
    lastUpdated: string;
  };
  gps?: {
    latitude: number;
    longitude: number;
    lastUpdated: string;
  };
  shockTilt?: {
    eventCount: number;
    lastUpdated: string;
  };
}

export interface SensorDataCardsProps {
  sensorData?: SensorData | null;
}

interface SensorCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  lastUpdated: string;
}

const SensorCard: React.FC<SensorCardProps> = ({
  icon,
  label,
  value,
  subValue,
  lastUpdated,
}) => (
  <div className="bg-[rgba(0,0,0,0.2)] rounded-2xl border border-[rgba(255,255,255,0.05)] p-5 flex flex-col gap-3 hover:border-[rgba(0,212,200,0.3)] transition-colors">
    <div className="flex items-center gap-3">
      <div className="bg-[rgba(0,212,200,0.15)] rounded-xl w-11 h-11 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <span className="text-[rgba(255,255,255,0.6)] text-sm font-medium">{label}</span>
    </div>
    <div className="flex flex-col gap-1">
      <p className="text-white text-2xl font-semibold m-0">
        {value}
        {subValue && (
          <span className="text-[#00d4c8] text-lg ml-1">{subValue}</span>
        )}
      </p>
      <p className="text-[rgba(255,255,255,0.4)] text-xs m-0">
        Last updated: {lastUpdated}
      </p>
    </div>
  </div>
);

const SensorDataCards: React.FC<SensorDataCardsProps> = ({ sensorData }) => {
  const formatCoordinate = (coord: number, type: "lat" | "lng"): string => {
    const direction = type === "lat" ? (coord >= 0 ? "N" : "S") : (coord >= 0 ? "E" : "W");
    return `${Math.abs(coord).toFixed(4)}° ${direction}`;
  };

  const hasAnyData = sensorData && (
    sensorData.temperature ||
    sensorData.humidity ||
    sensorData.gps ||
    sensorData.shockTilt
  );

  return (
    <div className="bg-[rgba(8,40,50,0.4)] border-[1.5px] border-[rgba(0,180,160,0.3)] rounded-3xl px-8 py-12 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)] mt-8 md:px-5 md:py-8 md:rounded-2xl sm:px-4 sm:py-6">
      <h2 className="font-['Bebas_Neue',sans-serif] text-[clamp(1.75rem,4vw,2.5rem)] font-normal tracking-[0.04em] leading-[1.2] text-white text-center mb-8">
        SENSOR <span className="text-[#00d4c8]">DATA</span>
      </h2>

      {hasAnyData ? (
        <div className="grid grid-cols-4 gap-4 lg:grid-cols-2 sm:grid-cols-2">
          {/* Temperature Card */}
          {sensorData.temperature ? (
            <SensorCard
              icon={<Thermometer className="w-5 h-5 text-[#00d4c8]" />}
              label="Temperature"
              value={`${sensorData.temperature.value}`}
              subValue={sensorData.temperature.unit}
              lastUpdated={sensorData.temperature.lastUpdated}
            />
          ) : (
            <div className="bg-[rgba(0,0,0,0.2)] rounded-2xl border border-[rgba(255,255,255,0.05)] p-5 flex items-center justify-center">
              <p className="text-[rgba(255,255,255,0.3)] text-sm m-0">No temperature data</p>
            </div>
          )}

          {/* Humidity Card */}
          {sensorData.humidity ? (
            <SensorCard
              icon={<Droplets className="w-5 h-5 text-[#00d4c8]" />}
              label="Humidity"
              value={`${sensorData.humidity.value}`}
              subValue={sensorData.humidity.unit}
              lastUpdated={sensorData.humidity.lastUpdated}
            />
          ) : (
            <div className="bg-[rgba(0,0,0,0.2)] rounded-2xl border border-[rgba(255,255,255,0.05)] p-5 flex items-center justify-center">
              <p className="text-[rgba(255,255,255,0.3)] text-sm m-0">No humidity data</p>
            </div>
          )}

          {/* GPS Location Card */}
          {sensorData.gps ? (
            <SensorCard
              icon={<MapPin className="w-5 h-5 text-[#00d4c8]" />}
              label="GPS Location"
              value={formatCoordinate(sensorData.gps.latitude, "lat")}
              subValue={formatCoordinate(sensorData.gps.longitude, "lng")}
              lastUpdated={sensorData.gps.lastUpdated}
            />
          ) : (
            <div className="bg-[rgba(0,0,0,0.2)] rounded-2xl border border-[rgba(255,255,255,0.05)] p-5 flex items-center justify-center">
              <p className="text-[rgba(255,255,255,0.3)] text-sm m-0">No GPS data</p>
            </div>
          )}

          {/* Shock/Tilt Events Card */}
          {sensorData.shockTilt ? (
            <SensorCard
              icon={<AlertTriangle className="w-5 h-5 text-[#00d4c8]" />}
              label="Shock/Tilt Events"
              value={`${sensorData.shockTilt.eventCount}`}
              subValue="events"
              lastUpdated={sensorData.shockTilt.lastUpdated}
            />
          ) : (
            <div className="bg-[rgba(0,0,0,0.2)] rounded-2xl border border-[rgba(255,255,255,0.05)] p-5 flex items-center justify-center">
              <p className="text-[rgba(255,255,255,0.3)] text-sm m-0">No shock/tilt data</p>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[rgba(0,0,0,0.2)] rounded-2xl border border-[rgba(255,255,255,0.05)] px-8 py-12 flex flex-col items-center text-center">
          <div className="bg-[rgba(255,255,255,0.05)] rounded-full w-20 h-20 flex items-center justify-center mb-6">
            <Thermometer className="w-10 h-10 text-[rgba(255,255,255,0.3)]" />
          </div>
          <h3 className="text-white text-xl font-semibold m-0 mb-2">No Sensor Data Available</h3>
          <p className="text-[rgba(255,255,255,0.5)] text-base m-0 max-w-md">
            IoT sensor readings will appear here once the shipment tracking devices start transmitting data.
          </p>
        </div>
      )}
    </div>
  );
};

export default SensorDataCards;