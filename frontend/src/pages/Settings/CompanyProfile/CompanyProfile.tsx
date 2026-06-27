import React, { useEffect, useState } from 'react';
import { Building2, MapPin, Save, UploadCloud } from 'lucide-react';
import FileUpload from '../../../components/ui/FileUpload';

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

const STORAGE_KEY = 'navin-company-profile';
const LOGO_STORAGE_KEY = 'navin-company-logo';

const readStoredProfile = (): CompanyProfileState => {
  if (typeof window === 'undefined') {
    return getInitialProfile();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return getInitialProfile();
    }

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

function getInitialProfile(): CompanyProfileState {
  return {
    companyInfo: {
      name: '',
      registrationNumber: '',
      industry: '',
    },
    contactDetails: {
      email: '',
      phone: '',
      website: '',
    },
    address: {
      addressLine1: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
    branding: {
      logoDataUrl: null,
      logoName: '',
    },
  };
}

function validateEmail(email: string): string | null {
  if (!email) return null;
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email) ? null : 'Please enter a valid email address.';
}

function validatePhone(phone: string): string | null {
  if (!phone) return null;
  const pattern = /^\+?[0-9\s().-]{7,15}$/;
  return pattern.test(phone) ? null : 'Please enter a valid phone number.';
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

const CompanyProfile: React.FC = () => {
  const [profile, setProfile] = useState<CompanyProfileState>(() => readStoredProfile());
  const [savedProfile, setSavedProfile] = useState<CompanyProfileState>(() => readStoredProfile());
  const [companyInfoErrors, setCompanyInfoErrors] = useState<Record<string, string>>({});
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [brandingErrors, setBrandingErrors] = useState<Record<string, string>>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoName, setLogoName] = useState('');

  useEffect(() => {
    const stored = readStoredProfile();
    setProfile(stored);
    setSavedProfile(stored);
    setLogoPreview(stored.branding.logoDataUrl ?? null);
    setLogoName(stored.branding.logoName ?? '');
  }, []);

  const updateProfile = (updater: (current: CompanyProfileState) => CompanyProfileState) => {
    setProfile((current) => updater(current));
  };

  const isDirty = {
    companyInfo:
      JSON.stringify(profile.companyInfo) !== JSON.stringify(savedProfile.companyInfo),
    contactDetails:
      JSON.stringify(profile.contactDetails) !== JSON.stringify(savedProfile.contactDetails),
    address: JSON.stringify(profile.address) !== JSON.stringify(savedProfile.address),
    branding: Boolean(logoPreview && logoPreview !== savedProfile.branding.logoDataUrl),
  };

  const saveCompanyInfo = () => {
    const nextErrors: Record<string, string> = {};
    if (!profile.companyInfo.name.trim()) nextErrors.name = 'Company name is required.';
    if (!profile.companyInfo.registrationNumber.trim()) nextErrors.registrationNumber = 'Registration number is required.';
    if (!profile.companyInfo.industry.trim()) nextErrors.industry = 'Industry is required.';

    setCompanyInfoErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const nextProfile = { ...profile, companyInfo: profile.companyInfo };
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
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const nextProfile = { ...profile, contactDetails: profile.contactDetails };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfile));
    setSavedProfile(nextProfile);
    setContactErrors({});
  };

  const saveAddress = () => {
    const nextErrors: Record<string, string> = {};
    if (!profile.address.addressLine1.trim()) nextErrors.addressLine1 = 'Address line 1 is required.';
    if (!profile.address.city.trim()) nextErrors.city = 'City is required.';
    if (!profile.address.country.trim()) nextErrors.country = 'Country is required.';

    setAddressErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const nextProfile = { ...profile, address: profile.address };
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
      branding: {
        logoDataUrl: logoPreview,
        logoName,
      },
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

  const inputClassName =
    'w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-2.5 text-sm text-white outline-none transition focus:border-cyan-400';

  const SectionCard = ({
    title,
    description,
    icon,
    dirty,
    onSave,
    children,
  }: {
    title: string;
    description: string;
    icon: React.ReactNode;
    dirty: boolean;
    onSave: () => void;
    children: React.ReactNode;
  }) => (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-sm shadow-slate-950/30">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400">{icon}</div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              {dirty && (
                <span
                  aria-label="unsaved changes"
                  className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-400"
                />
              )}
            </div>
            <p className="text-sm text-slate-400">{description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onSave}
          className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
        >
          <Save size={16} />
          Save {title}
        </button>
      </div>
      {children}
    </section>
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-400">Company Profile</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Manage your company details</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Keep your company information current and your branding visible across the app.
        </p>
      </div>

      <SectionCard
        title="Company Info"
        description="Share the basic identity details for your company profile."
        icon={<Building2 size={18} />}
        dirty={isDirty.companyInfo}
        onSave={saveCompanyInfo}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="company-name" className="mb-2 block text-sm text-slate-400">
              Company name
            </label>
            <input
              id="company-name"
              value={profile.companyInfo.name}
              onChange={(e) => updateProfile((current) => ({ ...current, companyInfo: { ...current.companyInfo, name: e.target.value } }))}
              className={inputClassName}
              placeholder="YieldVault"
            />
            {companyInfoErrors.name && <p className="mt-1 text-sm text-rose-400">{companyInfoErrors.name}</p>}
          </div>
          <div>
            <label htmlFor="registration-number" className="mb-2 block text-sm text-slate-400">
              Registration number
            </label>
            <input
              id="registration-number"
              value={profile.companyInfo.registrationNumber}
              onChange={(e) => updateProfile((current) => ({ ...current, companyInfo: { ...current.companyInfo, registrationNumber: e.target.value } }))}
              className={inputClassName}
              placeholder="RC123456"
            />
            {companyInfoErrors.registrationNumber && <p className="mt-1 text-sm text-rose-400">{companyInfoErrors.registrationNumber}</p>}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="industry" className="mb-2 block text-sm text-slate-400">
              Industry
            </label>
            <input
              id="industry"
              value={profile.companyInfo.industry}
              onChange={(e) => updateProfile((current) => ({ ...current, companyInfo: { ...current.companyInfo, industry: e.target.value } }))}
              className={inputClassName}
              placeholder="Logistics"
            />
            {companyInfoErrors.industry && <p className="mt-1 text-sm text-rose-400">{companyInfoErrors.industry}</p>}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Contact Details"
        description="Add contact details that customers and partners can use to reach your team."
        icon={<UploadCloud size={18} />}
        dirty={isDirty.contactDetails}
        onSave={saveContactDetails}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="contact-email" className="mb-2 block text-sm text-slate-400">
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              value={profile.contactDetails.email}
              onChange={(e) => updateProfile((current) => ({ ...current, contactDetails: { ...current.contactDetails, email: e.target.value } }))}
              className={inputClassName}
              placeholder="hello@company.com"
            />
            {contactErrors.email && <p className="mt-1 text-sm text-rose-400">{contactErrors.email}</p>}
          </div>
          <div>
            <label htmlFor="contact-phone" className="mb-2 block text-sm text-slate-400">
              Phone
            </label>
            <input
              id="contact-phone"
              value={profile.contactDetails.phone}
              onChange={(e) => updateProfile((current) => ({ ...current, contactDetails: { ...current.contactDetails, phone: e.target.value } }))}
              className={inputClassName}
              placeholder="+234 800 123 4567"
            />
            {contactErrors.phone && <p className="mt-1 text-sm text-rose-400">{contactErrors.phone}</p>}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="contact-website" className="mb-2 block text-sm text-slate-400">
              Website
            </label>
            <input
              id="contact-website"
              value={profile.contactDetails.website}
              onChange={(e) => updateProfile((current) => ({ ...current, contactDetails: { ...current.contactDetails, website: e.target.value } }))}
              className={inputClassName}
              placeholder="https://company.com"
            />
            {contactErrors.website && <p className="mt-1 text-sm text-rose-400">{contactErrors.website}</p>}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Address"
        description="Provide the primary business address for verified records."
        icon={<MapPin size={18} />}
        dirty={isDirty.address}
        onSave={saveAddress}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="address-line1" className="mb-2 block text-sm text-slate-400">
              Address line 1
            </label>
            <input
              id="address-line1"
              value={profile.address.addressLine1}
              onChange={(e) => updateProfile((current) => ({ ...current, address: { ...current.address, addressLine1: e.target.value } }))}
              className={inputClassName}
              placeholder="42 Marina Road"
            />
            {addressErrors.addressLine1 && <p className="mt-1 text-sm text-rose-400">{addressErrors.addressLine1}</p>}
          </div>
          <div>
            <label htmlFor="address-city" className="mb-2 block text-sm text-slate-400">
              City
            </label>
            <input
              id="address-city"
              value={profile.address.city}
              onChange={(e) => updateProfile((current) => ({ ...current, address: { ...current.address, city: e.target.value } }))}
              className={inputClassName}
              placeholder="Lagos"
            />
            {addressErrors.city && <p className="mt-1 text-sm text-rose-400">{addressErrors.city}</p>}
          </div>
          <div>
            <label htmlFor="address-state" className="mb-2 block text-sm text-slate-400">
              State / Province
            </label>
            <input
              id="address-state"
              value={profile.address.state}
              onChange={(e) => updateProfile((current) => ({ ...current, address: { ...current.address, state: e.target.value } }))}
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
              value={profile.address.postalCode}
              onChange={(e) => updateProfile((current) => ({ ...current, address: { ...current.address, postalCode: e.target.value } }))}
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
              value={profile.address.country}
              onChange={(e) => updateProfile((current) => ({ ...current, address: { ...current.address, country: e.target.value } }))}
              className={inputClassName}
              placeholder="Nigeria"
            />
            {addressErrors.country && <p className="mt-1 text-sm text-rose-400">{addressErrors.country}</p>}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Branding"
        description="Upload a square logo and preview it before you save it for the navbar."
        icon={<Building2 size={18} />}
        dirty={isDirty.branding}
        onSave={saveBranding}
      >
        <div className="space-y-4">
          <FileUpload
            accept={['image/*']}
            maxSizeMB={5}
            onFilesSelected={handleLogoSelection}
          />

          <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 md:flex-row md:items-center">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
              {logoPreview ? (
                <img src={logoPreview} alt="Company logo preview" className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm text-slate-500">No logo</span>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-white">{logoName || 'Upload an image to preview your square logo'}</p>
              <p className="text-sm text-slate-400">
                The image is cropped to a square preview before saving so it displays neatly in the navbar.
              </p>
              {brandingErrors.logo && <p className="text-sm text-rose-400">{brandingErrors.logo}</p>}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export default CompanyProfile;
