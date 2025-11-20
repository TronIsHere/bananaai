import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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
  title: "BananaAI | پلتفرم هوش مصنوعی ایرانی",
  description: "تولید تصویر با هوش مصنوعی نانوبنانا - تبدیل متن به تصویر و تصویر به تصویر",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body
        className={`${iranSans.variable} antialiased font-sans bg-slate-950 text-white`}
      >
        {children}
      </body>
    </html>
  );
}
