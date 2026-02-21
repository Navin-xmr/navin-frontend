import React, { useState } from 'react';
import { Camera, Save, CheckCircle2, Loader2, Link as LinkIcon, Bell, Building2 } from 'lucide-react';
import { WalletConnectButton } from '../../../../components/auth/WalletConnectButton/WalletConnectButton';
import './CompanySettings.css';

const CompanySettings: React.FC = () => {
    const [profile, setProfile] = useState({
        name: 'Navin Logistics',
        address: '123 Supply Chain Blvd, Singapore 109332',
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const [notifications, setNotifications] = useState({
        email: true,
        inApp: true,
        sms: false,
    });

    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

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

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        setLoading(true);
        setSuccessMsg('');
        setTimeout(() => {
            setLoading(false);
            setSuccessMsg('Settings saved successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
        }, 1500);
    };

  return (
    <div className="company-settings-container">
      <div className="settings-header">
        <h1>Company Settings</h1>
        <p>Manage your company profile, notifications, and connected wallets.</p>
      </div>

          <div className="settings-content">
              {/* Company Profile Section */}
              <section className="settings-card">
                  <div className="card-header">
                      <Building2 className="card-icon" size={24} />
                      <h2>Company Profile</h2>
                  </div>
                  <div className="card-body">
                      <div className="logo-upload-group">
                          <label>Company Logo</label>
                          <div className="logo-preview-container">
                              {logoPreview ? (
                                  <img src={logoPreview} alt="Company Logo" className="logo-preview" />
                              ) : (
                                  <div className="logo-placeholder">
                                      <Camera size={32} color="#475569" />
                                  </div>
                              )}
                              <div className="upload-actions">
                                  <label htmlFor="logo-upload" className="upload-btn">
                                      Upload new
                                  </label>
                                  <input
                                      type="file"
                                      id="logo-upload"
                                      accept="image/*"
                                      onChange={handleLogoUpload}
                                      hidden
                                  />
                                  <p className="upload-hint">JPG, GIF or PNG. Max size 2MB</p>
                              </div>
                          </div>
                      </div>

                      <div className="form-group">
                          <label htmlFor="companyName">Company Name</label>
                          <input
                              type="text"
                              id="companyName"
                              name="name"
                              value={profile.name}
                              onChange={handleProfileChange}
                          />
                      </div>

                      <div className="form-group">
                          <label htmlFor="companyAddress">Company Address</label>
                          <textarea
                              id="companyAddress"
                              name="address"
                              rows={3}
                              value={profile.address}
                              onChange={handleProfileChange}
                          />
                      </div>
                  </div>
              </section>

              {/* Notification Preferences Section */}
              <section className="settings-card">
                  <div className="card-header">
                      <Bell className="card-icon" size={24} />
                      <h2>Notification Preferences</h2>
                  </div>
                  <div className="card-body">
                      <div className="toggle-group">
                          <div className="toggle-info">
                              <span className="toggle-label">Email Alerts</span>
                              <span className="toggle-desc">Receive shipment updates via email</span>
                          </div>
                          <label className="switch">
                              <input
                                  type="checkbox"
                                  checked={notifications.email}
                                  onChange={() => toggleNotification('email')}
                              />
                              <span className="slider round"></span>
                          </label>
                      </div>

                      <div className="toggle-group">
                          <div className="toggle-info">
                              <span className="toggle-label">In-App Notifications</span>
                              <span className="toggle-desc">Show alerts within the dashboard</span>
                          </div>
                          <label className="switch">
                              <input
                                  type="checkbox"
                                  checked={notifications.inApp}
                                  onChange={() => toggleNotification('inApp')}
                              />
                              <span className="slider round"></span>
                          </label>
                      </div>

                      <div className="toggle-group">
                          <div className="toggle-info">
                              <span className="toggle-label">SMS Alerts</span>
                              <span className="toggle-desc">Receive critical alerts via SMS text</span>
                          </div>
                          <label className="switch">
                              <input
                                  type="checkbox"
                                  checked={notifications.sms}
                                  onChange={() => toggleNotification('sms')}
                              />
                              <span className="slider round"></span>
                          </label>
                      </div>
                  </div>
              </section>

              {/* Connected Wallet Section */}
              <section className="settings-card">
                  <div className="card-header">
                      <LinkIcon className="card-icon" size={24} />
                      <h2>Connected Wallet</h2>
                  </div>
                  <div className="card-body">
                      <p className="wallet-desc">
                          Connect your Freighter wallet to authorize blockchain transactions and manage smart contracts.
                      </p>
                      <div className="wallet-connect-wrapper">
                          <WalletConnectButton />
                      </div>
                  </div>
              </section>
          </div>

          <div className="settings-footer">
              {successMsg && (
                  <div className="success-toast">
                      <CheckCircle2 size={18} />
                      {successMsg}
                  </div>
              )}
              <button
                  className="save-btn"
                  onClick={handleSave}
                  disabled={loading}
              >
                  {loading ? (
                      <>
                          <Loader2 className="spinner" size={18} />
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
