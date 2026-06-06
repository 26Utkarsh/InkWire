/**
 * @fileoverview SchedulerService.js — All cron jobs for InkWire automation.
 * Daily generation at 5 AM + three timed publishing windows + analytics snapshot.
 */

import cron from 'node-cron';
import { Article } from '../models/Article.js';
import { fetchAllHeadlines } from './NewsService.js';
import { selectTopStories, assignPublishSlots } from './RankingService.js';
import { writeArticle } from './AIService.js';
import { fetchImage } from './ImageService.js';
import { sendAdminAlert, sendPublishReminder } from './EmailService.js';
import { sendDailyDigest } from './NewsletterService.js';
import { runAutoReview } from './AutoReviewService.js';
import { createSlug } from '../utils/slugify.js';
import { sanitizeArticleHTML } from '../utils/sanitize.js';
import { calculateReadTime, countWords } from '../utils/readTime.js';
import { logger } from '../utils/logger.js';
import { CRON, ARTICLE } from '../config/constants.js';

/**
 * Generate articles: fetch headlines → rank → write → save as drafts
 * @param {number} [count]     - How many articles to generate. Auto=6, Manual=any.
 * @param {boolean} [isManual] - True when triggered by admin button (skips daily cap).
 * @returns {Promise<object[]>} Array of saved draft articles
 */
export const generateDailyArticles = async (count = ARTICLE.DRAFTS_PER_DAY, isManual = false) => {
  const label = isManual ? `Manual generation (${count} articles)` : 'Daily auto-generation';
  logger.info(`[SCHEDULER] ${label} started`);

  try {
    const headlines  = await fetchAllHeadlines();
    const topStories = selectTopStories(headlines, count);
    const assigned   = assignPublishSlots(topStories);

    const articleJobs = assigned.map(async (story) => {
      try {
        const articleData = await writeArticle(story);
        const imageData = await fetchImage(story.assignedTopic, articleData.imageSearchQuery || story.title);

        const sanitizedBody = sanitizeArticleHTML(articleData.body);
        const words    = countWords(sanitizedBody);
        const readTime = calculateReadTime(words);
        const slug     = createSlug(articleData.headline);

        const generatedAt    = new Date();
        const reviewDeadline = new Date(generatedAt.getTime() + 30 * 60 * 1000);

        const article = await Article.create({
          headline:    articleData.headline,
          subheadline: articleData.subheadline,
          slug,
          body:        sanitizedBody,
          summary:     articleData.summary,
          tags:        articleData.tags,
          topic:       articleData.topic,
          wordCount:   words,
          readTime,
          imageUrl:    imageData.url,
          imageCredit: imageData.credit,
          sources:     articleData.sources,
          scheduledFor: story.scheduledFor,
          status:      'draft',
          generatedAt,
          reviewDeadline,
        });

        logger.info(`[SCHEDULER] Draft saved: "${article.headline}" (${article.scheduledFor})`);
        return article;
      } catch (err) {
        logger.error(`[SCHEDULER] Failed to generate article for "${story.title}": ${err.message}`);
        return null;
      }
    });

    const results = await Promise.allSettled(articleJobs);
    const saved = results
      .filter((r) => r.status === 'fulfilled' && r.value !== null)
      .map((r) => r.value);

    logger.info(`[SCHEDULER] ${label} complete: ${saved.length}/${count} articles saved`);
    await sendAdminAlert(saved);
    return saved;
  } catch (err) {
    logger.error(`[SCHEDULER] generateDailyArticles failed: ${err.message}`);
    return [];
  }
};


/**
 * Publish approved articles for a given time slot
 * @param {string} slot - 'morning' | 'afternoon' | 'evening'
 * @returns {Promise<void>}
 */
export const publishSlot = async (slot) => {
  logger.info(`[SCHEDULER] Publishing ${slot} slot`);

  try {
    const approved = await Article.find({ status: 'approved', scheduledFor: slot });

    if (approved.length === 0) {
      const pending = await Article.find({ status: 'draft', scheduledFor: slot });
      if (pending.length > 0) {
        logger.warn(`[SCHEDULER] ${slot} slot: ${pending.length} articles pending — not publishing`);
        await sendPublishReminder(slot, pending);
      }
      return;
    }

    for (const article of approved) {
      article.status = 'published';
      article.publishedAt = new Date();
      await article.save();
      logger.info(`[SCHEDULER] Published: "${article.headline}"`);
    }

    if (slot === 'morning') {
      const todayPublished = await Article.find({
        status: 'published',
        publishedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      });
      await sendDailyDigest(todayPublished);
    }
  } catch (err) {
    logger.error(`[SCHEDULER] publishSlot(${slot}) failed: ${err.message}`);
  }
};

/**
 * Save daily analytics snapshot at midnight
 * @returns {Promise<void>}
 */
const saveAnalyticsSnapshot = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const published = await Article.find({ status: 'published', publishedAt: { $gte: today } });
    const totalViews = published.reduce((sum, a) => sum + a.views, 0);

    logger.info(`[SCHEDULER] Analytics snapshot: ${published.length} articles, ${totalViews} views today`);
  } catch (err) {
    logger.error(`[SCHEDULER] saveAnalyticsSnapshot failed: ${err.message}`);
  }
};

/**
 * Initialize all cron jobs — call once on server start
 * @returns {void}
 */
export const initScheduler = () => {
  /** Daily article generation at 5:00 AM */
  cron.schedule(CRON.DAILY_GENERATION, () => generateDailyArticles());

  /** Publishing windows */
  cron.schedule(CRON.MORNING_PUBLISH,   () => publishSlot('morning'));
  cron.schedule(CRON.AFTERNOON_PUBLISH, () => publishSlot('afternoon'));
  cron.schedule(CRON.EVENING_PUBLISH,   () => publishSlot('evening'));

  /** 30-minute pre-window reminders — warn admin of unapproved articles */
  cron.schedule('30 7 * * *',  () => checkAndRemind('morning'));
  cron.schedule('30 12 * * *', () => checkAndRemind('afternoon'));
  cron.schedule('30 18 * * *', () => checkAndRemind('evening'));

  /** Analytics snapshot at midnight */
  cron.schedule(CRON.ANALYTICS_SNAPSHOT, () => saveAnalyticsSnapshot());

  /** Auto-review: every 5 minutes — picks up overdue drafts */
  cron.schedule('*/5 * * * *', () => runAutoReview());

  logger.info('[SCHEDULER] All cron jobs initialized');
  logger.info('[SCHEDULER] Generation: 5:00 AM | Auto-Review: every 5 min | Reminders: 7:30/12:30/18:30 | Publish: 8:00 AM / 1:00 PM / 7:00 PM');
};

/**
 * Check pending articles for a slot and send reminder if any exist
 * @param {string} slot
 */
const checkAndRemind = async (slot) => {
  try {
    const pending = await Article.find({ status: 'draft', scheduledFor: slot });
    if (pending.length > 0) {
      logger.warn(`[SCHEDULER] Reminder: ${pending.length} unapproved articles for ${slot} slot`);
      await sendPublishReminder(slot, pending);
    }
  } catch (err) {
    logger.error(`[SCHEDULER] checkAndRemind(${slot}): ${err.message}`);
  }
};
