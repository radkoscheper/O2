import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  lazy?: boolean;
  placeholder?: 'blur' | 'empty';
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  priority = false,
  lazy = true,
  placeholder = 'blur',
  sizes,
  onLoad,
  onError
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(!lazy || priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Load images 50px before they come into view
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy, priority, inView]);

  // Generate responsive image sizes
  const generateSrcSet = (baseSrc: string) => {
    const extensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = extensions.find(e => baseSrc.toLowerCase().endsWith(e)) || '.jpg';
    const basePath = baseSrc.replace(ext, '');
    
    return [
      `${basePath}_480${ext} 480w`,
      `${basePath}_768${ext} 768w`,
      `${basePath}_1024${ext} 1024w`,
      `${basePath}_1280${ext} 1280w`,
      `${basePath}${ext} 1920w`
    ].join(', ');
  };

  const handleLoad = () => {
    setLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setError(true);
    if (onError) onError();
  };

  // Blur placeholder CSS
  const blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

  if (!inView) {
    return (
      <div 
        ref={imgRef}
        className={cn(
          'bg-navy-dark/20 animate-pulse',
          className
        )}
        style={{ 
          width: '100%', 
          height: '100%',
          minHeight: priority ? '100vh' : 'auto'
        }}
      />
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Blur placeholder */}
      {placeholder === 'blur' && !loaded && !error && (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110"
          aria-hidden="true"
        />
      )}

      {/* Loading placeholder */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Main image */}
      {!error && (
        <img
          ref={imgRef}
          src={src}
          srcSet={generateSrcSet(src)}
          sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {/* Error fallback */}
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-sm">Image niet beschikbaar</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Specialized Hero Image component with fixed dimensions to prevent CLS
export const HeroImageOptimized: React.FC<OptimizedImageProps> = (props) => {
  return (
    <div className="w-full h-full">
      <OptimizedImage
        {...props}
        priority={true}
        lazy={false}
        sizes="100vw"
        placeholder="blur"
        className={`w-full h-full object-cover ${props.className || ''}`}
      />
    </div>
  );
};

export const DestinationImageOptimized: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImage
    {...props}
    priority={false}
    lazy={true}
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
    placeholder="blur"
  />
);

export const ThumbnailImageOptimized: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImage
    {...props}
    priority={false}
    lazy={true}
    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 200px"
    placeholder="blur"
  />
);