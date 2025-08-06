import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AITag {
  tag: string;
  confidence: number;
  category: string;
}

interface AITaggingResult {
  tags: AITag[];
  categories: string[];
  confidence: number;
  isAppropriate: boolean;
  processingTime: number;
}

export function useAITagging() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<AITaggingResult | null>(null);
  const { toast } = useToast();

  const processImage = useCallback(async (imageUrl: string, imageName: string): Promise<AITaggingResult> => {
    setIsProcessing(true);
    const startTime = Date.now();

    try {
      // In production zou dit een echte Cloudinary API call zijn
      // Voor nu simuleren we de AI tagging met intelligente mock data
      const mockResult = await generateIntelligentTags(imageUrl, imageName);
      const processingTime = Date.now() - startTime;
      
      const result: AITaggingResult = {
        ...mockResult,
        processingTime
      };
      
      setResults(result);
      
      console.log('🤖 AI Tagging completed:', {
        image: imageName,
        tags: result.tags.length,
        processingTime: `${processingTime}ms`,
        confidence: result.confidence
      });
      
      toast({
        title: "AI Tagging voltooid",
        description: `${result.tags.length} tags gegenereerd voor ${imageName}`,
      });
      
      return result;
    } catch (error) {
      console.error('AI Tagging failed:', error);
      toast({
        title: "AI Tagging fout",
        description: "Er is een probleem opgetreden bij het analyseren van de afbeelding",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const batchProcess = useCallback(async (images: Array<{ url: string; name: string }>): Promise<AITaggingResult[]> => {
    const results: AITaggingResult[] = [];
    
    for (const image of images) {
      try {
        const result = await processImage(image.url, image.name);
        results.push(result);
        
        // Kleine delay tussen batch processing om rate limits te respecteren
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Batch processing failed for ${image.name}:`, error);
      }
    }
    
    toast({
      title: "Batch AI Tagging voltooid",
      description: `${results.length}/${images.length} afbeeldingen succesvol geprocessed`,
    });
    
    return results;
  }, [processImage, toast]);

  return {
    processImage,
    batchProcess,
    isProcessing,
    results,
    clearResults: () => setResults(null)
  };
}

// Intelligente mock tagging gebaseerd op Polen travel content
async function generateIntelligentTags(imageUrl: string, imageName: string): Promise<Omit<AITaggingResult, 'processingTime'>> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
  
  const url = imageUrl.toLowerCase();
  const name = imageName.toLowerCase();
  const combined = `${url} ${name}`.toLowerCase();
  
  const tags: AITag[] = [];
  const categories: string[] = [];
  
  // Base tags voor alle Polen content
  tags.push(
    { tag: 'polen', confidence: 0.95, category: 'location' },
    { tag: 'travel', confidence: 0.92, category: 'activity' },
    { tag: 'tourism', confidence: 0.88, category: 'activity' }
  );
  categories.push('travel', 'destinations');
  
  // Steden detectie
  if (combined.includes('krakow') || combined.includes('krakau')) {
    tags.push(
      { tag: 'krakow', confidence: 0.98, category: 'location' },
      { tag: 'historic-city', confidence: 0.85, category: 'characteristic' },
      { tag: 'unesco-world-heritage', confidence: 0.82, category: 'classification' },
      { tag: 'medieval', confidence: 0.78, category: 'period' }
    );
    categories.push('cities', 'culture', 'history');
  }
  
  if (combined.includes('warsaw') || combined.includes('warszawa')) {
    tags.push(
      { tag: 'warsaw', confidence: 0.97, category: 'location' },
      { tag: 'capital-city', confidence: 0.94, category: 'classification' },
      { tag: 'modern', confidence: 0.81, category: 'characteristic' },
      { tag: 'business-district', confidence: 0.75, category: 'area' }
    );
    categories.push('cities', 'business', 'modern');
  }
  
  if (combined.includes('gdansk')) {
    tags.push(
      { tag: 'gdansk', confidence: 0.96, category: 'location' },
      { tag: 'baltic-sea', confidence: 0.89, category: 'geographic' },
      { tag: 'hanseatic-city', confidence: 0.84, category: 'classification' },
      { tag: 'amber', confidence: 0.76, category: 'specialty' }
    );
    categories.push('coastal', 'historic', 'maritime');
  }
  
  // Natuur detectie
  if (combined.includes('tatra') || combined.includes('zakopane')) {
    tags.push(
      { tag: 'tatra-mountains', confidence: 0.93, category: 'geographic' },
      { tag: 'hiking', confidence: 0.87, category: 'activity' },
      { tag: 'skiing', confidence: 0.82, category: 'activity' },
      { tag: 'mountain-resort', confidence: 0.79, category: 'classification' }
    );
    categories.push('mountains', 'outdoor', 'nature');
  }
  
  if (combined.includes('nature') || combined.includes('natuur') || combined.includes('park')) {
    tags.push(
      { tag: 'nature-park', confidence: 0.88, category: 'classification' },
      { tag: 'wildlife', confidence: 0.84, category: 'nature' },
      { tag: 'hiking-trails', confidence: 0.81, category: 'activity' },
      { tag: 'conservation', confidence: 0.75, category: 'concept' }
    );
    categories.push('nature', 'outdoor', 'conservation');
  }
  
  // Architectuur detectie
  if (combined.includes('castle') || combined.includes('kasteel') || combined.includes('palace')) {
    tags.push(
      { tag: 'castle', confidence: 0.91, category: 'architecture' },
      { tag: 'medieval-architecture', confidence: 0.86, category: 'style' },
      { tag: 'fortification', confidence: 0.82, category: 'classification' },
      { tag: 'royal-residence', confidence: 0.78, category: 'function' }
    );
    categories.push('architecture', 'history', 'attractions');
  }
  
  if (combined.includes('church') || combined.includes('kerk') || combined.includes('cathedral')) {
    tags.push(
      { tag: 'church', confidence: 0.89, category: 'architecture' },
      { tag: 'religious-architecture', confidence: 0.85, category: 'style' },
      { tag: 'gothic', confidence: 0.79, category: 'style' },
      { tag: 'baroque', confidence: 0.72, category: 'style' }
    );
    categories.push('architecture', 'religion', 'culture');
  }
  
  // Food & Restaurant detectie
  if (combined.includes('restaurant') || combined.includes('food') || combined.includes('eten')) {
    tags.push(
      { tag: 'polish-cuisine', confidence: 0.87, category: 'food' },
      { tag: 'traditional-food', confidence: 0.84, category: 'characteristic' },
      { tag: 'local-specialties', confidence: 0.81, category: 'food' },
      { tag: 'dining', confidence: 0.79, category: 'activity' }
    );
    categories.push('food', 'restaurants', 'culture');
  }
  
  // Seizoen detectie (gebaseerd op bestandsnaam)
  if (combined.includes('winter') || combined.includes('snow')) {
    tags.push(
      { tag: 'winter', confidence: 0.85, category: 'season' },
      { tag: 'snow', confidence: 0.82, category: 'weather' },
      { tag: 'winter-sports', confidence: 0.78, category: 'activity' }
    );
  }
  
  if (combined.includes('summer') || combined.includes('festival')) {
    tags.push(
      { tag: 'summer', confidence: 0.83, category: 'season' },
      { tag: 'festivals', confidence: 0.80, category: 'activity' },
      { tag: 'cultural-events', confidence: 0.77, category: 'activity' }
    );
  }
  
  // Berekenen overall confidence
  const avgConfidence = tags.reduce((sum, tag) => sum + tag.confidence, 0) / tags.length;
  
  return {
    tags,
    categories: Array.from(new Set(categories)), // Remove duplicates
    confidence: Math.round(avgConfidence * 100) / 100,
    isAppropriate: true // Assumptie dat onze travel content appropriate is
  };
}