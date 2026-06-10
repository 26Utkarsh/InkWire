import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { Article } from '../models/Article.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function find() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);

  const articles = await Article.find({
    headline: { $regex: 'Blue Origin|Missile', $options: 'i' }
  }).select('headline imageUrl status topic').lean();

  console.log(`Found ${articles.length} articles matching search:`);
  articles.forEach((a, i) => {
    console.log(`${i+1}. [${a.status.toUpperCase()}] [${a.topic}] "${a.headline}"\n   Image: ${a.imageUrl}`);
  });

  await mongoose.disconnect();
}

find().catch(console.error);
