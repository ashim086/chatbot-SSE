import type { Metadata } from 'next';
import { Providers } from './Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'StreamChat - Real-time AI',
  description: 'Production-grade streaming chatbot with SSE',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
