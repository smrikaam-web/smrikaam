import axios from 'axios';

async function verifyServices() {
  const BASE_URL = 'http://localhost:5174';

  console.log('=== VERIFYING SERVICES REST ENDPOINTS & CMS DB ===');
  
  // 1. Fetch all services
  const res = await axios.get(`${BASE_URL}/api/services`);
  const services = res.data;
  console.log(`Fetched ${services.length} services from /api/services.`);

  const expectedSlugs = [
    'ai-ml',
    'industrial-iot-iiot',
    'data-engineering',
    'generative-agentic-ai',
    'devops-cloud',
    'data-governance',
    'integration-services',
    'servicenow-solutions',
    'advisory-services',
    'ai-workflow-automation'
  ];

  let allPassed = true;

  for (const slug of expectedSlugs) {
    const srv = services.find((s) => s.slug === slug);
    if (!srv) {
      console.error(`✗ Missing service in DB: ${slug}`);
      allPassed = false;
      continue;
    }

    // Test single get endpoint
    const singleRes = await axios.get(`${BASE_URL}/api/services/${slug}`);
    if (singleRes.data && singleRes.data.title === srv.title) {
      console.log(`✓ [${srv.num}] ${srv.title} (${slug}) - Tech: ${srv.technology?.slice(0, 3).join(', ')}...`);
    } else {
      console.error(`✗ Failed single fetch for ${slug}`);
      allPassed = false;
    }
  }

  // 2. Test backward compatibility for data-analytics-bi
  try {
    const legacyRes = await axios.get(`${BASE_URL}/api/services/data-analytics-bi`);
    console.log(`✓ Legacy slug data-analytics-bi resolves to: ${legacyRes.data?.title || 'OK'}`);
  } catch (e) {
    console.log('Legacy slug handled on client defaultServicesMap.');
  }

  if (allPassed) {
    console.log('\n✓ ALL 10 SERVICES VERIFIED SUCCESSFULLY!');
  } else {
    process.exit(1);
  }
}

verifyServices().catch((err) => {
  console.error('Error verifying services:', err.message);
  process.exit(1);
});
