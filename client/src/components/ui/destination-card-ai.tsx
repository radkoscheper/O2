import React from 'react';
import { Card, CardContent } from './card';
import AIEnhancedImage from './ai-enhanced-image';
import { Button } from './button';
import { MapPin, Users, Star } from 'lucide-react';
import { Link } from 'wouter';

interface DestinationCardAIProps {
  destination: {
    id: number;
    name: string;
    slug: string;
    shortDescription?: string;
    headerImage?: string;
    averageRating?: number;
    totalReviews?: number;
    estimatedVisitors?: number;
  };
  aspectRatio?: '16:9' | '4:3' | '1:1';
  upscale?: boolean;
  autoTag?: boolean;
  onTagsGenerated?: (tags: string[], categories: string[]) => void;
}

export function DestinationCardAI({
  destination,
  aspectRatio = '4:3',
  upscale = true,
  autoTag = true,
  onTagsGenerated
}: DestinationCardAIProps) {
  const handleAIProcessed = (tags: string[], categories: string[]) => {
    console.log(`🏷️ AI tags for ${destination.name}:`, tags);
    if (onTagsGenerated) {
      onTagsGenerated(tags, categories);
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative overflow-hidden">
        <AIEnhancedImage
          src={destination.headerImage || '/images/placeholder-destination.jpg'}
          alt={`${destination.name} - Ontdek deze prachtige bestemming in Polen`}
          aiPreset="auto" // Automatically detect content type
          upscale={upscale}
          aspectRatio={aspectRatio}
          autoTag={autoTag}
          onAIProcessed={handleAIProcessed}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
          priority={false}
          lazy={true}
        />
        
        {/* AI Enhancement Indicator */}
        <div className="absolute top-2 right-2">
          <div className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            AI Enhanced
          </div>
        </div>
        
        {/* Rating Overlay */}
        {destination.averageRating && (
          <div className="absolute top-2 left-2">
            <div className="bg-white bg-opacity-90 text-gray-800 text-sm px-2 py-1 rounded flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {destination.averageRating.toFixed(1)}
            </div>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-playfair font-bold text-lg text-navy-dark group-hover:text-golden transition-colors">
              {destination.name}
            </h3>
            {destination.shortDescription && (
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                {destination.shortDescription}
              </p>
            )}
          </div>
          
          {/* Destination Stats */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {destination.estimatedVisitors && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {destination.estimatedVisitors.toLocaleString()} bezoekers/jaar
              </div>
            )}
            {destination.totalReviews && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                {destination.totalReviews} reviews
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center text-gray-500 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              Polen
            </div>
            
            <Link href={`/bestemming/${destination.slug}`}>
              <Button 
                size="sm" 
                className="bg-golden hover:bg-golden/90 text-white group-hover:shadow-md transition-all"
              >
                Ontdek meer
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DestinationCardAI;