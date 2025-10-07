'use client';

import React from 'react';
import styles from './IosInstallPrompt.module.css';

// Simple SVG icons to avoid new dependencies
const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
);
const PlusSquareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
);
const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);


interface IosInstallPromptProps {
  onClose: () => void;
}

const IosInstallPrompt: React.FC<IosInstallPromptProps> = ({ onClose }) => {
  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.header}>
            <h2 className={styles.title}>Install Loops for Full Reliability</h2>
            <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                <XIcon />
            </button>
        </div>
        <div className={styles.content}>
            <p className={styles.description}>
                For the best performance and to ensure alerts are never missed, add Loops to your Home Screen.
            </p>
            <div className={styles.importantNote}>
                <strong>Important:</strong> For the most reliable alerts, please keep Loops running in the background.
            </div>
            <ol className={styles.stepsList}>
                <li className={styles.step}>
                    <div className={styles.stepNumber}>1</div>
                    <span>Tap the <ShareIcon /> button in Safari.</span>
                </li>
                <li className={styles.step}>
                    <div className={styles.stepNumber}>2</div>
                    <span>Scroll down and tap <PlusSquareIcon /> 'Add to Home Screen'.</span>
                </li>
                <li className={styles.step}>
                    <div className={styles.stepNumber}>3</div>
                    <span>Tap 'Add' to confirm.</span>
                </li>
            </ol>
        </div>
        <button className={styles.button} onClick={onClose}>
          Got It
        </button>
      </div>
    </>
  );
};

export default IosInstallPrompt;