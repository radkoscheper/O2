// Simplified AI batch status endpoint for reliable Vercel deployment
const { Pool } = require('pg');

// Global connection pool (critical for serverless)
let pool;

if (!pool) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1, // Critical: 1 connection per serverless instance
    idle_timeout: 0,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
}

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let client;
  
  try {
    client = await pool.connect();
    
    // Simple, reliable query
    const destQuery = `
      SELECT COUNT(*) as total,
             COUNT(CASE WHEN header_image LIKE 'https://res.cloudinary.com%' THEN 1 END) as cloudinary,
             COUNT(CASE WHEN header_image NOT LIKE 'https://res.cloudinary.com%' AND header_image IS NOT NULL THEN 1 END) as local
      FROM bestemmingen 
      WHERE is_deleted = false OR is_deleted IS NULL
    `;
    
    const result = await client.query(destQuery);
    const row = result.rows[0];
    
    const response = {
      total: parseInt(row.total) || 0,
      cloudinary: parseInt(row.cloudinary) || 0,
      local: parseInt(row.local) || 0,
      destinations: {
        total: parseInt(row.total) || 0,
        processed: parseInt(row.cloudinary) || 0
      },
      guides: {
        total: 0,
        processed: 0
      },
      status: 'ready',
      timestamp: new Date().toISOString()
    };
    
    res.status(200).json(response);
    
  } catch (error) {
    console.error('AI batch status error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};