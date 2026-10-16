import React from 'react';
import { MapPin } from 'lucide-react';
import SectionCard from './SectionCard';

interface AddressData {
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface AddressSectionProps {
  data: AddressData;
  errors: Record<string, string>;
  dirty: boolean;
  inputClassName: string;
  onChange: (updates: Partial<AddressData>) => void;
  onSave: () => void;
}

const AddressSection: React.FC<AddressSectionProps> = ({
  data,
  errors,
  dirty,
  inputClassName,
  onChange,
  onSave,
}) => (
  <SectionCard
    title="Address"
    description="Provide the primary business address for verified records."
    icon={<MapPin size={18} />}
    dirty={dirty}
    onSave={onSave}
  >
    <div className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <label htmlFor="address-line1" className="mb-2 block text-sm text-slate-400">
          Address line 1
        </label>
        <input
          id="address-line1"
          value={data.addressLine1}
          onChange={(e) => onChange({ addressLine1: e.target.value })}
          className={inputClassName}
          placeholder="42 Marina Road"
        />
        {errors.addressLine1 && (
          <p className="mt-1 text-sm text-rose-400">{errors.addressLine1}</p>
        )}
      </div>
      <div>
        <label htmlFor="address-city" className="mb-2 block text-sm text-slate-400">
          City
        </label>
        <input
          id="address-city"
          value={data.city}
          onChange={(e) => onChange({ city: e.target.value })}
          className={inputClassName}
          placeholder="Lagos"
        />
        {errors.city && <p className="mt-1 text-sm text-rose-400">{errors.city}</p>}
      </div>
      <div>
        <label htmlFor="address-state" className="mb-2 block text-sm text-slate-400">
          State / Province
        </label>
        <input
          id="address-state"
          value={data.state}
          onChange={(e) => onChange({ state: e.target.value })}
          className={inputClassName}
          placeholder="Lagos State"
        />
      </div>
      <div>
        <label htmlFor="address-postal-code" className="mb-2 block text-sm text-slate-400">
          Postal code
        </label>
        <input
          id="address-postal-code"
          value={data.postalCode}
          onChange={(e) => onChange({ postalCode: e.target.value })}
          className={inputClassName}
          placeholder="100001"
        />
      </div>
      <div>
        <label htmlFor="address-country" className="mb-2 block text-sm text-slate-400">
          Country
        </label>
        <input
          id="address-country"
          value={data.country}
          onChange={(e) => onChange({ country: e.target.value })}
          className={inputClassName}
          placeholder="Nigeria"
        />
        {errors.country && <p className="mt-1 text-sm text-rose-400">{errors.country}</p>}
      </div>
    </div>
  </SectionCard>
);

export default AddressSection;
