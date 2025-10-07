'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AccessibilityContextType {
  announce: (message: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: ReactNode;
}

/**
 * Provides an assertive ARIA live region to announce critical updates to screen readers.
 * This is essential for notifying users of events like "SOS activated" or "Error saving data".
 */
export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [announcement, setAnnouncement] = useState('');

  const announce = useCallback((message: string) => {
    // Set the message, then clear it after a short delay.
    // This ensures that the same message can be announced again if needed.
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(''), 200);
  }, []);

  return (
    <AccessibilityContext.Provider value={{ announce }}>
      {children}
      {/*
        This is the ARIA live region.
        - `aria-live="assertive"` ensures that screen readers announce the message immediately,
          interrupting any current speech. This is crucial for urgent alerts.
        - `aria-atomic="true"` ensures the entire message is read, even if only part of it changes.
        - The CSS styles visually hide the element from sighted users.
      */}
      <div
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {announcement}
      </div>
    </AccessibilityContext.Provider>
  );
};