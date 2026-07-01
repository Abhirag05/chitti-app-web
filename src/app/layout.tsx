import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

// --- Mentorship Note ---
// layout.tsx is the "shell" of your entire application.
// It wraps EVERY page in your app. This is the perfect place to add:
// 1. Global fonts
// 2. Global CSS
// 3. Providers (like AuthProvider) that need to be available everywhere
//
// Note: layout.tsx itself is a SERVER Component (no "use client" directive).
// But we can still render Client Components (like AuthProvider) inside it.

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Chitti App - Financial Dashboard",
  description: "Financial management dashboard for Chitti App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {/* AuthProvider wraps everything so every page has access to auth state */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
