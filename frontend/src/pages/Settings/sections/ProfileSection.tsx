import React, { useRef, useState } from 'react';
import { Camera, Save } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

interface ProfileData {
  fullName: string;
  email: string;
  companyName: string;
}

const initial: ProfileData = {
  fullName: '',
  email: '',
  companyName: '',
};

const ProfileSection: React.FC<{ isCompany: boolean }> = ({ isCompany }) => {
  const [form, setForm] = useState<ProfileData>(initial);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { isLoading, error, success, save } = useSettings();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = () => {
    const changed: Partial<ProfileData> = {};
    if (form.fullName) changed.fullName = form.fullName;
    if (form.email) changed.email = form.email;
    if (isCompany && form.companyName) changed.companyName = form.companyName;
    void save({ url: '/api/users/me', payload: changed });
  };

  const inputCls =
    'w-full bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#62ffff]';

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Profile</h2>

      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div
          className="w-20 h-20 rounded-full bg-[rgba(19,186,186,0.1)] border border-[rgba(98,255,255,0.2)] flex items-center justify-center overflow-hidden cursor-pointer"
          onClick={() => fileRef.current?.click()}
          title="Change avatar"
        >
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
          ) : (
            <Camera size={24} className="text-[#62ffff]" />
          )}
        </div>
        <div>
          <button
            type="button"
            className="text-sm text-[#62ffff] border border-[rgba(98,255,255,0.3)] px-3 py-1.5 rounded-lg hover:bg-[rgba(98,255,255,0.1)] transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            Upload photo
          </button>
          <p className="text-xs text-slate-500 mt-1">JPG, PNG or GIF. Max 2 MB.</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="profile-fullName" className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
          <input id="profile-fullName" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Your name" className={inputCls} />
        </div>
        <div>
          <label htmlFor="profile-email" className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
          <input id="profile-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@company.com" className={inputCls} />
        </div>
        {isCompany && (
          <div className="md:col-span-2">
            <label htmlFor="profile-companyName" className="block text-xs font-medium text-slate-400 mb-1.5">Company Name (read-only)</label>
            <input
              id="profile-companyName"
              name="companyName"
              value={form.companyName}
              readOnly
              className={`${inputCls} opacity-60 cursor-not-allowed`}
              placeholder="Your company"
            />
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && <p className="text-sm text-green-400">{success}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={isLoading}
        className="flex items-center gap-2 px-5 py-2.5 bg-[#62ffff] text-black font-semibold text-sm rounded-lg hover:bg-[#4ae8e8] disabled:opacity-50 transition-colors"
      >
        <Save size={16} />
        {isLoading ? 'Saving…' : 'Save Profile'}
      </button>
    </div>
  );
};

export default ProfileSection;
