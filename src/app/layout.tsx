import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "./providers/AuthProvider";
import FCMProvider from "./providers/FCMProvider";
import { AccessibilityProvider } from "./providers/AccessibilityProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
  return (
    <html lang="en">
      <body className={inter.className}>
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