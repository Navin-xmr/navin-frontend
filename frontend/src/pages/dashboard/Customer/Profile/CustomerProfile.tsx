import React, { useState } from 'react';
import { User, Phone, MapPin, Mail, Wallet, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { WalletConnectButton } from '../../../../components/auth/WalletConnectButton/WalletConnectButton';

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
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

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
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      setSuccessMsg('');
      setTimeout(() => {
        setLoading(false);
        setSuccessMsg('Profile saved successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }, 1500);
    }
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
        <h1 className="text-2xl md:text-3xl font-semibold text-white mb-2">Customer Profile</h1>
        <p className="text-[rgba(255,255,255,0.6)] text-sm md:text-base">
          Manage your personal information and connected wallet.
        </p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Profile Information Card */}
        <div className="bg-[rgba(20,20,20,0.7)] backdrop-blur-md border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[rgba(0,212,200,0.1)] flex items-center justify-center">
              <User size={20} className="text-[#00d4c8]" />
            </div>
            <h2 className="text-lg font-semibold text-white">Personal Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[rgba(255,255,255,0.6)] flex items-center gap-2">
                <User size={14} />
                Full Name
              </label>
              <input
                name="fullName"
                type="text"
                value={profile.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your full name"
                className={`w-full bg-[rgba(255,255,255,0.05)] border rounded-xl px-4 py-3.5 text-white text-base transition-all focus:outline-none focus:border-[#00d4c8] focus:bg-[rgba(255,255,255,0.08)] focus:shadow-[0_0_0_4px_rgba(0,212,200,0.1)] ${
                  errors.fullName ? 'border-[#FF4D4D]' : 'border-[rgba(255,255,255,0.1)]'
                }`}
              />
              {errors.fullName && (
                <span className="text-[#FF4D4D] text-sm">{errors.fullName}</span>
              )}
            </div>

            {/* Email (Read-only) */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[rgba(255,255,255,0.6)] flex items-center gap-2">
                <Mail size={14} />
                Email Address
              </label>
              <input
                name="email"
                type="email"
                value={profile.email}
                disabled
                className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3.5 text-[rgba(255,255,255,0.5)] text-base cursor-not-allowed"
              />
              <span className="text-xs text-[rgba(255,255,255,0.4)]">Email cannot be changed</span>
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[rgba(255,255,255,0.6)] flex items-center gap-2">
                <Phone size={14} />
                Phone Number
              </label>
              <input
                name="phone"
                type="tel"
                value={profile.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="+1 234 567 8900"
                className={`w-full bg-[rgba(255,255,255,0.05)] border rounded-xl px-4 py-3.5 text-white text-base transition-all focus:outline-none focus:border-[#00d4c8] focus:bg-[rgba(255,255,255,0.08)] focus:shadow-[0_0_0_4px_rgba(0,212,200,0.1)] ${
                  errors.phone ? 'border-[#FF4D4D]' : 'border-[rgba(255,255,255,0.1)]'
                }`}
              />
              {errors.phone && (
                <span className="text-[#FF4D4D] text-sm">{errors.phone}</span>
              )}
            </div>

            {/* Delivery Address */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-medium text-[rgba(255,255,255,0.6)] flex items-center gap-2">
                <MapPin size={14} />
                Delivery Address
              </label>
              <textarea
                name="address"
                value={profile.address}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your delivery address"
                rows={3}
                className={`w-full bg-[rgba(255,255,255,0.05)] border rounded-xl px-4 py-3.5 text-white text-base transition-all resize-none focus:outline-none focus:border-[#00d4c8] focus:bg-[rgba(255,255,255,0.08)] focus:shadow-[0_0_0_4px_rgba(0,212,200,0.1)] ${
                  errors.address ? 'border-[#FF4D4D]' : 'border-[rgba(255,255,255,0.1)]'
                }`}
              />
              {errors.address && (
                <span className="text-[#FF4D4D] text-sm">{errors.address}</span>
              )}
            </div>
          </div>
        </div>

        {/* Connected Wallet Card */}
        <div className="bg-[rgba(20,20,20,0.7)] backdrop-blur-md border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[rgba(0,212,200,0.1)] flex items-center justify-center">
              <Wallet size={20} className="text-[#00d4c8]" />
            </div>
            <h2 className="text-lg font-semibold text-white">Connected Wallet</h2>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-[rgba(255,255,255,0.6)] text-sm">
              Connect your Stellar wallet to authorize blockchain transactions and receive payments.
            </p>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {walletAddress ? (
                <div className="flex items-center gap-3 px-4 py-3 bg-[rgba(0,212,200,0.1)] border border-[rgba(0,212,200,0.2)] rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-[#00d4c8] animate-pulse" />
                  <span className="text-[#00d4c8] font-mono text-sm">
                    {truncateAddress(walletAddress)}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-[rgba(255,255,255,0.3)]" />
                  <span className="text-[rgba(255,255,255,0.5)] text-sm">Not Connected</span>
                </div>
              )}
              
              <WalletConnectButton 
                onConnect={handleWalletConnect}
                onDisconnect={handleWalletDisconnect}
              />
            </div>
          </div>
        </div>

        {/* Save Button and Success Message */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {successMsg && (
            <div className="flex items-center gap-2 px-4 py-2 bg-[rgba(0,212,200,0.1)] border border-[rgba(0,212,200,0.2)] rounded-xl text-[#00d4c8] text-sm">
              <CheckCircle2 size={16} />
              {successMsg}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="ml-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-linear-to-r from-[#00d4c8] to-[#00a89e] text-[#010101] font-semibold rounded-xl transition-all hover:opacity-90 hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,212,200,0.3)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
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