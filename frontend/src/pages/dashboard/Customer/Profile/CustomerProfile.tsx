import React, { useState } from 'react';
import { User, Phone, MapPin, Mail, Wallet, Save, Loader2 } from 'lucide-react';
import { WalletConnectButton } from '../../../../components/auth/WalletConnectButton/WalletConnectButton';
import { useToast } from '@context/ToastContext';

type Profile = { fullName: string; email: string; phone: string; address: string; };
type ProfileErrors = { fullName?: string; phone?: string; address?: string; };

const initialProfile: Profile = { 
  fullName: 'John Doe', 
  email: 'john.doe@example.com', 
  phone: '', 
  address: '' 
};

const CustomerProfile: React.FC = () => {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const { addToast } = useToast();

  const validate = (field: keyof Profile, value: string): string => {
    if (field === 'fullName' && !value.trim()) return 'Full name is required.';
    if (field === 'phone' && value && !/^\+?[\d\s-]{10,}$/.test(value)) return 'Enter a valid phone number.';
    if (field === 'address' && !value.trim()) return 'Delivery address is required.';
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value } as Profile);
    setErrors({ ...errors, [name]: validate(name as keyof Profile, value) });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setErrors({ ...errors, [name]: validate(name as keyof Profile, value) });
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: ProfileErrors = {};
    (Object.keys(profile) as Array<keyof Profile>).forEach((field) => {
      if (field !== 'email') {
        const error = validate(field, profile[field]);
        if (error) newErrors[field] = error;
      }
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      addToast('Please fix the highlighted fields before saving.', 'error');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addToast('Profile saved successfully!', 'success');
    }, 1500);
  };

  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);
  };

  const handleWalletDisconnect = () => {
    setWalletAddress(null);
  };

  const truncateAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-text-primary mb-2">Customer Profile</h1>
        <p className="text-text-secondary text-sm md:text-base">
          Manage your personal information and connected wallet.
        </p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Profile Information Card */}
        <div className="bg-background-card backdrop-blur-md border border-border rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <User size={20} className="text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary">Personal Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="flex flex-col gap-2">
              <label htmlFor="fullName" className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <User size={14} />
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={profile.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your full name"
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? "fullName-error" : undefined}
                className={`w-full bg-background-secondary border rounded-xl px-4 py-3.5 text-text-primary text-base transition-all focus:outline-none focus:border-primary focus:bg-background-secondary focus:shadow-[0_0_0_4px_rgba(0,212,200,0.1)] ${
                  errors.fullName ? 'border-error' : 'border-border'
                }`}
              />
              {errors.fullName && (
                <span id="fullName-error" className="text-error text-sm" role="alert">{errors.fullName}</span>
              )}
            </div>

            {/* Email (Read-only) */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <Mail size={14} />
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                disabled
                className="w-full bg-background-secondary border border-border rounded-xl px-4 py-3.5 text-text-muted text-base cursor-not-allowed"
              />
              <span className="text-xs text-text-muted">Email cannot be changed</span>
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-2">
              <label htmlFor="phone" className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <Phone size={14} />
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={profile.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="+1 234 567 8900"
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "phone-error" : undefined}
                className={`w-full bg-background-secondary border rounded-xl px-4 py-3.5 text-text-primary text-base transition-all focus:outline-none focus:border-primary focus:bg-background-secondary focus:shadow-[0_0_0_4px_rgba(0,212,200,0.1)] ${
                  errors.phone ? 'border-error' : 'border-border'
                }`}
              />
              {errors.phone && (
                <span id="phone-error" className="text-error text-sm" role="alert">{errors.phone}</span>
              )}
            </div>

            {/* Delivery Address */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label htmlFor="address" className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <MapPin size={14} />
                Delivery Address
              </label>
              <textarea
                id="address"
                name="address"
                value={profile.address}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your delivery address"
                rows={3}
                aria-invalid={!!errors.address}
                aria-describedby={errors.address ? "address-error" : undefined}
                className={`w-full bg-background-secondary border rounded-xl px-4 py-3.5 text-text-primary text-base transition-all resize-none focus:outline-none focus:border-primary focus:bg-background-secondary focus:shadow-[0_0_0_4px_rgba(0,212,200,0.1)] ${
                  errors.address ? 'border-error' : 'border-border'
                }`}
              />
              {errors.address && (
                <span id="address-error" className="text-error text-sm" role="alert">{errors.address}</span>
              )}
            </div>
          </div>
        </div>

        {/* Wallet Card */}
        <div className="bg-background-card backdrop-blur-md border border-border rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wallet size={20} className="text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary">Connected Wallet</h2>
          </div>

          <div className="flex flex-col gap-4">
            {walletAddress ? (
              <div className="flex items-center justify-between bg-background-secondary border border-border rounded-xl px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-text-primary font-mono text-sm">{truncateAddress(walletAddress)}</span>
                </div>
                <button
                  type="button"
                  onClick={handleWalletDisconnect}
                  className="text-sm text-error hover:text-error/80 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <WalletConnectButton onConnect={handleWalletConnect} />
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-background font-semibold px-6 py-3 rounded-xl transition-all"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerProfile;
