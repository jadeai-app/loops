'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/clientApp';

export default function AllSetPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(true);

  useEffect(() => {
    if (user) {
      const completeOnboarding = async () => {
        try {
          const profileRef = doc(firestore, 'profiles', user.uid);
          await setDoc(profileRef, { onboardingComplete: true }, { merge: true });
        } catch (error) {
          console.error('Failed to update onboarding status:', error);
          // Handle error, maybe show a message to the user
        } finally {
          setIsUpdating(false);
        }
      };
      completeOnboarding();
    } else {
      // If no user is found, they shouldn't be on this page
      router.push('/login');
    }
  }, [user, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 text-center shadow-md">
        <h1 className="mb-4 text-4xl font-bold text-green-600">
          You're All Set!
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          You've successfully created your first circle. You're now ready to
          use Loops to stay connected and protected.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          disabled={isUpdating}
          className="rounded-md bg-indigo-600 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUpdating ? 'Finalizing...' : 'Go to Dashboard'}
        </button>
      </div>
    </div>
  );
}