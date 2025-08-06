import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { generateAIEnhancedUrl, TRAVEL_AI_PRESETS } from '@/lib/cloudinary-ai-features';

interface AIEnhancedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  aiPreset?: keyof typeof TRAVEL_AI_PRESETS | 'auto';
  upscale?: boolean;
  aspectRatio?: string; // '16:9', '4:3', '1:1' etc voor generative fill
  autoTag?: boolean;
  fallback?: string;
  priority?: boolean;
  lazy?: boolean;
  onAIProcessed?: (tags: string[], categories: string[]) => void;
  className?: string;
}

export function AIEnhancedImage({
  src,
  alt,
  aiPreset = 'auto',
  upscale = false,
  aspectRatio,
  autoTag = false,
  fallback = '/images/placeholder.jpg',
  priority = false,
  lazy = true,
  onAIProcessed,
  className,
  ...props
}: AIEnhancedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [processedSrc, setProcessedSrc] = useState<string>(src);
  const [aiTags, setAiTags] = useState<string[]>([]);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '100px' // Start loading before image is visible
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy, priority, isInView]);

  // Process image with AI when it comes into view
  useEffect(() => {
    if (!isInView || !src) return;

    processImageWithAI();
  }, [isInView, src, aiPreset, upscale, aspectRatio]);

  const processImageWithAI = async () => {
    try {
      // Check if src is a valid Cloudinary URL or local image
      if (!src || src === '/images/placeholder.jpg') {
        console.log('📷 Using placeholder image, skipping AI processing');
        setProcessedSrc(src);
        setIsLoaded(true);
        return;
      }

      let transformations: string[] = [];

      // Auto-detect content type for smart AI preset
      let selectedPreset = aiPreset;
      if (aiPreset === 'auto') {
        selectedPreset = detectContentType(src, alt);
      }

      // Add AI preset transformation
      if (selectedPreset !== 'auto' && TRAVEL_AI_PRESETS[selectedPreset as keyof typeof TRAVEL_AI_PRESETS]) {
        transformations.push(TRAVEL_AI_PRESETS[selectedPreset as keyof typeof TRAVEL_AI_PRESETS]);
      }

      // Add AI upscaling if requested
      if (upscale) {
        transformations.push('e_upscale');
        console.log('🤖 AI Upscaling activated for:', alt);
      }

      // Add generative fill for aspect ratio changes
      if (aspectRatio) {
        const [width, height] = aspectRatio.split(':').map(Number);
        transformations.push(`ar_${width}:${height}`, 'c_fill');
        console.log('🎨 Generative Fill applied for aspect ratio:', aspectRatio);
      }

      // Base optimization - always add these
      transformations.push('w_800', 'h_600', 'c_fill', 'g_auto', 'q_auto:good', 'f_auto');

      let enhancedUrl = src;
      
      // Only apply AI transformations to Cloudinary URLs
      if (src.includes('res.cloudinary.com')) {
        const transformation = transformations.join(',');
        enhancedUrl = generateAIEnhancedUrl(src, '', { transformation });
      } else {
        // For local/other images, just use the original
        console.log('📷 Non-Cloudinary image detected, using original:', src);
      }
      
      setProcessedSrc(enhancedUrl);

      // Auto-tagging if enabled
      if (autoTag) {
        await performAutoTagging(src);
      }

    } catch (error) {
      console.error('AI processing failed:', error);
      setProcessedSrc(src); // Fallback to original
    }
  };

  const detectContentType = (imageSrc: string, imageAlt: string): keyof typeof TRAVEL_AI_PRESETS => {
    const alt = imageAlt.toLowerCase();
    const src = imageSrc.toLowerCase();
    
    // Nature detection
    if (alt.includes('natuur') || alt.includes('berg') || alt.includes('meer') || 
        alt.includes('bos') || alt.includes('park') || src.includes('nature')) {
      return 'nature';
    }
    
    // Architecture detection
    if (alt.includes('kasteel') || alt.includes('kerk') || alt.includes('gebouw') ||
        alt.includes('stad') || alt.includes('architectuur') || src.includes('architecture')) {
      return 'architecture';
    }
    
    // Food detection
    if (alt.includes('restaurant') || alt.includes('eten') || alt.includes('food') ||
        alt.includes('gerecht') || src.includes('food') || src.includes('restaurant')) {
      return 'food';
    }
    
    // People detection
    if (alt.includes('mensen') || alt.includes('portret') || alt.includes('person') ||
        src.includes('people') || src.includes('portrait')) {
      return 'people';
    }
    
    // Default to landscape for travel content
    return 'landscape';
  };

  const performAutoTagging = async (imageSrc: string) => {
    try {
      // Simulate AI tagging (in production zou dit een echte Cloudinary API call zijn)
      const mockTags = generateMockTags(imageSrc, alt);
      setAiTags(mockTags.tags);
      
      console.log('🏷️ Auto-tagging completed:', mockTags.tags);
      
      if (onAIProcessed) {
        onAIProcessed(mockTags.tags, mockTags.categories);
      }
    } catch (error) {
      console.error('Auto-tagging failed:', error);
    }
  };

  const generateMockTags = (imageSrc: string, imageAlt: string) => {
    // Enhanced mock tagging based on Poland travel content
    const alt = imageAlt.toLowerCase();
    const src = imageSrc.toLowerCase();
    
    let tags: string[] = ['polen', 'travel', 'tourism'];
    let categories: string[] = ['travel', 'destinations'];
    
    // Location-based tags
    if (alt.includes('krakow') || src.includes('krakow')) {
      tags.push('krakow', 'małopolska', 'historic-city', 'unesco');
      categories.push('cities', 'culture');
    }
    
    if (alt.includes('warszawa') || alt.includes('warsaw')) {
      tags.push('warsaw', 'capital', 'mazowsze', 'modern');
      categories.push('cities', 'business');
    }
    
    if (alt.includes('gdansk')) {
      tags.push('gdansk', 'baltic-sea', 'hanseatic', 'amber');
      categories.push('coastal', 'historic');
    }
    
    // Activity-based tags
    if (alt.includes('hiking') || alt.includes('wandelen')) {
      tags.push('hiking', 'outdoor-activities', 'nature-trails');
      categories.push('activities', 'outdoor');
    }
    
    if (alt.includes('castle') || alt.includes('kasteel')) {
      tags.push('castle', 'medieval', 'architecture', 'historic-site');
      categories.push('attractions', 'history');
    }
    
    // Content type tags
    if (alt.includes('restaurant') || alt.includes('food')) {
      tags.push('polish-cuisine', 'dining', 'local-food');
      categories.push('food', 'restaurants');
    }
    
    return { tags, categories };
  };

  const handleLoad = () => {
    setIsLoaded(true);
    console.log('✅ AI-enhanced image loaded:', alt);
  };

  const handleError = () => {
    setIsError(true);
    // Try fallback first, then original src
    if (processedSrc !== src) {
      console.warn('⚠️ AI-enhanced URL failed, trying original:', alt);
      setProcessedSrc(src);
    } else {
      console.warn('❌ Image failed completely, using fallback:', alt);
      setProcessedSrc(fallback);
    }
  };

  if (!isInView) {
    return (
      <div 
        ref={imgRef}
        className={cn('bg-gray-200 animate-pulse', className)}
        style={{ minHeight: '200px' }}
      />
    );
  }

  return (
    <div className="relative">
      <img
        ref={imgRef}
        src={processedSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={cn(
          'transition-opacity duration-500',
          isLoaded ? 'opacity-100' : 'opacity-0',
          isError && 'opacity-60',
          className
        )}
        {...props}
      />
      
      {/* AI Tags Overlay (optional, voor debugging) */}
      {autoTag && aiTags.length > 0 && process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs p-1 rounded">
          🏷️ {aiTags.slice(0, 3).join(', ')}
        </div>
      )}
      
      {/* AI Processing Indicator */}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="text-gray-500 text-sm flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            AI Processing...
          </div>
        </div>
      )}
    </div>
  );
}

export default AIEnhancedImage;