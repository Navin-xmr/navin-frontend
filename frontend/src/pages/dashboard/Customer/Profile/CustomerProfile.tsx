import React, { useState } from 'react';
import { Wallet, Save, AlertCircle, CheckCircle } from 'lucide-react';
import './CustomerProfile.css';

interface FormErrors {
  fullName?: string;
  phone?: string;
  address?: string;
}

interface ProfileFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

const CustomerProfile: React.FC = () => {
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: 'Alex Sterling',
    email: 'alex.sterling@logistics.com',
    phone: '+1 (555) 123-4567',
    address: '1234 Shipping Lane, Cargo City, CC 12345',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [walletConnected, setWalletConnected] = useState(true);
  const [walletAddress, setWalletAddress] = useState('0x742d35Cc6634C0532925a3b844Bc59e5c3d0fA6d');

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Full name must be at least 2 characters';
        if (!/^[a-zA-Z\s'-]+$/.test(value)) return 'Full name can only contain letters, spaces, hyphens, and apostrophes';
        return undefined;
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!/^[\d\s\-+()\.]/.test(value)) return 'Invalid phone number format';
        if (value.replace(/\D/g, '').length < 10) return 'Phone number must have at least 10 digits';
        return undefined;
      case 'address':
        if (!value.trim()) return 'Delivery address is required';
        if (value.trim().length < 5) return 'Address must be at least 5 characters';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Real-time validation
    const error = validateField(name, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
        return newErrors;
      });
    }

    // Clear success message when user starts editing
    setSaveSuccess(false);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    const fullNameError = validateField('fullName', formData.fullName);
    if (fullNameError) newErrors.fullName = fullNameError;

    const phoneError = validateField('phone', formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    const addressError = validateField('address', formData.address);
    if (addressError) newErrors.address = addressError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  const handleConnectWallet = () => {
    // Mock wallet connection - in real app, this would use Web3
    setWalletConnected(!walletConnected);
    if (!walletConnected) {
      setWalletAddress('0x742d35Cc6634C0532925a3b844Bc59e5c3d0fA6d');
    } else {
      setWalletAddress('');
    }
  };

  return (
    <div className="customer-profile-container">
      <div className="profile-header">
        <h1 className="profile-title">Profile Settings</h1>
        <p className="profile-subtitle">Manage your account information and connected wallet</p>
      </div>

      <div className="profile-content">
        {/* Wallet Section */}
        <section className="wallet-section">
          <div className="wallet-header">
            <div className="wallet-icon-wrapper">
              <Wallet size={20} />
            </div>
            <div className="wallet-info">
              <h2>Connected Wallet</h2>
              <p>{walletConnected ? 'Your wallet is connected' : 'No wallet connected'}</p>
            </div>
          </div>
          <div className="wallet-content">
            {walletConnected && walletAddress ? (
              <div className="wallet-address-display">
                <span className="wallet-label">Wallet Address:</span>
                <code className="wallet-address">{walletAddress}</code>
                <button 
                  type="button" 
                  className="wallet-button disconnect"
                  onClick={handleConnectWallet}
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="wallet-not-connected">
                <p>No wallet connected</p>
                <button 
                  type="button" 
                  className="wallet-button connect"
                  onClick={handleConnectWallet}
                >
                  Connect Wallet
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Profile Form Section */}
        <section className="profile-form-section">
          <h2 className="form-section-title">Personal Information</h2>
          <form onSubmit={handleSubmit} className="profile-form">
            {/* Full Name Field */}
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{errors.fullName}</span>
                </div>
              )}
            </div>

            {/* Email Field (Read-only) */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                disabled
                className="form-input input-disabled"
                placeholder="Email address"
              />
              <p className="field-note">Email address cannot be changed</p>
            </div>

            {/* Phone Number Field */}
            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Phone Number <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`form-input ${errors.phone ? 'input-error' : ''}`}
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{errors.phone}</span>
                </div>
              )}
            </div>

            {/* Delivery Address Field */}
            <div className="form-group">
              <label htmlFor="address" className="form-label">
                Delivery Address <span className="required">*</span>
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`form-textarea ${errors.address ? 'input-error' : ''}`}
                placeholder="Enter your delivery address"
                rows={4}
              />
              {errors.address && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{errors.address}</span>
                </div>
              )}
            </div>

            {/* Success Message */}
            {saveSuccess && (
              <div className="success-message">
                <CheckCircle size={16} />
                <span>Profile updated successfully!</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="form-actions">
              <button
                type="submit"
                disabled={loading || Object.keys(errors).length > 0}
                className="save-button"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default CustomerProfile;
