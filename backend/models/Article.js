/**
 * @fileoverview Article.js — Article model for InkWire.
 * Core data structure for all AI-generated and published articles.
 */

import mongoose from 'mongoose';
import { TOPIC_IDS } from '../config/topics.config.js';

const { Schema } = mongoose;

/** Source attribution sub-schema */
const sourceSchema = new Schema(
  {
    title: { type: String },
    url: { type: String },
    source: { type: String },
  },
  { _id: false }
);

const articleSchema = new Schema(
  {
    // Content
    headline: { type: String, required: true, trim: true },
    subheadline: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    body: { type: String, required: true },
    summary: { type: String, required: true },
    byline: { type: String, default: 'InkWire Editorial Desk' },

    // Metadata
    topic: { type: String, required: true, enum: TOPIC_IDS, index: true },
    tags: [{ type: String }],
    readTime: { type: Number },
    wordCount: { type: Number },
    imageUrl: { type: String },
    imageCredit: { type: String },

    // Sources used for writing
    sources: [sourceSchema],

    // Workflow
    status: {
      type: String,
      enum: ['draft', 'approved', 'published', 'rejected'],
      default: 'draft',
      index: true,
    },
    scheduledFor: {
      type: String,
      enum: ['morning', 'afternoon', 'evening'],
    },
    publishedAt:   { type: Date, index: true },
    generatedAt:   { type: Date, default: Date.now },
    editedByAdmin: { type: Boolean, default: false },
    isFeatured:    { type: Boolean, default: false },

    // Auto-review pipeline
    reviewDeadline:   { type: Date, index: true },   // generatedAt + 30 min
    autoReviewed:     { type: Boolean, default: false },
    autoReviewResult: {
      passed:     { type: Boolean },
      score:      { type: Number },           // 0–100
      issues:     [{ type: String }],         // list of found problems
      reviewedAt: { type: Date },
    },

    // Analytics
    views:     { type: Number, default: 0 },
    readCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/** Full-text search index on headline and body */
articleSchema.index({ headline: 'text', body: 'text', tags: 'text' });

export const Article = mongoose.model('Article', articleSchema);
