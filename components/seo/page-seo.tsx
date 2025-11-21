"use client";

import { useEffect } from "react";
import { siteConfig } from "@/lib/seo-config";

interface PageSEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  noindex?: boolean;
  nofollow?: boolean;
  canonical?: string;
}

export function PageSEO({
  title,
  description,
  keywords,
  image,
  url,
  noindex = false,
  nofollow = false,
  canonical,
}: PageSEOProps) {
  const pageTitle = title
    ? `${title} | ${siteConfig.name}`
    : siteConfig.name;
  const pageDescription = description || siteConfig.description;
  const pageKeywords = keywords
    ? [...siteConfig.keywords, ...keywords].join(", ")
    : siteConfig.keywords.join(", ");
  const pageImage = image?.startsWith("http")
    ? image
    : `${siteConfig.url}${image || siteConfig.ogImage}`;
  const pageUrl = url?.startsWith("http") ? url : `${siteConfig.url}${url || ""}`;
  const canonicalUrl = canonical?.startsWith("http")
    ? canonical
    : `${siteConfig.url}${canonical || ""}`;

  const robotsContent = [
    noindex ? "noindex" : "index",
    nofollow ? "nofollow" : "follow",
  ].join(", ");

  useEffect(() => {
    // Update document title
    document.title = pageTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, attribute = "name") => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // Primary Meta Tags
    updateMetaTag("title", pageTitle);
    updateMetaTag("description", pageDescription);
    updateMetaTag("keywords", pageKeywords);
    updateMetaTag("author", siteConfig.author.name);
    updateMetaTag("language", siteConfig.language);
    updateMetaTag("robots", robotsContent);

    // Open Graph
    updateMetaTag("og:type", "website", "property");
    updateMetaTag("og:url", pageUrl, "property");
    updateMetaTag("og:title", pageTitle, "property");
    updateMetaTag("og:description", pageDescription, "property");
    updateMetaTag("og:image", pageImage, "property");
    updateMetaTag("og:locale", siteConfig.locale, "property");
    updateMetaTag("og:site_name", siteConfig.name, "property");

    // Twitter
    updateMetaTag("twitter:card", siteConfig.twitter.cardType);
    updateMetaTag("twitter:url", pageUrl);
    updateMetaTag("twitter:title", pageTitle);
    updateMetaTag("twitter:description", pageDescription);
    updateMetaTag("twitter:image", pageImage);
    if (siteConfig.twitter.handle) {
      updateMetaTag("twitter:creator", siteConfig.twitter.handle);
    }

    // Additional Meta Tags
    updateMetaTag("theme-color", "#0f172a");
    updateMetaTag("apple-mobile-web-app-capable", "yes");
    updateMetaTag("apple-mobile-web-app-status-bar-style", "black-translucent");

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.rel = "canonical";
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;
  }, [
    pageTitle,
    pageDescription,
    pageKeywords,
    pageImage,
    pageUrl,
    canonicalUrl,
    robotsContent,
  ]);

  return null;
}

