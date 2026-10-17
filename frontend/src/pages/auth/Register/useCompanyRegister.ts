import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PASSWORD_MIN_LENGTH } from '../../../utils/passwordPolicy';

export interface Step1Data {
  companyName: string;
  industry: string;
  country: string;
  companySize: string;
}

export interface Step2Data {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface Step1Errors {
  companyName?: string;
  industry?: string;
  country?: string;
  companySize?: string;
}

export interface Step2Errors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export interface UseCompanyRegisterReturn {
  step1Errors: Step1Errors;
  step2Errors: Step2Errors;
  setStep1Errors: React.Dispatch<React.SetStateAction<Step1Errors>>;
  setStep2Errors: React.Dispatch<React.SetStateAction<Step2Errors>>;
  validateStep1: (data: Step1Data) => boolean;
  validateStep2: (data: Step2Data) => boolean;
}

export function useCompanyRegister(): UseCompanyRegisterReturn {
  const { t } = useTranslation('auth');
  const [step1Errors, setStep1Errors] = useState<Step1Errors>({});
  const [step2Errors, setStep2Errors] = useState<Step2Errors>({});

  const validateStep1 = (data: Step1Data): boolean => {
    const errs: Step1Errors = {};
    if (!data.companyName.trim()) errs.companyName = t('companyRegister.errorCompanyNameRequired');
    if (!data.industry) errs.industry = t('companyRegister.errorIndustryRequired');
    if (!data.country) errs.country = t('companyRegister.errorCountryRequired');
    if (!data.companySize) errs.companySize = t('companyRegister.errorCompanySizeRequired');
    setStep1Errors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = (data: Step2Data): boolean => {
    const errs: Step2Errors = {};
    if (!data.fullName.trim()) errs.fullName = t('companyRegister.errorFullNameRequired');
    if (!data.email) errs.email = t('companyRegister.errorEmailRequired');
    else if (!/\S+@\S+\.\S+/.test(data.email)) errs.email = t('companyRegister.errorEmailInvalid');
    if (!data.password) errs.password = t('companyRegister.errorPasswordRequired');
    else if (data.password.length < PASSWORD_MIN_LENGTH) errs.password = t('companyRegister.errorPasswordMinLength');
    if (data.password !== data.confirmPassword) errs.confirmPassword = t('companyRegister.errorPasswordsMismatch');
    setStep2Errors(errs);
    return Object.keys(errs).length === 0;
  };

  return { step1Errors, step2Errors, setStep1Errors, setStep2Errors, validateStep1, validateStep2 };
}
