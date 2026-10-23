import type { Metadata } from 'next';
import './globals.css';
import { GlobalHeader } from '@/components/navigation/GlobalHeader';
import { GlobalOverlays } from '@/components/overlays/GlobalOverlays';

export const metadata: Metadata = {
  title: 'Papaya Claims Assessment Copilot',
  description: 'AI-Powered Health Insurance Claims Assessment Workstation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-100/70 text-slate-800 antialiased flex flex-col font-sans">
        <GlobalHeader />
        <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6">{children}</main>
        <GlobalOverlays />
      </body>
    </html>
  );
}
