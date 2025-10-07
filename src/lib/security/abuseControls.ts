/**
 * This module implements client-side abuse prevention controls, specifically "pocket-dial"
 * protection by using the Device Orientation and Proximity Sensor APIs.
 * It's designed to be used by the SOSButton component to cancel an activation
 * if a high risk of a false trigger is detected.
 */

// State to hold the latest sensor readings.
// These are module-level variables to maintain state across function calls.
let devicePitch: number | null = null;
let proximityDistance: number | null = null;
let isListening = false;
let proximitySensor: any = null; // Using `any` for the experimental ProximitySensor

/**
 * Handles the device orientation event to update the device's pitch.
 * @param event - The DeviceOrientationEvent from the browser.
 */
const handleOrientation = (event: DeviceOrientationEvent) => {
  // event.beta is the pitch (front-to-back tilt).
  // A value of 90 indicates the device is upright.
  if (event.beta !== null) {
    devicePitch = event.beta;
  }
};

/**
 * Initializes and starts the proximity sensor if it's available.
 */
const startProximitySensor = () => {
  if ('ProximitySensor' in window) {
    try {
      // The type for ProximitySensor might not be in default TS libs.
      // @ts-ignore
      proximitySensor = new ProximitySensor({ frequency: 1 });

      proximitySensor.addEventListener('reading', () => {
        proximityDistance = proximitySensor.distance;
      });

      proximitySensor.addEventListener('error', (event: any) => {
        console.error('Proximity sensor error:', event.error.name, event.error.message);
        // Invalidate the reading on error to prevent incorrect pocket-dial checks.
        proximityDistance = null;
      });

      proximitySensor.start();
    } catch (error: any) {
      console.error('Could not start proximity sensor:', error.name, error.message);
    }
  } else {
    console.warn('Proximity Sensor API is not supported on this device/browser.');
  }
};

/**
 * Stops the proximity sensor and cleans up listeners.
 */
const stopProximitySensor = () => {
  if (proximitySensor) {
    proximitySensor.stop();
    proximitySensor = null;
    proximityDistance = null;
  }
};

/**
 * Starts listening to device orientation and proximity sensors.
 * This should be called when the component that needs this logic mounts (e.g., in a useEffect hook).
 */
export const startPocketDialDetection = () => {
  if (isListening || typeof window === 'undefined') return;

  if ('DeviceOrientationEvent' in window) {
    window.addEventListener('deviceorientation', handleOrientation);
    startProximitySensor();
    isListening = true;
  } else {
    console.warn('Device Orientation API is not supported on this device/browser.');
  }
};

/**
 * Stops listening to device sensors to save battery and prevent memory leaks.
 * This should be called when the component unmounts.
 */
export const stopPocketDialDetection = () => {
  if (!isListening || typeof window === 'undefined') return;

  if ('DeviceOrientationEvent' in window) {
    window.removeEventListener('deviceorientation', handleOrientation);
  }
  stopProximitySensor();
  isListening = false;
  devicePitch = null;
};

/**
 * Checks if there is a significant risk of a "pocket dial".
 * As per the spec, this is true if the device is nearly vertical AND close to an object.
 * @returns {boolean} True if the device is likely in a pocket, false otherwise.
 */
export const isPocketDialRisk = (): boolean => {
  // If we don't have data from both sensors, we cannot make a reliable determination.
  // Default to `false` to avoid incorrectly blocking a legitimate SOS attempt.
  if (devicePitch === null || proximityDistance === null) {
    return false;
  }

  // A vertical orientation is when beta is 90 degrees.
  // "within ±15° of vertical" means pitch is between 75 and 105 degrees.
  const isVertical = devicePitch >= 75 && devicePitch <= 105;

  // Proximity sensor reports distance < 5 cm.
  const isClose = proximityDistance < 5;

  // Risk is high only if BOTH conditions are met.
  return isVertical && isClose;
};