import React, { useState } from 'react';
import { Camera, Save, Loader2, Link as LinkIcon, Building2 } from 'lucide-react';
import { useToast } from '@context/ToastContext';
import { WalletConnectButton } from '../../../../components/auth/WalletConnectButton/WalletConnectButton';
import NotificationPreferences from '../../../Settings/NotificationPreferences/NotificationPreferences';
import MyTemplatesSection from '../../../Settings/sections/MyTemplatesSection';
import { useTranslation } from "react-i18next";

const CompanySettings: React.FC = () => {
    const { t, i18n } = useTranslation("common");
    const [profile, setProfile] = useState({
        name: 'Navin Logistics',
        address: '123 Supply Chain Blvd, Singapore 109332',
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const [loading, setLoading] = useState<boolean>(false);
    const { addToast } = useToast();

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setLogoPreview(url);
        }
    };

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            addToast('Settings saved successfully!', 'success');
        }, 1500);
    };

  return (
 <div className="py-5 px-4 sm:py-8 sm:px-6 max-w-[900px] mx-auto min-h-[calc(100vh-80px)] text-[#F1F5F9]">
    <div className="mb-8">
    <div className="flex justify-between items-center">
        <div>
            <h1 className="text-[28px] font-semibold mb-2">{t("settings")}</h1>
            <p className="text-[15px] text-[#94A3B8]">
                Manage your company profile, notifications, and connected wallets.
            </p>
        </div>

        <select
            value={i18n.language}
            onChange={(e) => {
                const lang = e.target.value;
                i18n.changeLanguage(lang);
                localStorage.setItem("language", lang);
            }}
            className="border rounded-md px-3 py-2"
        >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
        </select>
    </div>
    </div>


          <div className="flex flex-col gap-6">
              {/* Company Profile Section */}
              <section className="bg-[#14171E] border border-[#1E293B] rounded-xl overflow-hidden shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]">
                  <div className="p-4 sm:px-6 sm:pt-6 sm:pb-5 flex items-center gap-3 border-b border-[#1E293B]">
                      <Building2 className="text-[#3B82F6] bg-[rgba(59,130,246,0.1)] p-1.5 rounded-lg [box-sizing:content-box]" size={24} />
                      <h2 className="text-lg font-semibold m-0">{t("companyProfile")}</h2>
                  </div>
                  <div className="p-4 sm:p-6 flex flex-col gap-6">
                      <div className="flex flex-col gap-3 border-b border-[#1E293B] pb-6 mb-2">
                          <label>{t("companyLogo")}</label>
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
              <button
                  className="flex items-center gap-2 px-6 py-3 bg-[#3B82F6] text-white border-none rounded-lg text-[15px] font-medium cursor-pointer transition-colors duration-200 enabled:hover:bg-[#2563EB] disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto justify-center sm:justify-start"
                  onClick={handleSave}
                  disabled={loading}
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
