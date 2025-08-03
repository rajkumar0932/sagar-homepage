// src/LoginPage.js
import React, { useState } from 'react';
import { auth, db } from './firebase';
import { doc, setDoc } from "firebase/firestore"; 
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import './LoginPage.css';
import ForgotPassword from './ForgotPassword'; // Import the new component

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false); // New state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err) {
        setError("Invalid email or password. Please try again.");
      }
    } else {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await setDoc(doc(db, "userData", user.uid), {
          firstName: firstName,
          lastName: lastName,
          email: user.email,
          attendanceData: {
            'EIM(SB)': { attended: 0, total: 0 }, 'DSP(SRC)': { attended: 0, total: 0 },
            'ADC(TM)': { attended: 0, total: 0 }, 'IM(ABC)': { attended: 0, total: 0 },
            'MPMC': { attended: 0, total: 0 }, 'LAB': { attended: 0, total: 0 }
          },
          gymData: { streak: 0, calendar: {} },
          skinCareData: { streak: 0, calendar: {} },
          groceryList: []
        });
      } catch (err) {
        if (err.code === 'auth/email-already-in-use') {
          setError('This email is already registered.');
        } else {
          setError('Failed to create an account. Please try again.');
        }
      }
    }
  };

  const toggleForm = (e) => {
    e.preventDefault();
    setIsLogin(!isLogin);
    setError('');
  };

  if (showForgotPassword) {
    return <ForgotPassword onBackToLogin={() => setShowForgotPassword(false)} />;
  }

  return (
    <div className="login-page-background">
      {isLogin ? (
        <form className="new-form" onSubmit={handleAuthAction}>
          <p className="new-title">Login</p>
          <p className="new-message">Welcome back! Please enter your details.</p>
          <label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <span>Email</span>
          </label>
          <label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <span>Password</span>
          </label>
          <div className="forgot-password">
            <button type="button" className="link-button" onClick={() => setShowForgotPassword(true)}>
              Forgot Password?
            </button>
          </div>
          <button type="submit" className="new-submit">Submit</button>
          <p className="new-signin">Don't have an account? <button type="button" className="link-button" onClick={toggleForm}>Sign up</button></p>
          {error && <p style={{color: '#ef4444', textAlign: 'center', marginTop: '10px'}}>{error}</p>}
        </form>
      ) : (
        // Register Form
        <form className="new-form" onSubmit={handleAuthAction}>
          <p className="new-title">Register</p>
          <p className="new-message">Signup now and get full access to our app.</p>
          <div className="new-flex">
            <label>
              <input className="input" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              <span>Firstname</span>
            </label>
            <label>
              <input className="input" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              <span>Lastname</span>
            </label>
          </div>
          <label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <span>Email</span>
          </label>
          <label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <span>Password</span>
          </label>
          <label>
            <input className="input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            <span>Confirm password</span>
          </label>
          <button type="submit" className="new-submit">Submit</button>
          <p className="new-signin">Already have an account? <button type="button" className="link-button" onClick={toggleForm}>Sign in</button></p>
          {error && <p style={{color: '#ef4444', textAlign: 'center', marginTop: '10px'}}>{error}</p>}
        </form>
      )}
    </div>
  );
};

export default LoginPage;