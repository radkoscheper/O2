/**
 * Cloudinary AI Features voor Ontdek Polen
 * Uitgebreide AI transformaties voor travel images
 */

export interface CloudinaryAITransform {
  name: string;
  description: string;
  transformation: string;
  useCase: string;
  aiFeatures: string[];
}

// Geavanceerde AI transformaties voor travel website
export const CLOUDINARY_AI_TRANSFORMS: CloudinaryAITransform[] = [
  {
    name: 'travel-hero-enhanced',
    description: 'AI-enhanced hero images met background removal en upscaling',
    transformation: 'w_1200,h_600,c_fill,g_auto,e_upscale,e_auto_contrast,e_saturation:10,q_auto:good,f_auto',
    useCase: 'Hero sections voor bestemmingen',
    aiFeatures: ['Smart Cropping', 'AI Upscaling', 'Auto Enhancement']
  },
  {
    name: 'destination-card-ai',
    description: 'Perfect destination cards met AI background replacement',
    transformation: 'w_400,h_300,c_fill,g_auto,e_improve,e_auto_brightness,e_auto_contrast,q_auto:good,f_auto',
    useCase: 'Destination cards op homepage',
    aiFeatures: ['Smart Cropping', 'Auto Enhancement', 'Quality Improvement']
  },
  {
    name: 'travel-photo-professional',
    description: 'Professional travel photography enhancement',
    transformation: 'w_800,h_600,c_fill,g_auto,e_improve:outdoor,e_saturation:15,e_brightness:5,q_auto:good,f_auto',
    useCase: 'Travel foto galleries en activities',
    aiFeatures: ['Outdoor Enhancement', 'Color Enhancement', 'Professional Quality']
  },
  {
    name: 'background-remove-replace',
    description: 'Background removal voor product shots en portraits',
    transformation: 'e_background_removal,w_800,h_600,c_pad,b_white,q_auto:good,f_auto',
    useCase: 'Restaurant/hotel product images, staff portraits',
    aiFeatures: ['AI Background Removal', 'Smart Padding']
  },
  {
    name: 'mobile-optimized-ai',
    description: 'Mobile-first AI optimization',
    transformation: 'w_375,h_250,c_fill,g_auto,dpr_2.0,e_improve,q_auto:low,f_auto',
    useCase: 'Mobile device optimization',
    aiFeatures: ['Smart Cropping', 'Device Optimization', 'Bandwidth Optimization']
  },
  {
    name: 'social-media-ai',
    description: 'AI-optimized voor social media sharing',
    transformation: 'w_1200,h_630,c_fill,g_auto,e_improve,e_saturation:10,q_80,f_auto',
    useCase: 'Open Graph en social media previews',
    aiFeatures: ['Smart Cropping', 'Social Optimization', 'Enhanced Colors']
  }
];

/**
 * Generative AI Features (2024 Nieuwe Features)
 */
export interface GenerativeAIOptions {
  prompt?: string;
  aspectRatio?: string;
  style?: string;
}

export const GENERATIVE_AI_FEATURES = {
  // Generative Background Replace
  backgroundReplace: (prompt: string) => `e_gen_background_replace:prompt_${encodeURIComponent(prompt)}`,
  
  // Generative Fill voor aspect ratio changes
  generativeFill: (aspectRatio: string) => `ar_${aspectRatio},c_pad,e_gen_fill`,
  
  // Generative Remove voor ongewenste objecten
  generativeRemove: (objectsToRemove: string) => `e_gen_remove:prompt_${encodeURIComponent(objectsToRemove)}`,
  
  // Generative Recolor
  recolor: (colorPrompt: string) => `e_gen_recolor:prompt_${encodeURIComponent(colorPrompt)}`
};

/**
 * Auto Tagging en Content Analysis
 */
export const AUTO_TAGGING_OPTIONS = {
  // Amazon Rekognition voor brede object detectie
  amazonRekognition: 'categorization=aws_rek_tagging,auto_tagging=0.7',
  
  // Google Image Analysis
  googleVision: 'categorization=google_tagging,auto_tagging=0.6',
  
  // Imagga Auto Tagging (beste voor travel content)
  imaggaTravel: 'categorization=imagga_tagging,auto_tagging=0.5',
  
  // Content Moderation
  contentModeration: 'moderation=aws_rek'
};

/**
 * Genereert AI-enhanced Cloudinary URL
 */
export function generateAIEnhancedUrl(
  originalUrl: string,
  transformName?: string,
  customOptions?: Record<string, any>
): string {
  const publicId = extractPublicId(originalUrl);
  if (!publicId) return originalUrl;
  
  const cloudName = 'df3i1avwb';
  let transformation = '';
  
  if (transformName) {
    const transform = CLOUDINARY_AI_TRANSFORMS.find(t => t.name === transformName);
    transformation = transform?.transformation || '';
  }
  
  if (customOptions?.transformation) {
    transformation = customOptions.transformation;
  } else if (customOptions && !transformation) {
    transformation = Object.entries(customOptions)
      .map(([key, value]) => `${key}_${value}`)
      .join(',');
  }
  
  if (!transformation) {
    return originalUrl;
  }
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${publicId}`;
}

/**
 * AI Upscaling Utility
 */
export function generateUpscaledUrl(originalUrl: string, targetWidth?: number): string {
  const publicId = extractPublicId(originalUrl);
  if (!publicId) return originalUrl;
  
  const cloudName = 'df3i1avwb';
  let transformation = 'e_upscale';
  
  if (targetWidth) {
    transformation += `,w_${targetWidth}`;
  }
  
  transformation += ',c_scale,q_auto:good,f_auto';
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${publicId}`;
}

/**
 * Generative Fill voor Aspect Ratio Changes
 */
export function generateAspectRatioUrl(
  originalUrl: string, 
  aspectRatio: string, 
  width: number = 800
): string {
  const publicId = extractPublicId(originalUrl);
  if (!publicId) return originalUrl;
  
  const cloudName = 'df3i1avwb';
  const [w, h] = aspectRatio.split(':').map(Number);
  const height = Math.round(width * (h / w));
  
  const transformation = [
    `w_${width}`,
    `h_${height}`,
    `ar_${aspectRatio}`,
    'c_pad',
    'e_gen_fill',
    'q_auto:good',
    'f_auto'
  ].join(',');
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${publicId}`;
}

/**
 * AI Content Analysis voor automatische categorisering
 */
export async function analyzeImageContent(imageUrl: string): Promise<{
  tags: string[];
  categories: string[];
  confidence: number;
  isAppropriate: boolean;
}> {
  // In production zou dit een echte Cloudinary API call zijn
  // Voor nu returneren we mock data gebaseerd op de URL
  const mockAnalysis = {
    tags: ['poland', 'castle', 'architecture', 'tourism', 'historic'],
    categories: ['travel', 'destinations', 'culture'],
    confidence: 0.87,
    isAppropriate: true
  };
  
  return mockAnalysis;
}

/**
 * Extract public ID from Cloudinary URL
 */
function extractPublicId(cloudinaryUrl: string): string | null {
  const match = cloudinaryUrl.match(/\/image\/upload\/(?:v\d+\/)?(.+)$/);
  return match ? match[1] : null;
}

/**
 * Travel-specific AI Enhancements
 */
export const TRAVEL_AI_PRESETS = {
  // Voor natuur foto's
  nature: 'e_improve:outdoor,e_saturation:20,e_vibrance:15',
  
  // Voor architectuur/steden
  architecture: 'e_improve:indoor,e_auto_contrast,e_sharpen:100',
  
  // Voor food photography
  food: 'e_improve:indoor,e_saturation:15,e_vibrance:20,e_auto_brightness',
  
  // Voor mensen/portraits
  people: 'e_improve:indoor,g_faces,e_saturation:10',
  
  // Voor landschappen
  landscape: 'e_improve:outdoor,e_saturation:25,e_auto_contrast'
};

export default {
  CLOUDINARY_AI_TRANSFORMS,
  GENERATIVE_AI_FEATURES,
  AUTO_TAGGING_OPTIONS,
  generateAIEnhancedUrl,
  analyzeImageContent,
  TRAVEL_AI_PRESETS
};