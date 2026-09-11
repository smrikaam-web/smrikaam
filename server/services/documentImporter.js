import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import JSZip from 'jszip';
import { cleanSlug } from '../utils/slug.js';

/**
 * Server-safe polyfills for PDF.js when running in headless / serverless environments (Vercel Lambda)
 * Ensures that missing browser DOM globals (DOMMatrix, ImageData, Path2D) do not crash module loading.
 */
function ensurePdfPolyfills() {
  if (typeof globalThis.DOMMatrix === 'undefined') {
    globalThis.DOMMatrix = class DOMMatrix {
      constructor() {
        this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
        this.m11 = 1; this.m12 = 0; this.m13 = 0; this.m14 = 0;
        this.m21 = 0; this.m22 = 1; this.m23 = 0; this.m24 = 0;
        this.m31 = 0; this.m32 = 0; this.m33 = 1; this.m34 = 0;
        this.m41 = 0; this.m42 = 0; this.m43 = 0; this.m44 = 1;
        this.is2D = true;
        this.isIdentity = true;
      }
      multiplySelf() { return this; }
      preMultiplySelf() { return this; }
      translate() { return this; }
      scale() { return this; }
      invertSelf() { return this; }
    };
  }

  if (typeof globalThis.ImageData === 'undefined') {
    globalThis.ImageData = class ImageData {
      constructor(width, height) {
        this.width = width;
        this.height = height;
        this.data = new Uint8ClampedArray(width * height * 4);
      }
    };
  }

  if (typeof globalThis.Path2D === 'undefined') {
    globalThis.Path2D = class Path2D {
      addPath() {}
    };
  }
}

const CATEGORY_KEYWORDS = {
  'Artificial Intelligence & Machine Learning': ['artificial intelligence', 'machine learning', 'ml', 'neural', 'classification', 'model', 'dataset', 'inference', 'vision', 'decision-making', 'predictive'],
  'Generative AI & LLM Systems': ['genai', 'llm', 'rag', 'gpt', 'vector', 'embedding', 'prompt', 'transformer', 'generative ai', 'agent'],
  'Industrial IoT (IIoT)': ['iiot', 'iot', 'sensor', 'edge', 'factory', 'telemetry', 'opc-ua', 'mqtt', 'scada', 'plc', 'machinery', 'manufacturing'],
  'Enterprise Data Engineering': ['data', 'pipeline', 'etl', 'cdc', 'lakehouse', 'spark', 'snowflake', 'bigquery', 'dbt', 'warehouse', 'sql', 'timescale'],
  'DevOps & Cloud Infrastructure': ['devops', 'cloud', 'kubernetes', 'k8s', 'docker', 'terraform', 'aws', 'azure', 'gcp', 'ci/cd', 'infrastructure', 'network'],
  'Data Governance & Security': ['governance', 'security', 'hipaa', 'gdpr', 'compliance', 'privacy', 'encryption', 'audit', 'rbac', 'iam', 'zero-trust'],
  'Integration Services': ['integration', 'api', 'microservices', 'kafka', 'event-driven', 'rest', 'graphql', 'webhook', 'middleware'],
  'ServiceNow Solutions': ['servicenow', 'itsm', 'itom', 'workflow', 'cmdb', 'incident', 'catalog'],
  'Technology Advisory': ['architecture', 'strategy', 'advisory', 'digital transformation', 'roadmap', 'modernization', 'tco'],
  'Staffing & Pod Augmentation': ['staffing', 'pod', 'augmentation', 'hiring', 'talent', 'resource', 'contract', 'team']
};

const COMMON_TAGS = [
  'AI', 'Machine Learning', 'Infrastructure', 'Cloud', 'IIoT', 'Telemetry',
  'Data Engineering', 'DevOps', 'Security', 'Zero-Trust', 'Microservices',
  'Kafka', 'Kubernetes', 'Python', 'Architecture', 'ServiceNow'
];

/**
 * Pure Node.js RGBA to PNG buffer encoder
 */
function encodePNG(width, height, rgbaBuffer) {
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    crcTable[n] = c;
  }
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }
  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(4 + 4 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4);
    data.copy(buf, 8);
    const crc = crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crc, 8 + len);
    return buf;
  }

  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = makeChunk('IHDR', ihdrData);

  const rowLen = width * 4;
  const scanlines = Buffer.alloc(height * (rowLen + 1));
  for (let y = 0; y < height; y++) {
    scanlines[y * (rowLen + 1)] = 0;
    rgbaBuffer.copy(scanlines, y * (rowLen + 1) + 1, y * rowLen, (y + 1) * rowLen);
  }

  const compressed = zlib.deflateSync(scanlines);
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdr, idat, iend]);
}

/**
 * Strips all empty / placeholder / artifact lines and cleans Markdown.
 */
export function cleanMarkdown(text) {
  if (!text || typeof text !== 'string') return '';

  let cleaned = text
    .replace(/\r\n/g, '\n')
    // Remove blank headings
    .replace(/^#{1,6}\s*$/gm, '')
    // Remove empty blockquotes
    .replace(/^>\s*$/gm, '')
    // Remove empty list markers
    .replace(/^[-*+]\s*$/gm, '')
    .replace(/^\d+\.\s*$/gm, '')
    // Remove broken image links
    .replace(/!\[[^\]]*\]\(\s*\)/g, '')
    .replace(/!\[[^\]]*\]\((undefined|null)\)/g, '')
    // Remove common placeholder phrases
    .replace(/\b(Article content coming soon|Transforming factories, operations, and enterprise systems|No description available|Content unavailable|undefined|null|N\/A)\b/gi, '')
    // Remove PDF page numbers and web footer lines
    .replace(/^page\s+\d+(\s+of\s+\d+)?$/gim, '')
    .replace(/^--\s*\d+\s+of\s+\d+\s*--$/gim, '')
    .replace(/^--\s*\[page break\]\s*--$/gim, '')
    // Consolidate redundant consecutive blank lines
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return cleaned;
}

/**
 * Intelligent Source-Driven Document Importer
 */
export async function parseDocument(file, uploadsDir) {
  const ext = path.extname(file.originalname).toLowerCase();
  const fileBuffer = fs.readFileSync(file.path);

  let rawText = '';
  let docTitle = '';
  let docAuthor = '';
  let docDate = '';
  let numPages = 1;
  const extractedImages = [];
  const contentBlocks = [];

  if (ext === '.pdf') {
    // 1. Safe Vercel-compatible PDF Parsing: ensure polyfills first, then lazy-load
    ensurePdfPolyfills();
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: fileBuffer });
    await parser.load();

    const info = await parser.getInfo();
    numPages = parser.doc ? parser.doc.numPages : 1;

    if (info && info.info) {
      if (info.info.Title && !info.info.Title.toLowerCase().includes('unspecified') && !info.info.Title.toLowerCase().includes('untitled')) {
        docTitle = info.info.Title.trim();
      }
      if (info.info.Author && !info.info.Author.toLowerCase().includes('anonymous') && !info.info.Author.toLowerCase().includes('unspecified')) {
        docAuthor = info.info.Author.trim();
      }
    }

    // Extract embedded images from PDF pages
    if (parser.doc) {
      try {
        for (let pNum = 1; pNum <= Math.min(numPages, 10); pNum++) {
          const page = await parser.doc.getPage(pNum);
          const ops = await page.getOperatorList();
          for (let idx = 0; idx < ops.fnArray.length; idx++) {
            if (ops.fnArray[idx] === 85 || ops.fnArray[idx] === 86) {
              const imgName = ops.argsArray[idx][0];
              await new Promise((resolve) => {
                page.objs.get(imgName, (img) => {
                  if (img && img.data && img.width >= 60 && img.height >= 60) {
                    try {
                      let imgBuffer;
                      let fileName;
                      if (img.kind === 3) {
                        // RGBA pixel buffer
                        imgBuffer = encodePNG(img.width, img.height, Buffer.from(img.data));
                        fileName = `pdf_img_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.png`;
                      } else if (img.data && img.data.length > 2000) {
                        imgBuffer = Buffer.from(img.data);
                        fileName = `pdf_img_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.jpg`;
                      }

                      if (imgBuffer && imgBuffer.length > 2000) {
                        const targetPath = path.join(uploadsDir, fileName);
                        fs.writeFileSync(targetPath, imgBuffer);
                        extractedImages.push({
                          filename: fileName,
                          url: `/uploads/${fileName}`,
                          size: imgBuffer.length,
                          width: img.width,
                          height: img.height
                        });
                      }
                    } catch (e) {
                      console.warn('Could not encode image:', e.message);
                    }
                  }
                  resolve();
                });
              });
            }
          }
        }
      } catch (err) {
        console.warn('PDF image extraction notice:', err.message);
      }
    }

    // Fallback image scanner: Check for direct JPEG markers if operator list missed them
    if (extractedImages.length === 0) {
      const binStr = fileBuffer.toString('binary');
      const jpegMatches = binStr.match(/\xFF\xD8\xFF[\s\S]+?\xFF\xD9/g) || [];
      let c = 0;
      for (const rawJpeg of jpegMatches) {
        if (rawJpeg.length > 4000) {
          const imgBuffer = Buffer.from(rawJpeg, 'binary');
          const fileName = `pdf_stream_${Date.now()}_${c++}.jpg`;
          fs.writeFileSync(path.join(uploadsDir, fileName), imgBuffer);
          extractedImages.push({
            filename: fileName,
            url: `/uploads/${fileName}`,
            size: imgBuffer.length
          });
          if (extractedImages.length >= 4) break;
        }
      }
    }

    // Extract text
    const textObj = await parser.getText();
    rawText = textObj.text || '';

    // Process PDF text lines
    const rawLines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    // Filter noise lines (page footers, page numbers)
    const cleanLines = rawLines.filter((line) => {
      if (/^page\s+\d+(\s+of\s+\d+)?$/i.test(line)) return false;
      if (/^--\s*\d+\s+of\s+\d+\s*--$/i.test(line)) return false;
      if (/www\.[a-z0-9\-\.]+\.[a-z]{2,}/i.test(line) && line.length < 90) return false;
      return true;
    });

    // Detect Author & Date from header lines
    let bodyStartIndex = 0;
    for (let i = 0; i < Math.min(5, cleanLines.length); i++) {
      const l = cleanLines[i];
      if (/author\s*:\s*([^|]+)/i.test(l)) {
        const match = l.match(/author\s*:\s*([^|]+)/i);
        docAuthor = match[1].trim();
        bodyStartIndex = Math.max(bodyStartIndex, i + 1);
      }
      if (/date\s*:\s*([^|]+)/i.test(l)) {
        const match = l.match(/date\s*:\s*([^|]+)/i);
        docDate = match[1].trim();
        bodyStartIndex = Math.max(bodyStartIndex, i + 1);
      }
      if (/by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/.test(l) && !docAuthor) {
        const match = l.match(/by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
        docAuthor = match[1].trim();
        bodyStartIndex = Math.max(bodyStartIndex, i + 1);
      }
    }

    // Detect Title from top lines if not found from metadata
    if (!docTitle || docTitle.toLowerCase().includes('untitled') || docTitle.toLowerCase().includes('brief')) {
      const titleLines = [];
      for (let i = 0; i < Math.max(1, bodyStartIndex); i++) {
        const line = cleanLines[i];
        if (!line.includes('Author:') && !line.includes('Published by') && !line.includes('Date:')) {
          titleLines.push(line);
        }
      }
      if (titleLines.length > 0) {
        docTitle = titleLines.join(' ').replace(/\s{2,}/g, ' ').trim();
      } else if (cleanLines.length > 0) {
        docTitle = cleanLines[0];
        bodyStartIndex = 1;
      }
    }

    // Build structured content from remaining lines
    let currentParagraph = [];
    for (let i = bodyStartIndex; i < cleanLines.length; i++) {
      const line = cleanLines[i];

      // Bullet points
      if (/^[•\-*–]\s+/.test(line)) {
        if (currentParagraph.length > 0) {
          contentBlocks.push(currentParagraph.join(' '));
          currentParagraph = [];
        }
        const bulletText = line.replace(/^[•\-*–]\s+/, '').trim();
        // Check if item has title like "Predictive Management: desc"
        if (/^([A-Za-z\s]+):\s+(.+)$/.test(bulletText)) {
          const m = bulletText.match(/^([A-Za-z\s]+):\s+(.+)$/);
          contentBlocks.push(`- **${m[1].trim()}:** ${m[2].trim()}`);
        } else {
          contentBlocks.push(`- ${bulletText}`);
        }
        continue;
      }

      // Numbered lists
      if (/^\d+\.\s+/.test(line)) {
        if (currentParagraph.length > 0) {
          contentBlocks.push(currentParagraph.join(' '));
          currentParagraph = [];
        }
        contentBlocks.push(line);
        continue;
      }

      // Headings (short line without period, capitalized or section title)
      const isHeading =
        line.length < 80 &&
        !line.endsWith('.') &&
        !line.endsWith(',') &&
        !line.endsWith(';') &&
        (line === line.toUpperCase() ||
          /^[A-Z][a-z0-9]+(\s+[A-Z][a-z0-9]+)+$/.test(line) ||
          /^(introduction|background|architecture|methodology|key benefits|implementation|results|conclusion|overview|summary)/i.test(line));

      if (isHeading) {
        if (currentParagraph.length > 0) {
          contentBlocks.push(currentParagraph.join(' '));
          currentParagraph = [];
        }
        contentBlocks.push(`\n## ${line}\n`);
        continue;
      }

      // Regular paragraph line
      currentParagraph.push(line);
    }

    if (currentParagraph.length > 0) {
      contentBlocks.push(currentParagraph.join(' '));
    }
  } else if (ext === '.docx' || ext === '.doc') {
    // 2. DOCX Parsing with JSZip
    const zip = await JSZip.loadAsync(fileBuffer);

    // Extract images from word/media/
    const imageFiles = Object.keys(zip.files).filter((fileName) => fileName.startsWith('word/media/'));
    for (const imgPath of imageFiles) {
      const imgFile = zip.file(imgPath);
      if (imgFile) {
        const imgBuffer = await imgFile.async('nodebuffer');
        if (imgBuffer.length > 2048) {
          const imgExt = path.extname(imgPath) || '.png';
          const imgFileName = `docx_img_${Date.now()}_${Math.random().toString(36).substr(2, 5)}${imgExt}`;
          fs.writeFileSync(path.join(uploadsDir, imgFileName), imgBuffer);
          extractedImages.push({
            filename: imgFileName,
            url: `/uploads/${imgFileName}`,
            size: imgBuffer.length
          });
        }
      }
    }

    // Extract core metadata if available
    const coreXml = zip.file('docProps/core.xml');
    if (coreXml) {
      const coreStr = await coreXml.async('string');
      const titleMatch = coreStr.match(/<dc:title(?:\s[^>]*)?>(.*?)<\/dc:title>/i);
      if (titleMatch && titleMatch[1].trim()) docTitle = titleMatch[1].trim();
      const creatorMatch = coreStr.match(/<dc:creator(?:\s[^>]*)?>(.*?)<\/dc:creator>/i);
      if (creatorMatch && creatorMatch[1].trim()) docAuthor = creatorMatch[1].trim();
    }

    // Extract document.xml text and tables
    const docXml = zip.file('word/document.xml');
    if (docXml) {
      const xmlStr = await docXml.async('string');

      // Table extraction
      const tableMatches = xmlStr.match(/<w:tbl(?:\s|>).*?<\/w:tbl>/gs) || [];
      const tablesAsMarkdown = [];
      for (const tblXml of tableMatches) {
        const rowMatches = tblXml.match(/<w:tr(?:\s|>).*?<\/w:tr>/gs) || [];
        const rows = [];
        for (const trXml of rowMatches) {
          const cellMatches = trXml.match(/<w:tc(?:\s|>).*?<\/w:tc>/gs) || [];
          const cells = cellMatches.map((tc) => {
            const tMatches = tc.match(/<w:t(?:\s|>).*?<\/w:t>/gs) || [];
            return tMatches.map((t) => t.replace(/<[^>]+>/g, '')).join(' ').trim();
          });
          if (cells.some((c) => c.length > 0)) {
            rows.push(cells);
          }
        }
        if (rows.length > 1) {
          const header = `| ${rows[0].join(' | ')} |`;
          const sep = `| ${rows[0].map(() => '---').join(' | ')} |`;
          const body = rows.slice(1).map((r) => `| ${r.join(' | ')} |`).join('\n');
          tablesAsMarkdown.push(`${header}\n${sep}\n${body}`);
        }
      }

      // Paragraph extraction
      const pMatches = xmlStr.match(/<w:p(?:\s|>).*?<\/w:p>/gs) || [];
      for (const pXml of pMatches) {
        const tMatches = pXml.match(/<w:t(?:\s|>).*?<\/w:t>/gs) || [];
        const text = tMatches.map((t) => t.replace(/<[^>]+>/g, '')).join('').trim();
        if (!text) continue;

        const isHeading1 = /<w:pStyle\s+w:val="Heading1"/i.test(pXml) || /<w:pStyle\s+w:val="1"/i.test(pXml);
        const isHeading2 = /<w:pStyle\s+w:val="Heading2"/i.test(pXml) || /<w:pStyle\s+w:val="2"/i.test(pXml);
        const isHeading3 = /<w:pStyle\s+w:val="Heading3"/i.test(pXml) || /<w:pStyle\s+w:val="3"/i.test(pXml);
        const isList = /<w:numPr>/i.test(pXml);

        if (isHeading1) {
          contentBlocks.push(`\n## ${text}\n`);
          if (!docTitle) docTitle = text;
        } else if (isHeading2) {
          contentBlocks.push(`\n### ${text}\n`);
        } else if (isHeading3) {
          contentBlocks.push(`\n#### ${text}\n`);
        } else if (isList) {
          contentBlocks.push(`- ${text}`);
        } else {
          contentBlocks.push(text);
        }
      }

      // Append extracted tables
      if (tablesAsMarkdown.length > 0) {
        contentBlocks.push('\n\n### Document Data Tables\n\n' + tablesAsMarkdown.join('\n\n'));
      }
    }
  }

  // Fallback title detection: Never use raw filename or "it_blog_article" unless nothing else exists
  if (!docTitle || docTitle.toLowerCase().includes('untitled') || docTitle.toLowerCase().includes('new blog')) {
    const firstGoodBlock = contentBlocks.find((b) => b.length > 5 && !b.startsWith('#') && !b.startsWith('-'));
    if (firstGoodBlock) {
      docTitle = firstGoodBlock.slice(0, 80).replace(/^[#\-\*\s]+/, '').trim();
    } else {
      docTitle = path.basename(file.originalname, ext).replace(/[-_]+/g, ' ');
    }
  }

  // Sanitize title
  docTitle = docTitle.replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim();

  // Automatic Slug
  const slug = cleanSlug(docTitle);

  // Detect Category
  const fullTextContent = contentBlocks.join(' ').toLowerCase();
  let suggestedCategory = '';
  let maxScore = 0;

  for (const [catName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    keywords.forEach((kw) => {
      if (fullTextContent.includes(kw)) score++;
    });
    if (score > maxScore) {
      maxScore = score;
      suggestedCategory = catName;
    }
  }

  // Detect Tags
  const suggestedTags = [];
  COMMON_TAGS.forEach((tag) => {
    if (fullTextContent.includes(tag.toLowerCase()) && !suggestedTags.includes(tag)) {
      suggestedTags.push(tag);
    }
  });

  // Extract Excerpt from first meaningful narrative paragraph
  const narrativeParagraphs = contentBlocks.filter(
    (b) => !b.startsWith('#') && !b.startsWith('-') && !b.startsWith('|') && b.length > 40
  );
  let excerpt = '';
  if (narrativeParagraphs.length > 0) {
    excerpt = narrativeParagraphs[0].slice(0, 240).trim();
    if (narrativeParagraphs[0].length > 240) excerpt += '...';
  }

  // Position extracted images in content
  let markdownBody = contentBlocks.join('\n\n');
  if (extractedImages.length > 1) {
    // Insert secondary image inside the article
    const secondaryImages = extractedImages.slice(1);
    markdownBody += '\n\n' + secondaryImages.map((img, i) => `![Figure ${i + 1}: Architectural Overview](${img.url})`).join('\n\n');
  }

  // Clean all blank/placeholder content
  const cleanedContent = cleanMarkdown(markdownBody);

  // Set Featured Image (first image)
  const featuredImage = extractedImages.length > 0 ? extractedImages[0].url : '';

  return {
    sourceType: ext.replace('.', '').toUpperCase(),
    sourceFileName: file.originalname,
    numPages,
    title: docTitle,
    slug,
    category: suggestedCategory,
    excerpt,
    content: cleanedContent,
    cover_image_url: featuredImage,
    tags: suggestedTags.slice(0, 6),
    author: docAuthor, // DO NOT invent generic author if empty
    date: docDate,
    meta_title: docTitle ? `${docTitle} | SMRIKAAM Technical Insights` : '',
    meta_description: excerpt,
    extractedImages,
    sectionsCount: (cleanedContent.match(/^##\s+.+$/gm) || []).length,
    paragraphsCount: narrativeParagraphs.length,
    status: 'draft' // ALWAYS DRAFT ON IMPORT
  };
}
