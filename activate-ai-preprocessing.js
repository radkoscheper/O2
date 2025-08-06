#!/usr/bin/env node
/**
 * Production AI Pre-Processing Activation Script
 * Run this after deploying to activate AI-enhanced images
 */

const https = require('https');

async function activateAIPreprocessing() {
  console.log('🚀 Starting AI Pre-Processing Activation...\n');
  
  const baseUrl = 'https://o2-phi.vercel.app';
  
  try {
    console.log('📊 Checking current AI processing status...');
    
    // Check status
    const statusResponse = await fetch(`${baseUrl}/api/images/ai-status`);
    if (statusResponse.ok) {
      const status = await statusResponse.json();
      console.log('Current status:', status);
      
      if (status.summary.totalProcessed === 0) {
        console.log('\n🔄 Starting batch processing...');
        
        // Start batch processing
        const batchResponse = await fetch(`${baseUrl}/api/destinations/batch-process-ai`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (batchResponse.ok) {
          const result = await batchResponse.json();
          console.log('✅ Batch processing completed:', result.message);
        } else {
          console.error('❌ Batch processing failed:', batchResponse.status);
        }
      } else {
        console.log('✅ AI preprocessing already active!');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Manual activation steps:');
    console.log('1. Visit: https://o2-phi.vercel.app/admin');
    console.log('2. Login as admin');
    console.log('3. Go to AI Pre-Processing section');
    console.log('4. Click "Start Batch Processing"');
  }
}

// Check if running directly
if (require.main === module) {
  activateAIPreprocessing();
}

module.exports = { activateAIPreprocessing };
