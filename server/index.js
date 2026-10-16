import './utils/suppressWarnings.js';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { router as apiRouter } from './routes/api.js';
import { postgres } from './services/postgres.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static public & uploads serving
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const UPLOADS_DIR = path.resolve(__dirname, '../public/uploads');
const TMP_UPLOADS_DIR = path.resolve('/tmp', 'uploads');
app.use(express.static(PUBLIC_DIR));
app.use('/uploads', express.static(UPLOADS_DIR));
if (fs.existsSync(TMP_UPLOADS_DIR)) {
  app.use('/uploads', express.static(TMP_UPLOADS_DIR));
}

// API Routes
app.use('/api', apiRouter);

// Root health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Explicit 410 Gone handler for intentionally removed legacy service pages
app.get([
  '/services/integration-services/sap.html',
  '/services/integration-services/api.html'
], (req, res) => {
  res.status(410).type('html').send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="robots" content="noindex, nofollow">
  <title>410 Gone - Page Removed | SMRIKAAM Technologies</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #000000; color: #FFFFFF; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
    .container { max-width: 600px; padding: 2rem; border: 1px solid #333333; border-radius: 0px; background: #111111; }
    h1 { font-size: 2.5rem; margin-bottom: 0.5rem; color: #FFFFFF; }
    p { color: #E5E5E5; font-size: 1rem; margin-bottom: 1.5rem; }
    a { display: inline-block; background: #FFFFFF; color: #000000; padding: 0.75rem 1.5rem; border-radius: 0px; text-decoration: none; font-weight: 600; border: 1px solid #FFFFFF; }
    a:hover { background: #000000; color: #FFFFFF; border: 1px solid #FFFFFF; }
  </style>
</head>
<body>
  <div class="container">
    <h1>410 Gone</h1>
    <p>This service page has been permanently removed.</p>
    <a href="https://smrikaam.com/services/integration-services">View Integration Services</a>
  </div>
</body>
</html>`);
});

// Production: Serve frontend static build if dist exists AND running in production/standalone mode
const DIST_DIR = path.resolve(__dirname, '../dist');
const distIndexPath = path.join(DIST_DIR, 'index.html');
const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);
const isProduction = process.env.NODE_ENV === 'production' || isDirectRun;

if (isProduction && fs.existsSync(distIndexPath)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    res.sendFile(distIndexPath);
  });
} else {
  // Development mode under Vite: let Vite handle frontend routing and HMR
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    next();
  });
}

// Start listening if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  (async () => {
    if (postgres.hasConfig) {
      await postgres.testConnection();
    }
    app.listen(PORT, () => {
      console.log(`SMRIKAAM Central CMS API Server running on port ${PORT}`);
      console.log(`Persistent File Storage at: ${UPLOADS_DIR}`);
      console.log(`Database connected: ${postgres.isConnected}`);
    });
  })();
}

export default app;
