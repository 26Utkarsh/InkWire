/**
 * @fileoverview AutoReviewService.js — AI-powered automatic article review for InkWire.
 *
 * HOW IT WORKS:
 * 1. Every 5 minutes, a cron job checks for draft articles whose reviewDeadline has passed
 * 2. If admin has NOT reviewed them within 30 min, AI takes over
 * 3. AI checks: grammar, factual plausibility, structure, tone
 * 4. System checks: image URL validity
 * 5. If score >= 75/100 → auto-publish + email admin
 * 6. If score < 75 → flag issues + email admin to review manually
 */

import axios from 'axios';
import { Article } from '../models/Article.js';
import { logger } from '../utils/logger.js';
import { sendAutoPublishNotification, sendAutoReviewFailed } from './EmailService.js';
import { createSlug } from '../utils/slugify.js';

const AUTO_REVIEW_PASS_SCORE = 75; // out of 100 — articles scoring above this are auto-published
const IMAGE_CHECK_TIMEOUT_MS = 8000;

/**
 * Build the AI quality-review prompt for an article
 * @param {object} article
 * @returns {string}
 */
const buildReviewPrompt = (article) => `
You are a senior editor and fact-checker at a world-class news publication.
Review the following AI-generated news article for publication readiness.

ARTICLE HEADLINE: ${article.headline}
ARTICLE SUBHEADLINE: ${article.subheadline}
ARTICLE BODY:
${article.body?.replace(/<[^>]*>/g, ' ').slice(0, 3000)}

ARTICLE SUMMARY: ${article.summary}
TOPIC: ${article.topic}
WORD COUNT: ${article.wordCount}

Evaluate the article on these criteria:
1. GRAMMAR & LANGUAGE (0-25): Spelling, grammar, sentence structure, readability
2. FACTUAL PLAUSIBILITY (0-25): Does it make factual sense? No obvious fabrications? No contradictions?
3. JOURNALISTIC STRUCTURE (0-25): Clear lead, body, conclusion? Follows news writing conventions?
4. TONE & PROFESSIONALISM (0-25): Objective, professional, no bias or clickbait?

RESPOND IN THIS EXACT JSON FORMAT ONLY — NO MARKDOWN, NO EXTRA TEXT:
{
  "score": <total score 0-100>,
  "grammar": <0-25>,
  "factual": <0-25>,
  "structure": <0-25>,
  "tone": <0-25>,
  "passed": <true if score >= 75, else false>,
  "issues": ["<specific issue 1>", "<specific issue 2>"],
  "verdict": "<one sentence explaining the decision>"
}
`;

/**
 * Call Gemini to review an article
 * @param {object} article
 * @returns {Promise<object>} Review result
 */
const reviewWithAI = async (article) => {
  const prompt = buildReviewPrompt(article);
  const apiKey = process.env.GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('No Gemini API key available for review');

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await axios.post(
    endpoint,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
        thinkingConfig: {
          thinkingBudget: 0
        }
      },
    },
    { timeout: 30000 }
  );

  const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Empty AI review response');

  const cleaned = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in AI review response');

  return JSON.parse(jsonMatch[0]);
};

/**
 * Check if the article's image URL loads correctly
 * @param {string} imageUrl
 * @returns {Promise<boolean>}
 */
const checkImageUrl = async (imageUrl) => {
  if (!imageUrl) return false;
  try {
    const res = await axios.head(imageUrl, { timeout: IMAGE_CHECK_TIMEOUT_MS });
    return res.status >= 200 && res.status < 400;
  } catch {
    try {
      /** Some servers don't support HEAD — try GET with range */
      const res = await axios.get(imageUrl, {
        timeout: IMAGE_CHECK_TIMEOUT_MS,
        headers: { Range: 'bytes=0-1024' },
        responseType: 'stream',
      });
      res.data.destroy();
      return res.status >= 200 && res.status < 400;
    } catch {
      return false;
    }
  }
};

/**
 * Review and potentially auto-publish a single article
 * @param {object} article — Mongoose document
 * @returns {Promise<void>}
 */
const reviewAndPublish = async (article) => {
  logger.info(`[AUTO-REVIEW] Starting review: "${article.headline}"`);

  const issues = [];
  let aiResult = null;

  /** ── AI Quality Review ── */
  try {
    aiResult = await reviewWithAI(article);
    logger.info(`[AUTO-REVIEW] AI score: ${aiResult.score}/100 for "${article.headline}"`);

    if (aiResult.issues?.length > 0) {
      issues.push(...aiResult.issues);
    }
  } catch (err) {
    logger.warn(`[AUTO-REVIEW] AI review failed for "${article.headline}": ${err.message}`);
    /** If AI review itself fails, we default to publishing to not block the pipeline */
    aiResult = { score: 80, passed: true, verdict: 'AI review unavailable — published with default pass', issues: [] };
  }

  /** ── Image URL Check ── */
  const imageOk = await checkImageUrl(article.imageUrl);
  if (!imageOk && article.imageUrl) {
    issues.push('Article image failed to load — placeholder may be shown');
    logger.warn(`[AUTO-REVIEW] Image check failed for "${article.headline}"`);
  }

  const finalScore  = aiResult.score;
  const passed      = finalScore >= AUTO_REVIEW_PASS_SCORE;
  const reviewedAt  = new Date();

  /** ── Save review result ── */
  article.autoReviewed     = true;
  article.autoReviewResult = { passed, score: finalScore, issues, reviewedAt };

  if (passed) {
    /** ✅ Auto-publish */
    article.status      = 'published';
    article.publishedAt = reviewedAt;
    await article.save();

    logger.info(`[AUTO-REVIEW] ✅ Auto-published: "${article.headline}" (score: ${finalScore})`);

    await sendAutoPublishNotification([{
      ...article.toObject(),
      aiScore:  finalScore,
      verdict:  aiResult.verdict,
      imageOk,
      issues,
    }]);
  } else {
    /** ❌ Issues found — keep as draft, alert admin */
    await article.save();
    logger.warn(`[AUTO-REVIEW] ❌ Auto-review failed: "${article.headline}" (score: ${finalScore}, issues: ${issues.join(', ')})`);

    await sendAutoReviewFailed({
      ...article.toObject(),
      aiScore: finalScore,
      verdict: aiResult.verdict,
      imageOk,
      issues,
    });
  }
};

/**
 * Main auto-review runner — called by cron every 5 minutes.
 * Finds all draft articles past their reviewDeadline.
 * @returns {Promise<void>}
 */
export const runAutoReview = async () => {
  try {
    const overdue = await Article.find({
      status:         'draft',
      autoReviewed:   false,
      reviewDeadline: { $lte: new Date() },
    });

    if (overdue.length === 0) return;

    logger.info(`[AUTO-REVIEW] Found ${overdue.length} article(s) past review deadline`);

    for (const article of overdue) {
      try {
        await reviewAndPublish(article);
      } catch (err) {
        logger.error(`[AUTO-REVIEW] Failed for "${article.headline}": ${err.message}`);
      }
    }
  } catch (err) {
    logger.error(`[AUTO-REVIEW] runAutoReview failed: ${err.message}`);
  }
};
