/**
 * Checks if the current device is running on iOS (iPhone, iPad, iPod).
 * This is a client-side only function.
 * @returns {boolean} True if the device is an iOS device, false otherwise.
 */
export const isIOS = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

/**
 * Checks if the application is running as a Progressive Web App (PWA).
 * This is determined by checking the `display-mode` media query or the `standalone` navigator property.
 * This is a client-side only function.
 * @returns {boolean} True if the app is running in PWA mode, false otherwise.
 */
export const isPWA = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  // For modern browsers
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  // For older Safari versions
  if ('standalone' in navigator && (navigator as any).standalone === true) {
    return true;
  }
  return false;
};