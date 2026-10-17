import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, ChevronLeft } from 'lucide-react';
import PasswordStrengthMeter from '@components/ui/PasswordStrengthMeter';
import type { Step2Data, Step2Errors } from './useCompanyRegister';
import { inputBase, labelClass, errorClass } from './Step1CompanyInfo';

export interface Step2AdminAccountProps {
  data: Step2Data;
  errors: Step2Errors;
  onChange: (data: Step2Data) => void;
  onClearError: (field: keyof Step2Errors) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step2AdminAccount: React.FC<Step2AdminAccountProps> = ({
  data,
  errors,
  onChange,
  onClearError,
  onNext,
  onBack,
}) => {
  const { t } = useTranslation('auth');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      {/* Full Name */}
      <div className="flex flex-col gap-2">
        <label htmlFor="fullName" className={labelClass}>{t('companyRegister.fullNameLabel')}</label>
        <input
          type="text"
          id="fullName"
          placeholder={t('companyRegister.fullNamePlaceholder')}
          value={data.fullName}
          onChange={(e) => { onChange({ ...data, fullName: e.target.value }); onClearError('fullName'); }}
          aria-invalid={!!errors.fullName}
          aria-describedby={errors.fullName ? 'fullName-error' : undefined}
          className={`${inputBase} pr-4 ${errors.fullName ? 'border-[#FF4D4D]' : ''}`}
        />
        {errors.fullName && <span id="fullName-error" className={errorClass} role="alert">{errors.fullName}</span>}
      </div>

      {/* Business Email */}
      <div className="flex flex-col gap-2">
        <label htmlFor="bizEmail" className={labelClass}>{t('companyRegister.bizEmailLabel')}</label>
        <input
          type="email"
          id="bizEmail"
          placeholder={t('companyRegister.bizEmailPlaceholder')}
          value={data.email}
          onChange={(e) => { onChange({ ...data, email: e.target.value }); onClearError('email'); }}
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'bizEmail-error' : undefined}
          className={`${inputBase} pr-4 ${errors.email ? 'border-[#FF4D4D]' : ''}`}
        />
        {errors.email && <span id="bizEmail-error" className={errorClass} role="alert">{errors.email}</span>}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className={labelClass}>{t('companyRegister.passwordLabel')}</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            placeholder="••••••••"
            value={data.password}
            onChange={(e) => { onChange({ ...data, password: e.target.value }); onClearError('password'); }}
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            className={`${inputBase} pr-12 ${errors.password ? 'border-[#FF4D4D]' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent text-[rgba(255,255,255,0.6)] cursor-pointer flex items-center justify-center p-2 rounded-lg transition-all hover:text-[#00DAC1] hover:bg-[rgba(255,255,255,0.05)]"
            aria-label={showPassword ? t('companyRegister.hidePassword') : t('companyRegister.showPassword')}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <PasswordStrengthMeter password={data.password} />
        {errors.password && <span id="password-error" className={errorClass} role="alert">{errors.password}</span>}
      </div>

      {/* Confirm Password */}
      <div className="flex flex-col gap-2">
        <label htmlFor="confirmPassword" className={labelClass}>{t('companyRegister.confirmPasswordLabel')}</label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            placeholder="••••••••"
            value={data.confirmPassword}
            onChange={(e) => { onChange({ ...data, confirmPassword: e.target.value }); onClearError('confirmPassword'); }}
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
            className={`${inputBase} pr-12 ${errors.confirmPassword ? 'border-[#FF4D4D]' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent text-[rgba(255,255,255,0.6)] cursor-pointer flex items-center justify-center p-2 rounded-lg transition-all hover:text-[#00DAC1] hover:bg-[rgba(255,255,255,0.05)]"
            aria-label={showConfirmPassword ? t('companyRegister.hideConfirmPassword') : t('companyRegister.showConfirmPassword')}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.confirmPassword && <span id="confirmPassword-error" className={errorClass} role="alert">{errors.confirmPassword}</span>}
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
          onClick={onNext}
          className="flex-[2] bg-[linear-gradient(135deg,#00DAC1_0%,#008B7B_100%)] text-black border-none rounded-xl py-4 text-base font-bold cursor-pointer transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,218,193,0.4)]"
        >
          {t('companyRegister.reviewAndSubmit')}
        </button>
      </div>
    </div>
  );
};

export default Step2AdminAccount;
