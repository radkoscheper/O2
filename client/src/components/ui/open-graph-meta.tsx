import { useEffect } from 'react';

interface OpenGraphMetaProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  siteName?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export default function OpenGraphMeta({
  title,
  description,
  image,
  url,
  type = 'website',
  siteName = 'Ontdek Polen',
  author = 'Ontdek Polen',
  publishedTime,
  modifiedTime
}: OpenGraphMetaProps) {
  useEffect(() => {
    console.log('🔗 OpenGraphMeta component mounting...', { title, type });
    
    // Get current URL and default image
    const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const defaultImage = typeof window !== 'undefined' ? `${window.location.origin}/images/og-default.jpg` : '';
    const ogImage = image || defaultImage;

    // Meta tags to add/update
    const metaTags = [
      // Open Graph basic tags
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: ogImage },
      { property: 'og:url', content: currentUrl },
      { property: 'og:type', content: type },
      { property: 'og:site_name', content: siteName },
      { property: 'og:locale', content: 'nl_NL' },
      
      // Open Graph image details
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: `${title} - ${siteName}` },
      
      // Twitter Card tags
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: ogImage },
      { name: 'twitter:site', content: '@OntdekPolen' },
      
      // Additional SEO meta tags
      { name: 'author', content: author },
      { name: 'robots', content: 'index, follow' },
    ];

    // Add article-specific tags if type is article
    if (type === 'article' && publishedTime) {
      metaTags.push(
        { property: 'article:published_time', content: publishedTime },
        { property: 'article:author', content: author },
        { property: 'article:section', content: 'Travel' }
      );
      
      if (modifiedTime) {
        metaTags.push({ property: 'article:modified_time', content: modifiedTime });
      }
    }

    // Add canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', currentUrl);
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', currentUrl);
      document.head.appendChild(canonicalLink);
    }

    // Add or update meta tags
    metaTags.forEach(({ property, name, content }) => {
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

    console.log('✅ Open Graph meta tags updated for:', title);

    // Cleanup function
    return () => {
      // Note: We don't remove meta tags on unmount as they should persist
      // for social media crawlers and SEO
    };
  }, [title, description, image, url, type, siteName, author, publishedTime, modifiedTime]);

  return null; // This component doesn't render anything visible
}