'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { startPocketDialDetection, stopPocketDialDetection, isPocketDialRisk } from '../../lib/security/abuseControls';
import { isIOS, isPWA } from '../../lib/utils/platform';

// Define the props for the component
interface SOSButtonProps {
  onActivate: () => void; // Callback function when SOS is successfully activated
  holdTime?: number; // Optional: allow extending hold time for accessibility
  disabled?: boolean;
}

// Define the possible states for the button
type SOSState = 'idle' | 'holding' | 'activated' | 'canceled';

const SOSButton: React.FC<SOSButtonProps> = ({ onActivate, holdTime = 3000, disabled = false }) => {
  const [sosState, setSosState] = useState<SOSState>('idle');
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Press and hold for 3 seconds to activate SOS');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Haptic feedback function
  const vibrate = (pattern: number | number[]) => {
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate(pattern);
    }
  };

  const startHold = () => {
    if (disabled || sosState === 'holding') return;

    setSosState('holding');
    setStatusText('Activating...');
    setProgress(0);
    vibrate(50); // Initial light vibration

    // Interval to update the progress bar
    intervalRef.current = setInterval(() => {
      setProgress(p => p + 10);
    }, holdTime / 100);

    // Haptic pulses at 1s and 2s
    setTimeout(() => vibrate(100), 1000);
    setTimeout(() => vibrate(100), 2000);

    // Main timer to activate the SOS
    timerRef.current = setTimeout(() => {
      if (isPocketDialRisk()) {
        console.warn('SOS activation canceled due to high pocket-dial risk.');
        setStatusText('Activation Canceled: High risk of false alarm.');
        cancelHold();
        return;
      }

      setSosState('activated');
      setStatusText('SOS Activated!');
      setProgress(100);
      vibrate([200, 100, 200]); // Success vibration
      onActivate();

      // For iOS PWAs, push notifications can be unreliable.
      // Trigger a local notification as a backup reminder for the sender.
      if (isIOS() && isPWA()) {
        console.log('iOS PWA detected. Triggering local backup notification.');
        // Ensure we have permission before trying to show a notification.
        if (Notification.permission === 'granted') {
          new Notification('SOS Activated - Reminder', {
            body: 'Your alert has been sent. For the most reliable updates, please keep Loops open in the background.',
            icon: '/favicon.ico', // Optional: adds an icon
          });
        }
      }

      if (intervalRef.current) clearInterval(intervalRef.current);
    }, holdTime);
  };

  const cancelHold = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Only reset state if it hasn't been successfully activated
    if (sosState !== 'activated') {
      setSosState('canceled');
      setStatusText('Activation Canceled. Press and hold to try again.');
      setProgress(0);
    }
  }, [sosState]);

  // Event handlers for pointer events (works for mouse, touch, pen)
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    // Only respond to the primary button (e.g., left mouse click)
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    startHold();
  };

  const handlePointerUp = () => {
    cancelHold();
  };

  const handlePointerLeave = () => {
    // If the user is still holding down the button and moves the pointer away, cancel.
    if (sosState === 'holding') {
      cancelHold();
    }
  };

  // Keyboard accessibility handlers
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      startHold();
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      cancelHold();
    }
  };

  // Effect to manage pocket-dial detection listeners
  useEffect(() => {
    startPocketDialDetection();

    // Cleanup function to stop listeners when the component unmounts
    return () => {
      stopPocketDialDetection();
      // Also clear any running timers on unmount
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const buttonColor = disabled ? '#9CA3AF' : '#DC2626'; // Gray when disabled, Red otherwise
  const progressStyle = {
    background: `conic-gradient(${buttonColor} ${progress * 3.6}deg, #F3F4F6 ${progress * 3.6}deg)`
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <button
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        disabled={disabled || sosState === 'activated'}
        aria-label="SOS Emergency Button"
        aria-describedby="sos-status"
        style={{
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          border: 'none',
          color: 'white',
          fontSize: '2rem',
          fontWeight: 'bold',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          background: '#F3F4F6', // Light gray background for the progress track
          outline: 'none',
          ...progressStyle,
          transition: 'background-color 0.3s',
        }}
      >
        <div style={{
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          backgroundColor: buttonColor,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1,
        }}>
          SOS
        </div>
      </button>
      <div id="sos-status" aria-live="assertive" style={{ marginTop: '20px', fontSize: '1.2rem', color: '#4B5563' }}>
        {statusText}
      </div>
    </div>
  );
};

export default SOSButton;