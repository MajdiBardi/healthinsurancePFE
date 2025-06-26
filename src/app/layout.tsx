import * as React from 'react';
import type { Viewport } from 'next';

import '@/styles/global.css';
import { ReactNode } from 'react';

import { AuthProvider } from '../contexts/AuthProvider';
import { UserProvider } from '@/contexts/user-context';
import { LocalizationProvider } from '@/components/core/localization-provider';
import { ThemeProvider } from '@/components/core/theme-provider/theme-provider';

import Sidebar from '@/components/Sidebar'; // ← assure-toi que ce composant existe bien

export const viewport = {
  width: 'device-width',
  initialScale: 1
} satisfies Viewport;

interface LayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ThemeProvider>
            <LocalizationProvider>
              <UserProvider>
                <div style={{ display: 'flex', minHeight: '100vh' }}>
                  <Sidebar />
                  <main style={{ flex: 1, padding: '2rem' }}>
                    {children}
                  </main>
                </div>
              </UserProvider>
            </LocalizationProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
