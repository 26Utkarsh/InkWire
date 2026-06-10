import 'dotenv/config';
import { connectDB } from './config/db.js';
import { Article } from './models/Article.js';

async function check() {
  await connectDB();
  const approved = await Article.find({ status: 'approved' })
    .select('headline scheduledFor createdAt updatedAt')
    .lean();
  console.log(`Found ${approved.length} approved articles:`);
  approved.forEach((a, i) => {
    console.log(`${i+1}. [Created: ${a.createdAt?.toISOString()}] [Slot: ${a.scheduledFor}] ${a.headline}`);
  });
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
