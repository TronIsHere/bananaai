"use client";

import { useState } from "react";
import { MobileMenu } from "@/components/landing/mobile-menu";
import { Header } from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { WorkflowSection } from "@/components/landing/workflow-section";
import { TrustedBySection } from "@/components/landing/trusted-by-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { BetaCTASection } from "@/components/landing/beta-cta-section";
import { AboutSection } from "@/components/landing/about-section";
import { ContactSection } from "@/components/landing/contact-section";
import { Footer } from "@/components/landing/footer";
import { StructuredData } from "@/components/seo/structured-data";
import { PageSEO } from "@/components/seo/page-seo";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <PageSEO
        title="پلتفرم هوش مصنوعی ایرانی برای تولید تصویر"
        description="تولید تصویر با هوش مصنوعی نانوبنانا - تبدیل متن به تصویر و تصویر به تصویر با دقت بالا. پلتفرم ایرانی هوش مصنوعی برای خلق تصاویر حرفه‌ای از متن فارسی و انگلیسی."
        keywords={[
          "تولید تصویر",
          "هوش مصنوعی ایرانی",
          "نانوبنانا",
          "تبدیل متن به تصویر",
        ]}
        canonical="/"
      />
      <StructuredData type="all" />
      <div className="min-h-screen bg-slate-950 text-white" dir="rtl">
        <MobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
        <Header onMobileMenuOpen={() => setMobileMenuOpen(true)} />
        <main className="px-4 pb-16">
          <HeroSection />
          <FeaturesSection />
          <WorkflowSection />
          <TrustedBySection />
          <PricingSection />
          <AboutSection />
          <ContactSection />
          {/* <BetaCTASection /> */}
        </main>
        <Footer />
      </div>
    </>
  );
}
