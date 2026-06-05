/**
 * @fileoverview index.js — Route aggregator for InkWire API.
 * Mounts all route modules under /api/v1/ prefix.
 */

import { Router } from 'express';
import { articleRouter } from './article.routes.js';
import { adminRouter } from './admin.routes.js';
import { authRouter } from './auth.routes.js';
import { newsletterRouter } from './newsletter.routes.js';
import { Article } from '../models/Article.js';

export const router = Router();

router.use('/articles', articleRouter);
router.use('/admin', adminRouter);
router.use('/auth', authRouter);
router.use('/newsletter', newsletterRouter);

/** Sitemap.xml — auto-generated with all published article URLs */
router.get('/sitemap.xml', async (req, res) => {
  try {
    const articles = await Article.find({ status: 'published' })
      .select('slug publishedAt updatedAt')
      .lean();

    const frontendUrl = process.env.FRONTEND_URL || 'https://inkwire.netlify.app';

    const urls = [
      `<url><loc>${frontendUrl}/</loc><changefreq>hourly</changefreq><priority>1.0</priority></url>`,
      `<url><loc>${frontendUrl}/about</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>`,
      `<url><loc>${frontendUrl}/privacy-policy</loc><changefreq>monthly</changefreq><priority>0.3</priority></url>`,
      ...articles.map((a) => `<url><loc>${frontendUrl}/article/${a.slug}</loc><lastmod>${new Date(a.publishedAt || a.updatedAt).toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).send('Error generating sitemap');
  }
});
