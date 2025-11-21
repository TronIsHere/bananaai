import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { siteConfig, defaultSEO } from "@/lib/seo-config";

const iranSans = localFont({
  src: [
    {
      path: "../public/fonts/IRANSans-Light.woff",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/IRANSans-Reg.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/IRANSans-SemiBold.woff",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/IRANSans-Bold.woff",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-iran-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: defaultSEO.title,
    template: defaultSEO.title.includes("|")
      ? defaultSEO.title
      : "%s | BananaAI",
  },
  description: defaultSEO.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author.name, url: siteConfig.author.url }],
  creator: siteConfig.creator,
  publisher: siteConfig.publisher,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    ...defaultSEO.openGraph,
    url: siteConfig.url,
  },
  twitter: defaultSEO.twitter,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteConfig.url,
    languages: {
      "fa-IR": siteConfig.url,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="dark">
      <body
        className={`${iranSans.variable} antialiased font-sans bg-slate-950 text-white`}
      >
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
