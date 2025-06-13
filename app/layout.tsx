import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Clancy\'s Outdoors - Ice Fishing Equipment & Gear',
  description: 'Your trusted source for premium ice fishing equipment, shelters, electronics, and accessories. Serving ice fishing enthusiasts since 2008.',
  keywords: 'ice fishing, ice shelters, fish finders, ice fishing rods, ice fishing gear, winter fishing',
  authors: [{ name: 'Clancy\'s Outdoors' }],
  creator: 'Clancy\'s Outdoors',
  publisher: 'Clancy\'s Outdoors',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Clancy\'s Outdoors - Ice Fishing Equipment & Gear',
    description: 'Your trusted source for premium ice fishing equipment, shelters, electronics, and accessories.',
    url: 'https://clancysoutdoors.com',
    siteName: 'Clancy\'s Outdoors',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=630&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Ice fishing equipment and gear',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clancy\'s Outdoors - Ice Fishing Equipment & Gear',
    description: 'Your trusted source for premium ice fishing equipment, shelters, electronics, and accessories.',
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=630&fit=crop'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-white antialiased">
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  );
}
