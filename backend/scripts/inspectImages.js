import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { Article } from '../models/Article.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function inspect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not set');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const articles = await Article.find({ status: 'published' })
    .sort({ publishedAt: -1 })
    .limit(15)
    .select('headline topic imageUrl imageCredit')
    .lean();

  console.log(`\n--- Top 15 Published Articles and Images ---`);
  articles.forEach((a, i) => {
    console.log(`${i+1}. [${a.topic.toUpperCase()}] "${a.headline}"`);
    console.log(`   Image:  ${a.imageUrl}`);
    console.log(`   Credit: ${a.imageCredit || 'None'}`);
  });

  await mongoose.disconnect();
}

inspect().catch(err => {
  console.error(err);
  process.exit(1);
});
