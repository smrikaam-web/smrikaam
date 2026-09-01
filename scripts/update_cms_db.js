import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialSeedData } from '../server/data/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../server/data/cms_db.json');

if (fs.existsSync(dbPath)) {
  const currentDb = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  currentDb.services = initialSeedData.services;
  fs.writeFileSync(dbPath, JSON.stringify(currentDb, null, 2), 'utf-8');
  console.log('✓ Successfully synchronized cms_db.json with 10 updated services!');
} else {
  fs.writeFileSync(dbPath, JSON.stringify(initialSeedData, null, 2), 'utf-8');
  console.log('✓ Initialized cms_db.json with updated seed data!');
}
