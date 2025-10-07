'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { startPocketDialDetection, stopPocketDialDetection, isPocketDialRisk } from '../../lib/security/abuseControls';
import { isIOS, isPWA } from '../../lib/utils/platform';
import styles from './SOSButton.module.css';

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
    vibrate(50);

    const progressInterval = holdTime / 100;
    intervalRef.current = setInterval(() => {
      setProgress(p => p + 1);
    }, progressInterval);

    setTimeout(() => vibrate(100), 1000);
    setTimeout(() => vibrate(100), 2000);

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
      vibrate([200, 100, 200]);
      onActivate();

      if (isIOS() && isPWA()) {
        console.log('iOS PWA detected. Triggering local backup notification.');
        if (Notification.permission === 'granted') {
          new Notification('SOS Activated - Reminder', {
            body: 'Your alert has been sent. For the most reliable updates, please keep Loops open in the background.',
            icon: '/favicon.ico',
          });
        }
      }

      if (intervalRef.current) clearInterval(intervalRef.current);
    }, holdTime);
  };

  const cancelHold = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (sosState !== 'activated') {
      setSosState('canceled');
      setStatusText('Activation Canceled. Press and hold to try again.');
      setProgress(0);
    }
  }, [sosState]);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    startHold();
  };
  const handlePointerUp = () => cancelHold();
  const handlePointerLeave = () => {
    if (sosState === 'holding') cancelHold();
  };

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

  useEffect(() => {
    startPocketDialDetection();
    return () => {
      stopPocketDialDetection();
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const progressStyle = {
    background: `conic-gradient(var(--destructive) ${progress * 3.6}deg, var(--secondary) ${progress * 3.6}deg)`
  };

  const buttonClasses = `${styles.sosButton} ${sosState === 'idle' ? styles.idle : ''}`;
  const statusClasses = `${styles.sosStatus} ${sosState === 'activated' ? styles.activated : ''}`;

  return (
    <div className={styles.sosButtonContainer}>
      <button
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        disabled={disabled || sosState === 'activated'}
        aria-label="SOS Emergency Button"
        aria-describedby="sos-status"
        className={buttonClasses}
        style={progressStyle}
      >
        <div className={styles.sosButtonInner}>
          SOS
        </div>
      </button>
      <div id="sos-status" aria-live="assertive" className={statusClasses}>
        {statusText}
      </div>
    </div>
  );
};

export default SOSButton;