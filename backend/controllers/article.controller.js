/**
 * @fileoverview article.controller.js — Public article CRUD controller for InkWire.
 * SECURITY: Never exposes raw err.message to client — all 500s use generic message.
 *           Search query is capped at 100 chars to prevent ReDoS via text index.
 */

import { Article } from '../models/Article.js';
import { logger } from '../utils/logger.js';
import { ARTICLE } from '../config/constants.js';

/** Generic safe message returned on all 500 errors — never leaks DB details */
const INTERNAL_ERROR = 'Internal server error';

/**
 * Get all published articles with pagination
 */
export const getArticles = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(ARTICLE.MAX_PAGE_SIZE, parseInt(req.query.limit, 10) || ARTICLE.PAGE_SIZE);
    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      Article.find({ status: 'published' })
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-body')
        .lean(),
      Article.countDocuments({ status: 'published' }),
    ]);

    res.json({
      success: true,
      data: articles,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    logger.error(`[CONTROLLER] getArticles: ${err.message}`);
    res.status(500).json({ success: false, message: INTERNAL_ERROR });
  }
};

/**
 * Get single article by slug and increment view count
 */
export const getArticleBySlug = async (req, res) => {
  try {
    const article = await Article.findOneAndUpdate(
      { slug: req.params.slug, status: 'published' },
      { $inc: { views: 1 } },
      { new: true }
    ).lean();

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    return res.json({ success: true, data: article });
  } catch (err) {
    logger.error(`[CONTROLLER] getArticleBySlug: ${err.message}`);
    return res.status(500).json({ success: false, message: INTERNAL_ERROR });
  }
};

/**
 * Get published articles filtered by topic
 */
export const getArticlesByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(ARTICLE.MAX_PAGE_SIZE, parseInt(req.query.limit, 10) || ARTICLE.PAGE_SIZE);

    const [articles, total] = await Promise.all([
      Article.find({ status: 'published', topic: topicId })
        .sort({ publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-body')
        .lean(),
      Article.countDocuments({ status: 'published', topic: topicId }),
    ]);

    res.json({ success: true, data: articles, pagination: { page, limit, total } });
  } catch (err) {
    logger.error(`[CONTROLLER] getArticlesByTopic: ${err.message}`);
    res.status(500).json({ success: false, message: INTERNAL_ERROR });
  }
};

/**
 * Full-text search across published articles.
 * SECURITY: Query capped at 100 chars to prevent ReDoS against MongoDB text index.
 */
export const searchArticles = async (req, res) => {
  try {
    const rawQuery = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (!rawQuery || rawQuery.length < 2) {
      return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters' });
    }

    // Cap length — prevents excessively long queries from hitting the text index
    const query = rawQuery.slice(0, 100);

    const articles = await Article.find(
      { $text: { $search: query }, status: 'published' },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(20)
      .select('-body')
      .lean();

    return res.json({ success: true, data: articles, count: articles.length });
  } catch (err) {
    logger.error(`[CONTROLLER] searchArticles: ${err.message}`);
    return res.status(500).json({ success: false, message: INTERNAL_ERROR });
  }
};

/**
 * Get featured article (pinned or most recent published)
 */
export const getFeaturedArticle = async (req, res) => {
  try {
    // Try pinned first, fall back to most recent
    const article = await Article.findOne({ status: 'published', isFeatured: true })
      .select('-body').lean()
      || await Article.findOne({ status: 'published' })
        .sort({ publishedAt: -1 }).select('-body').lean();

    if (!article) {
      return res.status(404).json({ success: false, message: 'No published articles found' });
    }

    return res.json({ success: true, data: article });
  } catch (err) {
    logger.error(`[CONTROLLER] getFeaturedArticle: ${err.message}`);
    return res.status(500).json({ success: false, message: INTERNAL_ERROR });
  }
};

/**
 * Get articles by date (archive)
 */
export const getArticlesByDate = async (req, res) => {
  try {
    const dateStr = req.query.date;
    if (!dateStr || typeof dateStr !== 'string') {
      return res.status(400).json({ success: false, message: 'date query param required (YYYY-MM-DD) as a string' });
    }

    const start = new Date(dateStr);
    if (isNaN(start.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const end = new Date(dateStr);
    end.setDate(end.getDate() + 1);

    const articles = await Article.find({
      status: 'published',
      publishedAt: { $gte: start, $lt: end },
    }).sort({ publishedAt: -1 }).select('-body').lean();

    return res.json({ success: true, data: articles });
  } catch (err) {
    logger.error(`[CONTROLLER] getArticlesByDate: ${err.message}`);
    return res.status(500).json({ success: false, message: INTERNAL_ERROR });
  }
};

/**
 * Mark article as read (scrolled 80%+ → increment readCount)
 */
export const markArticleRead = async (req, res) => {
  try {
    await Article.findOneAndUpdate(
      { slug: req.params.slug, status: 'published' },
      { $inc: { readCount: 1 } }
    );
    res.json({ success: true });
  } catch (err) {
    logger.error(`[CONTROLLER] markArticleRead: ${err.message}`);
    res.status(500).json({ success: false, message: INTERNAL_ERROR });
  }
};
