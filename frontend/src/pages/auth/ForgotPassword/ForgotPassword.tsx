import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import '../Signup/Signup.css';
import './ForgotPassword.css';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState(false);

  const validateEmail = (val: string) => {
    if (!val) {
      return 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(val)) {
      return 'Invalid email format';
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (touched) {
      setError(validateEmail(val));
    }
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validateEmail(email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="auth-container">
        <div className="signup-card success-card">
          <div className="success-icon-wrapper">
            <CheckCircle2 size={64} className="success-icon" />
          </div>
          <div className="signup-header">
            <h2>Check your email</h2>
            <p>If this email exists, you'll receive a reset link shortly.</p>
          </div>
          <Link to="/login" className="submit-btn back-to-login-btn">
            <ArrowLeft size={20} />
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="signup-card">
        <div className="signup-header">
          <h2>Reset Password</h2>
          <p>Enter your email address and we'll send you a link to reset your password.</p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="name@company.com"
                value={email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={error ? 'error' : ''}
                autoComplete="email"
              />
              <div className="input-icon">
                <Mail size={20} />
              </div>
            </div>
            {error && <span className="error-message">{error}</span>}
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Sending Link...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <p className="login-link">
          Remember your password? <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
