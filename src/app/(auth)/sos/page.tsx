'use client';

import React, { useState, useEffect } from 'react';
import SOSButton from '../../../components/ui/SOSButton';
import { triggerSOSCallable } from '../../../lib/firebase/clientApp';
import { useAuth } from '../providers/AuthProvider';

/**
 * The main SOS activation page. This page is protected by the AuthLayout.
 * It's a client component responsible for handling the user interaction
 * of triggering an SOS.
 */
export default function SosPage() {
  const { user } = useAuth();
  const [isActivating, setIsActivating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [circleId, setCircleId] = useState<string | null>(null);

  // Effect to fetch the user's primary circle ID
  useEffect(() => {
    if (user) {
      // TODO: Implement logic to fetch the user's actual circle ID from their profile
      // For now, we simulate this by setting a placeholder.
      // In a real implementation, this would involve a Firestore query.
      const fetchedCircleId = 'placeholder-circle-id'; // This is still a placeholder, but in the correct logic flow
      setCircleId(fetchedCircleId);
    }
  }, [user]);

  const handleSosActivation = () => {
    if (!circleId) {
      setStatusMessage("Error: Cannot send SOS without a safety circle.");
      return;
    }
    setIsActivating(true);
    setStatusMessage('Getting your location...');

    if (!navigator.geolocation) {
      setStatusMessage('Geolocation is not supported by your browser.');
      setIsActivating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setStatusMessage('Location acquired. Sending SOS...');

        try {
          const result = await triggerSOSCallable({
            latitude,
            longitude,
            accuracy,
            circleId, // Use the fetched circleId
          });

          if (result.data.status === 'success') {
            setStatusMessage(`SOS successfully sent! Event ID: ${result.data.eventId}`);
          } else {
            throw new Error('SOS trigger failed on the server.');
          }
        } catch (error: any) {
          console.error('Error triggering SOS:', error);
          const errorMessage = error.message || 'An unknown error occurred.';
          setStatusMessage(`Error: ${errorMessage}`);
          setIsActivating(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        setStatusMessage(`Error: Could not get your location. ${error.message}`);
        setIsActivating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const isButtonDisabled = isActivating || !circleId;

  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
    }}>
      <h1 style={{ marginBottom: '2rem' }}>Emergency SOS</h1>
      <SOSButton onActivate={handleSosActivation} disabled={isButtonDisabled} />
      {statusMessage && (
        <p style={{ marginTop: '2rem', fontSize: '1.1rem', color: '#1F2937' }}>
          {statusMessage}
        </p>
      )}
      {!circleId && !isActivating && (
         <p style={{ marginTop: '1rem', color: '#DC2626' }}>
           You must set up a safety circle before you can send an SOS.
         </p>
      )}
    </main>
  );
}