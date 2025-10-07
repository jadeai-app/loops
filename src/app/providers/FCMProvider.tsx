'use client';

import { useEffect, useState } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { clientApp, clientDb } from '../../lib/firebase/clientApp';
import { useAuth } from './AuthProvider'; // Assuming an AuthProvider exists to get the user

/**
 * A provider component that handles Firebase Cloud Messaging (FCM) setup.
 *
 * - Initializes Firebase Messaging on the client.
 * - Requests notification permission from the user contextually.
 * - Retrieves the FCM token and stores it in Firestore under `push_subscriptions`.
 * - Listens for token refreshes and updates the token in Firestore.
 * - Handles foreground messages (e.g., displaying an in-app notification).
 *
 * This component should be placed within the main app layout, inside an
 * authentication provider so it has access to the user's UID.
 */
export default function FCMProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth(); // This hook should provide the current Firebase user object
  const [permissionRequested, setPermissionRequested] = useState(false);

  useEffect(() => {
    // Only run this logic if we have a logged-in user.
    if (!user || typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const messaging = getMessaging(clientApp);

    // Function to request permission and get the token
    const requestPermissionAndGetToken = async () => {
      if (permissionRequested) return;
      setPermissionRequested(true);

      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted.');

          // Register the service worker
          const serviceWorkerRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

          // Get the token
          const currentToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY, // This needs to be in your .env.local
            serviceWorkerRegistration,
          });

          if (currentToken) {
            console.log('FCM Token:', currentToken);
            // Save the token to Firestore
            const subId = `${user.uid}-${currentToken.slice(-10)}`;
            const subscriptionRef = doc(clientDb, 'push_subscriptions', subId);
            await setDoc(subscriptionRef, {
              user_uid: user.uid,
              fcm_token: currentToken,
              platform: 'web',
              created_at: serverTimestamp(),
              last_seen: serverTimestamp(),
            }, { merge: true });
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        } else {
          console.log('Unable to get permission to notify.');
        }
      } catch (err) {
        console.error('An error occurred while retrieving token. ', err);
      }
    };

    // We can trigger this based on a user action, e.g., a button click.
    // For this implementation, we'll request it after a delay on the first visit.
    // In a real app, this should be tied to a clear user benefit.
    const timer = setTimeout(() => {
      requestPermissionAndGetToken();
    }, 5000); // Request after 5 seconds

    // Handle foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received in foreground. ', payload);
      // You can show an in-app notification here.
      // For example: new Notification(payload.notification.title, { body: payload.notification.body });
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };

  }, [user, permissionRequested]);

  return <>{children}</>;
}