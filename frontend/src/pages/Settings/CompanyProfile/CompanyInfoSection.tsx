import React from 'react';
import { Building2 } from 'lucide-react';
import SectionCard from './SectionCard';

interface CompanyInfoData {
  name: string;
  registrationNumber: string;
  industry: string;
}

interface CompanyInfoSectionProps {
  data: CompanyInfoData;
  errors: Record<string, string>;
  dirty: boolean;
  inputClassName: string;
  onChange: (updates: Partial<CompanyInfoData>) => void;
  onSave: () => void;
}

const CompanyInfoSection: React.FC<CompanyInfoSectionProps> = ({
  data,
  errors,
  dirty,
  inputClassName,
  onChange,
  onSave,
}) => (
  <SectionCard
    title="Company Info"
    description="Share the basic identity details for your company profile."
    icon={<Building2 size={18} />}
    dirty={dirty}
    onSave={onSave}
  >
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label htmlFor="company-name" className="mb-2 block text-sm text-slate-400">
          Company name
        </label>
        <input
          id="company-name"
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className={inputClassName}
          placeholder="YieldVault"
        />
        {errors.name && <p className="mt-1 text-sm text-rose-400">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor="registration-number" className="mb-2 block text-sm text-slate-400">
          Registration number
        </label>
        <input
          id="registration-number"
          value={data.registrationNumber}
          onChange={(e) => onChange({ registrationNumber: e.target.value })}
          className={inputClassName}
          placeholder="RC123456"
        />
        {errors.registrationNumber && (
          <p className="mt-1 text-sm text-rose-400">{errors.registrationNumber}</p>
        )}
      </div>
      <div className="md:col-span-2">
        <label htmlFor="industry" className="mb-2 block text-sm text-slate-400">
          Industry
        </label>
        <input
          id="industry"
          value={data.industry}
          onChange={(e) => onChange({ industry: e.target.value })}
          className={inputClassName}
          placeholder="Logistics"
        />
        {errors.industry && <p className="mt-1 text-sm text-rose-400">{errors.industry}</p>}
      </div>
    </div>
  </SectionCard>
);

export default CompanyInfoSection;
