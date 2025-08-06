import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';

interface SEOData {
  title: string;
  description: string;
  image: string;
  url: string;
  type: 'website' | 'article';
  keywords?: string;
  siteName: string;
  publishedTime?: string;
  modifiedTime?: string;
}

// Hook to dynamically update SEO meta tags
export function useSEO() {
  const [location] = useLocation();
  
  const { data: seoData, isLoading } = useQuery<SEOData>({
    queryKey: ['/api/seo-data', location],
    queryFn: async () => {
      const response = await fetch(`/api/seo-data?path=${encodeURIComponent(location)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch SEO data');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  useEffect(() => {
    if (!seoData || isLoading) return;

    console.log('🔍 Updating dynamic SEO tags for:', location, seoData.title);

    // Update title
    document.title = seoData.title;

    // Update meta tags dynamically
    const metaUpdates = [
      { name: 'description', content: seoData.description },
      { property: 'og:title', content: seoData.title },
      { property: 'og:description', content: seoData.description },
      { property: 'og:image', content: seoData.image },
      { property: 'og:url', content: seoData.url },
      { property: 'og:type', content: seoData.type },
      { name: 'twitter:title', content: seoData.title },
      { name: 'twitter:description', content: seoData.description },
      { name: 'twitter:image', content: seoData.image },
    ];

    if (seoData.keywords) {
      metaUpdates.push({ name: 'keywords', content: seoData.keywords });
    }

    metaUpdates.forEach(({ name, property, content }) => {
      const attribute = property ? 'property' : 'name';
      const value = property || name;
      
      let metaTag = document.querySelector(`meta[${attribute}="${value}"]`);
      
      if (metaTag) {
        metaTag.setAttribute('content', content);
      } else {
        metaTag = document.createElement('meta');
        metaTag.setAttribute(attribute, value);
        metaTag.setAttribute('content', content);
        document.head.appendChild(metaTag);
      }
    });

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonicalLink) {
      canonicalLink.href = seoData.url;
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      canonicalLink.href = seoData.url;
      document.head.appendChild(canonicalLink);
    }

  }, [seoData, location, isLoading]);

  return { seoData, isLoading };
}