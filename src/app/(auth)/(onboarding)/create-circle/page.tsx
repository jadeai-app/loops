'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createFirstCircleCallable } from '@/lib/firebase/clientApp';

export default function CreateCirclePage() {
  const [circleName, setCircleName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleCreateCircle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await createFirstCircleCallable({ circleName });
      if (result.data.success) {
        router.push('/all-set');
      } else {
        setError('Could not create circle. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-4 text-center text-3xl font-bold text-gray-800">
          Create Your First Circle
        </h1>
        <p className="mb-8 text-center text-gray-600">
          A circle is a group of trusted contacts who will be alerted in an
          emergency. Give your first circle a name to get started.
        </p>
        <form onSubmit={handleCreateCircle} className="space-y-6">
          {error && (
            <p className="rounded-md bg-red-50 p-4 text-sm text-red-600">
              {error}
            </p>
          )}
          <div>
            <label
              htmlFor="circleName"
              className="block text-sm font-medium text-gray-700"
            >
              Circle Name
            </label>
            <input
              id="circleName"
              name="circleName"
              type="text"
              required
              value={circleName}
              onChange={(e) => setCircleName(e.target.value)}
              className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="e.g., Family, Close Friends"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Circle...' : 'Create Circle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}