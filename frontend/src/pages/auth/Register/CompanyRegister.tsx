import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../../services/api';
import { ProgressStepper, type StepDef } from '../../../components/ui/ProgressStepper';
import useFormAutosave from '../../../hooks/useFormAutosave';
import { AutosaveBanner } from '../../../components/ui/AutosaveBanner';
import { useCompanyRegister } from './useCompanyRegister';
import type { Step1Data, Step2Data } from './useCompanyRegister';
import Step1CompanyInfo from './Step1CompanyInfo';
import Step2AdminAccount from './Step2AdminAccount';
import Step3Review from './Step3Review';

const CompanyRegister: React.FC = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const registerSteps: StepDef[] = [
    { label: t('companyRegister.stepCompany'), description: t('companyRegister.stepCompanyDesc') },
    { label: t('companyRegister.stepAdmin'), description: t('companyRegister.stepAdminDesc') },
    { label: t('companyRegister.stepReview'), description: t('companyRegister.stepReviewDesc') },
  ];

  const stepTitles = [
    t('companyRegister.step1Title'),
    t('companyRegister.step2Title'),
    t('companyRegister.step3Title'),
  ];

  const stepDescriptions = [
    t('companyRegister.step1Desc'),
    t('companyRegister.step2Desc'),
    t('companyRegister.step3Desc'),
  ];

  const [step1, setStep1] = useState<Step1Data>({
    companyName: '',
    industry: '',
    country: '',
    companySize: '',
  });

  const [step2, setStep2] = useState<Step2Data>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const { step1Errors, step2Errors, setStep1Errors, setStep2Errors, validateStep1, validateStep2 } = useCompanyRegister();

  const { status: autosaveStatus, lastSavedAt, clearDraft } = useFormAutosave({
    storageKey: 'navin-company-register',
    data: { step1, step2: { ...step2, password: '', confirmPassword: '' } },
  });

  const handleNextStep1 = () => {
    if (validateStep1(step1)) setStep(2);
  };

  const handleNextStep2 = () => {
    if (validateStep2(step2)) setStep(3);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setGeneralError('');
    try {
      await authApi.registerCompany({
        companyName: step1.companyName,
        industry: step1.industry,
        country: step1.country,
        companySize: step1.companySize,
        adminName: step2.fullName,
        email: step2.email,
        password: step2.password,
      });
      clearDraft();
      navigate('/register/verify-email', { state: { email: step2.email } });
    } catch {
      setGeneralError(t('companyRegister.errorRegistrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white relative overflow-hidden font-sans py-12">
      <div
        className="absolute w-[500px] h-[500px] top-[-250px] right-[-100px] z-0 pointer-events-none"
        style={{ background: 'radial-gradient(rgba(0,218,193,0.4), rgba(0,218,193,0))' }}
      />
      <div
        className="absolute w-[600px] h-[600px] bottom-[-300px] left-[-200px] z-0 pointer-events-none"
        style={{ background: 'conic-gradient(from 180deg at 50% 50%, #16abff33 0deg, #0885ff33 55deg, #54d6ff33 120deg, #0071ff33 160deg, transparent 360deg)' }}
      />

      <div className="bg-[rgba(20,20,20,0.7)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-3xl p-10 w-full max-w-[480px] z-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] sm:p-8 sm:rounded-none sm:min-h-screen sm:flex sm:flex-col sm:justify-center">
        <div className="text-center mb-8">
          <h2 className="text-[2rem] font-bold mb-2 bg-[linear-gradient(135deg,#fff_0%,#00DAC1_100%)] bg-clip-text [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
            {stepTitles[step - 1]}
          </h2>
          <p className="text-[rgba(255,255,255,0.6)] text-[0.95rem]">
            {stepDescriptions[step - 1]}
          </p>
          {step < 3 && (
            <div className="mt-2 flex justify-center">
              <AutosaveBanner status={autosaveStatus} lastSavedAt={lastSavedAt} />
            </div>
          )}
        </div>

        <ProgressStepper steps={registerSteps} currentStep={step} className="mb-8" />

        {step === 1 && (
          <Step1CompanyInfo
            data={step1}
            errors={step1Errors}
            onChange={setStep1}
            onClearError={(field) => setStep1Errors((prev) => ({ ...prev, [field]: undefined }))}
            onNext={handleNextStep1}
          />
        )}
        {step === 2 && (
          <Step2AdminAccount
            data={step2}
            errors={step2Errors}
            onChange={setStep2}
            onClearError={(field) => setStep2Errors((prev) => ({ ...prev, [field]: undefined }))}
            onNext={handleNextStep2}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <Step3Review
            step1={step1}
            step2={step2}
            generalError={generalError}
            loading={loading}
            onBack={() => setStep(2)}
            onEditStep1={() => setStep(1)}
            onEditStep2={() => setStep(2)}
            onSubmit={() => void handleSubmit()}
          />
        )}

        <p className="text-center text-[0.9rem] text-[rgba(255,255,255,0.6)] mt-6">
          {t('companyRegister.alreadyHaveAccount')}{' '}
          <Link to="/login" className="text-[#00DAC1] no-underline font-semibold hover:underline">
            {t('companyRegister.signIn')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default CompanyRegister;
