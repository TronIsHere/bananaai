import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { siteConfig, defaultSEO } from "@/lib/seo-config";
import { Toaster } from "sonner";

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
    images: [
      {
        url: defaultSEO.openGraph.images[0].url,
        width: 1200,
        height: 630,
        alt: defaultSEO.openGraph.images[0].alt,
      },
    ],
  },
  twitter: {
    ...defaultSEO.twitter,
    images: defaultSEO.twitter.images.map((img) => ({
      url: img,
      alt: `${siteConfig.name} - ${siteConfig.nameFa}`,
    })),
  },
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
  icons: {
    icon: [
      { url: "/icons/favicon.ico", sizes: "any" },
      { url: "/icons/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "manifest",
        url: "/icons/site.webmanifest",
      },
    ],
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
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
