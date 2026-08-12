import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image, url, type = 'website', productData = null, noindex = false }) => {
  const siteName = 'PINAKA TECHNOLOGIES SG PRIVATE LIMITED';
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} | Premium 3D Printers & Materials`;
  const defaultDescription = 'Explore PINAKA TECHNOLOGIES SG PRIVATE LIMITED\'s premium collection of 3D printers, filaments, and parts. High-quality 3D printing solutions for professionals and hobbyists.';
  const metaDescription = description || defaultDescription;
  const siteUrl = window.location.origin;
  const canonicalUrl = url ? `${siteUrl}${url}` : `${siteUrl}${window.location.pathname}`;
  const metaKeywords = keywords || 'PINAKA TECHNOLOGIES SG PRIVATE LIMITED, 3D Printer, 3D Printing, 3D Printer Filament, Industrial 3D Printers, 3D Printer Materials, 3D Printer Parts';

  // Base Schema for Organization
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteName,
    "url": siteUrl,
    "logo": `${siteUrl}/logo.png`,
    "sameAs": [
      "https://wa.me/918299475268"
    ]
  };

  // Product Schema (if type is product and productData is provided)
  const productSchema = type === 'product' ? {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": title,
    "image": [image],
    "description": metaDescription,
    "sku": productData?.sku || productData?._id || '',
    "brand": {
      "@type": "Brand",
      "name": productData?.brand || siteName
    },
    "offers": {
      "@type": "Offer",
      "url": canonicalUrl,
      "priceCurrency": "INR",
      "price": productData?.price || 0,
      "availability": productData?.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": siteName
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "IN",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 7,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn"
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": 0,
          "currency": "INR"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "IN"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 0,
            "maxValue": 2,
            "unitCode": "d"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 5,
            "unitCode": "d"
          }
        }
      }
    },
    ...(productData?.rating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": productData.rating.toFixed(1),
        "reviewCount": productData.reviews?.length || 1
      }
    })
  } : null;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name='description' content={metaDescription} />
      <meta name='keywords' content={metaKeywords} />
      {noindex && <meta name="robots" content="noindex" />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={image || `${siteUrl}/logo.png`} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteName} />
      {productData?.price && <meta property="product:price:amount" content={productData.price} />}
      {productData?.price && <meta property="product:price:currency" content="INR" />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={image || `${siteUrl}/logo.png`} />

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify(type === 'product' && productSchema ? productSchema : orgSchema)}
      </script>
    </Helmet>
  );
};

export default SEO;
