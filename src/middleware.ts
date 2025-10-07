import { NextResponse, type NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeServerApp } from './lib/firebase/serverApp';

// Initialize Firebase Admin SDK
initializeServerApp();

async function getOnboardingStatus(uid: string): Promise<boolean> {
  try {
    const db = getFirestore();
    const profileDoc = await db.collection('profiles').doc(uid).get();
    if (profileDoc.exists) {
      return profileDoc.data()?.onboardingComplete === true;
    }
    return false;
  } catch (error) {
    console.error('Error fetching onboarding status:', error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('__session')?.value;

  const isMarketingRoute = pathname === '/login' || pathname === '/signup';
  const isOnboardingRoute = pathname.startsWith('/welcome') || pathname.startsWith('/create-circle') || pathname.startsWith('/all-set');

  // If there's no session cookie, redirect unauthenticated users
  if (!sessionCookie) {
    if (isMarketingRoute || pathname === '/') {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If there is a session, verify it
  try {
    const decodedToken = await getAuth().verifySessionCookie(sessionCookie, true);
    const onboardingComplete = await getOnboardingStatus(decodedToken.uid);

    // If user is authenticated and tries to access login/signup, redirect to dashboard
    if (isMarketingRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If user is not onboarded, redirect to the onboarding flow
    if (!onboardingComplete && !isOnboardingRoute) {
      return NextResponse.redirect(new URL('/welcome', request.url));
    }

    // If user is onboarded and tries to access onboarding, redirect to dashboard
    if (onboardingComplete && isOnboardingRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // Session cookie is invalid, clear it and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('__session');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};