import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { Article } from '../models/Article.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function fixSpecific() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not set in .env');
    process.exit(1);
  }

  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('✅ Connected.\n');

  // 1. Fix India's Pralay Missile article
  const missileArticle = await Article.findOne({
    headline: { $regex: 'Pralay Missile', $options: 'i' }
  });

  if (missileArticle) {
    console.log(`Found missile article: "${missileArticle.headline}"`);
    console.log(`Current image: ${missileArticle.imageUrl}`);
    
    missileArticle.imageUrl = 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=800&q=80';
    missileArticle.imageCredit = 'Photo by NASA on Unsplash';
    await missileArticle.save();
    console.log(`✅ Updated missile article image!`);
  } else {
    console.log(`❌ Missile article not found.`);
  }

  console.log('---');

  // 2. Fix Blue Origin Pad explosion article
  const blueOriginArticle = await Article.findOne({
    headline: { $regex: 'Blue Origin Pad', $options: 'i' }
  });

  if (blueOriginArticle) {
    console.log(`Found Blue Origin article: "${blueOriginArticle.headline}"`);
    console.log(`Current image: ${blueOriginArticle.imageUrl}`);
    
    blueOriginArticle.imageUrl = 'https://images.unsplash.com/photo-1508873699372-7aeab60b44ab?auto=format&fit=crop&w=800&q=80';
    blueOriginArticle.imageCredit = 'Photo by NASA on Unsplash';
    await blueOriginArticle.save();
    console.log(`✅ Updated Blue Origin article image!`);
  } else {
    console.log(`❌ Blue Origin article not found.`);
  }

  console.log('\n🔌 Disconnecting...');
  await mongoose.disconnect();
  console.log('✅ Done.');
}

fixSpecific().catch(err => {
  console.error('❌ Error running script:', err);
  process.exit(1);
});
