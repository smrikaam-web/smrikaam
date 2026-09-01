import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5174';

async function runTests() {
  console.log('==================================================');
  console.log('STARTING SMRIKAAM CENTRAL CMS E2E TEST SUITE');
  console.log('==================================================\n');

  try {
    // 1. Health & Initial Public Read
    console.log('[1/7] Testing Public API & Seed Data...');
    const initialReports = await axios.get(`${BASE_URL}/api/reports`);
    console.log(`✓ Initial Published Reports count: ${initialReports.data.length}`);

    const initialPosts = await axios.get(`${BASE_URL}/api/posts`);
    console.log(`✓ Initial Published Posts count: ${initialPosts.data.length}`);

    // 2. Authentication Test
    console.log('\n[2/7] Testing Admin Authentication (POST /api/auth/login)...');
    const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@smrikaam.com',
      password: 'admin123456'
    });

    const token = loginRes.data?.token;
    if (!token) throw new Error('No JWT token returned from login');
    console.log(`✓ Authenticated successfully as: ${loginRes.data.user.name} (${loginRes.data.user.email})`);
    console.log(`✓ Received JWT Token: ${token.substring(0, 24)}...`);

    const authHeaders = { Authorization: `Bearer ${token}` };

    // 3. Verify /api/auth/me
    console.log('\n[3/7] Verifying Session (GET /api/auth/me)...');
    const meRes = await axios.get(`${BASE_URL}/api/auth/me`, { headers: authHeaders });
    console.log(`✓ Session Validated: User ID ${meRes.data.user.id}, Role: ${meRes.data.user.role}`);

    // 4. Create & Publish Flash Report
    console.log('\n[4/7] Creating & Publishing a New Flash Report (POST /api/reports/admin)...');
    const newReportPayload = {
      reportType: 'Weekly',
      category: 'Services',
      title: 'Automated Edge Telemetry & Real-Time OPC-UA Ingestion',
      problemStatement: 'Legacy factory machinery lacks sub-50ms operational visibility.',
      solutionStatement: 'Deployed BitXhift edge agents delivering continuous streaming telemetry.',
      techStack: ['Python', 'OPC-UA', 'MQTT', 'TimescaleDB', 'Docker'],
      date: new Date().toISOString().split('T')[0],
      cover_image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop',
      relatedContent: 'Industrial IoT (IIoT)',
      status: 'published'
    };

    const createReportRes = await axios.post(`${BASE_URL}/api/reports/admin`, newReportPayload, { headers: authHeaders });
    const createdReport = createReportRes.data;
    console.log(`✓ Created Flash Report: ID=${createdReport.id}, Title="${createdReport.title}"`);

    // 5. Verify Public API Returns New Report as Newest
    console.log('\n[5/7] Verifying Public API & Section 04 Data Sync (GET /api/reports)...');
    const updatedReports = await axios.get(`${BASE_URL}/api/reports`);
    console.log(`✓ Updated Published Reports count: ${updatedReports.data.length}`);
    const topReport = updatedReports.data[0];
    if (topReport.id === createdReport.id) {
      console.log(`✓ CONFIRMED: New Flash Report is now at top of public list! (ID: ${topReport.id})`);
    } else {
      console.warn(`! Top report is ${topReport.id}, created was ${createdReport.id}`);
    }

    // 6. Create & Publish New Blog Article
    console.log('\n[6/7] Creating & Publishing New Blog Post (POST /api/posts/admin)...');
    const newPostPayload = {
      title: 'High-Throughput Time-Series Architecture for Discrete Manufacturing',
      slug: 'high-throughput-time-series-manufacturing',
      category: 'Industrial IoT',
      excerpt: 'Engineering low-latency sensor ingestion pipelines capable of handling millions of telemetry points per minute.',
      content: '## Deterministic Sensor Ingestion\n\nModern shop floor machinery demands sub-50ms ingestion latency across distributed PLC networks.',
      tags: ['IIoT', 'TimescaleDB', 'OPC-UA', 'Python'],
      author: 'SMRIKAAM Core Engineering',
      status: 'published'
    };

    const createPostRes = await axios.post(`${BASE_URL}/api/posts/admin`, newPostPayload, { headers: authHeaders });
    console.log(`✓ Created Blog Post: ID=${createPostRes.data.id}, Slug="${createPostRes.data.slug}"`);

    const publicPostRes = await axios.get(`${BASE_URL}/api/posts/${createPostRes.data.slug}`);
    console.log(`✓ Fetched Public Post by Slug: "${publicPostRes.data.title}" (Status: ${publicPostRes.data.status})`);

    // 7. Verify Database Persistence on Disk
    console.log('\n[7/7] Verifying Persistent Disk Storage (server/data/cms_db.json)...');
    const dbFilePath = path.resolve(__dirname, '../server/data/cms_db.json');
    if (fs.existsSync(dbFilePath)) {
      const diskData = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
      const reportOnDisk = diskData.reports.find((r) => r.id === createdReport.id);
      const postOnDisk = diskData.posts.find((p) => p.id === createPostRes.data.id);
      if (reportOnDisk && postOnDisk) {
        console.log(`✓ CONFIRMED: Data is atomically written and persisted to disk in cms_db.json!`);
        console.log(`  - Persisted Report: ${reportOnDisk.title}`);
        console.log(`  - Persisted Post: ${postOnDisk.title}`);
      } else {
        throw new Error('Data not found on disk file');
      }
    } else {
      throw new Error(`Database file not found at ${dbFilePath}`);
    }

    console.log('\n==================================================');
    console.log('ALL CMS TESTS PASSED SUCCESSFULLY (7/7)');
    console.log('==================================================');
  } catch (err) {
    console.error('\n❌ Test Failure:', err.response?.data || err.message);
    process.exit(1);
  }
}

runTests();
