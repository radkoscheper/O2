import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AIEnhancedImage from '@/components/ui/ai-enhanced-image';

const TEST_IMAGES = [
  {
    name: 'Cloudinary Hero Image (Working)',
    url: 'https://res.cloudinary.com/df3i1avwb/image/upload/v1753801852/ontdek-polen/backgrounds/header.jpg',
    description: 'Main hero image that should work with AI features'
  },
  {
    name: 'Local Image (Fallback)',
    url: '/images/placeholder.jpg',
    description: 'Local placeholder that should load normally'
  }
];

export default function AITestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-playfair font-bold text-navy-dark mb-4">
            AI Features Test Page
          </h1>
          <p className="text-lg text-gray-600">
            Test page om AI Enhanced Images te debuggen
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {TEST_IMAGES.map((image, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{image.name}</CardTitle>
                <p className="text-sm text-gray-600">{image.description}</p>
              </CardHeader>
              <CardContent>
                <div className="aspect-[4/3] relative">
                  <AIEnhancedImage
                    src={image.url}
                    alt={image.name}
                    aiPreset="auto"
                    upscale={true}
                    aspectRatio="4:3"
                    autoTag={true}
                    className="w-full h-full object-cover rounded-lg border"
                    priority={true}
                    lazy={false}
                    onAIProcessed={(tags, categories) => {
                      console.log(`🏷️ AI Test - ${image.name} tags:`, tags);
                    }}
                  />
                </div>
                <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
                  <strong>URL:</strong> {image.url}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Console Logs Verwacht:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm space-y-1">
              <div>🤖 AI Upscaling activated for: [image name]</div>
              <div>🎨 Generative Fill applied for aspect ratio: 4:3</div>
              <div>🏷️ Auto-tagging completed: [array of tags]</div>
              <div>✅ AI-enhanced image loaded: [image name]</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}