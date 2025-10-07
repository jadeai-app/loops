import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { credential } from 'firebase-admin';

// It's important to use environment variables for the service account credentials
// to avoid committing sensitive data to the repository.
// These should be set in your hosting environment (e.g., Vercel, Firebase Hosting).
const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
};

/**
 * Initializes the Firebase Admin SDK on the server side.
 * It ensures that the app is only initialized once (singleton pattern).
 * This is safe to call from any server component or API route.
 *
 * @returns The initialized Firebase Admin App instance.
 */
const initializeServerApp = (): App => {
  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp({
    credential: credential.cert(serviceAccount),
  });
};

// Initialize the app
const serverApp = initializeServerApp();

// Export a ready-to-use instance of the Auth service
export const serverAuth = getAuth(serverApp);