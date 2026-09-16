import type {Metadata, Viewport} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sankara Digital Vision Screening - Sankara Eye Hospital',
  description: 'Child-friendly visual acuity (tumbling-E) and colour vision digital screening application for Sankara Eye Hospital school eye-screening programs.',
  openGraph: {
    title: 'Sankara Digital Vision Screening',
    description: 'Standardized digital vision screening for school eye health programs by Sankara Eye Hospital.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sankara Digital Vision Screening',
    description: 'Standardized digital vision screening for school eye health programs by Sankara Eye Hospital.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ea580c',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased bg-[#FFFDF9] text-slate-900 selection:bg-orange-100 selection:text-orange-900" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
