import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/layout/SiteChrome";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "George Herald | Garden Route News",
    template: "%s | George Herald",
  },
  description:
    "Your trusted source for local news, sport, and community stories from George and the Garden Route.",
  keywords: ["George Herald", "Garden Route", "News", "George", "South Africa", "Local News"],
  icons: {
    apple: "/georgeherald_favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "https://www.georgeherald.com",
    siteName: "George Herald",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
