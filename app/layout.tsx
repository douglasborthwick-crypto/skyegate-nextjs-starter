import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'SkyeGate Next.js Starter',
  description:
    'Minimal Next.js starter for @skyemeta/skyegate — wallet-verified gated content powered by InsumerAPI.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
