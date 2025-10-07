'use client';

import React from 'react';

interface IosInstallPromptProps {
  onClose: () => void;
}

const IosInstallPrompt: React.FC<IosInstallPromptProps> = ({ onClose }) => {
  const modalStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '400px',
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    textAlign: 'center',
  };

  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  };

  const headerStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  };

  const paragraphStyle: React.CSSProperties = {
    marginBottom: '1.5rem',
    lineHeight: '1.6',
  };

  const importantNoteStyle: React.CSSProperties = {
    ...paragraphStyle,
    fontWeight: 'bold',
    color: '#DC2626', // Red-600
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: '#1F2937', // Gray-800
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
  };

  return (
    <>
      <div style={backdropStyle} onClick={onClose} />
      <div style={modalStyle}>
        <h2 style={headerStyle}>Install Loops for Full Reliability</h2>
        <p style={paragraphStyle}>
          To get the best performance and ensure alerts are not missed, install Loops on your Home Screen.
        </p>
        <p style={importantNoteStyle}>
          For the most reliable alerts, please keep Loops open in the background.
        </p>
        <ol style={{ textAlign: 'left', paddingLeft: '2rem', marginBottom: '1.5rem' }}>
          <li>Tap the <strong>Share</strong> button in Safari.</li>
          <li>Scroll down and tap <strong>'Add to Home Screen'</strong>.</li>
          <li>Tap <strong>'Add'</strong> to confirm.</li>
        </ol>
        <button style={buttonStyle} onClick={onClose}>
          Got It
        </button>
      </div>
    </>
  );
};

export default IosInstallPrompt;