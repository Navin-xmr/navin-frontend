import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Step1Data, Step1Errors } from './useCompanyRegister';

export const INDUSTRIES = [
  'Agriculture', 'Automotive', 'Construction', 'Education', 'Energy & Utilities',
  'Finance & Banking', 'Food & Beverage', 'Healthcare', 'Hospitality & Tourism',
  'Logistics & Supply Chain', 'Manufacturing', 'Media & Entertainment',
  'Mining & Resources', 'Pharmaceuticals', 'Real Estate', 'Retail & E-commerce',
  'Technology & Software', 'Telecommunications', 'Transportation', 'Other',
];

export const COUNTRIES = [
  'Australia', 'Brazil', 'Canada', 'China', 'Egypt', 'France', 'Germany', 'Ghana',
  'India', 'Indonesia', 'Japan', 'Kenya', 'Mexico', 'Netherlands', 'Nigeria',
  'Norway', 'Pakistan', 'Saudi Arabia', 'Singapore', 'South Africa', 'South Korea',
  'Spain', 'Sweden', 'United Arab Emirates', 'United Kingdom', 'United States', 'Other',
];

export const COMPANY_SIZES = ['1–10', '11–50', '51–200', '201–500', '501–1,000', '1,000+'];

export const inputBase =
  'w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3.5 text-white text-base transition-all box-border focus:outline-none focus:border-[#00DAC1] focus:bg-[rgba(255,255,255,0.08)] focus:shadow-[0_0_0_4px_rgba(0,218,193,0.1)]';

export const selectBase =
  'w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3.5 text-white text-base transition-all box-border focus:outline-none focus:border-[#00DAC1] focus:bg-[rgba(255,255,255,0.08)] focus:shadow-[0_0_0_4px_rgba(0,218,193,0.1)] appearance-none cursor-pointer';

export const labelClass = 'text-[0.85rem] font-medium text-[rgba(255,255,255,0.6)] ml-1';
export const errorClass = 'text-[#FF4D4D] text-[0.75rem] mt-1 ml-1';

export const SelectWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="relative">
    {children}
    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[rgba(255,255,255,0.4)]">
      <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
        <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  </div>
);

export interface Step1CompanyInfoProps {
  data: Step1Data;
  errors: Step1Errors;
  onChange: (data: Step1Data) => void;
  onClearError: (field: keyof Step1Errors) => void;
  onNext: () => void;
}

const Step1CompanyInfo: React.FC<Step1CompanyInfoProps> = ({ data, errors, onChange, onClearError, onNext }) => {
  const { t } = useTranslation('auth');

  return (
    <div className="flex flex-col gap-5">
      {/* Company Name */}
      <div className="flex flex-col gap-2">
        <label htmlFor="companyName" className={labelClass}>{t('companyRegister.companyNameLabel')}</label>
        <input
          type="text"
          id="companyName"
          placeholder={t('companyRegister.companyNamePlaceholder')}
          value={data.companyName}
          onChange={(e) => { onChange({ ...data, companyName: e.target.value }); onClearError('companyName'); }}
          aria-invalid={!!errors.companyName}
          aria-describedby={errors.companyName ? 'companyName-error' : undefined}
          className={`${inputBase} pr-4 ${errors.companyName ? 'border-[#FF4D4D]' : ''}`}
        />
        {errors.companyName && <span id="companyName-error" className={errorClass} role="alert">{errors.companyName}</span>}
      </div>

      {/* Industry */}
      <div className="flex flex-col gap-2">
        <label htmlFor="industry" className={labelClass}>{t('companyRegister.industryLabel')}</label>
        <SelectWrapper>
          <select
            id="industry"
            value={data.industry}
            onChange={(e) => { onChange({ ...data, industry: e.target.value }); onClearError('industry'); }}
            aria-invalid={!!errors.industry}
            aria-describedby={errors.industry ? 'industry-error' : undefined}
            className={`${selectBase} ${errors.industry ? 'border-[#FF4D4D]' : ''} ${!data.industry ? 'text-[rgba(255,255,255,0.4)]' : ''}`}
          >
            <option value="" disabled className="bg-[#121620] text-[rgba(255,255,255,0.4)]">{t('companyRegister.selectIndustry')}</option>
            {INDUSTRIES.map((ind) => <option key={ind} value={ind} className="bg-[#121620] text-white">{ind}</option>)}
          </select>
        </SelectWrapper>
        {errors.industry && <span id="industry-error" className={errorClass} role="alert">{errors.industry}</span>}
      </div>

      {/* Country */}
      <div className="flex flex-col gap-2">
        <label htmlFor="country" className={labelClass}>{t('companyRegister.countryLabel')}</label>
        <SelectWrapper>
          <select
            id="country"
            value={data.country}
            onChange={(e) => { onChange({ ...data, country: e.target.value }); onClearError('country'); }}
            aria-invalid={!!errors.country}
            aria-describedby={errors.country ? 'country-error' : undefined}
            className={`${selectBase} ${errors.country ? 'border-[#FF4D4D]' : ''} ${!data.country ? 'text-[rgba(255,255,255,0.4)]' : ''}`}
          >
            <option value="" disabled className="bg-[#121620] text-[rgba(255,255,255,0.4)]">{t('companyRegister.selectCountry')}</option>
            {COUNTRIES.map((c) => <option key={c} value={c} className="bg-[#121620] text-white">{c}</option>)}
          </select>
        </SelectWrapper>
        {errors.country && <span id="country-error" className={errorClass} role="alert">{errors.country}</span>}
      </div>

      {/* Company Size */}
      <div className="flex flex-col gap-2">
        <label htmlFor="companySize" className={labelClass}>{t('companyRegister.companySizeLabel')}</label>
        <SelectWrapper>
          <select
            id="companySize"
            value={data.companySize}
            onChange={(e) => { onChange({ ...data, companySize: e.target.value }); onClearError('companySize'); }}
            aria-invalid={!!errors.companySize}
            aria-describedby={errors.companySize ? 'companySize-error' : undefined}
            className={`${selectBase} ${errors.companySize ? 'border-[#FF4D4D]' : ''} ${!data.companySize ? 'text-[rgba(255,255,255,0.4)]' : ''}`}
          >
            <option value="" disabled className="bg-[#121620] text-[rgba(255,255,255,0.4)]">{t('companyRegister.selectCompanySize')}</option>
            {COMPANY_SIZES.map((s) => (
              <option key={s} value={s} className="bg-[#121620] text-white">{s} {t('companyRegister.employees')}</option>
            ))}
          </select>
        </SelectWrapper>
        {errors.companySize && <span id="companySize-error" className={errorClass} role="alert">{errors.companySize}</span>}
      </div>

      <button
        type="button"
        onClick={onNext}
        className="mt-3 bg-[linear-gradient(135deg,#00DAC1_0%,#008B7B_100%)] text-black border-none rounded-xl py-4 text-base font-bold cursor-pointer transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,218,193,0.4)]"
      >
        {t('companyRegister.continue')}
      </button>
    </div>
  );
};

export default Step1CompanyInfo;
