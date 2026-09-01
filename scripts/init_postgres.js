import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initialSeedData } from '../server/data/seedData.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

async function initPostgres() {
  console.log('=== INITIALIZING SMRIKAAM POSTGRESQL DATABASE ===');

  const connectionString =
    process.env.DATABASE_URL ||
    `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || 'postgres'}@${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'smrikaam_db'}`;

  console.log('Target PostgreSQL Connection String:', connectionString.replace(/:[^:@]+@/, ':****@'));

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('✓ Successfully connected to PostgreSQL server.');

    // 1. Run Schema DDL
    const schemaSqlPath = path.resolve(__dirname, '../server/data/schema.sql');
    const schemaSql = fs.readFileSync(schemaSqlPath, 'utf8');
    await client.query(schemaSql);
    console.log('✓ Executed schema.sql (Tables, Constraints, Indexes created).');

    // 2. Seed Services (10 Services)
    console.log('Syncing 10 services into PostgreSQL...');
    for (const s of initialSeedData.services) {
      await client.query(
        `INSERT INTO services (id, title, slug, num, tagline, summary, description, business_problems, capabilities, technology, industry_applications, problem_statement, solution_statement, outcomes, accelerator, case_study, cover_image_url, status, display_order, created_at, updated_at, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           slug = EXCLUDED.slug,
           num = EXCLUDED.num,
           tagline = EXCLUDED.tagline,
           summary = EXCLUDED.summary,
           description = EXCLUDED.description,
           technology = EXCLUDED.technology,
           capabilities = EXCLUDED.capabilities,
           business_problems = EXCLUDED.business_problems,
           updated_at = NOW();`,
        [
          s.id, s.title, s.slug, s.num, s.tagline, s.summary, s.description,
          JSON.stringify(s.businessProblems || []),
          JSON.stringify(s.capabilities || []),
          JSON.stringify(s.technology || []),
          JSON.stringify(s.industryApplications || []),
          s.problemStatement, s.solutionStatement, s.outcomes, s.accelerator, s.caseStudy,
          s.cover_image_url, s.status, s.display_order, s.created_at, s.updated_at, s.published_at
        ]
      );
    }
    console.log('✓ 10 Services synced into PostgreSQL.');

    // 3. Check counts
    const srvCount = await client.query('SELECT count(*) FROM services');
    console.log(`Total services in PostgreSQL: ${srvCount.rows[0].count}`);

    await client.end();
    console.log('✓ PostgreSQL Initialization Completed Successfully!');
  } catch (err) {
    console.error('PostgreSQL Initialization Note / Error:', err.message);
    console.log('\nTip: To connect to your local or remote PostgreSQL instance:');
    console.log('1. Ensure PostgreSQL is installed and running.');
    console.log('2. Create database `smrikaam_db` (e.g. `createdb smrikaam_db` or via pgAdmin / psql).');
    console.log('3. Set DATABASE_URL or PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE in your .env file.');
  }
}

initPostgres();
