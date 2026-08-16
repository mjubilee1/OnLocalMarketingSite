import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { GA_MEASUREMENT_ID } from "@/lib/gtag";
import {
  SITE_DESCRIPTION,
  SITE_LEGAL_NAME,
  SITE_LOGO_PATH,
  SITE_NAME,
  SITE_URL,
  organizationJsonLd,
} from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_LEGAL_NAME} — Private AI for messy, inconsistent onboarding`,
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
  icons: {
    icon: [
      { url: "/brand/onlocalai-mark.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/brand/onlocalai-mark.svg",
  },
  openGraph: {
    title: `${SITE_LEGAL_NAME} — Private AI for messy, inconsistent onboarding`,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    url: SITE_URL,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: SITE_LOGO_PATH,
        width: 4000,
        height: 4000,
        alt: SITE_NAME,
      },
    ],
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_LEGAL_NAME} — Private AI for messy, inconsistent onboarding`,
    description: SITE_DESCRIPTION,
    images: [SITE_LOGO_PATH],
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
    <html lang="en">
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
