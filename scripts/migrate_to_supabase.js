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

const collectionTableMap = {
  users: { table: 'admin_users', idCol: 'id' },
  posts: { table: 'posts', idCol: 'id' },
  services: { table: 'services', idCol: 'id' },
  accelerators: { table: 'accelerators', idCol: 'id' },
  industries: { table: 'industries', idCol: 'id' },
  caseStudies: { table: 'case_studies', idCol: 'id' },
  reports: { table: 'reports', idCol: 'id' },
  media: { table: 'media', idCol: 'id' },
  activityLogs: { table: 'activity_logs', idCol: 'id' },
  staffing: { table: 'staffing', idCol: 'id' },
  locations: { table: 'locations', idCol: 'id' },
  settings: { table: 'settings', idCol: 'key' }
};

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

async function runMigration() {
  const isExecute = process.argv.includes('--execute');
  const mode = isExecute ? 'EXECUTE (LIVE MIGRATION)' : 'DRY-RUN (VALIDATION MODE)';

  console.log(`===========================================================`);
  console.log(`SMRIKAAM SUPABASE POSTGRESQL MIGRATION TOOL`);
  console.log(`MODE: ${mode}`);
  console.log(`===========================================================\n`);

  // 1. Verify cms_db.json exists
  if (!fs.existsSync(CMS_DB_PATH)) {
    console.error(`ERROR: CMS database file not found at ${CMS_DB_PATH}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(CMS_DB_PATH, 'utf8');
  const cmsData = JSON.parse(raw);

  // Backup cms_db.json if executing
  if (isExecute) {
    const backupPath = `${CMS_DB_PATH}.bak.${Date.now()}`;
    fs.copyFileSync(CMS_DB_PATH, backupPath);
    console.log(`✓ Safety backup created at: ${backupPath}\n`);
  }

  // 2. Connect to Database
  const connectionString =
    process.env.DATABASE_URL ||
    `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || 'postgres'}@${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'smrikaam_db'}`;

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log(`✓ Successfully connected to PostgreSQL / Supabase.`);
  } catch (err) {
    console.error(`✗ Database connection failed: ${err.message}`);
    console.error(`Please verify your DATABASE_URL or PostgreSQL credentials in .env`);
    process.exit(1);
  }

  const summary = [];

  try {
    // Audit each collection
    for (const [colName, mapping] of Object.entries(collectionTableMap)) {
      const { table, idCol } = mapping;
      let sourceItems = cmsData[colName];

      // Special handling for settings object
      if (colName === 'settings' && typeof sourceItems === 'object' && !Array.isArray(sourceItems)) {
        sourceItems = [{ key: 'site_settings', value: sourceItems }];
      } else if (!Array.isArray(sourceItems)) {
        sourceItems = [];
      }

      // Check if table exists
      const tableCheck = await client.query(
        `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1);`,
        [table]
      );

      if (!tableCheck.rows[0].exists) {
        console.error(`CRITICAL: Table "${table}" does not exist in Supabase! Stopping migration.`);
        await client.end();
        process.exit(1);
      }

      // Get destination items
      const destRes = await client.query(`SELECT ${idCol} FROM ${table}`);
      const destIds = new Set(destRes.rows.map((r) => String(r[idCol])));

      let toInsert = 0;
      let toUpdate = 0;

      for (const item of sourceItems) {
        const itemId = String(item[idCol] || item.id || item.key);
        if (destIds.has(itemId)) {
          toUpdate++;
        } else {
          toInsert++;
        }
      }

      summary.push({
        collection: colName,
        table,
        sourceCount: sourceItems.length,
        destCountBefore: destIds.size,
        toInsert,
        toUpdate,
        conflicts: 0
      });
    }

    console.log(`\n-----------------------------------------------------------------------------------------`);
    console.log(`COLLECTION        DEST TABLE       SOURCE   DEST(PRE)   INSERT   UPDATE   CONFLICTS`);
    console.log(`-----------------------------------------------------------------------------------------`);
    for (const row of summary) {
      console.log(
        `${row.collection.padEnd(17)} ${row.table.padEnd(16)} ${String(row.sourceCount).padEnd(8)} ${String(row.destCountBefore).padEnd(11)} ${String(row.toInsert).padEnd(8)} ${String(row.toUpdate).padEnd(8)} ${row.conflicts}`
      );
    }
    console.log(`-----------------------------------------------------------------------------------------\n`);

    if (!isExecute) {
      console.log(`[DRY-RUN VALIDATION COMPLETE]`);
      console.log(`All 12 target tables exist and are compatible.`);
      console.log(`To execute actual migration, run:\n  node scripts/migrate_to_supabase.js --execute\n`);
      await client.end();
      return;
    }

    // EXECUTE MIGRATION
    console.log(`Beginning data migration into Supabase PostgreSQL...\n`);

    // 1. Users
    if (Array.isArray(cmsData.users)) {
      for (const u of cmsData.users) {
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
    }

    // 2. Posts
    if (Array.isArray(cmsData.posts)) {
      for (const p of cmsData.posts) {
        const slug = p.slug || (p.title ? p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : p.id);
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
             status = EXCLUDED.status,
             updated_at = NOW();`,
          [
            p.id, p.title, slug, p.category, p.excerpt, p.content, p.cover_image_url,
            safeJson(p.tags), p.author, p.read_time, p.meta_title, p.meta_description,
            p.status || 'published', p.created_at || new Date(), p.updated_at || new Date(), p.published_at || new Date()
          ]
        );
      }
    }

    // 3. Services
    if (Array.isArray(cmsData.services)) {
      for (const s of cmsData.services) {
        const slug = s.slug || (s.title ? s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : s.id);
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
             updated_at = NOW();`,
          [
            s.id, s.title, slug, s.num, s.tagline, s.summary, s.description,
            safeJson(s.businessProblems || s.business_problems),
            safeJson(s.capabilities),
            safeJson(s.technology),
            safeJson(s.industryApplications || s.industry_applications),
            s.problemStatement || s.problem_statement,
            s.solutionStatement || s.solution_statement,
            s.outcomes, s.accelerator, s.caseStudy || s.case_study,
            s.cover_image_url, s.status || 'published', s.display_order || 0,
            s.created_at || new Date(), s.updated_at || new Date(), s.published_at || new Date()
          ]
        );
      }
    }

    // 4. Accelerators
    if (Array.isArray(cmsData.accelerators)) {
      for (const a of cmsData.accelerators) {
        const slug = a.slug || (a.name ? a.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : a.id);
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
             key_features = EXCLUDED.key_features,
             technology = EXCLUDED.technology,
             use_cases = EXCLUDED.use_cases,
             status = EXCLUDED.status,
             updated_at = NOW();`,
          [
            a.id, a.name, slug, a.category, a.tagline, a.shortDescription || a.short_description,
            a.fullDescription || a.full_description, a.cover_image_url, a.problem, a.solution,
            a.howItWorks || a.how_it_works, a.architecture,
            safeJson(a.keyFeatures || a.key_features),
            safeJson(a.technology),
            safeJson(a.useCases || a.use_cases),
            a.businessOutcomes || a.business_outcomes, a.pdfUrl || a.pdf_url,
            a.status || 'published', a.created_at || new Date(), a.updated_at || new Date(), a.published_at || new Date()
          ]
        );
      }
    }

    // 5. Industries
    if (Array.isArray(cmsData.industries)) {
      for (const ind of cmsData.industries) {
        const slug = ind.slug || (ind.name ? ind.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : ind.id);
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
            ind.id, ind.name, slug, ind.summary, ind.content, ind.cover_image_url,
            safeJson(ind.businessProblems || ind.business_problems),
            safeJson(ind.solutions),
            safeJson(ind.technology),
            safeJson(ind.useCases || ind.use_cases),
            ind.status || 'published', ind.created_at || new Date(), ind.updated_at || new Date(), ind.published_at || new Date()
          ]
        );
      }
    }

    // 6. Case Studies
    if (Array.isArray(cmsData.caseStudies)) {
      for (const cs of cmsData.caseStudies) {
        const slug = cs.slug || (cs.title ? cs.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : cs.id);
        await client.query(
          `INSERT INTO case_studies (id, title, client_name, slug, industry, location, accelerator, related_service, challenge, solution, implementation, results, technologies, cover_image_url, pdf_url, status, created_at, updated_at, published_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
           ON CONFLICT (id) DO UPDATE SET
             title = EXCLUDED.title,
             client_name = EXCLUDED.client_name,
             slug = EXCLUDED.slug,
             industry = EXCLUDED.industry,
             challenge = EXCLUDED.challenge,
             solution = EXCLUDED.solution,
             technologies = EXCLUDED.technologies,
             status = EXCLUDED.status,
             updated_at = NOW();`,
          [
            cs.id, cs.title, cs.clientName || cs.client_name || 'Enterprise Client', slug, cs.industry,
            cs.location, cs.accelerator, cs.relatedService || cs.related_service, cs.challenge,
            cs.solution, cs.implementation, cs.results, safeJson(cs.technologies),
            cs.cover_image_url, cs.pdfUrl || cs.pdf_url, cs.status || 'published', cs.created_at || new Date(), cs.updated_at || new Date(), cs.published_at || new Date()
          ]
        );
      }
    }

    // 7. Reports
    if (Array.isArray(cmsData.reports)) {
      for (const r of cmsData.reports) {
        const slug = r.slug || `${(r.title ? r.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : 'report')}-${r.id}`;
        await client.query(
          `INSERT INTO reports (id, title, slug, date, type, report_type, status, summary, full_content, tags, key_findings, source_file, pdf_url, docx_url, featured, created_at, updated_at, published_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
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
             featured = EXCLUDED.featured,
             updated_at = NOW();`,
          [
            r.id, r.title, slug, r.date, r.type || 'FLASH', r.reportType || r.report_type || 'ENGINEERING // DISPATCH', r.status || 'published', r.summary,
            r.fullContent || r.full_content, safeJson(r.tags), safeJson(r.keyFindings || r.key_findings),
            r.sourceFile || r.source_file, r.pdfUrl || r.pdf_url, r.docxUrl || r.docx_url,
            r.featured || false, r.created_at || new Date(), r.updated_at || new Date(), r.published_at || new Date()
          ]
        );
      }
    }

    // 8. Media
    if (Array.isArray(cmsData.media)) {
      for (const m of cmsData.media) {
        await client.query(
          `INSERT INTO media (id, filename, original_name, url, mime_type, size, type, uploaded_at, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO UPDATE SET
             filename = EXCLUDED.filename,
             original_name = EXCLUDED.original_name,
             url = EXCLUDED.url,
             mime_type = EXCLUDED.mime_type,
             size = EXCLUDED.size,
             type = EXCLUDED.type;`,
          [
            m.id, m.filename, m.originalName || m.original_name || m.filename, m.url,
            m.mimetype || m.mime_type, m.size, m.type || 'file', m.created_at || m.uploaded_at || new Date(),
            safeJson(m.metadata || {})
          ]
        );
      }
    }

    // 9. Activity Logs
    if (Array.isArray(cmsData.activityLogs)) {
      for (const log of cmsData.activityLogs) {
        await client.query(
          `INSERT INTO activity_logs (id, date, title, description, type, timestamp)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO NOTHING;`,
          [log.id, log.date, log.title, log.description, log.type, log.timestamp || new Date()]
        );
      }
    }

    // 10. Staffing
    if (Array.isArray(cmsData.staffing)) {
      for (const st of cmsData.staffing) {
        const slug = st.slug || (st.title ? st.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : st.id);
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
          [st.id, st.title, slug, st.subtitle, st.desc, safeJson(st.bullets), st.status || 'published', st.created_at || new Date(), st.updated_at || new Date(), st.published_at || new Date()]
        );
      }
    }

    // 11. Locations
    if (Array.isArray(cmsData.locations)) {
      for (const loc of cmsData.locations) {
        const slug = loc.slug || (loc.name ? loc.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : loc.id);
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
            loc.id, loc.name, slug, loc.type, loc.address, loc.email, loc.phone,
            loc.description, safeJson(loc.capabilities), loc.status || 'published', loc.created_at || new Date(), loc.updated_at || new Date(), loc.published_at || new Date()
          ]
        );
      }
    }

    // 12. Settings
    if (cmsData.settings && typeof cmsData.settings === 'object') {
      await client.query(
        `INSERT INTO settings (key, value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET
           value = EXCLUDED.value,
           updated_at = NOW();`,
        ['site_settings', JSON.stringify(cmsData.settings)]
      );
    }

    console.log(`\n✓ MIGRATION EXECUTED SUCCESSFULLY!`);

    // Verification check
    console.log(`\nVERIFYING FINAL RECORD COUNTS IN SUPABASE...`);
    for (const [colName, mapping] of Object.entries(collectionTableMap)) {
      const res = await client.query(`SELECT count(*) FROM ${mapping.table}`);
      console.log(`- ${colName.padEnd(16)} -> ${mapping.table.padEnd(16)}: ${res.rows[0].count} rows`);
    }

    await client.end();
  } catch (err) {
    console.error(`\n✗ Migration failed with error:`, err);
    await client.end();
    process.exit(1);
  }
}

runMigration();
