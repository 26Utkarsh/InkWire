/**
 * @fileoverview article.routes.js — Public article endpoints for InkWire.
 */

import { Router } from 'express';
import {
  getArticles,
  getArticleBySlug,
  getArticlesByTopic,
  searchArticles,
  getFeaturedArticle,
  getArticlesByDate,
  markArticleRead,
} from '../controllers/article.controller.js';

export const articleRouter = Router();

articleRouter.get('/', getArticles);
articleRouter.get('/featured', getFeaturedArticle);
articleRouter.get('/search', searchArticles);
articleRouter.get('/archive', getArticlesByDate);
articleRouter.get('/topic/:topicId', getArticlesByTopic);
articleRouter.get('/:slug', getArticleBySlug);
articleRouter.post('/:slug/read', markArticleRead);
