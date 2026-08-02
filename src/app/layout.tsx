import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OnLocalAI",
  description: "Your company's knowledge, captured and put to work.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
