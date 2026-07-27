import React, { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Modal from "../../../components/common/Modal/Modal";
import CopyToClipboard from "../../../components/ui/CopyToClipboard";
import { Download } from "lucide-react";

interface ShareQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackingNumber: string;
}

const ShareQRCodeModal: React.FC<ShareQRCodeModalProps> = ({
  isOpen,
  onClose,
  trackingNumber,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const trackingUrl = `https://app.navin.io/track/${trackingNumber}`;

  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `shipment-${trackingNumber}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Tracking QR Code" size="sm">
      <div className="flex flex-col items-center gap-5">
        <div ref={canvasRef} className="bg-white p-4 rounded-xl">
          <QRCodeCanvas value={trackingUrl} size={200} level="M" />
        </div>

        <div className="w-full flex items-center gap-2 bg-background-elevated rounded-lg px-3 py-2">
          <span className="flex-1 text-xs text-text-secondary truncate">
            {trackingUrl}
          </span>
          <CopyToClipboard value={trackingUrl} label="Copy link" size="sm" className="shrink-0 border-border/50 text-text-secondary hover:text-text-primary" />
        </div>

        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors duration-200"
        >
          <Download className="w-4 h-4" />
          Download QR
        </button>
      </div>
    </Modal>
  );
};

export default ShareQRCodeModal;