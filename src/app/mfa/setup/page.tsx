'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import {
  getMultiFactorResolver,
  TotpMultiFactorGenerator,
  TotpFactor,
  verifyTotpAssertion,
  multiFactor,
  ActionCodeInfo,
} from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { clientAuth, clientDb } from '../../../lib/firebase/clientApp';
import { useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';

/**
 * A page to guide the user through setting up Time-based One-Time Password (TOTP) MFA.
 */
export default function MfaSetupPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [qrCodeUri, setQrCodeUri] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  // Generate the TOTP secret and QR code URI when the component mounts
  useEffect(() => {
    const generateSecret = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const multiFactorSession = await multiFactor(user).getSession();
        const secret = await multiFactor(user).generateSecret(multiFactorSession);
        setSession(multiFactorSession);

        const qrCodeUri = secret.toUri();
        setQrCodeUri(qrCodeUri);
      } catch (err) {
        console.error("Error generating MFA secret:", err);
        setError("Could not generate MFA secret. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    generateSecret();
  }, [user]);

  const handleVerifyAndEnroll = async () => {
    if (!user || !session || !verificationCode) {
      setError("Verification code is required.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const multiFactorAssertion = TotpMultiFactorGenerator.assertionForEnrollment(
        session,
        verificationCode
      );

      await multiFactor(user).enroll(multiFactorAssertion, 'My Authenticator App');

      // Update the user's profile to mark MFA as enabled
      const profileRef = doc(clientDb, 'profiles', user.uid);
      await updateDoc(profileRef, {
        'security_settings.mfa_enabled': true,
      });

      // Redirect to the dashboard on success
      router.replace('/dashboard');

    } catch (err) {
      console.error("Error verifying MFA code:", err);
      setError("Invalid verification code. Please try again.");
      setLoading(false);
    }
  };

  if (!user) {
    return <p>Loading user information...</p>;
  }

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '2rem', textAlign: 'center' }}>
      <h1>Set Up Multi-Factor Authentication</h1>
      <p>To enhance your account's security, please set up MFA using an authenticator app (like Google Authenticator, Authy, or 1Password).</p>

      {loading && <p>Generating your unique QR code...</p>}

      {qrCodeUri && (
        <div style={{ margin: '2rem 0', padding: '1rem', backgroundColor: 'white', display: 'inline-block' }}>
          <QRCode value={qrCodeUri} />
        </div>
      )}

      {qrCodeUri && (
        <>
          <p>Scan the QR code with your authenticator app, then enter the 6-digit code below.</p>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter 6-digit code"
            maxLength={6}
            style={{ padding: '0.5rem', fontSize: '1.2rem', width: '200px', textAlign: 'center', margin: '1rem 0' }}
          />
          <button onClick={handleVerifyAndEnroll} disabled={loading || verificationCode.length < 6} style={{ display: 'block', margin: 'auto', padding: '0.75rem 1.5rem' }}>
            {loading ? 'Verifying...' : 'Verify & Complete Setup'}
          </button>
        </>
      )}

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
    </div>
  );
}