/**
 * AI Image Processing Service for Pre-Processing Images
 * Generates AI-enhanced URLs and stores them in the database
 */

// Simple Cloudinary URL generator for server-side processing
function generateCloudinaryUrl(baseUrl: string, transformations: string[]): string {
  // Extract base URL components
  const cloudinaryPattern = /(https:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\/)/;
  const match = baseUrl.match(cloudinaryPattern);
  
  if (!match) {
    return baseUrl; // Return original if not Cloudinary URL
  }
  
  const baseCloudinaryUrl = match[1];
  const restOfUrl = baseUrl.replace(match[0], '');
  
  // Insert transformations
  const transformationString = transformations.join(',');
  return `${baseCloudinaryUrl}${transformationString}/${restOfUrl}`;
}

export interface AIProcessingSettings {
  upscale?: boolean;
  aspectRatio?: string;
  autoTags?: string[];
  generativeFill?: boolean;
}

export interface AIProcessingResult {
  aiImageUrl: string;
  settings: AIProcessingSettings;
  tags: string[];
}

/**
 * Process a single image with AI enhancements
 */
export async function processImageWithAI(
  originalImageUrl: string,
  settings: AIProcessingSettings = {}
): Promise<AIProcessingResult> {
  // Only process Cloudinary URLs
  if (!originalImageUrl.includes('cloudinary.com')) {
    throw new Error('Only Cloudinary URLs can be processed with AI');
  }

  // Default AI settings for Polish travel content
  const defaultSettings: AIProcessingSettings = {
    upscale: true,
    aspectRatio: '4:3',
    generativeFill: true,
    ...settings
  };

  try {
    // Generate AI-enhanced URL using existing Cloudinary functions
    let aiImageUrl = originalImageUrl;
    
    // Apply upscaling if enabled
    if (defaultSettings.upscale) {
      aiImageUrl = generateCloudinaryUrl(aiImageUrl, ['e_upscale']);
    }
    
    // Apply generative fill if enabled and aspect ratio is set
    if (defaultSettings.generativeFill && defaultSettings.aspectRatio) {
      const [width, height] = defaultSettings.aspectRatio.split(':').map(n => parseInt(n));
      aiImageUrl = generateCloudinaryUrl(aiImageUrl, [`e_gen_fill,ar_${width}:${height},c_pad`]);
    }

    // Generate travel-specific tags for Poland content
    const autoTags = generateTravelTags(originalImageUrl);

    return {
      aiImageUrl,
      settings: {
        ...defaultSettings,
        autoTags
      },
      tags: autoTags
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('AI processing failed:', error);
    throw new Error(`Failed to process image with AI: ${errorMessage}`);
  }
}

/**
 * Generate travel-specific tags based on image URL patterns
 */
function generateTravelTags(imageUrl: string): string[] {
  const baseTags = ['polen', 'travel', 'tourism'];
  
  // Add location-specific tags based on URL or filename patterns
  if (imageUrl.toLowerCase().includes('krakow') || imageUrl.toLowerCase().includes('cracow')) {
    baseTags.push('krakow', 'małopolska', 'historic-city', 'unesco');
  }
  
  if (imageUrl.toLowerCase().includes('tatra')) {
    baseTags.push('tatra', 'mountains', 'nature', 'hiking');
  }
  
  if (imageUrl.toLowerCase().includes('gdansk')) {
    baseTags.push('gdansk', 'baltic-sea', 'historic-city', 'hanseatic');
  }
  
  if (imageUrl.toLowerCase().includes('bialowieza')) {
    baseTags.push('bialowieza', 'forest', 'unesco', 'nature', 'wildlife');
  }
  
  if (imageUrl.toLowerCase().includes('wroclaw')) {
    baseTags.push('wrocław', 'lower-silesia', 'historic-city', 'architecture');
  }

  return baseTags;
}

/**
 * Batch process multiple images
 */
export async function batchProcessImages(
  images: Array<{ id: number; url: string; type: 'destination' | 'guide' }>,
  settings: AIProcessingSettings = {}
): Promise<Array<{ id: number; result?: AIProcessingResult; error?: string }>> {
  const results = [];
  
  for (const image of images) {
    try {
      const result = await processImageWithAI(image.url, settings);
      results.push({ id: image.id, result });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.push({ id: image.id, error: errorMessage });
    }
  }
  
  return results;
}