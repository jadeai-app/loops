import type { Metadata } from "next";
import { AuthProvider } from "./providers/AuthProvider";
import FCMProvider from "./providers/FCMProvider";
import { AccessibilityProvider } from "./providers/AccessibilityProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Loops - Your Safety Circle",
  description: "A sovereign, zero-cost, life-critical alert system.",
};

/**
 * This is the root layout for the entire application.
 * It wraps all pages with the necessary context providers.
 *
 * - `AuthProvider`: Manages the user's authentication state.
 * - `FCMProvider`: Handles Firebase Cloud Messaging registration and listeners.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const bodyStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    margin: 0,
  };

  const mainStyle: React.CSSProperties = {
    flex: '1 0 auto',
  };

  return (
    <html lang="en">
      <body style={bodyStyle}>
        <AuthProvider>
          <FCMProvider>
            <AccessibilityProvider>
              {children}
            </AccessibilityProvider>
          </FCMProvider>
        </AuthProvider>
      </body>
    </html>
  );
}