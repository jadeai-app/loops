'use client';

import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 text-center shadow-md">
        <h1 className="mb-4 text-4xl font-bold text-gray-800">
          Welcome to Loops!
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          We're excited to have you. Let's get your account set up so you can
          stay connected and protected.
        </p>
        <button
          onClick={() => router.push('/create-circle')}
          className="rounded-md bg-indigo-600 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}