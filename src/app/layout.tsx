import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "./hooks/useAuth";
import "./globals.css";
import "./styles/responsive.css";
import { ThemeProvider } from "./context/ThemeContext";
import { Navbar } from "./components/navigation/Navbar";
import { DataServiceProvider } from "./contexts/DataServiceContext";
import { ErrorProvider } from "./context/ErrorContext";
import { ToastProvider } from "./components/error/ToastManager";
import { I18nProvider } from "./context/I18nContext";
import { MigrationProvider } from "./providers/MigrationProvider";
import { AppStateProvider } from "./contexts/AppStateContext";
// Import du composant de débogage
import AuthDebugger from "./components/debug/AuthDebugger";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevIndé Tracker",
  description: "Gérez votre activité indépendante efficacement",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900`}
      >
        <ThemeProvider>
          <DataServiceProvider>
            <ErrorProvider>
              <ToastProvider>
                <I18nProvider>
                  <MigrationProvider>
                    <AppStateProvider>
                      <AuthProvider>
                        <Navbar />
                        <main className="min-h-screen">
                          {children}
                        </main>
                        {/* Composant de débogage pour identifier les problèmes d'authentification */}
                        <AuthDebugger />
                      </AuthProvider>
                    </AppStateProvider>
                  </MigrationProvider>
                </I18nProvider>
              </ToastProvider>
            </ErrorProvider>
          </DataServiceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
