import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Article } from '../models/Article.js';
import { fetchImage } from '../services/ImageService.js';

dotenv.config();

async function run() {
  const dbUri = process.env.MONGODB_URI;
  if (!dbUri) {
    console.error('MONGODB_URI not defined in .env');
    process.exit(1);
  }

  try {
    console.log('Connecting to database...');
    await mongoose.connect(dbUri);
    console.log('Database connected successfully.');

    const articles = await Article.find({});
    console.log(`Found ${articles.length} articles to inspect and refine cover images.`);

    let updatedCount = 0;
    for (const article of articles) {
      console.log(`\nRefining image for article ID: ${article._id}`);
      console.log(`Headline: "${article.headline}"`);
      console.log(`Current Topic: ${article.topic}`);
      console.log(`Current Image: ${article.imageUrl || 'None'}`);

      // Derive visual query search term using tags or words from headline
      let searchWord = article.tags?.slice(0, 2).join(' ');
      if (!searchWord || searchWord.length < 3) {
        searchWord = article.headline;
      }

      console.log(`Querying image service with term: "${searchWord}"`);
      const imageData = await fetchImage(article.topic, searchWord);
      
      article.imageUrl = imageData.url;
      article.imageCredit = imageData.credit;
      await article.save();

      console.log(`SUCCESS -> Updated image to: ${imageData.url}`);
      console.log(`Credit: ${imageData.credit}`);
      updatedCount++;

      // Wait 800ms between calls to respect rate limiting if UNSPLASH_ACCESS_KEY is active
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    console.log(`\nRefinement completed. Refined images for ${updatedCount}/${articles.length} articles.`);
  } catch (err) {
    console.error('Refinement process encountered an error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
}

run();
