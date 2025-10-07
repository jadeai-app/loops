'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface SignupStep2Props {
  onCompleted: () => void;
}

const SignupStep2: React.FC<SignupStep2Props> = ({ onCompleted }) => {
  const [agreed, setAgreed] = useState(false);

  const containerStyle: React.CSSProperties = {
    maxWidth: '450px',
    margin: '2rem auto',
    padding: '2rem',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
  };

  const headerStyle: React.CSSProperties = {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  };

  const paragraphStyle: React.CSSProperties = {
    marginBottom: '1.5rem',
    lineHeight: '1.6',
    color: '#4B5563',
  };

  const checkboxContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '2rem',
  };

  const linkStyle: React.CSSProperties = {
    color: '#3B82F6', // Blue-500
    textDecoration: 'underline',
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: agreed ? '#1F2937' : '#9CA3AF', // Gray-800 or Gray-400
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: agreed ? 'pointer' : 'not-allowed',
    width: '100%',
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Security & Privacy</h2>
      <p style={paragraphStyle}>
        Your security is our priority. We strongly recommend setting up Multi-Factor Authentication (MFA) to protect your account.
      </p>

      {/* Placeholder for MFA setup component */}
      <div style={{ padding: '2rem', backgroundColor: '#F3F4F6', borderRadius: '8px', marginBottom: '2rem' }}>
        <p>MFA Setup Component Placeholder</p>
      </div>

      <div style={checkboxContainerStyle}>
        <input
          type="checkbox"
          id="terms-agree"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          style={{ marginRight: '0.5rem' }}
        />
        <label htmlFor="terms-agree">
          I agree to the{' '}
          <Link href="/TERMS_OF_SERVICE.md" passHref>
            <span style={linkStyle}>Terms of Service</span>
          </Link>{' '}
          and{' '}
          <Link href="/PRIVACY_POLICY.md" passHref>
            <span style={linkStyle}>Privacy Policy</span>
          </Link>
          .
        </label>
      </div>

      <button
        style={buttonStyle}
        onClick={onCompleted}
        disabled={!agreed}
      >
        Continue
      </button>
    </div>
  );
};

export default SignupStep2;