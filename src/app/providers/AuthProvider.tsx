'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { clientAuth } from '../../lib/firebase/clientApp';

// Define the shape of the authentication context
interface AuthContextType {
  user: User | null;
  loading: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

/**
 * The provider component that wraps the application and makes the auth state
 * available to any child component that calls `useAuth()`.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to the Firebase auth state change listener
    const unsubscribe = onAuthStateChanged(clientAuth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const value = { user, loading };

  return (
    <AuthContext.Provider value={value}>
      {/* We don't render children until the initial auth state is resolved */}
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