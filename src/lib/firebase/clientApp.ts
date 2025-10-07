import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, GeoPoint } from 'firebase/firestore';
import { getMessaging } from 'firebase/messaging';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Define types for our callable function
interface TriggerSOSRequest {
  location: GeoPoint;
  accuracy_meters: number;
}

interface TriggerSOSResponse {
  success: boolean;
  eventId: string;
  message: string;
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const firestore = getFirestore(app);
const messaging = getMessaging(app);
const functions = getFunctions(app);

// Create a typed callable function
const triggerSOSCallable = httpsCallable<TriggerSOSRequest, TriggerSOSResponse>(functions, 'triggerSOS');


export { app, auth, firestore, messaging, triggerSOSCallable };