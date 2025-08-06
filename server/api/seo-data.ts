import { Request, Response } from 'express';
import { db } from '../db';
import { pages, guides, siteSettings } from '@shared/schema';
import { eq } from 'drizzle-orm';

// API endpoint to get SEO data for a specific route
export async function getSEOData(req: Request, res: Response) {
  try {
    const { path } = req.query;
    
    if (!path || typeof path !== 'string') {
      return res.status(400).json({ error: 'Path parameter is required' });
    }

    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    
    // Get site settings
    const [settings] = await db.select().from(siteSettings).limit(1);
    
    let seoData: any = {
      siteName: settings?.siteName || 'Ontdek Polen',
      defaultImage: settings?.socialMediaImage || 'https://o2-phi.vercel.app/images/og-poland-travel.jpg'
    };

    if (cleanPath === '' || cleanPath === '/') {
      // Homepage SEO
      seoData = {
        ...seoData,
        title: settings?.siteName || 'Ontdek Polen - Jouw Complete Gids voor Polen Reizen',
        description: settings?.siteDescription || 'Ontdek de mooiste bestemmingen in Polen. Van historische steden tot natuurparken. Complete reisgidsen voor jouw perfecte Polen reis.',
        image: settings?.socialMediaImage || 'https://o2-phi.vercel.app/images/og-poland-travel.jpg',
        url: 'https://o2-phi.vercel.app/',
        type: 'website',
        keywords: 'Polen reizen, Krakau, Gdansk, Tatra Mountains, Polen vakantie'
      };
    } else {
      // Try to find page by slug
      const [page] = await db.select().from(pages).where(eq(pages.slug, cleanPath));
      
      if (page) {
        seoData = {
          ...seoData,
          title: `${page.title} - Ontdek Polen`,
          description: page.description || `Ontdek ${page.title} in Polen. Complete reisgids met tips en informatie voor jouw bezoek aan deze prachtige bestemming.`,
          image: page.image || seoData.defaultImage,
          url: `https://o2-phi.vercel.app/${cleanPath}`,
          type: page.template === 'destination' ? 'website' : 'article',
          keywords: `${page.title}, Polen, reizen, bestemming`,
          publishedTime: page.createdAt,
          modifiedTime: page.updatedAt,
          content: page.content,
          location: page.title
        };
      } else {
        // Try guides
        const [guide] = await db.select().from(guides).where(eq(guides.slug, cleanPath));
        
        if (guide) {
          seoData = {
            ...seoData,
            title: `${guide.title} - Ontdek Polen`,
            description: guide.description || `${guide.title} - Complete gids voor jouw Polen reis met praktische tips en insider informatie.`,
            image: guide.image || seoData.defaultImage,
            url: `https://o2-phi.vercel.app/${cleanPath}`,
            type: 'article',
            keywords: `${guide.title}, Polen reisgids, Polen tips, reizen Polen`,
            publishedTime: guide.createdAt,
            modifiedTime: guide.updatedAt,
            content: guide.description
          };
        } else {
          // Fallback for unknown routes
          seoData = {
            ...seoData,
            title: `${cleanPath} - Ontdek Polen`,
            description: `Ontdek ${cleanPath} in Polen. Jouw complete gids voor reizen naar deze bestemming in Polen.`,
            image: seoData.defaultImage,
            url: `https://o2-phi.vercel.app/${cleanPath}`,
            type: 'website',
            keywords: `${cleanPath}, Polen, reizen, bestemming`
          };
        }
      }
    }

    res.json(seoData);
  } catch (error) {
    console.error('Error fetching SEO data:', error);
    res.status(500).json({ error: 'Failed to fetch SEO data' });
  }
}