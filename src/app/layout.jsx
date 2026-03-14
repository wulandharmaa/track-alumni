import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import LayoutWrapper from '@/components/LayoutWrapper';
import AmbientBackground from '@/components/AmbientBackground';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata = {
  title: 'AlumniTrack - Sistem Pelacakan Alumni',
  description: 'Sistem pelacakan alumni otomatis berbasis analisis jejak digital multi-sumber publik.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${outfit.variable} ${jakarta.variable} dark`} suppressHydrationWarning>
      <body className="font-[var(--font-jakarta)] antialiased min-h-screen flex">
        <AmbientBackground />
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
