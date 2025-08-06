import { useEffect } from 'react';

// Core Web Vitals monitoring hook
export const usePerformanceMonitoring = () => {
  useEffect(() => {
    // Monitor Largest Contentful Paint (LCP)
    const observeLCP = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        console.log('🚀 LCP:', Math.round(lastEntry.startTime), 'ms');
        
        // Log performance warning if LCP is slow
        if (lastEntry.startTime > 2500) {
          console.warn('⚠️ Slow LCP detected. Consider optimizing images and critical resources.');
        }
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.info('LCP observation not supported in this browser');
      }
    };

    // Monitor Cumulative Layout Shift (CLS)
    const observeCLS = () => {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['layout-shift'] });
        
        // Report CLS on page visibility change
        const reportCLS = () => {
          console.log('🚀 CLS:', Math.round(clsValue * 1000) / 1000);
          if (clsValue > 0.1) {
            console.warn('⚠️ High CLS detected. Check for layout shifts in images, ads, or dynamic content.');
          }
        };

        document.addEventListener('visibilitychange', reportCLS);
        window.addEventListener('beforeunload', reportCLS);
      } catch (e) {
        console.info('CLS observation not supported in this browser');
      }
    };

    // Monitor First Input Delay (FID)
    const observeFID = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as any;
          const fid = fidEntry.processingStart - entry.startTime;
          console.log('🚀 FID:', Math.round(fid), 'ms');
          
          if (fid > 100) {
            console.warn('⚠️ Slow FID detected. Consider optimizing JavaScript execution.');
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.info('FID observation not supported in this browser');
      }
    };

    // Monitor resource loading
    const monitorResourceLoading = () => {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        console.log('🚀 Page Load Metrics:');
        console.log('  - DNS:', Math.round(navigation.domainLookupEnd - navigation.domainLookupStart), 'ms');
        console.log('  - Connect:', Math.round(navigation.connectEnd - navigation.connectStart), 'ms');
        console.log('  - Request:', Math.round(navigation.responseStart - navigation.requestStart), 'ms');
        console.log('  - Response:', Math.round(navigation.responseEnd - navigation.responseStart), 'ms');
        console.log('  - DOM Ready:', Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart), 'ms');
        console.log('  - Load Complete:', Math.round(navigation.loadEventEnd - navigation.fetchStart), 'ms');
      });
    };

    observeLCP();
    observeCLS();
    observeFID();
    monitorResourceLoading();

  }, []);
};

// Image optimization utilities
export const optimizeImageLoading = () => {
  useEffect(() => {
    // Add intersection observer for lazy loading images
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));

    return () => {
      images.forEach((img) => imageObserver.unobserve(img));
    };
  }, []);
};

// Connection monitoring
export const useConnectionMonitoring = () => {
  useEffect(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      const logConnection = () => {
        console.log('🌐 Network:', {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        });
        
        // Warn about slow connections
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          console.warn('⚠️ Slow network detected. Consider showing a simplified UI.');
        }
      };

      logConnection();
      connection.addEventListener('change', logConnection);

      return () => {
        connection.removeEventListener('change', logConnection);
      };
    }
  }, []);
};