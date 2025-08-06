import { useEffect } from 'react';

interface StructuredDataProps {
  type?: 'Website' | 'Article' | 'TravelGuide' | 'Place' | 'TouristDestination';
  title: string;
  description: string;
  url?: string;
  image?: string;
  location?: string;
  content?: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
  keywords?: string;
  siteName?: string;
}

export default function StructuredData({
  type = 'Article',
  title,
  description,
  url,
  image,
  location,
  content,
  author = 'Ontdek Polen',
  datePublished,
  dateModified,
  keywords,
  siteName = 'Ontdek Polen'
}: StructuredDataProps) {
  useEffect(() => {
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Create base structured data object
    const currentUrl = url || window.location.href;
    const currentImage = image || `${window.location.origin}/images/og-default.jpg`;

    let structuredData: any = {
      '@context': 'https://schema.org',
      '@type': type,
      'name': title,
      'headline': title,
      'description': description,
      'url': currentUrl,
      'image': {
        '@type': 'ImageObject',
        'url': currentImage,
        'width': 1200,
        'height': 630
      },
      'author': {
        '@type': 'Organization',
        'name': author,
        'url': window.location.origin
      },
      'publisher': {
        '@type': 'Organization',
        'name': siteName,
        'url': window.location.origin,
        'logo': {
          '@type': 'ImageObject',
          'url': `${window.location.origin}/favicon.ico`,
          'width': 32,
          'height': 32
        }
      },
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': currentUrl
      }
    };

    // Add type-specific properties
    if (type === 'TouristDestination' || type === 'Place') {
      structuredData['@type'] = 'TouristDestination';
      if (location) {
        structuredData.address = {
          '@type': 'PostalAddress',
          'addressCountry': 'PL',
          'addressRegion': location
        };
        structuredData.geo = {
          '@type': 'GeoCoordinates',
          'addressCountry': 'Poland'
        };
      }
      structuredData.touristType = 'Cultural Tourism';
    }

    if (type === 'TravelGuide' || type === 'Article') {
      structuredData['@type'] = 'Article';
      structuredData.articleSection = 'Travel';
      structuredData.genre = 'Travel Guide';
      
      if (datePublished) {
        structuredData.datePublished = datePublished;
      }
      if (dateModified) {
        structuredData.dateModified = dateModified;
      }
      if (content) {
        structuredData.wordCount = content.split(' ').length;
      }
    }

    if (type === 'Website') {
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': siteName,
        'description': description,
        'url': window.location.origin,
        'potentialAction': {
          '@type': 'SearchAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${window.location.origin}/?search={search_term_string}`
          },
          'query-input': 'required name=search_term_string'
        },
        'publisher': {
          '@type': 'Organization',
          'name': siteName,
          'url': window.location.origin
        }
      };
    }

    // Add keywords if provided
    if (keywords) {
      structuredData.keywords = keywords.split(',').map((k: string) => k.trim());
    }

    // Create and append script tag
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(structuredData, null, 2);
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const scriptToRemove = document.querySelector('script[type="application/ld+json"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [type, title, description, url, image, location, author, datePublished, dateModified, keywords, siteName]);

  return null; // This component doesn't render anything visible
}