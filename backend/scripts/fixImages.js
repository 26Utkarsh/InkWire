/**
 * @fileoverview fixImages.js — One-time migration to fix broken source.unsplash.com URLs.
 * Run: node scripts/fixImages.js
 *
 * Finds all articles with imageUrl containing "source.unsplash.com" (the old,
 * now-defunct service) and replaces them with a valid curated Unsplash CDN URL
 * matching the article's topic.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

/** Curated fallback image URLs per topic (permanent Unsplash CDN links) */
const TOPIC_FALLBACKS = {
  world:      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
  india:      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
  technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
  business:   'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
  science:    'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=800&q=80',
  politics:   'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
};

const FALLBACK_DEFAULT = TOPIC_FALLBACKS.world;

async function fixImages() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌  MONGODB_URI not set in .env');
    process.exit(1);
  }

  console.log('🔌  Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('✅  Connected.\n');

  const db = mongoose.connection.db;
  const collection = db.collection('articles');

  // Find all articles with broken source.unsplash.com URLs
  const broken = await collection.find({
    imageUrl: { $regex: 'source\\.unsplash\\.com', $options: 'i' }
  }).toArray();

  console.log(`🔍  Found ${broken.length} articles with broken source.unsplash.com URLs.\n`);

  if (broken.length === 0) {
    console.log('✨  Nothing to fix — all images are already on the correct CDN!');
    await mongoose.disconnect();
    return;
  }

  let fixed = 0;
  for (const article of broken) {
    const newUrl = TOPIC_FALLBACKS[article.topic] || FALLBACK_DEFAULT;
    await collection.updateOne(
      { _id: article._id },
      { $set: { imageUrl: newUrl } }
    );
    console.log(`  ✓ Fixed [${article.topic}]: "${article.headline?.slice(0, 60)}..."`);
    fixed++;
  }

  console.log(`\n🎉  Done! Fixed ${fixed}/${broken.length} articles.`);
  await mongoose.disconnect();
  console.log('🔌  Disconnected from MongoDB.');
}

fixImages().catch((err) => {
  console.error('❌  Migration failed:', err.message);
  process.exit(1);
});
