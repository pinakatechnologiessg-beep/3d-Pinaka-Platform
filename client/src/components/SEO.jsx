import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image, url, type = 'website' }) => {
  const siteName = '3D Pinaka';
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} | Premium 3D Printers & Materials`;
  const defaultDescription = 'Explore 3D Pinaka\'s premium collection of 3D printers, filaments, and parts. High-quality 3D printing solutions for professionals and hobbyists.';
  const metaDescription = description || defaultDescription;
  const siteUrl = window.location.origin;
  const canonicalUrl = url ? `${siteUrl}${url}` : window.location.href;
  const metaKeywords = keywords || '3D Pinaka, 3D Printer, 3D Printing, 3D Printer Filament, Industrial 3D Printers, 3D Printer Materials, 3D Printer Parts';

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name='description' content={metaDescription} />
      <meta name='keywords' content={metaKeywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={image || `${siteUrl}/logo.png`} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={image || `${siteUrl}/logo.png`} />

      {/* Structured Data (JSON-LD) */}
      {type === 'product' ? (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": title,
            "image": [image],
            "description": metaDescription,
            "brand": {
              "@type": "Brand",
              "name": siteName
            },
            "offers": {
              "@type": "Offer",
              "url": canonicalUrl,
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock",
              "itemCondition": "https://schema.org/NewCondition"
            }
          })}
        </script>
      ) : (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": siteName,
            "url": siteUrl,
            "logo": `${siteUrl}/logo.png`,
            "sameAs": [
              "https://wa.me/918299475268"
            ]
          })}
        </script>
      )}
    </Helmet>
  );
};


export default SEO;
