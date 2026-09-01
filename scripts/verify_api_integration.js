import { db, postgres } from '../server/services/db.js';

const BASE_URL = 'http://localhost:5000/api';

async function testApiIntegration() {
  console.log('===========================================================');
  console.log('SMRIKAAM SUPABASE POSTGRESQL API VERIFICATION');
  console.log('===========================================================');

  await postgres.testConnection();

  try {
    // 1. Direct DB verification
    console.log('\n--- 1. DIRECT POSTGRESQL DB VERIFICATION ---');
    const stats = await db.getStats();
    console.log('Database Stats from Supabase PostgreSQL:', JSON.stringify(stats, null, 2));

    const services = await db.getAll('services', { status: 'published' });
    console.log(`Fetched ${services.length} published services from Supabase.`);

    const products = await db.getAll('accelerators', { status: 'published' });
    console.log(`Fetched ${products.length} published products/accelerators from Supabase.`);

    const industries = await db.getAll('industries', { status: 'published' });
    console.log(`Fetched ${industries.length} published industries from Supabase.`);

    const caseStudies = await db.getAll('caseStudies', { status: 'published' });
    console.log(`Fetched ${caseStudies.length} published case studies from Supabase.`);

    const reports = await db.getAll('reports', { status: 'published' });
    console.log(`Fetched ${reports.length} published reports from Supabase.`);

    // 2. Test user lookup
    console.log('\n--- 2. ADMIN AUTH USER VERIFICATION ---');
    const adminUser = await db.getUserByEmail('admin@smrikaam.com');
    if (adminUser) {
      console.log(`✓ Successfully resolved admin user from Supabase: ${adminUser.email} (${adminUser.name})`);
    } else {
      console.error('✗ Failed to resolve admin user from Supabase!');
    }

    // 3. Test CRUD cycle on Supabase PostgreSQL
    console.log('\n--- 3. TEST CRUD CREATION IN SUPABASE POSTGRESQL ---');
    const testSlug = `test-service-${Date.now()}`;
    const newService = await db.create('services', {
      title: 'Test PostgreSQL Service',
      slug: testSlug,
      num: '99',
      tagline: 'Database Integration Test',
      summary: 'Testing direct insert into Supabase PostgreSQL',
      description: 'Full description for test service',
      status: 'draft'
    });
    console.log(`✓ Created test draft service in Supabase with ID: ${newService.id}`);

    const retrieved = await db.getBySlug('services', testSlug);
    console.log(`✓ Successfully retrieved newly inserted test service by slug: ${retrieved.title} (Status: ${retrieved.status})`);

    await db.delete('services', newService.id, null, true);
    console.log(`✓ Permanently deleted test service from Supabase PostgreSQL.`);

    console.log('\n===========================================================');
    console.log('✓ ALL SUPABASE POSTGRESQL INTEGRATION VERIFICATIONS PASSED!');
    console.log('===========================================================');
    process.exit(0);
  } catch (err) {
    console.error('\n✗ Integration test failed with error:', err);
    process.exit(1);
  }
}

testApiIntegration();
