import { useEffect } from 'react';

// Critical resource preloading
export const useCriticalResourcePreload = () => {
  useEffect(() => {
    // Preload critical fonts
    const preloadFont = (href: string, family: string) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.href = href;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      console.log(`🔧 Preloaded font: ${family}`);
    };

    // Preload critical images
    const preloadImage = (src: string, priority: 'high' | 'low' = 'high') => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      if (priority === 'high') {
        link.setAttribute('fetchpriority', 'high');
      }
      document.head.appendChild(link);
      console.log(`🔧 Preloaded image: ${src}`);
    };

    // Preload hero image if available
    const heroImage = document.querySelector('[data-hero-image]') as HTMLImageElement;
    if (heroImage && heroImage.src) {
      preloadImage(heroImage.src, 'high');
    }

    // Preload first destination images
    const destinationImages = document.querySelectorAll('[data-destination-image]');
    destinationImages.forEach((img, index) => {
      if (index < 3) { // Preload first 3 destination images
        const element = img as HTMLImageElement;
        if (element.dataset.src) {
          preloadImage(element.dataset.src, 'low');
        }
      }
    });

  }, []);
};

// Bundle splitting and code splitting optimization
export const useCodeSplitting = () => {
  useEffect(() => {
    // Prefetch next likely routes
    const prefetchRoute = (route: string) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
      console.log(`🔧 Prefetched route: ${route}`);
    };

    // Prefetch common routes based on user journey
    setTimeout(() => {
      prefetchRoute('/ontdek-meer');
      prefetchRoute('/admin');
    }, 2000);

  }, []);
};

// Critical CSS inlining
export const useCriticalCSS = () => {
  useEffect(() => {
    // Inline critical above-the-fold CSS
    const criticalCSS = `
      .hero-section { 
        min-height: 100vh;
        background-size: cover;
        background-position: center;
      }
      .font-playfair { 
        font-family: "Playfair Display", serif; 
      }
      .font-croatia-body { 
        font-family: "Inter", sans-serif; 
      }
      .bg-navy-dark { 
        background-color: #1a202c; 
      }
      .text-navy-dark { 
        color: #1a202c; 
      }
    `;

    const style = document.createElement('style');
    style.id = 'critical-css';
    style.textContent = criticalCSS;
    document.head.insertBefore(style, document.head.firstChild);
    console.log('🔧 Critical CSS inlined');

    return () => {
      const existingStyle = document.getElementById('critical-css');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);
};

// Resource hints optimization
export const useResourceHints = () => {
  useEffect(() => {
    // DNS prefetch for external domains
    const dnsPrefetch = (domain: string) => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      document.head.appendChild(link);
      console.log(`🔧 DNS prefetch: ${domain}`);
    };

    // Preconnect to critical origins
    const preconnect = (origin: string) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = origin;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      console.log(`🔧 Preconnected: ${origin}`);
    };

    // Google Analytics
    dnsPrefetch('www.googletagmanager.com');
    dnsPrefetch('www.google-analytics.com');

    // Google Fonts
    preconnect('https://fonts.googleapis.com');
    preconnect('https://fonts.gstatic.com');

    // Cloudinary CDN
    preconnect('https://res.cloudinary.com');
    dnsPrefetch('res.cloudinary.com');

    // CDN domains (if any)
    dnsPrefetch('cdn.jsdelivr.net');

  }, []);
};

// Service Worker registration for caching
export const useServiceWorker = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('🔧 Service Worker registered:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }, []);
};

// Combined performance optimization hook
export const usePerformanceOptimizations = () => {
  useCriticalResourcePreload();
  useCodeSplitting();
  useCriticalCSS();
  useResourceHints();
  useServiceWorker(); // Service Worker now implemented
};