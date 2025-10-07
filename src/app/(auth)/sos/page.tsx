'use client';

import React from 'react';
import SOSButton from '@/components/ui/SOSButton';
import styles from './page.module.css';

export default function SOSPage() {
  const handleSOSActivation = () => {
    // This is where the actual SOS activation logic would be triggered.
    // For now, we'll just log to the console.
    console.log('SOS Activated from SOS Page!');
    // In a real implementation, this would likely involve making an API call.
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Emergency SOS</h1>
        <p className={styles.description}>
          In a genuine emergency, press and hold the button below.
        </p>
        <SOSButton onActivate={handleSOSActivation} />
      </div>
    </div>
  );
}