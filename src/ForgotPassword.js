// src/ForgotPassword.js
import React, { useState } from 'react';
import { auth } from './firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import './LoginPage.css'; // We can reuse the same styles

const ForgotPassword = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Please check your inbox and spam folder.');
    } catch (err) {
      setError('Failed to send reset email. Please check the address.');
      console.error(err);
    }
  };

  return (
    <div className="login-page-background">
      <form className="new-form" onSubmit={handleSubmit}>
        <p className="new-title">Reset Password</p>
        <p className="new-message">Enter your email to receive a reset link.</p>
        
        <label>
          <input 
            className="input" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <span>Email</span>
        </label>
        
        <button type="submit" className="new-submit">Send Reset Link</button>
        
        {message && <p style={{color: '#4ade80', textAlign: 'center', marginTop: '10px'}}>{message}</p>}
        {error && <p style={{color: '#ef4444', textAlign: 'center', marginTop: '10px'}}>{error}</p>}

        <p className="new-signin">
          <button type="button" className="link-button" onClick={onBackToLogin}>
            &larr; Back to Login
          </button>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;