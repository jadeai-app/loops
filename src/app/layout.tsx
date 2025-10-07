import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "./providers/AuthProvider";
import FCMProvider from "./providers/FCMProvider";
import Footer from "../components/layout/Footer";
// import "./globals.css"; // Assuming a global stylesheet exists

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
      <body className={inter.className} style={bodyStyle}>
        <AuthProvider>
          <FCMProvider>
            <main style={mainStyle}>
              {children}
            </main>
            <Footer />
          </FCMProvider>
        </AuthProvider>
      </body>
    </html>
  );
}