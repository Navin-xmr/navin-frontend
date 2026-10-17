import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Pencil } from 'lucide-react';
import type { Step1Data, Step2Data } from './useCompanyRegister';

export interface Step3ReviewProps {
  step1: Step1Data;
  step2: Step2Data;
  generalError: string;
  loading: boolean;
  onBack: () => void;
  onEditStep1: () => void;
  onEditStep2: () => void;
  onSubmit: () => void;
}

const Step3Review: React.FC<Step3ReviewProps> = ({
  step1,
  step2,
  generalError,
  loading,
  onBack,
  onEditStep1,
  onEditStep2,
  onSubmit,
}) => {
  const { t } = useTranslation('auth');

  return (
    <div className="flex flex-col gap-5">
      {generalError && (
        <div
          className="bg-[rgba(255,77,77,0.1)] border border-[#FF4D4D] rounded-xl px-4 py-3 text-[#FF4D4D] text-sm text-center"
          role="alert"
        >
          {generalError}
        </div>
      )}

      {/* Company Info Summary */}
      <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[0.75rem] font-semibold text-[rgba(255,255,255,0.4)] uppercase tracking-wider">
            {t('companyRegister.companyInfoSummary')}
          </span>
          <button
            type="button"
            onClick={onEditStep1}
            className="flex items-center gap-1 text-[0.8rem] text-[#00DAC1] font-medium bg-transparent border-none cursor-pointer hover:underline"
          >
            <Pencil size={13} /> {t('companyRegister.edit')}
          </button>
        </div>
        <dl className="flex flex-col gap-2.5">
          {(
            [
              [t('companyRegister.companyNameLabel'), step1.companyName],
              [t('companyRegister.industryLabel'), step1.industry],
              [t('companyRegister.countryLabel'), step1.country],
              [t('companyRegister.companySizeLabel'), step1.companySize ? `${step1.companySize} ${t('companyRegister.employees')}` : ''],
            ] as [string, string][]
          ).map(([label, value]) => (
            <div key={label} className="flex justify-between text-[0.9rem]">
              <dt className="text-[rgba(255,255,255,0.5)]">{label}</dt>
              <dd className="text-white font-medium text-right max-w-[55%]">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Admin Account Summary */}
      <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[0.75rem] font-semibold text-[rgba(255,255,255,0.4)] uppercase tracking-wider">
            {t('companyRegister.adminAccountSummary')}
          </span>
          <button
            type="button"
            onClick={onEditStep2}
            className="flex items-center gap-1 text-[0.8rem] text-[#00DAC1] font-medium bg-transparent border-none cursor-pointer hover:underline"
          >
            <Pencil size={13} /> {t('companyRegister.edit')}
          </button>
        </div>
        <dl className="flex flex-col gap-2.5">
          {(
            [
              [t('companyRegister.fullNameLabel'), step2.fullName],
              [t('companyRegister.bizEmailLabel'), step2.email],
              [t('companyRegister.passwordLabel'), '••••••••'],
            ] as [string, string][]
          ).map(([label, value]) => (
            <div key={label} className="flex justify-between text-[0.9rem]">
              <dt className="text-[rgba(255,255,255,0.5)]">{label}</dt>
              <dd className="text-white font-medium text-right max-w-[55%] break-all">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex gap-3 mt-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white rounded-xl py-4 text-base font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 hover:bg-[rgba(255,255,255,0.1)]"
        >
          <ChevronLeft size={18} /> {t('companyRegister.back')}
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="flex-[2] bg-[linear-gradient(135deg,#00DAC1_0%,#008B7B_100%)] text-black border-none rounded-xl py-4 text-base font-bold cursor-pointer transition-all flex items-center justify-center gap-2 hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_4px_15px_rgba(0,218,193,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-[rgba(0,0,0,0.1)] border-t-black rounded-full animate-spin" />
              {t('companyRegister.submitting')}
            </>
          ) : (
            t('companyRegister.createAccount')
          )}
        </button>
      </div>
    </div>
  );
};

export default Step3Review;
