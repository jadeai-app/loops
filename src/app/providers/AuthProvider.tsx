'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { clientAuth, clientDb } from '../../lib/firebase/clientApp';
import { doc, onSnapshot } from 'firebase/firestore';
import { UserProfile } from '../../types';
import { useRouter, usePathname } from 'next/navigation';

// Define the shape of the authentication context
interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
});

/**
 * The provider component that wraps the application and makes the auth state
 * available to any child component that calls `useAuth()`.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let unsubscribeProfile: () => void = () => {};

    const unsubscribeAuth = onAuthStateChanged(clientAuth, (authUser) => {
      // Clean up any existing profile listener on auth state change
      unsubscribeProfile();

      if (authUser) {
        setUser(authUser);
        const profileRef = doc(clientDb, 'profiles', authUser.uid);

        unsubscribeProfile = onSnapshot(profileRef, (profileDoc) => {
          if (profileDoc.exists()) {
            const profileData = profileDoc.data() as UserProfile;
            setUserProfile(profileData);

            // Enforce MFA setup if user has skipped it
            if (
              profileData.security_settings?.mfa_enabled === false &&
              pathname !== '/mfa/setup' // Avoid redirect loop
            ) {
              router.replace('/mfa/setup');
            }
          } else {
            // Profile doesn't exist yet, probably during signup.
            // Onboarding flow will handle profile creation.
            setUserProfile(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error listening to profile:", error);
          setUserProfile(null);
          setLoading(false);
        });
      } else {
        // User is signed out
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeAuth();
      unsubscribeProfile();
    };
  }, [router, pathname]);

  const value = { user, userProfile, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use the AuthContext.
 * This provides an easy way for components to get the current user.
 *
 * @returns {AuthContextType} The current auth context (user and loading state).
 */
export const useAuth = (): AuthContextType => {
  return useContext(AuthContext);
};