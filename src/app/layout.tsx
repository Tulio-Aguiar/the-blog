import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../contexts/ThemeContext';

export const metadata: Metadata = {
  title: 'Este é um blog com Next.js',
  description: 'Descrição do Site em si.',
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
