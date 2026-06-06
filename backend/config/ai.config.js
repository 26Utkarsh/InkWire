/**
 * @fileoverview ai.config.js — AI model configurations and writing prompts.
 * To add a new AI provider: add one entry to PROVIDERS — nothing else changes.
 */

export const AI_CONFIG = {
  PRIMARY: {
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    apiKeyEnv: 'GEMINI_API_KEY',
  },
  GEMINI_LITE: {
    provider: 'gemini-lite',
    model: 'gemini-2.0-flash-lite',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent',
    apiKeyEnv: 'GEMINI_API_KEY',
  },
  FALLBACK: {
    provider: 'groq',
    model: 'llama3-70b-8192',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    apiKeyEnv: 'GROQ_API_KEY',
  },
};

/**
 * Build the article writing prompt with dynamic context
 * @param {string} topic - Topic id
 * @param {string[]} headlines - Array of headline strings
 * @returns {string} Complete prompt string
 */
export const buildArticlePrompt = (topic, headlines) => {
  const headlineList = headlines.map((h, i) => `${i + 1}. ${h}`).join('\n');

  return `You are a senior editor at a world-class publication combining the analytical depth of Bloomberg, the clarity of The New York Times, the global perspective of Reuters, and the India expertise of The Hindu.

Write a complete, publication-ready news article based on the following headlines and sources.

TOPIC: ${topic}
HEADLINES PROVIDED:
${headlineList}

ARTICLE REQUIREMENTS:
1. HEADLINE: Sharp, factual, compelling. No clickbait. Max 12 words.
2. SUBHEADLINE: One sentence expanding the headline. Max 20 words.
3. LEAD PARAGRAPH: The single most important fact. Answer who/what/when/where/why immediately.
4. BODY (5-7 paragraphs):
   - Para 2: Essential context and background
   - Para 3-4: Key details, data, quotes (attribute to sources provided)
   - Para 5: Expert analysis or opposing perspective
   - Para 6: India angle if relevant (Indian readers are primary audience)
   - Para 7: What happens next — implications
5. CLOSING: One strong concluding sentence with forward-looking insight.

WRITING RULES:
- Active voice always. Never passive.
- Short sentences. Average 18 words per sentence.
- No opinions. No editorializing. Facts only.
- No phrases like "In conclusion", "It is worth noting", "It should be mentioned"
- Vary paragraph length. Mix short punchy paragraphs with detailed ones.
- Use numbers and data wherever possible.
- If quoting, always attribute: "According to [source]..."
- Target reading level: intelligent adult, no jargon without explanation
- Word count: 850-1100 words

TAGS: Generate 4-6 relevant tags.
SUMMARY: Write a 2-sentence summary for social sharing.

CRITICAL JSON RULES:
- Output ONLY raw JSON. No markdown fences. No preamble. No explanation.
- The body field must use <p> tags for paragraphs, <strong> for bold, <em> for italic.
- Do NOT use double quotes inside field values. Use single quotes or HTML entities (&quot;) instead.
- Do NOT use backslashes. Do NOT include newlines inside string values.
- The entire response must be valid, parseable JSON.

RESPOND IN THIS EXACT JSON FORMAT ONLY:
{
  "headline": "",
  "subheadline": "",
  "body": "<p>paragraph one</p><p>paragraph two</p>",
  "summary": "",
  "tags": [],
  "topic": "${topic}",
  "wordCount": 0,
  "sourcesUsed": []
}`;
};

/**
 * Build a custom article writing prompt based on a user-provided topic/prompt
 * @param {string} topic - Category/topic identifier
 * @param {string} customPrompt - Custom topic instructions from the admin
 * @returns {string} Complete prompt string
 */
export const buildCustomArticlePrompt = (topic, customPrompt) => {
  return `You are a senior editor at a world-class publication combining the analytical depth of Bloomberg, the clarity of The New York Times, the global perspective of Reuters, and the India expertise of The Hindu.

Write a complete, publication-ready news article based on the following topic prompt provided by the editor.

TOPIC CATEGORY: ${topic}
EDITOR TOPIC PROMPT:
${customPrompt}

ARTICLE REQUIREMENTS:
1. HEADLINE: Sharp, factual, compelling. No clickbait. Max 12 words.
2. SUBHEADLINE: One sentence expanding the headline. Max 20 words.
3. LEAD PARAGRAPH: The single most important fact. Answer who/what/when/where/why immediately.
4. BODY (5-7 paragraphs):
   - Para 2: Essential context and background regarding the topic prompt
   - Para 3-4: Key details, data, quotes, and specific facts mentioned in the topic prompt
   - Para 5: Expert analysis or opposing perspective/implications
   - Para 6: India angle if relevant (Indian readers are primary audience)
   - Para 7: What happens next — implications
5. CLOSING: One strong concluding sentence with forward-looking insight.

WRITING RULES:
- Active voice always. Never passive.
- Short sentences. Average 18 words per sentence.
- No opinions. No editorializing. Facts only.
- No phrases like "In conclusion", "It is worth noting", "It should be mentioned"
- Vary paragraph length. Mix short punchy paragraphs with detailed ones.
- Use numbers and data wherever possible.
- Target reading level: intelligent adult, no jargon without explanation
- Word count: 600-900 words

TAGS: Generate 4-6 relevant tags.
SUMMARY: Write a 2-sentence summary for social sharing.

CRITICAL JSON RULES:
- Output ONLY raw JSON. No markdown fences. No preamble. No explanation.
- The body field must use <p> tags for paragraphs, <strong> for bold, <em> for italic.
- Do NOT use double quotes inside field values. Use single quotes or HTML entities (&quot;) instead.
- Do NOT use backslashes. Do NOT include newlines inside string values.
- The entire response must be valid, parseable JSON.

RESPOND IN THIS EXACT JSON FORMAT ONLY:
{
  "headline": "",
  "subheadline": "",
  "body": "<p>paragraph one</p><p>paragraph two</p>",
  "summary": "",
  "tags": [],
  "topic": "${topic}",
  "wordCount": 0,
  "sourcesUsed": ["Editor Custom Request"]
}`;
};

