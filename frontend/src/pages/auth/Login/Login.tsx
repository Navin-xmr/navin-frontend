import React from 'react';
import { Link } from 'react-router-dom';

const Login: React.FC = () => {
  return (
    <div className="auth-container">
      <div className="signup-card">
        <div className="signup-header">
          <h2>Login</h2>
          <p>Login content coming soon...</p>
        </div>
        <p className="login-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
