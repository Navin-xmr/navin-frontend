import React from 'react';
import { Wifi } from 'lucide-react';
import { useTelemetry } from './hooks/useTelemetry';
import IoTSummaryCards from './IoTSummaryCards';
import TemperatureHumidityChart from './TemperatureHumidityChart';
import GPSRouteMap from './GPSRouteMap';
import ShockEventsTimeline from './ShockEventsTimeline';
import AnomalyAlertBanner from './AnomalyAlertBanner';

interface Props {
  shipmentId: string;
  hasIoTDevice: boolean;
}

const SkeletonCard: React.FC = () => (
  <div className="rounded-xl border border-border bg-background-card p-4 animate-pulse">
    <div className="h-4 bg-background-elevated rounded w-1/2 mb-3" />
    <div className="h-8 bg-background-elevated rounded w-2/3" />
  </div>
);

const IoTPanel: React.FC<Props> = ({ shipmentId, hasIoTDevice }) => {
  const { latestReading, history, isLoading, error, hasAnomalies, timeRange, setTimeRange } =
    useTelemetry(shipmentId);

  if (!hasIoTDevice) {
    return (
      <div className="flex items-center gap-3 p-6 rounded-2xl border border-dashed border-border text-text-secondary text-sm mt-8">
        <Wifi size={20} className="opacity-40" />
        No IoT tracker attached to this shipment
      </div>
    );
  }

  return (
    <section className="mt-8" aria-labelledby="iot-panel-heading">
      <h2
        id="iot-panel-heading"
        className="font-['Bebas_Neue',sans-serif] text-[clamp(1.75rem,4vw,2.5rem)] font-normal tracking-[0.04em] text-white text-center mb-6"
      >
        IoT <span className="text-[#00d4c8]">SENSOR DATA</span>
      </h2>

      <div className="bg-[rgba(8,40,50,0.4)] border border-[rgba(0,180,160,0.3)] rounded-3xl p-6 backdrop-blur-md flex flex-col gap-8">
        {/* Anomaly banner */}
        {!isLoading && latestReading && hasAnomalies && (
          <AnomalyAlertBanner reading={latestReading} />
        )}

        {/* Error state */}
        {error && (
          <p className="text-sm text-red-400 text-center">{error}</p>
        )}

        {/* Summary cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : latestReading ? (
          <IoTSummaryCards reading={latestReading} />
        ) : null}

        {/* Temperature & humidity chart */}
        <div>
          <h3 className="text-base font-semibold text-text-primary mb-3">Temperature & Humidity History</h3>
          {isLoading ? (
            <div className="h-[280px] bg-background-elevated rounded-xl animate-pulse" />
          ) : (
            <TemperatureHumidityChart
              records={history}
              timeRange={timeRange}
              onRangeChange={setTimeRange}
            />
          )}
        </div>

        {/* GPS route map */}
        <div>
          <h3 className="text-base font-semibold text-text-primary mb-3">GPS Route</h3>
          {isLoading ? (
            <div className="h-[320px] bg-background-elevated rounded-xl animate-pulse" />
          ) : (
            <GPSRouteMap records={history} />
          )}
        </div>

        {/* Shock events */}
        <div>
          <h3 className="text-base font-semibold text-text-primary mb-3">Shock Events</h3>
          {isLoading ? (
            <div className="h-20 bg-background-elevated rounded-xl animate-pulse" />
          ) : (
            <ShockEventsTimeline records={history} />
          )}
        </div>
      </div>
    </section>
  );
};

export default IoTPanel;
