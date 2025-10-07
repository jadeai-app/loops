import { type ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { serverAuth } from '../../lib/firebase/serverApp';

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * This is a server-side layout that acts as an authentication guard for all
 * pages within the `(auth)` route group.
 *
 * It uses the Firebase Admin SDK on the server to verify the user's session
 * cookie. If the session is invalid or expired, it redirects the user to the
 * login page. Otherwise, it renders the protected content.
 */
export default async function AuthLayout({ children }: AuthLayoutProps) {
  const sessionCookie = cookies().get('session')?.value;

  // If there's no session cookie, the user is not logged in.
  if (!sessionCookie) {
    // Redirect to the login page. We use a query param to redirect back
    // to the intended page after successful login.
    // Note: The login page itself needs to be created.
    redirect('/login');
  }

  try {
    // Verify the session cookie with Firebase Admin SDK.
    // This will throw an error if the cookie is invalid or expired.
    await serverAuth.verifySessionCookie(sessionCookie, true);

    // If verification is successful, render the protected page.
    return <>{children}</>;

  } catch (error) {
    console.error('Session cookie verification failed:', error);
    // If verification fails, the session is invalid. Redirect to login.
    redirect('/login');
  }
}