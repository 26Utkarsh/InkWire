/**
 * @fileoverview newsletter.routes.js — Newsletter subscription endpoints for InkWire.
 */

import { Router } from 'express';
import { validateSubscription } from '../middleware/validate.middleware.js';
import { subscribeNewsletter, unsubscribeNewsletter } from '../controllers/newsletter.controller.js';

export const newsletterRouter = Router();

newsletterRouter.post('/subscribe', validateSubscription, subscribeNewsletter);
newsletterRouter.post('/unsubscribe', validateSubscription, unsubscribeNewsletter);
