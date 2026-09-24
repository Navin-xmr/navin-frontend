import React, { useState, useEffect, useRef } from 'react';
import { Camera, Save, Loader2, Link as LinkIcon, Building2, AlertTriangle } from 'lucide-react';
import { useToast } from '@context/ToastContext';
import { companyApi } from '@services/api';
import { WalletConnectButton } from '../../../../components/auth/WalletConnectButton/WalletConnectButton';
import NotificationPreferences from '../../../Settings/NotificationPreferences/NotificationPreferences';
import MyTemplatesSection from '../../../Settings/sections/MyTemplatesSection';
import { useTranslation } from 'react-i18next';

const CompanySettings: React.FC = () => {
    const { t } = useTranslation('common');
    const [profile, setProfile] = useState({ name: '', address: '' });
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const { addToast } = useToast();

    // Track the current blob URL so we can revoke it before creating a new one
    const prevLogoUrlRef = useRef<string | null>(null);

    // Load company profile on mount
    useEffect(() => {
        let cancelled = false;
        setProfileLoading(true);
        setProfileError(null);
        companyApi.getProfile()
            .then((data) => {
                if (cancelled) return;
                setProfile({ name: data.name, address: data.address });
                if (data.logoUrl) setLogoPreview(data.logoUrl);
            })
            .catch(() => {
                if (cancelled) return;
                setProfileError('Failed to load company profile.');
            })
            .finally(() => {
                if (cancelled) return;
                setProfileLoading(false);
            });
        return () => { cancelled = true; };
    }, []);

    // Revoke any pending blob URL on unmount
    useEffect(() => {
        return () => {
            if (prevLogoUrlRef.current) {
                URL.revokeObjectURL(prevLogoUrlRef.current);
            }
        };
    }, []);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // Revoke the previous preview URL to avoid memory leaks
        if (prevLogoUrlRef.current) {
            URL.revokeObjectURL(prevLogoUrlRef.current);
        }
        const url = URL.createObjectURL(file);
        prevLogoUrlRef.current = url;
        setLogoPreview(url);
        setLogoFile(file);
    };

    const handleSave = async () => {
        setLoading(true);
        setSaveError(null);
        try {
            if (logoFile) {
                await companyApi.uploadLogo(logoFile);
            }
            await companyApi.updateProfile(profile);
            addToast('Settings saved successfully!', 'success');
        } catch {
            setSaveError('Failed to save settings. Please try again.');
            addToast('Failed to save settings', 'error');
        } finally {
            setLoading(false);
        }
    };

  return (
 <div className="py-5 px-4 sm:py-8 sm:px-6 max-w-[900px] mx-auto min-h-[calc(100vh-80px)] text-[#F1F5F9]">
    <div className="mb-8">
        <h1 className="text-[28px] font-semibold mb-2">{t('settings')}</h1>
        <p className="text-[15px] text-[#94A3B8]">
            Manage your company profile, notifications, and connected wallets.
        </p>
    </div>


          <div className="flex flex-col gap-6">
              {/* Company Profile Section */}
              <section className="bg-[#14171E] border border-[#1E293B] rounded-xl overflow-hidden shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]">
                  <div className="p-4 sm:px-6 sm:pt-6 sm:pb-5 flex items-center gap-3 border-b border-[#1E293B]">
                      <Building2 className="text-[#3B82F6] bg-[rgba(59,130,246,0.1)] p-1.5 rounded-lg [box-sizing:content-box]" size={24} />
                      <h2 className="text-lg font-semibold m-0">{t('companyProfile')}</h2>
                  </div>

                  {profileLoading ? (
                      <div className="p-6 flex items-center justify-center gap-3 text-slate-400">
                          <Loader2 className="animate-spin" size={20} />
                          <span className="text-sm">Loading profile…</span>
                      </div>
                  ) : profileError ? (
                      <div className="p-6 flex items-center gap-3 text-red-400">
                          <AlertTriangle size={20} />
                          <span className="text-sm">{profileError}</span>
                      </div>
                  ) : (
                  <div className="p-4 sm:p-6 flex flex-col gap-6">
                      <div className="flex flex-col gap-3 border-b border-[#1E293B] pb-6 mb-2">
                          <label>{t('companyLogo')}</label>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                              {logoPreview ? (
                                  <img src={logoPreview} alt="Company Logo" className="w-20 h-20 rounded-xl bg-[#0B0E14] border border-dashed border-[#3B82F6] object-cover" />
                              ) : (
                                  <div className="w-20 h-20 rounded-xl bg-[#0B0E14] border border-dashed border-[#3B82F6] flex items-center justify-center">
                                      <Camera size={32} color="#475569" />
                                  </div>
                              )}
                              <div className="flex flex-col gap-2">
                                  <label htmlFor="logo-upload" className="bg-[#1E293B] text-[#F1F5F9] border border-[#334155] px-4 py-2 rounded-md text-[13px] font-medium cursor-pointer inline-block self-start transition-colors duration-200 hover:bg-[#334155]">
                                      Upload new
                                  </label>
                                  <input
                                      type="file"
                                      id="logo-upload"
                                      accept="image/*"
                                      onChange={handleLogoUpload}
                                      hidden
                                  />
                                  <p className="text-xs text-[#64748B] m-0">JPG, GIF or PNG. Max size 2MB</p>
                              </div>
                          </div>
                      </div>

                      <div className="flex flex-col gap-2">
                          <label htmlFor="companyName" className="text-sm font-medium text-[#CBD5E1]">Company Name</label>
                          <input
                              type="text"
                              id="companyName"
                              name="name"
                              value={profile.name}
                              onChange={handleProfileChange}
                              className="bg-[#0B0E14] border border-[#1E293B] rounded-lg px-4 py-3 text-[#F1F5F9] text-sm font-[inherit] transition-[border-color,box-shadow] duration-200 focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_2px_rgba(59,130,246,0.2)]"
                          />
                      </div>

                      <div className="flex flex-col gap-2">
                          <label htmlFor="companyAddress" className="text-sm font-medium text-[#CBD5E1]">Company Address</label>
                          <textarea
                              id="companyAddress"
                              name="address"
                              rows={3}
                              value={profile.address}
                              onChange={handleProfileChange}
                              className="bg-[#0B0E14] border border-[#1E293B] rounded-lg px-4 py-3 text-[#F1F5F9] text-sm font-[inherit] transition-[border-color,box-shadow] duration-200 focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_2px_rgba(59,130,246,0.2)]"
                          />
                      </div>
                  </div>
                  )}
              </section>

              {/* Notification Preferences Section */}
              <NotificationPreferences />

              <MyTemplatesSection />

              {/* Connected Wallet Section */}
              <section className="bg-[#14171E] border border-[#1E293B] rounded-xl overflow-hidden shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]">
                  <div className="p-4 sm:px-6 sm:pt-6 sm:pb-5 flex items-center gap-3 border-b border-[#1E293B]">
                      <LinkIcon className="text-[#3B82F6] bg-[rgba(59,130,246,0.1)] p-1.5 rounded-lg [box-sizing:content-box]" size={24} />
                      <h2 className="text-lg font-semibold m-0">Connected Wallet</h2>
                  </div>
                  <div className="p-4 sm:p-6 flex flex-col gap-6">
                      <p className="text-[#94A3B8] text-sm mb-4 leading-relaxed">
                          Connect your Freighter wallet to authorize blockchain transactions and manage smart contracts.
                      </p>
                      <div className="flex items-start">
                          <WalletConnectButton />
                      </div>
                  </div>
              </section>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end items-center gap-5 mt-8 pt-6 border-t border-[#1E293B]">
              {saveError && (
                  <p className="text-sm text-red-400 mr-auto">{saveError}</p>
              )}
              <button
                  className="flex items-center gap-2 px-6 py-3 bg-[#3B82F6] text-white border-none rounded-lg text-[15px] font-medium cursor-pointer transition-colors duration-200 enabled:hover:bg-[#2563EB] disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto justify-center sm:justify-start"
                  onClick={() => void handleSave()}
                  disabled={loading || profileLoading}
              >
                  {loading ? (
                      <>
                          <Loader2 className="animate-spin" size={18} />
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
    </div>
  );
};

export default CompanySettings;
