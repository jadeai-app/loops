export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 text-center shadow-md">
        <h1 className="mb-4 text-4xl font-bold text-gray-800">
          Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Welcome to your dashboard. You have successfully completed the onboarding process!
        </p>
      </div>
    </div>
  );
}