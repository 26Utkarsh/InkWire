import 'dotenv/config';
import { connectDB } from './config/db.js';
import { writeCustomArticle } from './services/AIService.js';

async function test() {
  await connectDB();
  console.log('Testing writeCustomArticle...');
  try {
    const topic = 'india';
    const prompt = 'Rahul Gandhi visiting Andaman islands';
    const data = await writeCustomArticle(topic, prompt);
    console.log('Custom article written successfully!', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed to write custom article:', err);
  }
  process.exit(0);
}

test();
