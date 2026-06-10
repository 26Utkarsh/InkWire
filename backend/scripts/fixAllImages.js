import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { Article } from '../models/Article.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

// Best rocket/missile/space images from Unsplash CDN
const ROCKET_LAUNCH_IMG = 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=800&q=80';
const LAUNCHPAD_FIRE_IMG = 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=800&q=80';
const MISSILE_DEFENSE_IMG = 'https://images.unsplash.com/photo-1608178398819-82c8a0afe8bf?auto=format&fit=crop&w=800&q=80';

async function fixAll() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);
  console.log('✅ Connected\n');

  // Fix ALL Blue Origin articles
  const blueOriginArticles = await Article.find({
    headline: { $regex: 'Blue Origin', $options: 'i' }
  });

  console.log(`Found ${blueOriginArticles.length} Blue Origin articles`);
  for (const a of blueOriginArticles) {
    console.log(`  Fixing: "${a.headline}"`);
    console.log(`  Old image: ${a.imageUrl}`);
    a.imageUrl = LAUNCHPAD_FIRE_IMG;
    a.imageCredit = 'Photo by SpaceX on Unsplash';
    await a.save();
    console.log(`  ✅ Fixed with rocket/launchpad image\n`);
  }

  // Fix ALL Missile articles
  const missileArticles = await Article.find({
    headline: { $regex: 'Missile|Pralay|missiles', $options: 'i' }
  });

  console.log(`Found ${missileArticles.length} Missile articles`);
  for (const a of missileArticles) {
    console.log(`  Fixing: "${a.headline}"`);
    console.log(`  Old image: ${a.imageUrl}`);
    a.imageUrl = ROCKET_LAUNCH_IMG;
    a.imageCredit = 'Photo by NASA on Unsplash';
    await a.save();
    console.log(`  ✅ Fixed with missile/rocket launch image\n`);
  }

  console.log('\n🎉 All done!');
  await mongoose.disconnect();
}

fixAll().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
