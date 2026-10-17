import React from 'react';
import ShipmentsExportButton from './ShipmentsExportButton';
import { ShipmentsViewToggle, type ShipmentsView } from './ShipmentsViewToggle';

interface ShipmentsHeaderProps {
  view: ShipmentsView;
  isExporting: boolean;
  exportDisabled: boolean;
  onViewChange: (next: ShipmentsView) => void;
  onExportCSV: () => void;
}

const ShipmentsHeader: React.FC<ShipmentsHeaderProps> = ({
  view,
  isExporting,
  exportDisabled,
  onViewChange,
  onExportCSV,
}) => (
  <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
    <h1 className="text-2xl font-semibold m-0">Shipments</h1>
    <div className="flex items-center gap-3">
      <ShipmentsViewToggle view={view} onViewChange={onViewChange} />
      <ShipmentsExportButton
        isExporting={isExporting}
        disabled={exportDisabled}
        onExport={onExportCSV}
      />
    </div>
  </div>
);

export default ShipmentsHeader;
