import http from 'node:http';

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function testWorkbenchLiveFeed() {
  console.log('==============================================');
  console.log('TESTING LIVE CMS WORKBENCH FEED');
  console.log('==============================================');

  // 1. Fetch public reports
  const initialRes = await makeRequest({
    hostname: 'localhost',
    port: 5173,
    path: '/api/reports',
    method: 'GET'
  });

  console.log(`1. Initial GET /api/reports returned status ${initialRes.status}. Total published reports: ${initialRes.data?.length || 0}`);
  if (Array.isArray(initialRes.data) && initialRes.data.length > 0) {
    console.log(`   Top report: "${initialRes.data[0].title}" (${initialRes.data[0].date})`);
  }

  // 2. Admin Login
  const loginRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5173,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    { email: 'admin@smrikaam.com', password: 'AdminPassword2026!' }
  );

  if (!loginRes.data?.token) {
    console.error('Failed to log in as admin:', loginRes.data);
    return;
  }
  const token = loginRes.data.token;
  console.log('2. Admin logged in successfully. Token acquired.');

  // 3. Create and publish a new Flash Report
  const newReport = {
    reportType: 'Weekly',
    category: 'Services',
    title: 'Automated Edge Telemetry & Real-Time OPC-UA Ingestion',
    problemStatement: 'Legacy factory machinery lacks sub-50ms operational visibility across distributed production lines.',
    solutionStatement: 'Deployed BitXhift edge intelligence agents delivering continuous microsecond streaming telemetry.',
    techStack: ['Python', 'OPC-UA', 'MQTT', 'TimescaleDB', 'Docker'],
    date: '2026-08-28',
    cover_image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop',
    relatedContent: 'Industrial IoT (IIoT)',
    status: 'published'
  };

  const createRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5173,
      path: '/api/reports/admin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    },
    newReport
  );

  console.log(`3. Created report via Admin API. Status: ${createRes.status}. ID: ${createRes.data?.id}`);

  // 4. Verify newly created report is immediately returned at the top of /api/reports
  const verifyRes = await makeRequest({
    hostname: 'localhost',
    port: 5173,
    path: '/api/reports',
    method: 'GET'
  });

  console.log(`4. Verifying public GET /api/reports after publication:`);
  console.log(`   Total reports now: ${verifyRes.data?.length}`);
  const topReport = verifyRes.data?.[0];
  console.log(`   Top report title: "${topReport?.title}"`);
  console.log(`   Top report date: ${topReport?.date}`);
  console.log(`   Top report problem: ${topReport?.problemStatement}`);
  console.log(`   Top report solution: ${topReport?.solutionStatement}`);
  console.log(`   Top report tech stack: ${JSON.stringify(topReport?.techStack)}`);

  if (topReport?.title === newReport.title) {
    console.log('\n>>> SUCCESS: Newly published CMS report is dynamically live and ranked #1 at the top of the feed! <<<');
  } else {
    console.error('\n>>> ERROR: Top report did not match newly published report <<<');
  }
}

testWorkbenchLiveFeed().catch(console.error);
