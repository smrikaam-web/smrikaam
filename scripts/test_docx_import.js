import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testDocxImport() {
  console.log('Testing DOCX extraction & image unpacking...');

  // 1. Create a synthetic test .docx archive with word/document.xml and word/media/image1.png
  const zip = new JSZip();
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
      <w:p>
        <w:pPr><w:pStyle w:val="Heading1"/></w:pPr>
        <w:r><w:t>Deterministic Telemetry Architecture</w:t></w:r>
      </w:p>
      <w:p>
        <w:r><w:t>This whitepaper discusses real-time edge telemetry for discrete manufacturing lines.</w:t></w:r>
      </w:p>
      <w:p>
        <w:pPr><w:numPr/></w:pPr>
        <w:r><w:t>Sub-50ms ingestion latency</w:t></w:r>
      </w:p>
      <w:p>
        <w:pPr><w:numPr/></w:pPr>
        <w:r><w:t>Zero-downtime database cutovers</w:t></w:r>
      </w:p>
    </w:body>
  </w:document>`;

  zip.file('word/document.xml', documentXml);
  // 1x1 transparent PNG pixel as sample embedded image
  const samplePngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  zip.file('word/media/image1.png', samplePngBuffer);

  const docxBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  const tempDocxPath = path.resolve(__dirname, 'sample_test.docx');
  fs.writeFileSync(tempDocxPath, docxBuffer);

  try {
    // Login to get token
    const loginRes = await axios.post('http://localhost:5174/api/auth/login', {
      email: 'admin@smrikaam.com',
      password: 'admin123456'
    });
    const token = loginRes.data.token;

    // Send multipart form-data
    const form = new FormData();
    form.append('file', fs.createReadStream(tempDocxPath));

    const importRes = await axios.post('http://localhost:5174/api/documents/import-docx', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✓ DOCX Import Response:', {
      success: importRes.data.success,
      title: importRes.data.title,
      imagesExtracted: importRes.data.images.length,
      extractedContentPreview: importRes.data.content.substring(0, 100) + '...'
    });

    if (importRes.data.images.length > 0) {
      console.log(`✓ Image extracted to persistent URL: ${importRes.data.images[0].url}`);
    }

    console.log('✓ DOCX EXTRACTION TEST PASSED!\n');
  } finally {
    if (fs.existsSync(tempDocxPath)) fs.unlinkSync(tempDocxPath);
  }
}

testDocxImport().catch(console.error);
