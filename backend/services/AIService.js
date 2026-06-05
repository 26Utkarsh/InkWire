/**
 * @fileoverview AIService.js — Gemini + Groq article writing service.
 * Gemini is primary; Groq/LLaMA is automatic fallback on any failure.
 */

import axios from 'axios';
import { AI_CONFIG, buildArticlePrompt } from '../config/ai.config.js';
import { logger } from '../utils/logger.js';
import { AI } from '../config/constants.js';

/**
 * Call Gemini API to generate article content
 * @param {string} prompt - Full article writing prompt
 * @returns {Promise<string>} Raw JSON string response
 */
const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const response = await axios.post(
    `${AI_CONFIG.PRIMARY.endpoint}?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: AI.TEMPERATURE,
        maxOutputTokens: 8192,
        thinkingConfig: {
          thinkingBudget: 0
        }
      },
    },
    { timeout: AI.REQUEST_TIMEOUT_MS }
  );

  const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return text;
};

/**
 * Call Groq API (OpenAI-compatible) to generate article content
 * @param {string} prompt - Full article writing prompt
 * @returns {Promise<string>} Raw JSON string response
 */
const callGroq = async (prompt) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set');

  const response = await axios.post(
    AI_CONFIG.FALLBACK.endpoint,
    {
      model: AI_CONFIG.FALLBACK.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: AI.TEMPERATURE,
      max_tokens: 4096,
    },
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: AI.REQUEST_TIMEOUT_MS,
    }
  );

  const text = response.data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from Groq');
  return text;
};

/**
 * Bulletproof JSON extractor — handles all Gemini output styles:
 * - Bare JSON
 * - ```json ... ``` wrapped
 * - Preamble text then JSON
 * - Mixed markdown + JSON
 * @param {string} rawText
 * @returns {object}
 */
const parseArticleResponse = (rawText) => {
  if (!rawText) throw new Error('Empty AI response');

  // Strategy 1: direct parse (already clean JSON)
  try {
    const trimmed = rawText.trim();
    if (trimmed.startsWith('{')) return JSON.parse(trimmed);
  } catch (_) {}

  // Strategy 2: strip ALL code fences (```json ... ``` or ``` ... ```)
  try {
    const stripped = rawText
      .replace(/^[\s\S]*?```(?:json)?\s*/i, '')  // remove everything up to first fence
      .replace(/\s*```[\s\S]*$/i, '')              // remove closing fence and anything after
      .trim();
    if (stripped.startsWith('{')) return JSON.parse(stripped);
  } catch (_) {}

  // Strategy 3: grab the largest {...} block anywhere in the response
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (_) {}
  }

  // Strategy 4: find first { and last } and try that substring
  const first = rawText.indexOf('{');
  const last  = rawText.lastIndexOf('}');
  if (first !== -1 && last > first) {
    try {
      return JSON.parse(rawText.slice(first, last + 1));
    } catch (_) {}
  }

  // Strategy 5: JSON repair — fix unescaped double quotes inside string values
  // Common Gemini failure: body contains "quoted words" that break JSON
  try {
    const slice = rawText.slice(rawText.indexOf('{'), rawText.lastIndexOf('}') + 1);
    // Replace unescaped quotes inside values with typographic quotes
    const repaired = slice.replace(
      /("(?:body|headline|subheadline|summary)":\s*")([\s\S]*?)(?<!\\)("(?=\s*[,}]))/g,
      (_, key, content, closing) =>
        key + content.replace(/(?<!\\)"/g, '\\"') + closing
    );
    return JSON.parse(repaired);
  } catch (_) {}

  throw new Error('No valid JSON found in AI response');
};


/**
 * Write a full article for a given story using AI
 * Tries Gemini first, falls back to Groq automatically
 * @param {object} story - Story with title, description, assignedTopic, scheduledFor
 * @returns {Promise<object>} Structured article data ready for DB
 */
export const writeArticle = async (story) => {
  const headlines = [
    story.title,
    story.description,
    ...(story.relatedHeadlines || []),
  ].filter(Boolean);

  const prompt = buildArticlePrompt(story.assignedTopic, headlines);
  let rawText;
  let provider = 'gemini';

  try {
    rawText = await callGemini(prompt);
    logger.info(`[AI] Gemini 2.5 Flash (Key 1): ${story.assignedTopic}`);
  } catch (err1) {
    logger.warn(`[AI] Key 1 failed (${err1.message}) — trying Key 2`);
    try {
      /** Second Gemini key — separate quota pool */
      const key2 = process.env.GEMINI_API_KEY_2;
      if (!key2) throw new Error('GEMINI_API_KEY_2 not set');
      const res2 = await axios.post(
        `${AI_CONFIG.PRIMARY.endpoint}?key=${key2}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: AI.TEMPERATURE,
            maxOutputTokens: 8192,
            thinkingConfig: {
              thinkingBudget: 0
            }
          }
        },
        { timeout: AI.REQUEST_TIMEOUT_MS }
      );
      rawText = res2.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Empty response from Gemini Key 2');
      provider = 'gemini-key2';
      logger.info(`[AI] Gemini 2.5 Flash (Key 2): ${story.assignedTopic}`);
    } catch (err2) {
      logger.warn(`[AI] Key 2 failed (${err2.message}) — trying Gemini Lite`);
      try {
        /** Gemini 2.0 Flash Lite — lighter model, different quota */
        const liteRes = await axios.post(
          `${AI_CONFIG.GEMINI_LITE.endpoint}?key=${process.env.GEMINI_API_KEY}`,
          { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: AI.TEMPERATURE, maxOutputTokens: 8192 } },
          { timeout: AI.REQUEST_TIMEOUT_MS }
        );
        rawText = liteRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) throw new Error('Empty response from Gemini Lite');
        provider = 'gemini-lite';
        logger.info(`[AI] Gemini Lite: ${story.assignedTopic}`);
      } catch (err3) {
        logger.warn(`[AI] Gemini Lite failed (${err3.message}) — switching to Groq`);
        try {
          rawText = await callGroq(prompt);
          provider = 'groq';
          logger.info(`[AI] Groq LLaMA: ${story.assignedTopic}`);
        } catch (err4) {
          logger.error(`[AI] All providers failed: ${err4.message}`);
          throw new Error(`AI generation failed after 4 attempts: ${err4.message}`);
        }
      }
    }
  }

  const parsed = parseArticleResponse(rawText);

  return {
    headline: parsed.headline || story.title,
    subheadline: parsed.subheadline || '',
    body: parsed.body || '',
    summary: parsed.summary || '',
    tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    topic: parsed.topic || story.assignedTopic,
    wordCount: parsed.wordCount || 0,
    sources: Array.isArray(parsed.sourcesUsed)
      ? parsed.sourcesUsed.map((s) => ({ title: s, url: story.url, source: story.source }))
      : [{ title: story.title, url: story.url, source: story.source }],
    scheduledFor: story.scheduledFor,
    aiProvider: provider,
  };
};
