import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Header } from "@/components/layout/header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MediAssist AI - Personalized Medical Diagnostics",
  description: "Smart medical platform for automated patient intake, AI-powered diagnostics, and digital prescriptions for hospitals and clinics.",
  keywords: ["medical", "AI", "diagnostics", "healthcare", "telemedicine", "prescription"],
  authors: [{ name: "MediAssist AI Team" }],
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 font-sans antialiased">
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <footer className="bg-gray-50 border-t py-8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center text-gray-600">
                  <p>&copy; 2025 Web02.com team. All rights reserved.</p>
                  <p className="text-sm mt-2">HIPAA-compliant medical platform for secure healthcare management.</p>
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}