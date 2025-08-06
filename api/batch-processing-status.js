// Direct serverless function for AI batch processing status
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

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
    // Simple query to count images
    const destQuery = `
      SELECT COUNT(*) as total,
             COUNT(CASE WHEN header_image LIKE '%cloudinary%' THEN 1 END) as cloudinary
      FROM bestemmingen 
      WHERE is_deleted = false
    `;
    
    const destResult = await pool.query(destQuery);
    const destTotal = parseInt(destResult.rows[0].total) || 0;
    const destCloudinary = parseInt(destResult.rows[0].cloudinary) || 0;

    // Return simple status
    return res.status(200).json({
      total: destTotal,
      cloudinary: destCloudinary,
      local: destTotal - destCloudinary,
      destinations: {
        total: destTotal,
        processed: destCloudinary
      },
      guides: {
        total: 0,
        processed: 0
      },
      status: 'ready'
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Database connection failed',
      message: error.message 
    });
  }
};