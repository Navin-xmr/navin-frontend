import React from 'react';
import { ArrowLeft, Loader2, Book } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Combobox from '@components/ui/Combobox';
import type { ComboboxOption } from '@components/ui/Combobox';
import CostBreakdown from '@components/shipment/CostBreakdown';
import type { CostBreakdownData } from '@components/shipment/CostBreakdown';
import type { FormData, FormErrors } from './useShipmentForm';

const inputClasses = (hasError: boolean) =>
  `w-full bg-[#0b0e14] border rounded-lg px-4 py-3 text-slate-100 text-sm font-sans transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-600 ${
    hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-800 focus:border-blue-500'
  }`;

export interface ShipmentFormProps {
  formData: FormData;
  errors: FormErrors;
  loading: boolean;
  addressOptions: ComboboxOption[];
  addressesLoading: boolean;
  costEstimate: CostBreakdownData | null;
  isEstimating: boolean;
  lastSavedAt: Date | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onOriginChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onOriginSelect: (option: ComboboxOption) => void;
  onDestinationSelect: (option: ComboboxOption) => void;
  onOriginBlur: () => void;
  onDestinationBlur: () => void;
  onOpenAddressBookOrigin: () => void;
  onOpenAddressBookDestination: () => void;
  onOpenSaveModal: () => void;
}

const ShipmentForm: React.FC<ShipmentFormProps> = ({
  formData,
  errors,
  loading,
  addressOptions,
  addressesLoading,
  costEstimate,
  isEstimating,
  lastSavedAt,
  onInputChange,
  onBlur,
  onSubmit,
  onOriginChange,
  onDestinationChange,
  onOriginSelect,
  onDestinationSelect,
  onOriginBlur,
  onDestinationBlur,
  onOpenAddressBookOrigin,
  onOpenAddressBookDestination,
  onOpenSaveModal,
}) => {
  const navigate = useNavigate();

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {/* Origin */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="origin" className="text-sm font-medium text-slate-100">Origin Address</label>
          <button
            type="button"
            className="inline-flex items-center gap-1 bg-transparent border border-blue-500 text-blue-500 text-xs px-2 py-0.5 rounded cursor-pointer transition-all hover:bg-blue-500/15"
            onClick={onOpenAddressBookOrigin}
          >
            <Book size={12} />
            Address Book
          </button>
        </div>
        <Combobox
          id="origin"
          name="origin"
          value={formData.origin}
          onChange={onOriginChange}
          onSelectOption={onOriginSelect}
          onBlur={onOriginBlur}
          options={addressOptions}
          placeholder="Search or type an address..."
          ariaLabel="Origin address"
          isLoading={addressesLoading}
          noResultsMessage="No matching addresses. Keep typing or enter a new one."
          loadingMessage="Loading your saved addresses…"
          className={errors.origin ? '[&_input]:border-red-500 [&_input]:focus:border-red-400' : ''}
        />
        {errors.origin && <span id="origin-error" className="text-red-500 text-xs -mt-1" role="alert">{errors.origin}</span>}
      </div>

      {/* Destination */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="destination" className="text-sm font-medium text-slate-100">Destination Address</label>
          <button
            type="button"
            className="inline-flex items-center gap-1 bg-transparent border border-blue-500 text-blue-500 text-xs px-2 py-0.5 rounded cursor-pointer transition-all hover:bg-blue-500/15"
            onClick={onOpenAddressBookDestination}
          >
            <Book size={12} />
            Address Book
          </button>
        </div>
        <Combobox
          id="destination"
          name="destination"
          value={formData.destination}
          onChange={onDestinationChange}
          onSelectOption={onDestinationSelect}
          onBlur={onDestinationBlur}
          options={addressOptions}
          placeholder="Search or type an address..."
          ariaLabel="Destination address"
          isLoading={addressesLoading}
          noResultsMessage="No matching addresses. Keep typing or enter a new one."
          loadingMessage="Loading your saved addresses…"
          className={errors.destination ? '[&_input]:border-red-500 [&_input]:focus:border-red-400' : ''}
        />
        {errors.destination && <span id="destination-error" className="text-red-500 text-xs -mt-1" role="alert">{errors.destination}</span>}
      </div>

      {/* Item Description */}
      <div className="flex flex-col gap-2">
        <label htmlFor="itemDescription" className="text-sm font-medium text-slate-100">Item Description</label>
        <textarea
          id="itemDescription"
          name="itemDescription"
          value={formData.itemDescription}
          onChange={onInputChange}
          onBlur={onBlur}
          aria-invalid={!!errors.itemDescription}
          aria-describedby={errors.itemDescription ? 'itemDescription-error' : undefined}
          className={inputClasses(!!errors.itemDescription)}
          placeholder="Describe the items being shipped..."
          rows={3}
        />
        {errors.itemDescription && <span id="itemDescription-error" className="text-red-500 text-xs -mt-1" role="alert">{errors.itemDescription}</span>}
      </div>

      {/* Weight + Delivery Date */}
      <div className="flex gap-6 sm:flex-col sm:gap-6">
        <div className="flex flex-col gap-2 flex-1">
          <label htmlFor="weight" className="text-sm font-medium text-slate-100">Weight (kg)</label>
          <input
            type="number"
            id="weight"
            name="weight"
            value={formData.weight}
            onChange={onInputChange}
            onBlur={onBlur}
            aria-invalid={!!errors.weight}
            aria-describedby={errors.weight ? 'weight-error' : undefined}
            className={inputClasses(!!errors.weight)}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
          {errors.weight && <span id="weight-error" className="text-red-500 text-xs -mt-1" role="alert">{errors.weight}</span>}
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <label htmlFor="expectedDeliveryDate" className="text-sm font-medium text-slate-100">Expected Delivery Date</label>
          <input
            type="date"
            id="expectedDeliveryDate"
            name="expectedDeliveryDate"
            value={formData.expectedDeliveryDate}
            onChange={onInputChange}
            onBlur={onBlur}
            aria-invalid={!!errors.expectedDeliveryDate}
            aria-describedby={errors.expectedDeliveryDate ? 'expectedDeliveryDate-error' : undefined}
            className={inputClasses(!!errors.expectedDeliveryDate)}
          />
          {errors.expectedDeliveryDate && <span id="expectedDeliveryDate-error" className="text-red-500 text-xs -mt-1" role="alert">{errors.expectedDeliveryDate}</span>}
        </div>
      </div>

      {/* Recipient */}
      <div className="flex gap-6 sm:flex-col sm:gap-6">
        <div className="flex flex-col gap-2 flex-1">
          <label htmlFor="recipientName" className="text-sm font-medium text-slate-100">Recipient Name</label>
          <input
            type="text"
            id="recipientName"
            name="recipientName"
            value={formData.recipientName}
            onChange={onInputChange}
            onBlur={onBlur}
            aria-invalid={!!errors.recipientName}
            aria-describedby={errors.recipientName ? 'recipientName-error' : undefined}
            className={inputClasses(!!errors.recipientName)}
            placeholder="John Doe"
          />
          {errors.recipientName && <span id="recipientName-error" className="text-red-500 text-xs -mt-1" role="alert">{errors.recipientName}</span>}
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <label htmlFor="recipientContact" className="text-sm font-medium text-slate-100">Recipient Contact</label>
          <input
            type="text"
            id="recipientContact"
            name="recipientContact"
            value={formData.recipientContact}
            onChange={onInputChange}
            onBlur={onBlur}
            aria-invalid={!!errors.recipientContact}
            aria-describedby={errors.recipientContact ? 'recipientContact-error' : undefined}
            className={inputClasses(!!errors.recipientContact)}
            placeholder="Phone or Email"
          />
          {errors.recipientContact && <span id="recipientContact-error" className="text-red-500 text-xs -mt-1" role="alert">{errors.recipientContact}</span>}
        </div>
      </div>

      <CostBreakdown data={costEstimate} isLoading={isEstimating} mode="estimate" />

      <p className="m-0 mt-1 text-xs text-slate-500" aria-live="polite">
        {lastSavedAt
          ? `Draft saved ${lastSavedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
          : 'Your progress is saved automatically as you type.'}
      </p>

      <div className="flex justify-end gap-4 mt-4 pt-6 border-t border-slate-800 sm:flex-col-reverse">
        <button
          type="button"
          className="bg-transparent border border-slate-800 text-slate-100 px-6 py-3 rounded-lg text-sm font-medium transition-all hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed sm:w-full"
          onClick={() => navigate(-1)}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="button"
          className="bg-transparent border border-slate-700 text-slate-300 px-6 py-3 rounded-lg text-sm font-medium transition-all hover:bg-slate-800 hover:text-slate-100 disabled:opacity-60 disabled:cursor-not-allowed sm:w-full flex items-center justify-center gap-2"
          onClick={onOpenSaveModal}
          disabled={loading}
        >
          Save as Template
        </button>
        <button
          type="submit"
          className="bg-blue-600 border border-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all hover:bg-blue-700 hover:border-blue-700 disabled:opacity-60 disabled:cursor-not-allowed sm:w-full flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Processing...</span>
            </>
          ) : (
            'Create Shipment'
          )}
        </button>
      </div>
    </form>
  );
};

export default ShipmentForm;
