import { useEffect } from 'react';

interface StructuredDataProps {
  type: 'destination' | 'guide' | 'activity' | 'page';
  data: any;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  useEffect(() => {
    const addStructuredData = () => {
      // Remove existing structured data if any
      const existingScript = document.querySelector('#structured-data');
      if (existingScript) {
        existingScript.remove();
      }

      let structuredData = {};

      switch (type) {
        case 'destination':
          structuredData = {
            "@context": "https://schema.org",
            "@type": "TravelGuide",
            "name": data.title,
            "description": data.metaDescription || data.description || `Reisgids voor ${data.title}, Polen`,
            "url": `https://ontdekpolen.nl/${data.slug}`,
            "about": {
              "@type": "Place",
              "name": data.title,
              "description": data.description,
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "PL",
                "addressRegion": "Polen"
              }
            },
            "author": {
              "@type": "Organization",
              "name": "Ontdek Polen"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Ontdek Polen",
              "url": "https://ontdekpolen.nl"
            },
            "inLanguage": "nl",
            "dateModified": data.updatedAt || new Date().toISOString(),
            "mainEntity": {
              "@type": "Place",
              "name": data.title,
              "description": data.description
            }
          };
          break;

        case 'guide':
          structuredData = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": data.title,
            "description": data.metaDescription || data.description || `${data.title} reisgids`,
            "url": `https://ontdekpolen.nl/guides/${data.slug}`,
            "author": {
              "@type": "Organization",
              "name": "Ontdek Polen"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Ontdek Polen",
              "url": "https://ontdekpolen.nl"
            },
            "datePublished": data.createdAt || new Date().toISOString(),
            "dateModified": data.updatedAt || new Date().toISOString(),
            "inLanguage": "nl",
            "articleSection": "Reisgidsen",
            "about": {
              "@type": "Place",
              "name": "Polen",
              "description": "Reisinformatie over Polen"
            }
          };
          break;

        case 'activity':
          structuredData = {
            "@context": "https://schema.org",
            "@type": "TouristAttraction",
            "name": data.name,
            "description": data.description || `${data.name} in Polen`,
            "url": `https://ontdekpolen.nl/activities/${data.id}`,
            "location": {
              "@type": "Place",
              "name": data.location || "Polen",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "PL"
              }
            },
            "touristType": data.category || "Algemeen",
            "isAccessibleForFree": true
          };
          break;

        case 'page':
          structuredData = {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": data.title,
            "description": data.metaDescription || data.description || `${data.title} - Ontdek Polen`,
            "url": `https://ontdekpolen.nl/${data.slug}`,
            "inLanguage": "nl",
            "isPartOf": {
              "@type": "WebSite",
              "name": "Ontdek Polen",
              "url": "https://ontdekpolen.nl"
            },
            "dateModified": data.updatedAt || new Date().toISOString(),
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://ontdekpolen.nl"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": data.title,
                  "item": `https://ontdekpolen.nl/${data.slug}`
                }
              ]
            }
          };
          break;
      }

      // Add image if available
      if (data.image || data.headerImage) {
        (structuredData as any).image = data.image || data.headerImage;
      }

      // Create and append script tag
      const script = document.createElement('script');
      script.id = 'structured-data';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData, null, 2);
      document.head.appendChild(script);
    };

    addStructuredData();
  }, [type, data]);

  return null; // This component doesn't render anything
}

export default StructuredData;