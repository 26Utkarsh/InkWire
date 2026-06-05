/**
 * @fileoverview Newsletter.js — Email subscriber model for InkWire.
 * Tracks newsletter subscribers with opt-out support.
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

const newsletterSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    active: { type: Boolean, default: true },
    subscribedAt: { type: Date, default: Date.now },
    unsubscribedAt: { type: Date },
    source: { type: String, enum: ['homepage', 'article', 'footer'], default: 'homepage' },
  },
  { timestamps: true }
);

export const Newsletter = mongoose.model('Newsletter', newsletterSchema);
