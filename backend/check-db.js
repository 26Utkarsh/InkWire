import 'dotenv/config';
import { connectDB } from './config/db.js';
import { Article } from './models/Article.js';

async function check() {
  await connectDB();
  console.log('Connected to DB!');

  const count = await Article.countDocuments();
  console.log('Total articles:', count);

  const drafts = await Article.countDocuments({ status: 'draft' });
  console.log('Drafts:', drafts);

  const approved = await Article.countDocuments({ status: 'approved' });
  console.log('Approved:', approved);

  const published = await Article.countDocuments({ status: 'published' });
  console.log('Published:', published);

  const rejected = await Article.countDocuments({ status: 'rejected' });
  console.log('Rejected:', rejected);

  console.log('\n--- Last 5 Published Articles ---');
  const lastPublished = await Article.find({ status: 'published' })
    .sort({ publishedAt: -1 })
    .limit(5)
    .select('headline publishedAt topic views')
    .lean();
  
  for (const a of lastPublished) {
    console.log(`- [${a.publishedAt?.toISOString()}] [${a.topic}] ${a.headline} (${a.views} views)`);
  }

  console.log('\n--- Last 5 Drafts ---');
  const lastDrafts = await Article.find({ status: 'draft' })
    .sort({ generatedAt: -1 })
    .limit(5)
    .select('headline generatedAt topic autoReviewed')
    .lean();
  
  for (const a of lastDrafts) {
    console.log(`- [${a.generatedAt?.toISOString()}] [${a.topic}] ${a.headline} (autoReviewed: ${a.autoReviewed})`);
  }

  process.exit(0);
}

check().catch(err => {
  console.error('Error running check:', err);
  process.exit(1);
});
