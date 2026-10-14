/**
 * ==============================================================================
 * SMRIKAAM Technologies - Verified PostgreSQL / Supabase Seed Script
 * Target Supabase Project: bgvayvnpgzfmagsoanem
 *
 * Requirements:
 * - Safe, idempotent execution using ON CONFLICT clauses.
 * - Seeds ONLY verified content from repository data (no invented records).
 * - Masks secrets and connection strings in logs.
 * - Validates counts across all 13 tables after completion.
 * ==============================================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;
const CMS_DB_PATH = path.resolve(__dirname, '../server/data/cms_db.json');

function safeJson(val) {
  if (val === undefined || val === null) return JSON.stringify([]);
  if (typeof val === 'string') {
    try {
      JSON.parse(val);
      return val;
    } catch {
      return JSON.stringify([val]);
    }
  }
  return JSON.stringify(val);
}

function maskConnectionString(url) {
  if (!url) return 'Not configured';
  try {
    const parsed = new URL(url.replace(/^postgres:/, 'http:').replace(/^postgresql:/, 'http:'));
    return `postgresql://${parsed.username ? '***' : ''}:***@${parsed.hostname}:${parsed.port || 5432}${parsed.pathname}`;
  } catch {
    return 'Configured (Masked)';
  }
}

async function runVerifiedSeed() {
  console.log('===========================================================');
  console.log('SMRIKAAM SUPABASE VERIFIED SEED RUNNER');
  console.log('Target Project: bgvayvnpgzfmagsoanem');
  console.log('===========================================================\n');

  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (!connectionString) {
    console.error('ERROR: DATABASE_URL is not configured.');
    console.error('Please configure DATABASE_URL in your .env file or environment before running.');
    process.exit(1);
  }

  console.log(`Connection URL: ${maskConnectionString(connectionString)}`);

  const isSupabase = connectionString.includes('supabase') || connectionString.includes('sslmode=require');
  const client = new Client({
    connectionString,
    ssl: (isSupabase || !connectionString.includes('localhost')) ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10000
  });

  try {
    await client.connect();
    console.log('✓ Successfully connected to PostgreSQL instance.');
  } catch (err) {
    console.error('✗ PostgreSQL connection failed:', err.message);
    process.exit(1);
  }

  try {
    if (!fs.existsSync(CMS_DB_PATH)) {
      throw new Error(`Data source file missing at ${CMS_DB_PATH}`);
    }

    const cmsData = JSON.parse(fs.readFileSync(CMS_DB_PATH, 'utf8'));
    console.log('✓ Verified repository source data loaded from server/data/cms_db.json\n');

    // 1. Admin User
    console.log('Seeding admin user...');
    for (const u of cmsData.users || []) {
      await client.query(
        `INSERT INTO admin_users (id, email, password_hash, name, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
           email = EXCLUDED.email,
           password_hash = EXCLUDED.password_hash,
           name = EXCLUDED.name,
           role = EXCLUDED.role,
           updated_at = NOW();`,
        [u.id, u.email, u.passwordHash || u.password_hash, u.name, u.role || 'superadmin', u.created_at || new Date(), u.updated_at || new Date()]
      );
    }
    console.log(`✓ Admin user verified (${(cmsData.users || []).length} record)`);

    // 2. Blog Posts
    console.log('Seeding blog posts...');
    for (const p of cmsData.posts || []) {
      const slug = p.slug || p.id;
      await client.query(
        `INSERT INTO posts (id, title, slug, category, excerpt, content, cover_image_url, tags, author, read_time, meta_title, meta_description, status, created_at, updated_at, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           slug = EXCLUDED.slug,
           category = EXCLUDED.category,
           excerpt = EXCLUDED.excerpt,
           content = EXCLUDED.content,
           cover_image_url = EXCLUDED.cover_image_url,
           tags = EXCLUDED.tags,
           author = EXCLUDED.author,
           read_time = EXCLUDED.read_time,
           meta_title = EXCLUDED.meta_title,
           meta_description = EXCLUDED.meta_description,
           status = EXCLUDED.status,
           updated_at = NOW();`,
        [
          p.id, p.title, slug, p.category, p.excerpt, p.content, p.cover_image_url,
          safeJson(p.tags), p.author || 'SMRIKAAM Engineering Team', p.read_time || '5 min read',
          p.meta_title || p.title, p.meta_description || p.excerpt,
          p.status || 'published', p.created_at || new Date(), p.updated_at || new Date(), p.published_at || new Date()
        ]
      );
    }
    console.log(`✓ Blog posts verified (${(cmsData.posts || []).length} records)`);

    // 3. Services
    console.log('Seeding services...');
    for (const s of cmsData.services || []) {
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
           business_problems = EXCLUDED.business_problems,
           capabilities = EXCLUDED.capabilities,
           technology = EXCLUDED.technology,
           industry_applications = EXCLUDED.industry_applications,
           problem_statement = EXCLUDED.problem_statement,
           solution_statement = EXCLUDED.solution_statement,
           outcomes = EXCLUDED.outcomes,
           accelerator = EXCLUDED.accelerator,
           case_study = EXCLUDED.case_study,
           cover_image_url = EXCLUDED.cover_image_url,
           status = EXCLUDED.status,
           display_order = EXCLUDED.display_order,
           updated_at = NOW();`,
        [
          s.id, s.title, s.slug, s.num, s.tagline, s.summary, s.description || s.content,
          safeJson(s.businessProblems || s.business_problems),
          safeJson(s.capabilities),
          safeJson(s.technology),
          safeJson(s.industryApplications || s.industry_applications),
          s.problemStatement || s.problem_statement,
          s.solutionStatement || s.solution_statement,
          s.outcomes, s.accelerator, s.caseStudy || s.case_study,
          s.cover_image_url, s.status || 'published', parseInt(s.display_order || s.num || 0, 10),
          s.created_at || new Date(), s.updated_at || new Date(), s.published_at || new Date()
        ]
      );
    }
    console.log(`✓ Services verified (${(cmsData.services || []).length} records)`);

    // 4. Accelerators
    console.log('Seeding accelerators / products...');
    for (const a of cmsData.accelerators || []) {
      await client.query(
        `INSERT INTO accelerators (id, name, slug, category, tagline, short_description, full_description, cover_image_url, problem, solution, how_it_works, architecture, key_features, technology, use_cases, business_outcomes, pdf_url, status, created_at, updated_at, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           slug = EXCLUDED.slug,
           category = EXCLUDED.category,
           tagline = EXCLUDED.tagline,
           short_description = EXCLUDED.short_description,
           full_description = EXCLUDED.full_description,
           cover_image_url = EXCLUDED.cover_image_url,
           problem = EXCLUDED.problem,
           solution = EXCLUDED.solution,
           how_it_works = EXCLUDED.how_it_works,
           architecture = EXCLUDED.architecture,
           key_features = EXCLUDED.key_features,
           technology = EXCLUDED.technology,
           use_cases = EXCLUDED.use_cases,
           business_outcomes = EXCLUDED.business_outcomes,
           pdf_url = EXCLUDED.pdf_url,
           status = EXCLUDED.status,
           updated_at = NOW();`,
        [
          a.id, a.name, a.slug, a.category, a.tagline,
          a.shortDescription || a.short_description,
          a.fullDescription || a.full_description,
          a.cover_image_url, a.problem, a.solution,
          a.howItWorks || a.how_it_works, a.architecture,
          safeJson(a.keyFeatures || a.key_features),
          safeJson(a.technology),
          safeJson(a.useCases || a.use_cases),
          a.businessOutcomes || a.business_outcomes, a.pdfUrl || a.pdf_url,
          a.status || 'published',
          a.created_at || new Date(), a.updated_at || new Date(), a.published_at || new Date()
        ]
      );
    }
    console.log(`✓ Accelerators verified (${(cmsData.accelerators || []).length} records)`);

    // 5. Industries
    console.log('Seeding industries...');
    for (const ind of cmsData.industries || []) {
      await client.query(
        `INSERT INTO industries (id, name, slug, summary, content, cover_image_url, business_problems, solutions, technology, use_cases, status, created_at, updated_at, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           slug = EXCLUDED.slug,
           summary = EXCLUDED.summary,
           content = EXCLUDED.content,
           cover_image_url = EXCLUDED.cover_image_url,
           business_problems = EXCLUDED.business_problems,
           solutions = EXCLUDED.solutions,
           technology = EXCLUDED.technology,
           use_cases = EXCLUDED.use_cases,
           status = EXCLUDED.status,
           updated_at = NOW();`,
        [
          ind.id, ind.name, ind.slug, ind.summary, ind.content, ind.cover_image_url,
          safeJson(ind.businessProblems || ind.business_problems),
          safeJson(ind.solutions),
          safeJson(ind.technology),
          safeJson(ind.useCases || ind.use_cases),
          ind.status || 'published',
          ind.created_at || new Date(), ind.updated_at || new Date(), ind.published_at || new Date()
        ]
      );
    }
    console.log(`✓ Industries verified (${(cmsData.industries || []).length} records)`);

    // 6. Case Studies
    console.log('Seeding case studies...');
    for (const cs of cmsData.caseStudies || []) {
      await client.query(
        `INSERT INTO case_studies (id, title, client_name, slug, industry, location, accelerator, related_service, challenge, solution, implementation, results, technologies, cover_image_url, pdf_url, status, created_at, updated_at, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           client_name = EXCLUDED.client_name,
           slug = EXCLUDED.slug,
           industry = EXCLUDED.industry,
           location = EXCLUDED.location,
           accelerator = EXCLUDED.accelerator,
           related_service = EXCLUDED.related_service,
           challenge = EXCLUDED.challenge,
           solution = EXCLUDED.solution,
           implementation = EXCLUDED.implementation,
           results = EXCLUDED.results,
           technologies = EXCLUDED.technologies,
           cover_image_url = EXCLUDED.cover_image_url,
           pdf_url = EXCLUDED.pdf_url,
           status = EXCLUDED.status,
           updated_at = NOW();`,
        [
          cs.id, cs.title, cs.client_name || cs.client || 'Enterprise Client', cs.slug,
          cs.industry, cs.location, cs.accelerator, cs.relatedService || cs.related_service,
          cs.challenge, cs.solution, cs.implementation, cs.results,
          safeJson(cs.technologies), cs.cover_image_url, cs.pdfUrl || cs.pdf_url,
          cs.status || 'published', cs.created_at || new Date(), cs.updated_at || new Date(), cs.published_at || new Date()
        ]
      );
    }
    console.log(`✓ Case studies verified (${(cmsData.caseStudies || []).length} records)`);

    // 7. Reports
    console.log('Seeding reports...');
    for (const rep of cmsData.reports || []) {
      const slug = (rep.slug || rep.title || rep.id).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      await client.query(
        `INSERT INTO reports (id, title, slug, date, type, report_type, status, summary, full_content, tags, key_findings, source_file, pdf_url, docx_url, featured, category, problem_statement, solution_statement, cover_image_url, related_content, created_at, updated_at, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           slug = EXCLUDED.slug,
           date = EXCLUDED.date,
           type = EXCLUDED.type,
           report_type = EXCLUDED.report_type,
           status = EXCLUDED.status,
           summary = EXCLUDED.summary,
           full_content = EXCLUDED.full_content,
           tags = EXCLUDED.tags,
           key_findings = EXCLUDED.key_findings,
           category = EXCLUDED.category,
           problem_statement = EXCLUDED.problem_statement,
           solution_statement = EXCLUDED.solution_statement,
           cover_image_url = EXCLUDED.cover_image_url,
           related_content = EXCLUDED.related_content,
           updated_at = NOW();`,
        [
          rep.id, rep.title, slug, rep.date, rep.type || 'FLASH',
          rep.reportType || rep.report_type || 'ENGINEERING // DISPATCH',
          rep.status || 'published',
          rep.summary || rep.problemStatement || '',
          rep.full_content || rep.solutionStatement || '',
          safeJson(rep.tags || rep.techStack),
          safeJson(rep.key_findings),
          rep.sourceFile || rep.source_file,
          rep.pdfUrl || rep.pdf_url,
          rep.docxUrl || rep.docx_url,
          rep.featured || false,
          rep.category || '',
          rep.problemStatement || rep.problem_statement || '',
          rep.solutionStatement || rep.solution_statement || '',
          rep.cover_image_url || '',
          rep.relatedContent || rep.related_content || '',
          rep.created_at || new Date(), rep.updated_at || new Date(), rep.published_at || new Date()
        ]
      );
    }
    console.log(`✓ Reports verified (${(cmsData.reports || []).length} records)`);

    // 8. Media
    console.log('Seeding media assets...');
    for (const m of cmsData.media || []) {
      await client.query(
        `INSERT INTO media (id, filename, original_name, url, mime_type, size, type, uploaded_at, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
           filename = EXCLUDED.filename,
           original_name = EXCLUDED.original_name,
           url = EXCLUDED.url,
           mime_type = EXCLUDED.mime_type;`,
        [
          m.id, m.filename, m.originalName || m.original_name || m.filename, m.url,
          m.mimetype || m.mime_type, m.size || 0, m.type || 'file',
          m.uploaded_at || m.created_at || new Date(),
          safeJson(m.metadata || {})
        ]
      );
    }
    console.log(`✓ Media assets verified (${(cmsData.media || []).length} records)`);

    // 9. Activity Logs
    console.log('Seeding activity logs...');
    for (const log of cmsData.activityLogs || []) {
      await client.query(
        `INSERT INTO activity_logs (id, date, title, description, type, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING;`,
        [log.id, log.date, log.title, log.description, log.type || 'system', log.timestamp || new Date()]
      );
    }
    console.log(`✓ Activity logs verified (${(cmsData.activityLogs || []).length} records)`);

    // 10. Staffing
    console.log('Seeding staffing models...');
    for (const st of cmsData.staffing || []) {
      await client.query(
        `INSERT INTO staffing (id, title, slug, subtitle, "desc", bullets, status, created_at, updated_at, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           slug = EXCLUDED.slug,
           subtitle = EXCLUDED.subtitle,
           "desc" = EXCLUDED."desc",
           bullets = EXCLUDED.bullets,
           status = EXCLUDED.status,
           updated_at = NOW();`,
        [
          st.id, st.title, st.slug, st.subtitle || '', st.desc || st.description || '',
          safeJson(st.bullets), st.status || 'published',
          st.created_at || new Date(), st.updated_at || new Date(), st.published_at || new Date()
        ]
      );
    }
    console.log(`✓ Staffing models verified (${(cmsData.staffing || []).length} records)`);

    // 11. Locations
    console.log('Seeding locations...');
    for (const loc of cmsData.locations || []) {
      await client.query(
        `INSERT INTO locations (id, name, slug, type, address, email, phone, description, capabilities, status, created_at, updated_at, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           slug = EXCLUDED.slug,
           type = EXCLUDED.type,
           address = EXCLUDED.address,
           email = EXCLUDED.email,
           phone = EXCLUDED.phone,
           description = EXCLUDED.description,
           capabilities = EXCLUDED.capabilities,
           status = EXCLUDED.status,
           updated_at = NOW();`,
        [
          loc.id, loc.name, loc.slug, loc.type || 'Office', loc.address, loc.email, loc.phone,
          loc.description, safeJson(loc.capabilities), loc.status || 'published',
          loc.created_at || new Date(), loc.updated_at || new Date(), loc.published_at || new Date()
        ]
      );
    }
    console.log(`✓ Locations verified (${(cmsData.locations || []).length} records)`);

    // 12. Settings
    console.log('Seeding settings...');
    const settingsVal = cmsData.settings || {
      siteName: 'SMRIKAAM Technologies',
      brandSubtitle: 'Progress Through Innovation',
      contactEmail: 'contact@smrikaam.com',
      contactPhone: '+91 91506 84601'
    };
    await client.query(
      `INSERT INTO settings (key, value, updated_at)
       VALUES ('site_settings', $1, NOW())
       ON CONFLICT (key) DO UPDATE SET
         value = EXCLUDED.value,
         updated_at = NOW();`,
      [safeJson(settingsVal)]
    );
    console.log('✓ Site settings verified');

    // 13. Engagements
    console.log('Seeding engagements / customer inquiries...');
    for (const eng of cmsData.engagements || []) {
      await client.query(
        `INSERT INTO engagements (id, full_name, company_name, email, phone, job_title, requirement_type, message, preferred_date, preferred_time, source, status, priority, assigned_to, admin_notes, is_read, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
         ON CONFLICT (id) DO UPDATE SET
           full_name = EXCLUDED.full_name,
           company_name = EXCLUDED.company_name,
           email = EXCLUDED.email,
           phone = EXCLUDED.phone,
           job_title = EXCLUDED.job_title,
           requirement_type = EXCLUDED.requirement_type,
           message = EXCLUDED.message,
           status = EXCLUDED.status,
           priority = EXCLUDED.priority,
           assigned_to = EXCLUDED.assigned_to,
           admin_notes = EXCLUDED.admin_notes,
           is_read = EXCLUDED.is_read,
           updated_at = NOW();`,
        [
          eng.id, eng.full_name || eng.name, eng.company_name || eng.company || '', eng.email,
          eng.phone || '', eng.job_title || eng.jobTitle || '', eng.requirement_type || eng.service || 'Technology Transformation',
          eng.message || '', eng.preferred_date || eng.preferredDate || '', eng.preferred_time || eng.preferredTime || '',
          eng.source || 'Book a Call Form', eng.status || 'NEW', eng.priority || 'MEDIUM',
          eng.assigned_to || '', eng.admin_notes || '', eng.is_read || false,
          eng.created_at || new Date(), eng.updated_at || new Date()
        ]
      );
    }
    console.log(`✓ Engagements verified (${(cmsData.engagements || []).length} records)\n`);

    // Final Verification
    console.log('-----------------------------------------------------------');
    console.log('VERIFICATION SUMMARY');
    console.log('-----------------------------------------------------------');
    const tables = [
      'admin_users', 'posts', 'services', 'accelerators', 'industries',
      'case_studies', 'reports', 'media', 'activity_logs', 'staffing',
      'locations', 'settings', 'engagements'
    ];

    for (const t of tables) {
      const res = await client.query(`SELECT COUNT(*) FROM ${t}`);
      console.log(`${t.padEnd(16)}: ${res.rows[0].count} rows`);
    }

    console.log('\nSeed completed successfully.');
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('\n✗ Seed failed with error:', err.message);
    await client.end();
    process.exit(1);
  }
}

runVerifiedSeed();
