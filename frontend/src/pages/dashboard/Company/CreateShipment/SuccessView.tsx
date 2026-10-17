import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface SuccessViewProps {
  shipmentId: string;
  onCreateAnother: () => void;
}

const SuccessView: React.FC<SuccessViewProps> = ({ shipmentId, onCreateAnother }) => {
  const navigate = useNavigate();

  return (
    <div className="px-6 py-8 bg-[#050505] text-slate-100 min-h-[calc(100vh-80px)] flex flex-col items-center justify-center sm:p-4">
      <div className="bg-[#14171E] border border-slate-800 rounded-xl p-12 max-w-[500px] w-full text-center shadow-lg sm:px-5 sm:py-8">
        <CheckCircle2 size={64} className="text-green-500 mb-4 mx-auto" color="#22c55e" />
        <h2 className="text-2xl font-semibold text-slate-100 mb-2">Shipment Created Successfully!</h2>
        <p className="text-slate-400 text-[15px] mb-8">Your shipment has been registered on the blockchain.</p>
        <div className="bg-[#0b0e14] border border-dashed border-blue-500 rounded-lg p-4 mb-8 flex flex-col gap-2">
          <span className="text-slate-400 text-xs uppercase tracking-wider">Shipment ID:</span>
          <span className="text-blue-500 text-xl font-semibold font-mono">{shipmentId}</span>
        </div>
        <div className="flex flex-col gap-3">
          <button
            className="w-full bg-blue-600 border border-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all hover:bg-blue-700 hover:border-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => navigate('/dashboard/shipments')}
          >
            View Shipment
          </button>
          <button
            className="w-full bg-transparent border border-slate-800 text-slate-100 px-6 py-3 rounded-lg text-sm font-medium transition-all hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={onCreateAnother}
          >
            Create Another
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessView;
