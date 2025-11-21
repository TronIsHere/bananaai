# SEO Improvements Summary

## Overview
Comprehensive SEO improvements for BananaAI landing page targeting Persian/Farsi audience.

## ✅ Completed Improvements

### 1. **Centralized SEO Configuration** (`lib/seo-config.ts`)
- Created centralized configuration file for easy management
- Includes site metadata, keywords, social links, and default SEO settings
- Domain: `bananaai.ir`

### 2. **Enhanced Metadata** (`app/layout.tsx`)
- Comprehensive metadata with Persian keywords
- Open Graph tags for social media sharing
- Twitter Card metadata
- Proper robots directives for search engines
- Canonical URLs
- Language and locale settings (fa-IR)

### 3. **Reusable SEO Components** (`components/seo/`)
- **PageSEO Component**: Client-side component for dynamic meta tag updates
- **StructuredData Component**: JSON-LD schema markup for:
  - Organization schema
  - Website schema
  - Software Application schema
  - Service schema with pricing plans

### 4. **Structured Data (JSON-LD)**
- Organization information
- Website search functionality
- Software application details
- Service offerings with pricing
- Proper schema.org markup for better search engine understanding

### 5. **Semantic HTML Improvements**
- Added proper `<article>` tags for pricing cards
- Used `<dl>`, `<dt>`, `<dd>` for statistics
- Added `<ol>` for workflow steps
- Proper heading hierarchy (h1, h2, h3)
- Semantic section tags

### 6. **Accessibility Enhancements**
- Added `aria-label` attributes to navigation links
- Added `aria-label` to buttons and interactive elements
- Added `aria-hidden` to decorative elements
- Proper alt texts for images
- Image dimensions for better performance

### 7. **Landing Page SEO** (`app/page.tsx`)
- Integrated PageSEO component with Persian keywords
- Added structured data for all schemas
- Optimized title and description for Persian audience

## 📋 Key Features

### Persian SEO Keywords
- هوش مصنوعی
- تولید تصویر
- تبدیل متن به تصویر
- تبدیل تصویر به تصویر
- نانوبنانا
- هوش مصنوعی ایرانی
- پلتفرم هوش مصنوعی
- And more...

### Meta Tags Included
- Title and description
- Keywords
- Open Graph (Facebook, LinkedIn)
- Twitter Cards
- Canonical URLs
- Language and locale
- Robots directives
- Theme color
- Mobile app meta tags

## 🚀 Usage

### For New Pages
```tsx
import { PageSEO } from "@/components/seo/page-seo";
import { StructuredData } from "@/components/seo/structured-data";

export default function MyPage() {
  return (
    <>
      <PageSEO
        title="صفحه من"
        description="توضیحات صفحه"
        keywords={["کلمه کلیدی 1", "کلمه کلیدی 2"]}
        canonical="/my-page"
      />
      <StructuredData type="all" />
      {/* Your page content */}
    </>
  );
}
```

### Updating SEO Config
Edit `lib/seo-config.ts` to update:
- Site name and description
- Keywords
- Social media links
- Contact information
- Default SEO settings

## 📝 Next Steps (Optional)

1. **Add verification codes** in `app/layout.tsx`:
   - Google Search Console
   - Yandex Webmaster
   - Bing Webmaster

2. **Create OG image** (`/public/og-image.jpg`):
   - Size: 1200x630px
   - Include BananaAI branding
   - Persian text support

3. **Add sitemap.xml** for better crawling

4. **Add robots.txt** if needed

5. **Monitor SEO performance**:
   - Google Search Console
   - Analytics integration
   - Performance metrics

## 🌐 Domain Configuration

Current domain: `bananaai.ir`
- Set `NEXT_PUBLIC_SITE_URL` environment variable if different
- All URLs and canonical links use this domain

## 📊 SEO Best Practices Implemented

✅ Semantic HTML structure
✅ Proper heading hierarchy
✅ Meta tags for all major platforms
✅ Structured data (JSON-LD)
✅ Accessibility (ARIA labels)
✅ Image optimization (alt texts, dimensions)
✅ Mobile-friendly meta tags
✅ Language and locale settings
✅ Canonical URLs
✅ Open Graph and Twitter Cards

