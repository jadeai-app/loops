import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration, loaded from environment variables.
// These variables must be prefixed with NEXT_PUBLIC_ to be exposed to the browser.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Initializes the Firebase app on the client side.
 * It ensures that the app is only initialized once (singleton pattern).
 * This is safe to call from any client component.
 *
 * @returns The initialized Firebase App instance.
 */
const initializeClientApp = () => {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
};

// Initialize the app
const clientApp = initializeClientApp();

// Export ready-to-use instances of the Firebase services
export const clientAuth = getAuth(clientApp);
export const clientDb = getFirestore(clientApp);
export const clientFunctions = getFunctions(clientApp);

// Export a typed wrapper for the triggerSOS callable function
interface TriggerSOSRequest {
  latitude: number;
  longitude: number;
  accuracy: number;
  circleId: string; // This will need to be fetched from user data
}

interface TriggerSOSResponse {
  status: string;
  eventId: string;
}

export const triggerSOSCallable = httpsCallable<TriggerSOSRequest, TriggerSOSResponse>(clientFunctions, 'triggerSOS');