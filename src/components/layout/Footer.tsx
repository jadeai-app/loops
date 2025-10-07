'use client';

import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  const footerStyle: React.CSSProperties = {
    backgroundColor: '#F9FAFB', // Gray-50
    borderTop: '1px solid #E5E7EB', // Gray-200
    padding: '2rem 1rem',
    textAlign: 'center',
    marginTop: 'auto', // Pushes the footer to the bottom in a flex container
  };

  const linkContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    gap: '1.5rem',
    marginBottom: '1rem',
  };

  const linkStyle: React.CSSProperties = {
    color: '#4B5563', // Gray-600
    textDecoration: 'none',
    fontSize: '0.9rem',
  };

  const copyrightStyle: React.CSSProperties = {
    color: '#6B7280', // Gray-500
    fontSize: '0.8rem',
  };

  return (
    <footer style={footerStyle}>
      <div style={linkContainerStyle}>
        <Link href="/TERMS_OF_SERVICE.md" passHref>
          <span style={linkStyle}>Terms of Service</span>
        </Link>
        <Link href="/PRIVACY_POLICY.md" passHref>
          <span style={linkStyle}>Privacy Policy</span>
        </Link>
        <Link href="/PRIVACY.md" passHref>
          <span style={linkStyle}>Data Retention</span>
        </Link>
      </div>
      <p style={copyrightStyle}>
        © {new Date().getFullYear()} Loops. All rights reserved.
      </p>
      <p style={{...copyrightStyle, marginTop: '0.5rem', fontStyle: 'italic'}}>
        Disclaimer: Loops is not a replacement for 911 or other emergency services.
      </p>
    </footer>
  );
};

export default Footer;