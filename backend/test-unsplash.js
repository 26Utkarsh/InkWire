import 'dotenv/config';
import { fetchImage } from './services/ImageService.js';

async function test() {
  console.log('Testing fetchImage with the new search implementation...');
  try {
    const topic = 'technology';
    const query = 'SpaceX launch';
    const result = await fetchImage(topic, query);
    console.log('Result:', result);
  } catch (err) {
    console.error('fetchImage Failed:', err.message);
  }
  process.exit(0);
}

test();
