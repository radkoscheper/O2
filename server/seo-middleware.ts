import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { pages, guides, siteSettings } from '@shared/schema';
import { eq } from 'drizzle-orm';

// SEO Middleware for dynamic meta tags based on route
export async function seoMiddleware(req: Request, res: Response, next: NextFunction) {
  const userAgent = req.get('User-Agent') || '';
  
  // Check if request is from a crawler/bot
  const isCrawler = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|twitterbot|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|developers\.google\.com/i.test(userAgent);
  
  // Only apply SEO middleware for crawlers or specific routes
  if (!isCrawler && !req.path.includes('seo-preview')) {
    return next();
  }

  try {
    const path = req.path.slice(1); // Remove leading slash
    let seoData: any = null;

    // Get site settings
    const [settings] = await db.select().from(siteSettings).limit(1);

    if (path === '' || path === '/') {
      // Homepage SEO
      seoData = {
        title: settings?.siteName || 'Ontdek Polen - Jouw Complete Gids voor Polen Reizen',
        description: settings?.siteDescription || 'Ontdek de mooiste bestemmingen in Polen. Van historische steden tot natuurparken. Complete reisgidsen voor jouw perfecte Polen reis.',
        image: settings?.socialMediaImage || 'https://o2-phi.vercel.app/images/og-poland-travel.jpg',
        url: 'https://o2-phi.vercel.app/',
        type: 'website'
      };
    } else {
      // Try to find page by slug
      const [page] = await db.select().from(pages).where(eq(pages.slug, path));
      
      if (page) {
        seoData = {
          title: `${page.title} - Ontdek Polen`,
          description: page.description || `Ontdek ${page.title} in Polen. Complete reisgids met tips en informatie.`,
          image: page.image || settings?.socialMediaImage || 'https://o2-phi.vercel.app/images/og-default.jpg',
          url: `https://o2-phi.vercel.app/${path}`,
          type: page.template === 'destination' ? 'website' : 'article',
          publishedTime: page.createdAt,
          modifiedTime: page.updatedAt
        };
      } else {
        // Try guides
        const [guide] = await db.select().from(guides).where(eq(guides.slug, path));
        
        if (guide) {
          seoData = {
            title: `${guide.title} - Ontdek Polen`,
            description: guide.description || `${guide.title} - Complete gids voor jouw Polen reis.`,
            image: guide.image || settings?.socialMediaImage || 'https://o2-phi.vercel.app/images/og-default.jpg',
            url: `https://o2-phi.vercel.app/${path}`,
            type: 'article',
            publishedTime: guide.createdAt,
            modifiedTime: guide.updatedAt
          };
        }
      }
    }

    if (seoData) {
      // Store SEO data in request for potential use
      req.seoData = seoData;
      
      // For crawler requests, we could potentially serve pre-rendered HTML here
      // For now, just continue with the normal flow but log the SEO data
      console.log('🔍 SEO middleware activated for:', path, 'User-Agent:', userAgent.substring(0, 50));
    }

    next();
  } catch (error) {
    console.error('SEO middleware error:', error);
    next();
  }
}

// Extend Request interface
declare global {
  namespace Express {
    interface Request {
      seoData?: {
        title: string;
        description: string;
        image: string;
        url: string;
        type: string;
        publishedTime?: string;
        modifiedTime?: string;
      };
    }
  }
}