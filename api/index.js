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
