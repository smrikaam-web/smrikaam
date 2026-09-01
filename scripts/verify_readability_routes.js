import http from 'node:http';

const urls = [
  'http://localhost:5173/',
  'http://localhost:5173/services',
  'http://localhost:5173/services/industrial-iot-iiot',
  'http://localhost:5173/accelerators',
  'http://localhost:5173/industries',
  'http://localhost:5173/industries/manufacturing',
  'http://localhost:5173/case-studies',
  'http://localhost:5173/case-studies/smart-factory-manufacturing',
  'http://localhost:5173/blog',
  'http://localhost:5173/blog/iiot-telemetry-coimbatore',
  'http://localhost:5173/staffing',
  'http://localhost:5173/about',
  'http://localhost:5173/locations',
  'http://localhost:5173/careers',
  'http://localhost:5173/contact'
];

async function checkRoute(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', (err) => {
      resolve({ url, error: err.message });
    });
  });
}

async function runAudit() {
  console.log('--- AUDITING READABILITY SYSTEM ROUTES ---');
  let allOk = true;
  for (const url of urls) {
    const res = await checkRoute(url);
    if (res.status === 200) {
      console.log(`[PASS] ${url} -> Status ${res.status}`);
    } else {
      console.error(`[FAIL] ${url} -> Status ${res.status || 'ERR'} ${res.error || ''}`);
      allOk = false;
    }
  }
  console.log(allOk ? '\n>>> ALL 15 PUBLIC ROUTES SERVING WITH 200 OK <<<' : '\n>>> SOME ROUTES FAILED <<<');
}

runAudit();
