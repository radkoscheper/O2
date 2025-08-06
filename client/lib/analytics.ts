// Define the gtag function globally
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Initialize Google Analytics
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!measurementId) {
    console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    return;
  }

  // Add Google Analytics script to the head
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Initialize gtag
  const script2 = document.createElement('script');
  script2.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}');
  `;
  document.head.appendChild(script2);

  console.log('🔧 Google Analytics initialized with ID:', measurementId);
};

// Track page views - useful for single-page applications
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId) return;
  
  window.gtag('config', measurementId, {
    page_path: url
  });

  console.log('📊 GA: Page view tracked:', url);
};

// Track events
export const trackEvent = (
  action: string, 
  category?: string, 
  label?: string, 
  value?: number
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });

  console.log('📊 GA: Event tracked:', { action, category, label, value });
};

// Track destination views for travel insights
export const trackDestinationView = (destinationName: string, destinationSlug: string) => {
  trackEvent('destination_view', 'travel', destinationName);
  trackPageView(`/bestemming/${destinationSlug}`);
};

// Track guide views
export const trackGuideView = (guideTitle: string, guideSlug: string) => {
  trackEvent('guide_view', 'content', guideTitle);
  trackPageView(`/gids/${guideSlug}`);
};

// Track search actions
export const trackSearch = (searchQuery: string, searchScope: string) => {
  trackEvent('search', 'navigation', searchQuery, searchQuery.length);
  window.gtag('event', 'search', {
    search_term: searchQuery,
    search_scope: searchScope
  });
};

// Track homepage engagement
export const trackHomepageInteraction = (interactionType: string, elementName?: string) => {
  trackEvent('homepage_interaction', 'engagement', `${interactionType}_${elementName || 'unknown'}`);
};

// Core Web Vitals tracking
export const trackWebVitals = () => {
  if (typeof window === 'undefined' || !window.gtag) return;

  // Track Largest Contentful Paint (LCP)
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    
    window.gtag('event', 'web_vitals', {
      event_category: 'performance',
      event_label: 'LCP',
      value: Math.round(lastEntry.startTime),
      non_interaction: true
    });
    
    console.log('📊 GA: LCP tracked:', Math.round(lastEntry.startTime));
  });

  try {
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    console.warn('LCP observation not supported');
  }

  // Track Cumulative Layout Shift (CLS)
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
      }
    }
  });

  try {
    clsObserver.observe({ entryTypes: ['layout-shift'] });
    
    // Report CLS on page hide
    window.addEventListener('beforeunload', () => {
      window.gtag('event', 'web_vitals', {
        event_category: 'performance',
        event_label: 'CLS',
        value: Math.round(clsValue * 1000),
        non_interaction: true
      });
    });
  } catch (e) {
    console.warn('CLS observation not supported');
  }
};