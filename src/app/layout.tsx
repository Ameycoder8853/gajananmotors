
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/use-auth';
import { FirebaseClientProvider } from '@/firebase';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { LocationProvider } from '@/hooks/use-location';

const siteConfig = {
  name: 'Gajanan Motors',
  url: 'https://gajananmotors.vercel.app',
  description: 'Gajanan Motors is your trusted partner for buying and selling quality used cars. Browse our verified listings from trusted dealers and find your dream car today.',
  ogImage: '/og-image.png',
  links: {
    twitter: 'https://twitter.com/gajananmotors',
  }
}

export const viewport: Viewport = {
  themeColor: '#3F51B5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - Trusted Used Car Dealership`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["Gajanan Motors", "used cars", "second-hand cars", "car dealership", "buy used car", "sell used car", "verified dealers", "used cars sangli", "used cars kolhapur"],
  authors: [{ name: "Gajanan Motors" }],
  creator: "Gajanan Motors",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: siteConfig.name,
  },
  formatDetection: {
    telephone: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@gajananmotors",
  },
  icons: {
    icon: "/favicon-light.ico",
  },
  manifest: `/site.webmanifest`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <AuthProvider>
              <LocationProvider>
                {children}
              </LocationProvider>
              <Toaster />
            </AuthProvider>
          </FirebaseClientProvider>
        </ThemeProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      </body>
    </html>
  );
}
