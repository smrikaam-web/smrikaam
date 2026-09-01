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

// Uploads directory: in public/uploads for direct browser serving
const UPLOADS_DIR = path.resolve(__dirname, '../../public/uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
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

// ============================================================
// 1. AUTHENTICATION ROUTES
// ============================================================

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

router.get('/media', requireAdminAuth, (req, res) => {
  try {
    const { type, search } = req.query;
    let items = db.getCollection('media');
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

router.post('/media/upload', requireAdminAuth, upload.single('file'), (req, res) => {
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

    const mediaCollection = db.getCollection('media');
    mediaCollection.unshift(mediaItem);
    db.save();

    db.logActivity(`Uploaded ${type}: "${req.file.originalname}"`, `Saved as ${publicUrl}`, 'media_upload');

    res.status(201).json(mediaItem);
  } catch (err) {
    res.status(500).json({ error: err.message || 'File upload failed.' });
  }
});

router.delete('/media/:id', requireAdminAuth, (req, res) => {
  try {
    const mediaCollection = db.getCollection('media');
    const index = mediaCollection.findIndex((m) => m.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Media file not found.' });
    }

    const item = mediaCollection[index];
    const filePath = path.join(UPLOADS_DIR, item.filename);

    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn('Could not delete file from disk:', e);
      }
    }

    mediaCollection.splice(index, 1);
    db.save();

    db.logActivity(`Deleted media file: "${item.originalName}"`, `Removed by Admin`, 'media_delete');

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete media item.' });
  }
});

// ============================================================
// 4. DOCX EXTRACTION & PDF UPLOADS
// ============================================================

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
