import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazirmatn",
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
        className={`${vazirmatn.variable} antialiased font-sans bg-gray-50 text-gray-900`}
      >
        {children}
      </body>
    </html>
  );
}
