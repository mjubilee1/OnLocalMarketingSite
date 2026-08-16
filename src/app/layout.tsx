import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { GA_MEASUREMENT_ID } from "@/lib/gtag";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});
import {
  SITE_DESCRIPTION,
  SITE_LEGAL_NAME,
  SITE_NAME,
  SITE_URL,
  organizationJsonLd,
} from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_LEGAL_NAME} — Private on-device AI`,
    template: `%s · ${SITE_LEGAL_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  keywords: [
    "employee onboarding",
    "on-premises AI",
    "private AI assistant",
    "offline AI",
    "HR onboarding software",
    "knowledge base AI",
    "self-hosted AI",
  ],
  applicationName: SITE_LEGAL_NAME,
  authors: [{ name: SITE_LEGAL_NAME, url: SITE_URL }],
  creator: SITE_LEGAL_NAME,
  publisher: SITE_LEGAL_NAME,
  // Icons are provided by file conventions: src/app/icon.svg and apple-icon.svg
  openGraph: {
    title: `${SITE_LEGAL_NAME} — Private AI for messy, inconsistent onboarding`,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    url: SITE_URL,
    type: "website",
    locale: "en_US",
    // 1200×630 social card. Design source: scripts/og-card.source.tsx
    images: [
      {
        url: "/brand/og-card.png",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_LEGAL_NAME} — Private AI for messy, inconsistent onboarding`,
    description: SITE_DESCRIPTION,
    images: ["/brand/og-card.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#01185e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd()),
          }}
        />
        {children}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
