import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { GA_MEASUREMENT_ID } from "@/lib/gtag";
import "./globals.css";

const siteDescription =
  "OnLocalAI is a private, on-premises AI workspace for company knowledge, training, helpdesk, onboarding, and timesheets — running entirely on your own computer. Nothing leaves your machine.";

export const metadata: Metadata = {
  title: {
    default: "OnLocalAI — Private, on-premises AI for your whole team",
    template: "%s · OnLocalAI",
  },
  description: siteDescription,
  keywords: [
    "on-premises AI",
    "local LLM",
    "private AI assistant",
    "offline AI",
    "employee onboarding AI",
    "AI helpdesk",
    "knowledge base AI",
    "Ollama",
    "ChromaDB",
  ],
  applicationName: "OnLocalAI",
  icons: {
    icon: [
      { url: "/brand/onlocalai-mark.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/brand/onlocalai-mark.svg",
  },
  openGraph: {
    title: "OnLocalAI — Private, on-premises AI for your whole team",
    description: siteDescription,
    siteName: "OnLocalAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OnLocalAI — Private, on-premises AI for your whole team",
    description: siteDescription,
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
