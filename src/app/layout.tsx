import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dynamicrsa.github.io/madrid-cricket-club"),
  title: {
    default: "Madrid Cricket Club",
    template: "%s | Madrid Cricket Club",
  },
  description:
    "Madrid Cricket Club — cricket in the heart of Spain since 2001. Join our welcoming community of players from all nationalities.",
  keywords: ["cricket", "madrid", "spain", "cricket españa", "cricket club madrid", "madrid cricket"],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://dynamicrsa.github.io/madrid-cricket-club",
    siteName: "Madrid Cricket Club",
    title: "Madrid Cricket Club",
    description: "Cricket in the heart of Spain since 2001. All nationalities welcome.",
    images: [{ url: "/images/og-image.jpg", width: 1200, height: 630, alt: "Madrid Cricket Club" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Madrid Cricket Club",
    description: "Cricket in the heart of Spain",
  },
  robots: { index: true, follow: true },
};

import CookieConsent from "@/components/CookieConsent";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <LanguageProvider>
          {children}
          <CookieConsent />
        </LanguageProvider>
      </body>
    </html>
  );
}
