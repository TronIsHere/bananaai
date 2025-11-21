import { siteConfig } from "@/lib/seo-config";

interface StructuredDataProps {
  type?: "organization" | "website" | "software" | "service" | "all";
  customData?: Record<string, any>;
}

export function StructuredData({
  type = "all",
  customData,
}: StructuredDataProps) {
  const schemas: Record<string, any> = {};

  if (type === "all" || type === "organization") {
    schemas.organization = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteConfig.name,
      alternateName: siteConfig.nameFa,
      url: siteConfig.url,
      logo: `${siteConfig.url}${siteConfig.logo}`,
      description: siteConfig.description,
      address: siteConfig.address,
      sameAs: Object.values(siteConfig.social).filter(Boolean),
      contactPoint: siteConfig.contact.email
        ? {
            "@type": "ContactPoint",
            email: siteConfig.contact.email,
            contactType: "customer service",
            availableLanguage: ["fa", "en"],
          }
        : undefined,
    };
  }

  if (type === "all" || type === "website") {
    schemas.website = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.name,
      alternateName: siteConfig.nameFa,
      url: siteConfig.url,
      description: siteConfig.description,
      inLanguage: siteConfig.locale,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    };
  }

  if (type === "all" || type === "software") {
    schemas.software = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: siteConfig.name,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "IRR",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "1000",
      },
      description: siteConfig.description,
    };
  }

  if (type === "all" || type === "service") {
    schemas.service = {
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: "AI Image Generation",
      provider: {
        "@type": "Organization",
        name: siteConfig.name,
      },
      areaServed: {
        "@type": "Country",
        name: "Iran",
      },
      description: siteConfig.description,
      offers: [
        {
          "@type": "Offer",
          name: "پلن رایگان",
          price: "0",
          priceCurrency: "IRR",
        },
        {
          "@type": "Offer",
          name: "پلن کاوشگر",
          price: "350000",
          priceCurrency: "IRR",
        },
        {
          "@type": "Offer",
          name: "پلن خلاق",
          price: "999000",
          priceCurrency: "IRR",
        },
        {
          "@type": "Offer",
          name: "پلن استودیو",
          price: "2990000",
          priceCurrency: "IRR",
        },
      ],
    };
  }

  // Merge custom data if provided
  const finalSchemas = customData
    ? { ...schemas, ...customData }
    : schemas;

  return (
    <>
      {Object.entries(finalSchemas).map(([key, schema]) => (
        <script
          key={key}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

