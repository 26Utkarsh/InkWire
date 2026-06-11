/**
 * resetAdmin.js — Emergency script to unlock the admin account.
 * Run with: node scripts/resetAdmin.js
 *
 * This clears loginAttempts, lockedUntil, and loginHistory.
 * Use this if you've been locked out of the dashboard.
 */

import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI is not set in your .env file');
  process.exit(1);
}

await mongoose.connect(MONGODB_URI);
console.log('✅  Connected to MongoDB');

const result = await mongoose.connection.collection('admins').updateMany(
  {},
  {
    $set: {
      loginAttempts: 0,
      lockedUntil: null,
      loginHistory: [],
    },
  }
);

if (result.modifiedCount === 0) {
  console.log('⚠️   No admin documents found — nothing to reset.');
} else {
  console.log(`✅  Admin account unlocked! (${result.modifiedCount} document(s) updated)`);
  console.log('   You can now log in at /admin/login');
}

await mongoose.disconnect();
process.exit(0);
