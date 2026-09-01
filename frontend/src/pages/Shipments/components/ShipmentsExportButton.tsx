import { Download, Loader2 } from 'lucide-react';

interface ShipmentsExportButtonProps {
  isExporting: boolean;
  disabled: boolean;
  onExport: () => void;
}

/**
 * Primary "Export CSV" button for the shipments page.
 *
 * Extracted from the Shipments page (issue #635).
 */
export function ShipmentsExportButton({ isExporting, disabled, onExport }: ShipmentsExportButtonProps) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 px-4 py-2 bg-transparent border border-[rgba(98,255,255,0.3)] rounded-lg text-[#62ffff] text-sm font-medium cursor-pointer transition-colors enabled:hover:bg-[rgba(98,255,255,0.08)] enabled:hover:border-[rgba(98,255,255,0.5)] disabled:opacity-[0.45] disabled:cursor-not-allowed"
      onClick={onExport}
      disabled={disabled}
      aria-label="Export shipments to CSV"
    >
      {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
      {isExporting ? 'Exporting' : 'Export CSV'}
    </button>
  );
}

export default ShipmentsExportButton;