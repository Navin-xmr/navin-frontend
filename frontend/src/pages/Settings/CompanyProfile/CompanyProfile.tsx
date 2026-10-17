import React, { useState } from 'react';
import AddressSection from './AddressSection';
import BrandingSection from './BrandingSection';
import CompanyInfoSection from './CompanyInfoSection';
import ContactDetailsSection from './ContactDetailsSection';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CompanyInfoData = {
  name: string;
  registrationNumber: string;
  industry: string;
};

type ContactDetailsData = {
  email: string;
  phone: string;
  website: string;
};

type AddressData = {
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type BrandingData = {
  logoDataUrl: string | null;
  logoName: string;
};

type CompanyProfileState = {
  companyInfo: CompanyInfoData;
  contactDetails: ContactDetailsData;
  address: AddressData;
  branding: BrandingData;
};

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'navin-company-profile';
const LOGO_STORAGE_KEY = 'navin-company-logo';

function getInitialProfile(): CompanyProfileState {
  return {
    companyInfo: { name: '', registrationNumber: '', industry: '' },
    contactDetails: { email: '', phone: '', website: '' },
    address: { addressLine1: '', city: '', state: '', postalCode: '', country: '' },
    branding: { logoDataUrl: null, logoName: '' },
  };
}

const readStoredProfile = (): CompanyProfileState => {
  if (typeof window === 'undefined') return getInitialProfile();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialProfile();

    const parsed = JSON.parse(raw) as Partial<CompanyProfileState>;
    return {
      companyInfo: {
        name: parsed.companyInfo?.name ?? '',
        registrationNumber: parsed.companyInfo?.registrationNumber ?? '',
        industry: parsed.companyInfo?.industry ?? '',
      },
      contactDetails: {
        email: parsed.contactDetails?.email ?? '',
        phone: parsed.contactDetails?.phone ?? '',
        website: parsed.contactDetails?.website ?? '',
      },
      address: {
        addressLine1: parsed.address?.addressLine1 ?? '',
        city: parsed.address?.city ?? '',
        state: parsed.address?.state ?? '',
        postalCode: parsed.address?.postalCode ?? '',
        country: parsed.address?.country ?? '',
      },
      branding: {
        logoDataUrl: parsed.branding?.logoDataUrl ?? null,
        logoName: parsed.branding?.logoName ?? '',
      },
    };
  } catch {
    return getInitialProfile();
  }
};

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function validateEmail(email: string): string | null {
  if (!email) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? null
    : 'Please enter a valid email address.';
}

function validatePhone(phone: string): string | null {
  if (!phone) return null;
  return /^\+?[0-9\s().-]{7,15}$/.test(phone)
    ? null
    : 'Please enter a valid phone number.';
}

function validateWebsite(website: string): string | null {
  if (!website) return null;
  try {
    const parsed = new URL(website.includes('://') ? website : `https://${website}`);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
      ? null
      : 'Please enter a valid website URL.';
  } catch {
    return 'Please enter a valid website URL.';
  }
}

// ---------------------------------------------------------------------------
// Logo preprocessing
// ---------------------------------------------------------------------------

function createSquarePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = Math.min(img.width, img.height);
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 320;
        const context = canvas.getContext('2d');

        if (!context) {
          reject(new Error('Unable to create image preview.'));
          return;
        }

        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        context.drawImage(img, sx, sy, size, size, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject(new Error('Unable to read image.'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Unable to read image.'));
    reader.readAsDataURL(file);
  });
}

// ---------------------------------------------------------------------------
// CompanyProfile page
// ---------------------------------------------------------------------------

const inputClassName =
  'w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-2.5 text-sm text-white outline-none transition focus:border-cyan-400';

const CompanyProfile: React.FC = () => {
  const [profile, setProfile] = useState<CompanyProfileState>(() => readStoredProfile());
  const [savedProfile, setSavedProfile] = useState<CompanyProfileState>(() => readStoredProfile());
  const [companyInfoErrors, setCompanyInfoErrors] = useState<Record<string, string>>({});
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [brandingErrors, setBrandingErrors] = useState<Record<string, string>>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoName, setLogoName] = useState('');

  const isDirty = {
    companyInfo:
      JSON.stringify(profile.companyInfo) !== JSON.stringify(savedProfile.companyInfo),
    contactDetails:
      JSON.stringify(profile.contactDetails) !== JSON.stringify(savedProfile.contactDetails),
    address: JSON.stringify(profile.address) !== JSON.stringify(savedProfile.address),
    branding: Boolean(logoPreview && logoPreview !== savedProfile.branding.logoDataUrl),
  };

  // ── Section save handlers ─────────────────────────────────────────────────

  const saveCompanyInfo = () => {
    const nextErrors: Record<string, string> = {};
    if (!profile.companyInfo.name.trim()) nextErrors.name = 'Company name is required.';
    if (!profile.companyInfo.registrationNumber.trim())
      nextErrors.registrationNumber = 'Registration number is required.';
    if (!profile.companyInfo.industry.trim()) nextErrors.industry = 'Industry is required.';

    setCompanyInfoErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const nextProfile = { ...profile };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfile));
    window.localStorage.setItem('navin-company-name', profile.companyInfo.name);
    setSavedProfile(nextProfile);
    setCompanyInfoErrors({});
  };

  const saveContactDetails = () => {
    const nextErrors: Record<string, string> = {};
    const emailError = validateEmail(profile.contactDetails.email);
    const phoneError = validatePhone(profile.contactDetails.phone);
    const websiteError = validateWebsite(profile.contactDetails.website);

    if (emailError) nextErrors.email = emailError;
    if (phoneError) nextErrors.phone = phoneError;
    if (websiteError) nextErrors.website = websiteError;

    setContactErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const nextProfile = { ...profile };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfile));
    setSavedProfile(nextProfile);
    setContactErrors({});
  };

  const saveAddress = () => {
    const nextErrors: Record<string, string> = {};
    if (!profile.address.addressLine1.trim())
      nextErrors.addressLine1 = 'Address line 1 is required.';
    if (!profile.address.city.trim()) nextErrors.city = 'City is required.';
    if (!profile.address.country.trim()) nextErrors.country = 'Country is required.';

    setAddressErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const nextProfile = { ...profile };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfile));
    setSavedProfile(nextProfile);
    setAddressErrors({});
  };

  const saveBranding = () => {
    if (!logoPreview) {
      setBrandingErrors({ logo: 'Upload a company logo before saving.' });
      return;
    }

    const nextProfile = {
      ...profile,
      branding: { logoDataUrl: logoPreview, logoName },
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfile));
    window.localStorage.setItem(LOGO_STORAGE_KEY, logoPreview);
    setSavedProfile(nextProfile);
    setBrandingErrors({});
  };

  const handleLogoSelection = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    try {
      const preview = await createSquarePreview(file);
      setLogoPreview(preview);
      setLogoName(file.name);
      setBrandingErrors({});
    } catch {
      setBrandingErrors({ logo: 'Unable to prepare the selected image.' });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-400">
          Company Profile
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Manage your company details</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Keep your company information current and your branding visible across the app.
        </p>
      </div>

      <CompanyInfoSection
        data={profile.companyInfo}
        errors={companyInfoErrors}
        dirty={isDirty.companyInfo}
        inputClassName={inputClassName}
        onChange={(updates) =>
          setProfile((current) => ({
            ...current,
            companyInfo: { ...current.companyInfo, ...updates },
          }))
        }
        onSave={saveCompanyInfo}
      />

      <ContactDetailsSection
        data={profile.contactDetails}
        errors={contactErrors}
        dirty={isDirty.contactDetails}
        inputClassName={inputClassName}
        onChange={(updates) =>
          setProfile((current) => ({
            ...current,
            contactDetails: { ...current.contactDetails, ...updates },
          }))
        }
        onSave={saveContactDetails}
      />

      <AddressSection
        data={profile.address}
        errors={addressErrors}
        dirty={isDirty.address}
        inputClassName={inputClassName}
        onChange={(updates) =>
          setProfile((current) => ({
            ...current,
            address: { ...current.address, ...updates },
          }))
        }
        onSave={saveAddress}
      />

      <BrandingSection
        logoPreview={logoPreview}
        logoName={logoName}
        errors={brandingErrors}
        dirty={isDirty.branding}
        onFilesSelected={handleLogoSelection}
        onSave={saveBranding}
      />
    </div>
  );
};

export default CompanyProfile;
