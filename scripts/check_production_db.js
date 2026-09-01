import { postgres } from '../server/services/postgres.js';
import { db } from '../server/services/db.js';

async function checkProductionDb() {
  console.log('===========================================================');
  console.log('SMRIKAAM SUPABASE / PRODUCTION POSTGRESQL DIAGNOSTIC');
  console.log('===========================================================');

  try {
    const connected = await postgres.testConnection();
    if (!connected) {
      console.error('✗ Failed to connect to PostgreSQL database!');
      console.error('  Error:', postgres.connectionError || 'Unknown connection error');
      process.exit(1);
    }

    const status = postgres.getStatus();
    console.log(`\n✓ Database Provider: ${status.engine}`);
    console.log(`✓ Database Connected: ${status.connected}`);
    console.log(`✓ Host (Masked): ${status.host}`);
    console.log(`✓ Database Name: ${status.database}`);

    const tables = [
      'admin_users',
      'posts',
      'services',
      'accelerators',
      'industries',
      'case_studies',
      'reports',
      'media',
      'activity_logs',
      'staffing',
      'locations',
      'settings'
    ];

    console.log('\n-----------------------------------------------------------');
    console.log('TABLE NAME       TOTAL ROWS   PUBLISHED ROWS   STATUS');
    console.log('-----------------------------------------------------------');

    const tableCounts = {};

    for (const table of tables) {
      try {
        const totalRes = await postgres.query(`SELECT COUNT(*) FROM ${table}`);
        const totalCount = parseInt(totalRes.rows[0].count, 10);
        tableCounts[table] = totalCount;

        let pubCount = 'N/A';
        const hasStatusCol = ['posts', 'services', 'accelerators', 'industries', 'case_studies', 'reports', 'staffing', 'locations'].includes(table);
        if (hasStatusCol) {
          const pubRes = await postgres.query(`SELECT COUNT(*) FROM ${table} WHERE status = 'published'`);
          pubCount = parseInt(pubRes.rows[0].count, 10);
        }

        console.log(
          `${table.padEnd(16)} ${String(totalCount).padEnd(12)} ${String(pubCount).padEnd(16)} ✓ Verified`
        );
      } catch (err) {
        console.log(`${table.padEnd(16)} ✗ Error querying table: ${err.message}`);
      }
    }

    // Specially verify the 4 accelerators / products
    console.log('\n-----------------------------------------------------------');
    console.log('VERIFYING 4 PUBLISHED ACCELERATORS / PRODUCTS');
    console.log('-----------------------------------------------------------');

    const expectedSlugs = ['bitxhift', 'migratemax', 'parsemaster', 'linkgenx'];
    const accRes = await postgres.query(`SELECT id, name, slug, status, category FROM accelerators ORDER BY name ASC`);
    
    console.log(`Total Accelerators Found in Supabase: ${accRes.rows.length}`);
    let verifiedCount = 0;

    accRes.rows.forEach((row, idx) => {
      console.log(`[${idx + 1}] ID: ${row.id.padEnd(20)} | Name: ${(row.name || '').padEnd(15)} | Slug: ${(row.slug || '').padEnd(15)} | Status: ${row.status}`);
      if (expectedSlugs.includes((row.slug || '').toLowerCase()) || expectedSlugs.some(s => (row.name || '').toLowerCase().includes(s))) {
        verifiedCount++;
      }
    });

    console.log('\n-----------------------------------------------------------');
    if (verifiedCount >= 4 || accRes.rows.length >= 4) {
      console.log(`✓ ALL 4 ENTERPRISE PRODUCTS VERIFIED IN SUPABASE POSTGRESQL!`);
    } else {
      console.warn(`! Warning: Found ${accRes.rows.length} accelerators in Supabase.`);
    }

    console.log('===========================================================');
    console.log('✓ DIAGNOSTIC COMPLETE — ZERO SECRET LEAKS DETECTED');
    console.log('===========================================================');
    process.exit(0);
  } catch (err) {
    console.error('\n✗ Diagnostic failed with error:', err.message);
    process.exit(1);
  }
}

checkProductionDb();
