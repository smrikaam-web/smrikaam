// Filter out non-actionable Node 22 internal library url.parse deprecation warnings
if (typeof process !== 'undefined' && process.on) {
  process.on('warning', (warning) => {
    if (warning && warning.code === 'DEP0169') return;
    console.warn(warning);
  });
}

import 'dotenv/config';
import app from '../server/index.js';
import { postgres } from '../server/services/postgres.js';

export default async function handler(req, res) {
  try {
    if (!postgres.isConnected) {
      await postgres.testConnection();
    }
  } catch (err) {
    console.warn('Vercel serverless connection attempt error:', err.message);
  }
  return app(req, res);
}
