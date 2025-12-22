export const siteConfig = {
  name: "BananaAI",
  nameFa: "هوش مصنوعی بنانا",
  description:
    "تولید تصویر با هوش مصنوعی نانوبنانا - تبدیل متن به تصویر و تصویر به تصویر با دقت بالاست. یک پلتفرم ایرانی هوش مصنوعی برای خلق تصاویر حرفه‌ای از متن فارسی و انگلیسی که مناسب برای طراحان، فریلنسرها و کسب‌وکارها است.",
  shortDescription: "پلتفرم هوش مصنوعی ایرانی برای تولید تصویر",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://bananaai.ir",
  ogImage: "/icons/web-app-manifest-512x512.png", // Temporary: should be replaced with 1200x630px og-image.jpg
  logo: "/logo.png",
  locale: "fa_IR",
  language: "fa",
  keywords: [
    "هوش مصنوعی",
    "تولید تصویر",
    "تبدیل متن به تصویر",
    "تبدیل تصویر به تصویر",
    "نانوبنانا",
    "هوش مصنوعی ایرانی",
    "پلتفرم هوش مصنوعی",
    "ساخت تصویر با هوش مصنوعی",
    "AI image generation",
    "text to image",
    "image to image",
    "هوش مصنوعی فارسی",
    "تولید تصویر با AI",
    "خلق تصویر",
    "طراحی با هوش مصنوعی",
    "هوش مصنوعی ایران",
    "پلتفرم تولید تصویر",
    "سرویس هوش مصنوعی",
  ],
  author: {
    name: "BananaAI Team",
    url: "https://bananaai.ir",
  },
  creator: "BananaAI",
  publisher: "BananaAI",
  twitter: {
    handle: "@bananaai",
    cardType: "summary_large_image" as const,
  },
  social: {
    // Add your social media links here when available
    twitter: "",
    instagram: "",
    linkedin: "",
    github: "",
  },
  contact: {
    email: "",
    phone: "",
  },
  address: {
    "@type": "PostalAddress" as const,
    addressCountry: "IR",
    addressLocality: "ایران",
  },
};

export const defaultSEO = {
  title: `${siteConfig.name} | ${siteConfig.nameFa}`,
  description: siteConfig.description,
  keywords: siteConfig.keywords.join(", "),
  openGraph: {
    type: "website" as const,
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | ${siteConfig.nameFa}`,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - ${siteConfig.nameFa}`,
      },
    ],
  },
  twitter: {
    card: siteConfig.twitter.cardType,
    title: `${siteConfig.name} | ${siteConfig.nameFa}`,
    description: siteConfig.shortDescription,
    images: [siteConfig.ogImage],
    creator: siteConfig.twitter.handle,
  },
};
