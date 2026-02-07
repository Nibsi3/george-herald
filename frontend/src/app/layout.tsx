import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

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
    icon: "/georgeherald_favicon.png",
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
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Script
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
        <Script id="google-translate-init" strategy="afterInteractive">
          {`function googleTranslateElementInit() {
            new google.translate.TranslateElement({
              pageLanguage: 'en',
              includedLanguages: 'en,af,zu,xh,st,nso,tn,ts,ss,ve,nr',
              layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false,
            }, 'google_translate_element');
          }`}
        </Script>
      </body>
    </html>
  );
}
