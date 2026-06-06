import axios from 'axios';
import { Article } from '../models/Article.js';
import { Newsletter } from '../models/Newsletter.js';
import { generateDailyArticles, publishSlot } from '../services/SchedulerService.js';
import { sendTestEmail } from '../services/EmailService.js';
import { sanitizeArticleHTML } from '../utils/sanitize.js';
import { countWords, calculateReadTime } from '../utils/readTime.js';
import { logger } from '../utils/logger.js';
import { ARTICLE } from '../config/constants.js';
import { writeCustomArticle, writeArticleFromWiki } from '../services/AIService.js';
import { fetchImage } from '../services/ImageService.js';
import { createSlug } from '../utils/slugify.js';
import { fetchAllHeadlines } from '../services/NewsService.js';
import { selectTopStories } from '../services/RankingService.js';

const VALID_SLOTS = ['morning', 'afternoon', 'evening'];

/** Get all draft articles awaiting review */
export const getQueue = async (req, res) => {
  try {
    const drafts = await Article.find({ status: 'draft' }).sort({ generatedAt: -1 }).lean();
    res.json({ success: true, data: drafts, count: drafts.length });
  } catch (err) {
    logger.error(`[ADMIN] getQueue: ${err.message}`);
    res.status(500).json({ success: false, message: 'Failed to load queue' });
  }
};

/** Get all published articles with pagination */
export const getPublished = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = parseInt(req.query.limit, 10) || ARTICLE.PAGE_SIZE;

    const [articles, total] = await Promise.all([
      Article.find({ status: 'published' })
        .sort({ publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Article.countDocuments({ status: 'published' }),
    ]);

    res.json({ success: true, data: articles, pagination: { page, limit, total } });
  } catch (err) {
    logger.error(`[ADMIN] getPublished: ${err.message}`);
    res.status(500).json({ success: false, message: 'Failed to load articles' });
  }
};

/** Get admin dashboard stats */
export const getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      todayApproved, todayRejected, todayPending,
      totalViews, weekPublished, subscriberCount,
      topArticle, totalPublished, totalDrafts,
    ] = await Promise.all([
      Article.countDocuments({ status: { $in: ['approved', 'published'] }, updatedAt: { $gte: today } }),
      Article.countDocuments({ status: 'rejected', updatedAt: { $gte: today } }),
      Article.countDocuments({ status: 'draft' }),
      Article.aggregate([{ $match: { status: 'published', publishedAt: { $gte: today } } }, { $group: { _id: null, total: { $sum: '$views' } } }]),
      Article.countDocuments({ status: 'published', publishedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
      Newsletter.countDocuments({ active: true }),
      Article.findOne({ status: 'published' }).sort({ views: -1 }).select('headline views slug').lean(),
      Article.countDocuments({ status: 'published' }),
      Article.countDocuments({ status: 'draft' }),
    ]);

    res.json({
      success: true,
      data: {
        today: {
          approved: todayApproved,
          rejected: todayRejected,
          pending: todayPending,
          views: totalViews[0]?.total || 0,
        },
        week: { published: weekPublished },
        total: { published: totalPublished, drafts: totalDrafts },
        subscribers: subscriberCount,
        topArticle: topArticle || null,
        system: {
          emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
          dbConnected: true,
          schedulerRunning: true,
        },
      },
    });
  } catch (err) {
    logger.error(`[ADMIN] getStats: ${err.message}`);
    res.status(500).json({ success: false, message: 'Failed to load stats' });
  }
};

/** Approve a draft article */
export const approveArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    logger.info(`[ADMIN] Approved: "${article.headline}"`);
    return res.json({ success: true, data: article });
  } catch (err) {
    logger.error(`[ADMIN] approveArticle: ${err.message}`);
    return res.status(500).json({ success: false, message: 'Failed to approve' });
  }
};

/** Reject a draft article */
export const rejectArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    logger.info(`[ADMIN] Rejected: "${article.headline}"`);
    return res.json({ success: true, data: article });
  } catch (err) {
    logger.error(`[ADMIN] rejectArticle: ${err.message}`);
    return res.status(500).json({ success: false, message: 'Failed to reject' });
  }
};

/** Bulk approve multiple articles */
export const bulkApprove = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'ids array required' });
    }
    const result = await Article.updateMany(
      { _id: { $in: ids }, status: 'draft' },
      { status: 'approved' }
    );
    logger.info(`[ADMIN] Bulk approved: ${result.modifiedCount} articles`);
    return res.json({ success: true, message: `${result.modifiedCount} articles approved`, count: result.modifiedCount });
  } catch (err) {
    logger.error(`[ADMIN] bulkApprove: ${err.message}`);
    return res.status(500).json({ success: false, message: 'Bulk approve failed' });
  }
};

/** Bulk reject multiple articles */
export const bulkReject = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'ids array required' });
    }
    const result = await Article.updateMany(
      { _id: { $in: ids }, status: 'draft' },
      { status: 'rejected' }
    );
    logger.info(`[ADMIN] Bulk rejected: ${result.modifiedCount} articles`);
    return res.json({ success: true, message: `${result.modifiedCount} articles rejected`, count: result.modifiedCount });
  } catch (err) {
    logger.error(`[ADMIN] bulkReject: ${err.message}`);
    return res.status(500).json({ success: false, message: 'Bulk reject failed' });
  }
};

/** Override the publish slot for an article */
export const updateSlot = async (req, res) => {
  try {
    const { slot } = req.body;
    if (!VALID_SLOTS.includes(slot)) {
      return res.status(400).json({ success: false, message: 'Invalid slot. Use: morning, afternoon, evening' });
    }
    const article = await Article.findByIdAndUpdate(req.params.id, { scheduledFor: slot }, { new: true });
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    logger.info(`[ADMIN] Slot changed to "${slot}": "${article.headline}"`);
    return res.json({ success: true, data: article });
  } catch (err) {
    logger.error(`[ADMIN] updateSlot: ${err.message}`);
    return res.status(500).json({ success: false, message: 'Failed to update slot' });
  }
};

/** Pin or unpin an article as the featured hero */
export const togglePin = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });

    /** Unpin all others first */
    if (!article.isFeatured) {
      await Article.updateMany({ isFeatured: true }, { isFeatured: false });
    }

    article.isFeatured = !article.isFeatured;
    await article.save();

    logger.info(`[ADMIN] ${article.isFeatured ? 'Pinned' : 'Unpinned'}: "${article.headline}"`);
    return res.json({ success: true, data: article, isFeatured: article.isFeatured });
  } catch (err) {
    logger.error(`[ADMIN] togglePin: ${err.message}`);
    return res.status(500).json({ success: false, message: 'Failed to toggle pin' });
  }
};

/** Edit article content — strict DTO allow-list (mass assignment protection) */
export const editArticle = async (req, res) => {
  try {
    /**
     * SECURITY: Explicit allow-list — only these 5 fields can be updated.
     * Any other properties in req.body (e.g. status, isFeatured, views) are silently ignored.
     * This prevents mass assignment attacks where an attacker crafts payloads with
     * hidden schema fields like { "isAdmin": true } or { "views": 9999999 }.
     */
    const { headline, subheadline, body, tags, approve } = req.body;

    // Type-check each allowed field before using it
    if (!headline || typeof headline !== 'string') {
      return res.status(400).json({ success: false, message: 'Valid headline required' });
    }
    if (!body || typeof body !== 'string') {
      return res.status(400).json({ success: false, message: 'Valid body required' });
    }

    const sanitizedBody = sanitizeArticleHTML(body);
    const wordCount = countWords(sanitizedBody);

    // Build update object from only the explicitly allowed fields
    const update = {
      headline:      headline.trim().slice(0, 500),
      subheadline:   typeof subheadline === 'string' ? subheadline.trim().slice(0, 500) : '',
      body:          sanitizedBody,
      tags:          Array.isArray(tags) ? tags.slice(0, 20).map(String) : [],
      wordCount,
      readTime:      calculateReadTime(wordCount),
      editedByAdmin: true,
      // Only allow status change to 'approved', never to arbitrary values
      ...(approve === true && { status: 'approved' }),
    };

    const article = await Article.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });

    logger.info(`[ADMIN] Edited: "${article.headline}"${approve ? ' (approved)' : ''}`);
    return res.json({ success: true, data: article });
  } catch (err) {
    logger.error(`[ADMIN] editArticle: ${err.message}`);
    return res.status(500).json({ success: false, message: 'Failed to edit' });
  }
};

/** Unpublish a published article — moves back to draft */
export const unpublishArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { status: 'draft', publishedAt: null, isFeatured: false },
      { new: true }
    );
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    logger.info(`[ADMIN] Unpublished: "${article.headline}"`);
    return res.json({ success: true, data: article });
  } catch (err) {
    logger.error(`[ADMIN] unpublishArticle: ${err.message}`);
    return res.status(500).json({ success: false, message: 'Failed to unpublish' });
  }
};

/** Permanently delete an article */
export const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    logger.info(`[ADMIN] Deleted: "${article.headline}"`);
    return res.json({ success: true, message: 'Article deleted' });
  } catch (err) {
    logger.error(`[ADMIN] deleteArticle: ${err.message}`);
    return res.status(500).json({ success: false, message: 'Failed to delete' });
  }
};

/** Manually trigger article generation — count from body, no daily cap */
export const triggerGeneration = async (req, res) => {
  try {
    const { count = 6 } = req.body || {};
    const safeCount = Math.min(Math.max(1, parseInt(count, 10) || 6), 20);
    logger.info(`[ADMIN] Manual generation triggered: ${safeCount} articles`);
    res.json({ success: true, message: `Generating ${safeCount} articles — they will appear in your queue in ~2 minutes per article` });
    generateDailyArticles(safeCount, true).catch((err) => logger.error(`[ADMIN] Manual generation error: ${err.message}`));
  } catch (err) {
    logger.error(`[ADMIN] triggerGeneration: ${err.message}`);
    res.status(500).json({ success: false, message: 'Failed to trigger generation' });
  }
};

/** Send test email to verify email config */
export const testEmail = async (req, res) => {
  try {
    await sendTestEmail();
    res.json({ success: true, message: `Test email sent to ${process.env.EMAIL_TO || process.env.ADMIN_EMAIL}` });
  } catch (err) {
    logger.error(`[ADMIN] testEmail: ${err.message}`);
    res.status(500).json({ success: false, message: `Email failed: ${err.message}` });
  }
};

/** Manually trigger publishing for a specific slot */
export const triggerPublish = async (req, res) => {
  try {
    const { slot } = req.body;
    if (!VALID_SLOTS.includes(slot)) {
      return res.status(400).json({ success: false, message: 'Invalid slot' });
    }
    res.json({ success: true, message: `Publishing ${slot} slot now...` });
    publishSlot(slot).catch((err) => logger.error(`[ADMIN] Manual publish error: ${err.message}`));
  } catch (err) {
    logger.error(`[ADMIN] triggerPublish: ${err.message}`);
    return res.status(500).json({ success: false, message: 'Failed to trigger publish' });
  }
};

/** Get newsletter subscribers */
export const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ subscribedAt: -1 }).lean();
    res.json({ success: true, data: subscribers, count: subscribers.length });
  } catch (err) {
    logger.error(`[ADMIN] getSubscribers: ${err.message}`);
    res.status(500).json({ success: false, message: 'Failed to load subscribers' });
  }
};

/** Generate a custom article based on AI prompt and input parameters */
export const generateCustomArticle = async (req, res) => {
  try {
    const { prompt, topic = 'india', imageUrl, imageCredit, slot } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ success: false, message: 'Prompt/Topic description is required' });
    }

    logger.info(`[ADMIN] Custom article generation requested for topic: ${topic}`);

    // Generate the article contents using the AI service
    const articleData = await writeCustomArticle(topic, prompt.trim());

    // Resolve the image url and credit: use user-provided or fallback to Unsplash
    let finalImageUrl = imageUrl;
    let finalImageCredit = imageCredit;

    if (!finalImageUrl) {
      const imageData = await fetchImage(topic, articleData.imageSearchQuery || articleData.headline);
      finalImageUrl = imageData.url;
      finalImageCredit = imageData.credit;
    } else if (!finalImageCredit) {
      finalImageCredit = 'Photo via Editor';
    }

    const sanitizedBody = sanitizeArticleHTML(articleData.body);
    const words = countWords(sanitizedBody);
    const readTime = calculateReadTime(words);
    const slug = createSlug(articleData.headline);

    const generatedAt = new Date();
    const reviewDeadline = new Date(generatedAt.getTime() + 30 * 60 * 1000);

    const article = await Article.create({
      headline: articleData.headline,
      subheadline: articleData.subheadline,
      slug,
      body: sanitizedBody,
      summary: articleData.summary,
      tags: articleData.tags,
      topic: articleData.topic,
      wordCount: words,
      readTime,
      imageUrl: finalImageUrl,
      imageCredit: finalImageCredit,
      sources: articleData.sources,
      scheduledFor: slot || 'morning', // default to morning slot
      status: 'draft',
      generatedAt,
      reviewDeadline,
    });

    logger.info(`[ADMIN] Custom article draft saved: "${article.headline}"`);
    return res.json({ success: true, data: article });
  } catch (err) {
    logger.error(`[ADMIN] generateCustomArticle: ${err.message}`);
    return res.status(500).json({ success: false, message: `Failed to generate custom article: ${err.message}` });
  }
};

/** Search Wikipedia articles via opensearch */
export const wikiSearch = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    logger.info(`[ADMIN] Wikipedia search requested for: "${query}"`);
    const response = await axios.get('https://en.wikipedia.org/w/api.php', {
      params: {
        action: 'opensearch',
        search: query.trim(),
        limit: 10,
        format: 'json',
        origin: '*'
      },
      headers: {
        'User-Agent': 'InkWire/1.0 (contact@inkwire.com; editorial@inkwire.com)'
      },
      timeout: 5000
    });

    const [, titles, descriptions, urls] = response.data;
    const results = (titles || []).map((title, i) => ({
      title,
      description: descriptions?.[i] || '',
      url: urls?.[i] || '',
    }));

    return res.json({ success: true, data: results });
  } catch (err) {
    logger.error(`[ADMIN] wikiSearch: ${err.message}`);
    return res.status(500).json({ success: false, message: 'Failed to search Wikipedia' });
  }
};

/** Fetch Wikipedia page content, rewrite via AI, and import to queue as draft */
export const wikiImport = async (req, res) => {
  try {
    const { title, topic = 'india' } = req.body;
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Wikipedia page title is required' });
    }

    logger.info(`[ADMIN] Wikipedia import triggered for page: "${title}" under category: ${topic}`);

    // Fetch extract content + main image URL from MediaWiki query API
    const contentRes = await axios.get('https://en.wikipedia.org/w/api.php', {
      params: {
        action: 'query',
        prop: 'extracts|pageimages',
        exintro: false,
        explaintext: true,
        piprop: 'original',
        titles: title.trim(),
        format: 'json',
        redirects: 1,
        origin: '*'
      },
      headers: {
        'User-Agent': 'InkWire/1.0 (contact@inkwire.com; editorial@inkwire.com)'
      },
      timeout: 8000
    });

    const pages = contentRes.data?.query?.pages;
    const pageId = Object.keys(pages || {})[0];
    const pageData = pages?.[pageId];

    if (!pageData || pageId === '-1') {
      return res.status(404).json({ success: false, message: `Wikipedia page "${title}" not found.` });
    }

    const wikiContent = pageData.extract || '';
    if (!wikiContent.trim()) {
      return res.status(400).json({ success: false, message: 'Wikipedia page has no text content.' });
    }

    // Call AIService to rewrite Wikipedia page into a structured news draft
    const articleData = await writeArticleFromWiki(topic, title.trim(), wikiContent);

    // Get the image URL from Wikipedia's original pageimage, or fallback to Unsplash
    let finalImageUrl = pageData.original?.source;
    let finalImageCredit = 'Image via Wikipedia';

    if (!finalImageUrl) {
      logger.info(`[ADMIN] Wikipedia page has no main image — querying Unsplash for: "${articleData.imageSearchQuery || articleData.headline}"`);
      const imageData = await fetchImage(topic, articleData.imageSearchQuery || articleData.headline);
      finalImageUrl = imageData.url;
      finalImageCredit = imageData.credit;
    }

    const sanitizedBody = sanitizeArticleHTML(articleData.body);
    const words = countWords(sanitizedBody);
    const readTime = calculateReadTime(words);
    const slug = createSlug(articleData.headline);

    const generatedAt = new Date();
    const reviewDeadline = new Date(generatedAt.getTime() + 30 * 60 * 1000);

    const article = await Article.create({
      headline: articleData.headline,
      subheadline: articleData.subheadline,
      slug,
      body: sanitizedBody,
      summary: articleData.summary,
      tags: articleData.tags,
      topic: articleData.topic,
      wordCount: words,
      readTime,
      imageUrl: finalImageUrl,
      imageCredit: finalImageCredit,
      sources: articleData.sources,
      scheduledFor: 'morning',
      status: 'draft',
      generatedAt,
      reviewDeadline,
    });

    logger.info(`[ADMIN] Wikipedia page "${title}" imported as draft: "${article.headline}"`);
    return res.json({ success: true, data: article });
  } catch (err) {
    logger.error(`[ADMIN] wikiImport: ${err.message}`);
    return res.status(500).json({ success: false, message: `Failed to import Wikipedia page: ${err.message}` });
  }
};

/** Fetch live suggested headlines from news feeds */
export const getSuggestedHeadlines = async (req, res) => {
  try {
    logger.info('[ADMIN] Fetching suggested headlines for custom article creation');
    const headlines = await fetchAllHeadlines();
    
    // Filter and score headlines using our RankingService
    const topStories = selectTopStories(headlines, Math.min(60, headlines.length));

    // Group ranked stories by topic
    const indiaStories = topStories.filter((s) => s.assignedTopic === 'india');
    const worldStories = topStories.filter((s) => s.assignedTopic === 'world');
    const otherStories = topStories.filter((s) => s.assignedTopic !== 'india' && s.assignedTopic !== 'world');

    // Build balanced set: up to 4 India stories, up to 3 World stories, and remaining from others
    const selected = [];
    selected.push(...indiaStories.slice(0, 4));
    selected.push(...worldStories.slice(0, 3));

    // Collect fallback/spillover pool
    const pool = [
      ...indiaStories.slice(4),
      ...worldStories.slice(3),
      ...otherStories,
    ];

    // Fill the remaining slots up to 8
    for (const story of pool) {
      if (selected.length >= 8) break;
      if (!selected.some((s) => s.title === story.title)) {
        selected.push(story);
      }
    }

    const suggestions = selected.map((h) => ({
      title: h.title.trim(),
      source: h.source || 'News Feed',
      topic: h.assignedTopic || 'india',
    }));

    return res.json({ success: true, data: suggestions });
  } catch (err) {
    logger.error(`[ADMIN] getSuggestedHeadlines: ${err.message}`);
    return res.status(500).json({ success: false, message: 'Failed to fetch suggested headlines' });
  }
};


