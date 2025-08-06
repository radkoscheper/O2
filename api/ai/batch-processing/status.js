// Individual serverless function for AI batch processing status
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function getAIBatchStatus() {
  try {
    // Query destinations with Cloudinary URLs
    const destQuery = `
      SELECT COUNT(*) as total,
             COUNT(CASE WHEN header_image LIKE '%cloudinary%' THEN 1 END) as cloudinary
      FROM bestemmingen 
      WHERE is_deleted = false
    `;
    
    const destResult = await pool.query(destQuery);
    const destTotal = parseInt(destResult.rows[0].total) || 0;
    const destCloudinary = parseInt(destResult.rows[0].cloudinary) || 0;

    // Query guides with Cloudinary URLs
    const guideQuery = `
      SELECT COUNT(*) as total,
             COUNT(CASE WHEN header_image LIKE '%cloudinary%' THEN 1 END) as cloudinary
      FROM guides 
      WHERE is_deleted = false
    `;
    
    const guideResult = await pool.query(guideQuery);
    const guideTotal = parseInt(guideResult.rows[0].total) || 0;
    const guideCloudinary = parseInt(guideResult.rows[0].cloudinary) || 0;

    return {
      total: destTotal + guideTotal,
      cloudinary: destCloudinary + guideCloudinary,
      local: (destTotal + guideTotal) - (destCloudinary + guideCloudinary),
      destinations: {
        total: destTotal,
        processed: destCloudinary
      },
      guides: {
        total: guideTotal,
        processed: guideCloudinary
      }
    };
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const status = await getAIBatchStatus();
    return res.status(200).json(status);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};