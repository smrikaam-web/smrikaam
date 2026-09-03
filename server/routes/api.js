import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';
import { db } from '../services/db.js';
import { authenticateUser, requireAdminAuth, verifyToken } from '../services/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Uploads directory: on serverless (AWS Lambda / Vercel), /var/task is read-only, so use /tmp/uploads
const isServerless = Boolean(process.env.VERCEL) ||
  Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
  Boolean(process.env.LAMBDA_TASK_ROOT) ||
  process.env.NODE_ENV === 'production';

let UPLOADS_DIR = isServerless ? path.resolve('/tmp', 'uploads') : path.resolve(__dirname, '../../public/uploads');
try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (err) {
  UPLOADS_DIR = path.resolve('/tmp', 'uploads');
  if (!fs.existsSync(UPLOADS_DIR)) {
    try {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    } catch (e) {
      // Ignored in serverless
    }
  }
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    cb(null, `${baseName}_${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExts = ['.png', '.jpg', '.jpeg', '.webp', '.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type ${ext}. Allowed: PNG, JPG, JPEG, WEBP, PDF, DOC, DOCX`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB
});

export const router = express.Router();

// Protect any /api/admin/* endpoint
router.use('/admin', requireAdminAuth);

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const { token, user } = await authenticateUser(email, password, ip);

    // Set secure cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ token, user });
  } catch (err) {
    res.status(401).json({ error: err.message || 'Authentication failed.' });
  }
});

router.post('/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

router.get('/auth/me', async (req, res) => {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ user: null });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ user: null });
  }

  const user = await db.getUserById(decoded.userId);

  if (!user) {
    return res.status(401).json({ user: null });
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

router.post('/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  await db.logActivity('Password Reset Requested', `Password reset token generated for ${email}`, 'auth_reset');
  res.json({
    success: true,
    message: 'If the email exists in our system, a password reset authorization code has been dispatched.'
  });
});

// ============================================================
// 2. RESOURCE CRUD ROUTE GENERATOR
// ============================================================

function createResourceRoutes(resourcePath, collectionName) {
  // Public list (Published only)
  router.get(`/${resourcePath}`, async (req, res) => {
    try {
      const { category, type, search, limit, sort } = req.query;
      const items = await db.getAll(collectionName, {
        status: 'published',
        category,
        type,
        search,
        limit: limit ? parseInt(limit, 10) : undefined,
        sort: sort || 'newest'
      });
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: `Failed to fetch ${resourcePath}` });
    }
  });

  // Public single item by ID or Slug
  router.get(`/${resourcePath}/:idOrSlug`, async (req, res) => {
    try {
      const { idOrSlug } = req.params;
      let item = await db.getById(collectionName, idOrSlug);
      if (!item) {
        item = await db.getBySlug(collectionName, idOrSlug);
      }

      if (!item || item.status !== 'published') {
        return res.status(404).json({ error: 'Item not found or not published.' });
      }

      res.json(item);
    } catch (err) {
      res.status(500).json({ error: `Failed to fetch ${resourcePath} item` });
    }
  });

  // Admin: Get all items (all statuses)
  router.get(`/${resourcePath}/admin/all`, requireAdminAuth, async (req, res) => {
    try {
      const { status, category, type, search, limit, sort } = req.query;
      const items = await db.getAll(collectionName, {
        status: status || 'all',
        category,
        type,
        search,
        limit: limit ? parseInt(limit, 10) : undefined,
        sort: sort || 'newest'
      });
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: `Failed to fetch admin ${resourcePath}` });
    }
  });

  // Admin: Create item
  router.post(`/${resourcePath}/admin`, requireAdminAuth, async (req, res) => {
    try {
      const created = await db.create(collectionName, req.body, req.user);
      res.status(201).json(created);
    } catch (err) {
      res.status(400).json({ error: err.message || `Failed to create ${resourcePath}` });
    }
  });

  // Admin: Update item
  router.put(`/${resourcePath}/admin/:id`, requireAdminAuth, async (req, res) => {
    try {
      const updated = await db.update(collectionName, req.params.id, req.body, req.user);
      if (!updated) {
        return res.status(404).json({ error: 'Item not found.' });
      }
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message || `Failed to update ${resourcePath}` });
    }
  });

  // Admin: Change status (Publish / Unpublish / Draft / Trash)
  router.patch(`/${resourcePath}/admin/:id/status`, requireAdminAuth, async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: 'Status is required.' });
      }
      const updated = await db.updateStatus(collectionName, req.params.id, status, req.user);
      if (!updated) {
        return res.status(404).json({ error: 'Item not found.' });
      }
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message || `Failed to update status` });
    }
  });

  // Admin: Delete item (soft delete to trash, or permanent if in trash)
  router.delete(`/${resourcePath}/admin/:id`, requireAdminAuth, async (req, res) => {
    try {
      const { permanent } = req.query;
      const success = await db.delete(collectionName, req.params.id, req.user, permanent === 'true');
      if (!success) {
        return res.status(404).json({ error: 'Item not found.' });
      }
      res.json({ success: true, message: permanent === 'true' ? 'Permanently deleted' : 'Moved to trash' });
    } catch (err) {
      res.status(500).json({ error: `Failed to delete ${resourcePath} item` });
    }
  });

  // Admin: Restore from trash
  router.post(`/${resourcePath}/admin/:id/restore`, requireAdminAuth, async (req, res) => {
    try {
      const restored = await db.restore(collectionName, req.params.id, req.user);
      if (!restored) {
        return res.status(404).json({ error: 'Item not found in trash.' });
      }
      res.json(restored);
    } catch (err) {
      res.status(500).json({ error: `Failed to restore item` });
    }
  });

  // Admin: Bulk Actions
  router.post(`/${resourcePath}/admin/bulk`, requireAdminAuth, async (req, res) => {
    try {
      const { ids, action } = req.body;
      if (!ids || !Array.isArray(ids) || !action) {
        return res.status(400).json({ error: 'IDs array and action required.' });
      }
      const affected = await db.bulkAction(collectionName, ids, action, req.user);
      res.json({ success: true, affectedCount: affected });
    } catch (err) {
      res.status(500).json({ error: `Failed to execute bulk action` });
    }
  });
}

// Register all resources
createResourceRoutes('posts', 'posts');
createResourceRoutes('services', 'services');
createResourceRoutes('accelerators', 'accelerators');
createResourceRoutes('products', 'accelerators');
createResourceRoutes('industries', 'industries');
createResourceRoutes('case-studies', 'caseStudies');
createResourceRoutes('reports', 'reports');
createResourceRoutes('staffing', 'staffing');
createResourceRoutes('locations', 'locations');

// ============================================================
// 3. MEDIA UPLOAD & LIBRARY
// ============================================================

router.get('/media', requireAdminAuth, async (req, res) => {
  try {
    const { type, search } = req.query;
    let items = [];
    if (db.usePostgres()) {
      try {
        items = await db.getAll('media', { status: 'all' });
      } catch (e) {
        items = [];
      }
    }
    if (!items || items.length === 0) {
      items = db.getCollection('media');
    }
    if (type && type !== 'all') {
      items = items.filter((m) => m.type === type);
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((m) => (m.originalName || m.filename || '').toLowerCase().includes(q));
    }
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch media library.' });
  }
});

router.post('/media/upload', requireAdminAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    let type = 'file';
    if (['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'].includes(ext)) {
      type = 'image';
    } else if (ext === '.pdf') {
      type = 'pdf';
    } else if (['.doc', '.docx'].includes(ext)) {
      type = 'document';
    }

    const publicUrl = `/uploads/${req.file.filename}`;

    const mediaItem = {
      id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: publicUrl,
      mimetype: req.file.mimetype,
      size: req.file.size,
      type,
      created_at: new Date().toISOString()
    };

    if (db.usePostgres()) {
      try {
        await db.create('media', mediaItem, req.user);
      } catch (err) {
        console.warn('Postgres media insert warning:', err.message);
      }
    }

    const mediaCollection = db.getCollection('media');
    mediaCollection.unshift(mediaItem);
    db.save();

    await db.logActivity(`Uploaded ${type}: "${req.file.originalname}"`, `Saved as ${publicUrl}`, 'media_upload');

    res.status(201).json(mediaItem);
  } catch (err) {
    res.status(500).json({ error: err.message || 'File upload failed.' });
  }
});

router.delete('/media/:id', requireAdminAuth, async (req, res) => {
  try {
    let item = null;
    if (db.usePostgres()) {
      try {
        item = await db.getById('media', req.params.id);
      } catch (e) {
        item = null;
      }
    }

    const mediaCollection = db.getCollection('media');
    const index = mediaCollection.findIndex((m) => m.id === req.params.id);
    if (!item && index !== -1) {
      item = mediaCollection[index];
    }

    if (!item && index === -1) {
      return res.status(404).json({ error: 'Media file not found.' });
    }

    if (item && item.filename) {
      const candidatePaths = [
        path.join(UPLOADS_DIR, item.filename),
        path.join('/tmp', 'uploads', item.filename),
        path.resolve(__dirname, '../../public/uploads', item.filename)
      ];

      for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
          try {
            fs.unlinkSync(p);
          } catch (e) {
            // Suppress EROFS cleanly on serverless read-only filesystems (/var/task)
            if (e.code !== 'EROFS') {
              console.warn('Could not delete file from disk:', e.message);
            }
          }
        }
      }
    }

    if (db.usePostgres()) {
      try {
        await db.delete('media', req.params.id, req.user, true);
      } catch (err) {
        console.warn('Postgres media delete warning:', err.message);
      }
    }

    if (index !== -1) {
      mediaCollection.splice(index, 1);
      db.save();
    }

    const fileLabel = item?.originalName || item?.filename || req.params.id;
    await db.logActivity(`Deleted media file: "${fileLabel}"`, `Removed by Admin`, 'media_delete');

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete media item.' });
  }
});

// ============================================================
// 4. DOCX EXTRACTION & PDF UPLOADS & SMART DOCUMENT IMPORTER
// ============================================================

router.post('/documents/import-smart', requireAdminAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF or DOCX file uploaded.' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    if (!['.pdf', '.docx', '.doc'].includes(ext)) {
      return res.status(400).json({ error: 'Unsupported file format. Please upload a PDF or DOCX document.' });
    }

    // Lazy load documentImporter only when an import request arrives
    const { parseDocument } = await import('../services/documentImporter.js');

    // Process document structure, text, metadata, and embedded images
    const parsedData = await parseDocument(req.file, UPLOADS_DIR);

    // Save extracted images to media collection
    if (parsedData.extractedImages && parsedData.extractedImages.length > 0) {
      parsedData.extractedImages.forEach((img) => {
        db.getCollection('media').unshift({
          id: `med_doc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          filename: img.filename,
          originalName: req.file.originalname,
          url: img.url,
          mimetype: 'image/png',
          size: img.size,
          type: 'image',
          created_at: new Date().toISOString()
        });
      });
    }

    db.save();
    db.logActivity(
      `Smart Import: "${req.file.originalname}" (${parsedData.sourceType})`,
      `Extracted ${parsedData.extractedImages.length} images, detected title "${parsedData.title}", assigned status DRAFT`,
      'document_import'
    );

    res.json({
      success: true,
      data: parsedData
    });
  } catch (err) {
    console.error('Smart Document Importer error:', err);
    res.status(500).json({ error: `Document import failed: ${err.message}` });
  }
});

router.post('/documents/import-docx', requireAdminAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No DOCX file uploaded.' });
    }

    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);

    // Unpack with JSZip
    const zip = await JSZip.loadAsync(fileBuffer);

    // 1. Extract embedded images from word/media/
    const extractedImages = [];
    const imageFiles = Object.keys(zip.files).filter((fileName) => fileName.startsWith('word/media/'));

    for (const imgPath of imageFiles) {
      const imgFile = zip.file(imgPath);
      if (imgFile) {
        const imgBuffer = await imgFile.async('nodebuffer');
        const imgExt = path.extname(imgPath) || '.png';
        const imgFileName = `docx_extracted_${Date.now()}_${Math.random().toString(36).substr(2, 6)}${imgExt}`;
        const targetImgPath = path.join(UPLOADS_DIR, imgFileName);

        fs.writeFileSync(targetImgPath, imgBuffer);

        const imgUrl = `/uploads/${imgFileName}`;
        extractedImages.push({
          originalPath: imgPath,
          url: imgUrl,
          filename: imgFileName
        });

        // Add to media collection
        db.getCollection('media').unshift({
          id: `med_docx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          filename: imgFileName,
          originalName: path.basename(imgPath),
          url: imgUrl,
          mimetype: `image/${imgExt.replace('.', '')}`,
          size: imgBuffer.length,
          type: 'image',
          created_at: new Date().toISOString()
        });
      }
    }

    // 2. Parse document.xml for text, headings, and paragraphs
    let extractedContent = '';
    let extractedTitle = path.basename(req.file.originalname, path.extname(req.file.originalname));
    const docXmlFile = zip.file('word/document.xml');

    if (docXmlFile) {
      const xmlString = await docXmlFile.async('string');

      // Simple XML element regex extractor for paragraphs
      const pMatches = xmlString.match(/<w:p(?:\s|>).*?<\/w:p>/gs) || [];
      const lines = [];

      for (const pXml of pMatches) {
        // Extract text runs inside paragraph
        const tMatches = pXml.match(/<w:t(?:\s|>).*?<\/w:t>/gs) || [];
        const pText = tMatches
          .map((t) => t.replace(/<[^>]+>/g, ''))
          .join('')
          .trim();

        if (!pText) continue;

        // Check if heading
        const isHeading1 = /<w:pStyle\s+w:val="Heading1"/i.test(pXml) || /<w:pStyle\s+w:val="1"/i.test(pXml);
        const isHeading2 = /<w:pStyle\s+w:val="Heading2"/i.test(pXml) || /<w:pStyle\s+w:val="2"/i.test(pXml);
        const isHeading3 = /<w:pStyle\s+w:val="Heading3"/i.test(pXml) || /<w:pStyle\s+w:val="3"/i.test(pXml);
        const isList = /<w:numPr>/i.test(pXml);

        if (isHeading1) {
          lines.push(`\n## ${pText}\n`);
          if (lines.length === 1) extractedTitle = pText;
        } else if (isHeading2) {
          lines.push(`\n### ${pText}\n`);
        } else if (isHeading3) {
          lines.push(`\n#### ${pText}\n`);
        } else if (isList) {
          lines.push(`- ${pText}`);
        } else {
          lines.push(`${pText}\n`);
        }
      }

      extractedContent = lines.join('\n');
    }

    // Embed extracted images into markdown content if present
    if (extractedImages.length > 0) {
      extractedContent += '\n\n### Document Images\n';
      extractedImages.forEach((img, idx) => {
        extractedContent += `\n![Document Image ${idx + 1}](${img.url})\n`;
      });
    }

    db.save();
    db.logActivity(`Imported DOCX Document: "${req.file.originalname}"`, `Extracted ${extractedImages.length} images and ${extractedContent.length} chars text`, 'document_import');

    res.json({
      success: true,
      title: extractedTitle,
      content: extractedContent,
      images: extractedImages,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname
    });
  } catch (err) {
    console.error('DOCX parsing error:', err);
    res.status(500).json({ error: `DOCX extraction failed: ${err.message}` });
  }
});

router.post('/documents/upload-pdf', requireAdminAuth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded.' });
    }

    const publicUrl = `/uploads/${req.file.filename}`;

    const mediaItem = {
      id: `med_pdf_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: publicUrl,
      mimetype: 'application/pdf',
      size: req.file.size,
      type: 'pdf',
      created_at: new Date().toISOString()
    };

    db.getCollection('media').unshift(mediaItem);
    db.save();

    db.logActivity(`Uploaded PDF Document: "${req.file.originalname}"`, `Saved as ${publicUrl}`, 'pdf_upload');

    res.status(201).json(mediaItem);
  } catch (err) {
    res.status(500).json({ error: err.message || 'PDF upload failed.' });
  }
});

// ============================================================
// 5. SYSTEM STATS & ACTIVITY LOGS
// ============================================================

router.get('/stats', requireAdminAuth, async (req, res) => {
  try {
    const stats = await db.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve stats.' });
  }
});

router.get('/activity-logs', requireAdminAuth, async (req, res) => {
  try {
    const logs = await db.getActivityLogs(30);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve activity logs.' });
  }
});

router.get('/settings', async (req, res) => {
  try {
    const settings = await db.getSettings();
    res.json(settings || {});
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve settings.' });
  }
});

router.put('/settings', requireAdminAuth, async (req, res) => {
  try {
    const updated = await db.updateSettings(req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings.' });
  }
});

// ============================================================
// 6. ENGAGEMENT & CONTACT SUBMISSION ROUTES
// ============================================================

// Helper validation function
function validateBookCallPayload(body) {
  const name = body.name || body.full_name;
  const company = body.company || body.company_name;
  const email = body.email;
  const message = body.message || body.requirement_details;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return 'Full name is required.';
  }
  if (!company || typeof company !== 'string' || !company.trim()) {
    return 'Company name is required.';
  }
  if (!email || typeof email !== 'string' || !email.trim() || !email.includes('@')) {
    return 'A valid work email address is required.';
  }
  if (message && typeof message !== 'string') {
    return 'Invalid message format.';
  }
  return null;
}

// 6.1 BOOK A CALL — PUBLIC SUBMISSION
router.post('/book-a-call', async (req, res) => {
  try {
    const errorMsg = validateBookCallPayload(req.body);
    if (errorMsg) {
      return res.status(400).json({ error: errorMsg });
    }

    const payload = {
      full_name: (req.body.name || req.body.full_name).trim(),
      company_name: (req.body.company || req.body.company_name).trim(),
      email: req.body.email.trim().toLowerCase(),
      phone: req.body.phone ? String(req.body.phone).trim() : '',
      job_title: req.body.jobTitle || req.body.job_title || '',
      requirement_type: req.body.service || req.body.requirement_type || 'Technology Transformation',
      message: (req.body.message || '').trim(),
      preferred_date: req.body.preferredDate || req.body.preferred_date || '',
      preferred_time: req.body.preferredTime || req.body.preferred_time || '',
      source: req.body.source || 'Book a Call Form',
      status: 'NEW',
      priority: req.body.priority || 'MEDIUM'
    };

    const record = await db.createEngagement(payload);
    await db.logActivity(
      `New Book a Call Request: ${payload.company_name}`,
      `${payload.full_name} (${payload.email}) requested session for ${payload.requirement_type}`,
      'engagement'
    );

    return res.status(201).json({
      success: true,
      message: 'Thank you. Your call request has been received. Our engineering lead will connect with you within 24 hours.',
      id: record.id
    });
  } catch (err) {
    console.error('Book a Call submission error:', err);
    return res.status(500).json({ error: 'Failed to process call booking request. Please try again.' });
  }
});

// 6.2 CONTACT & ENGAGEMENTS — PUBLIC SUBMISSION
router.post('/contact', async (req, res) => {
  try {
    const errorMsg = validateBookCallPayload(req.body);
    if (errorMsg) {
      return res.status(400).json({ error: errorMsg });
    }

    const payload = {
      full_name: (req.body.full_name || req.body.name).trim(),
      company_name: (req.body.company_name || req.body.company).trim(),
      email: req.body.email.trim().toLowerCase(),
      phone: req.body.phone ? String(req.body.phone).trim() : '',
      job_title: req.body.job_title || req.body.jobTitle || '',
      requirement_type: req.body.requirement_type || req.body.service || 'Technology Transformation',
      message: (req.body.message || '').trim(),
      preferred_date: req.body.preferred_date || req.body.preferredDate || '',
      preferred_time: req.body.preferred_time || req.body.preferredTime || '',
      source: req.body.source || 'Contact Form',
      status: 'NEW',
      priority: req.body.priority || 'MEDIUM'
    };

    const record = await db.createEngagement(payload);
    await db.logActivity(
      `New Contact Inquiry: ${payload.company_name}`,
      `${payload.full_name} (${payload.email}) - ${payload.requirement_type}`,
      'engagement'
    );

    return res.status(201).json({
      success: true,
      message: 'Thank you. Our engineering leads will connect with you shortly.',
      id: record.id
    });
  } catch (err) {
    console.error('Contact submission error:', err);
    return res.status(500).json({ error: 'Failed to process contact submission. Please try again.' });
  }
});

router.post('/engagements', async (req, res) => {
  try {
    const errorMsg = validateBookCallPayload(req.body);
    if (errorMsg) {
      return res.status(400).json({ error: errorMsg });
    }

    const payload = {
      full_name: (req.body.full_name || req.body.name).trim(),
      company_name: (req.body.company_name || req.body.company).trim(),
      email: req.body.email.trim().toLowerCase(),
      phone: req.body.phone ? String(req.body.phone).trim() : '',
      job_title: req.body.job_title || req.body.jobTitle || '',
      requirement_type: req.body.requirement_type || req.body.service || 'Technology Transformation',
      message: (req.body.message || '').trim(),
      preferred_date: req.body.preferred_date || req.body.preferredDate || '',
      preferred_time: req.body.preferred_time || req.body.preferredTime || '',
      source: req.body.source || 'Public Website',
      status: 'NEW',
      priority: req.body.priority || 'MEDIUM'
    };

    const record = await db.createEngagement(payload);
    await db.logActivity(
      `New Engagement Inquiry: ${payload.company_name}`,
      `${payload.full_name} (${payload.email}) - ${payload.requirement_type}`,
      'engagement'
    );

    return res.status(201).json({
      success: true,
      message: 'Thank you. Our engineering leads will connect with you shortly.',
      id: record.id
    });
  } catch (err) {
    console.error('Engagement submission error:', err);
    return res.status(500).json({ error: 'Failed to process engagement submission. Please try again.' });
  }
});

// 6.3 ADMIN READ & MANAGEMENT ENDPOINTS (AUTH REQUIRED)
router.get('/book-a-call', requireAdminAuth, async (req, res) => {
  try {
    const records = await db.getEngagements();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch book-a-call requests.' });
  }
});

router.get('/engagements', requireAdminAuth, async (req, res) => {
  try {
    const records = await db.getEngagements();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch engagement submissions.' });
  }
});

router.get('/contact/admin/all', requireAdminAuth, async (req, res) => {
  try {
    const records = await db.getEngagements();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch engagement submissions.' });
  }
});

router.patch('/book-a-call/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await db.updateEngagement(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Request not found.' });
    }
    res.json({ success: true, item: updated });
  } catch (err) {
    console.error('Update book-a-call error:', err);
    res.status(500).json({ error: 'Failed to update request.' });
  }
});

router.patch('/engagements/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await db.updateEngagement(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Request not found.' });
    }
    res.json({ success: true, item: updated });
  } catch (err) {
    console.error('Update engagement error:', err);
    res.status(500).json({ error: 'Failed to update engagement.' });
  }
});

router.patch('/contact/admin/:id/read', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_read } = req.body;
    const status = is_read ? 'CONTACTED' : 'NEW';

    const updated = await db.updateEngagement(id, { is_read, status });
    res.json({ success: true, status: updated?.status || status });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update read state.' });
  }
});

router.delete('/book-a-call/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteEngagement(id);
    res.json({ success: true, message: 'Request record deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete request.' });
  }
});

router.delete('/engagements/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteEngagement(id);
    res.json({ success: true, message: 'Engagement record deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete engagement record.' });
  }
});
