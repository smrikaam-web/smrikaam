import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { initialSeedData } from '../data/seedData.js';
import { postgres } from './postgres.js';
import { cleanSlug } from '../utils/slug.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'cms_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const tableMap = {
  users: 'admin_users',
  admin_users: 'admin_users',
  posts: 'posts',
  services: 'services',
  accelerators: 'accelerators',
  industries: 'industries',
  caseStudies: 'case_studies',
  'case-studies': 'case_studies',
  reports: 'reports',
  media: 'media',
  activityLogs: 'activity_logs',
  activity_logs: 'activity_logs',
  staffing: 'staffing',
  locations: 'locations',
  settings: 'settings',
  engagements: 'engagements',
  visitors: 'visitors',
  visitor_sessions: 'visitor_sessions'
};

function safeParseJson(val, defaultVal = []) {
  if (val === null || val === undefined) return defaultVal;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return defaultVal;
  }
}

function safeStringify(val) {
  if (val === undefined || val === null) return JSON.stringify([]);
  if (typeof val === 'string') {
    try {
      JSON.parse(val);
      return val;
    } catch {
      return JSON.stringify([val]);
    }
  }
  return JSON.stringify(val);
}

class Database {
  constructor() {
    this.data = null;
    this.initLocalFallback();
  }

  initLocalFallback() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
      } else {
        this.data = JSON.parse(JSON.stringify(initialSeedData));
        this.saveLocalSnapshot();
      }
    } catch (err) {
      console.error('Error reading local fallback database snapshot:', err);
      this.data = JSON.parse(JSON.stringify(initialSeedData));
    }
  }

  saveLocalSnapshot() {
    try {
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      if (err.code !== 'EROFS') {
        console.warn('Local snapshot save skipped:', err.message);
      }
    }
  }

  usePostgres() {
    return Boolean(postgres.hasConfig && (postgres.pool || postgres.isConnected));
  }

  getCollection(name) {
    if (!this.data) {
      this.initLocalFallback();
    }
    if (!this.data) this.data = {};
    if (!Array.isArray(this.data[name])) {
      this.data[name] = [];
    }
    return this.data[name];
  }

  save() {
    this.saveLocalSnapshot();
  }

  // --- ASYNC SUPABASE / POSTGRES METHOD IMPLEMENTATIONS ---

  async getUserByEmail(email) {
    if (!email) return null;
    const targetEmail = (process.env.ADMIN_EMAIL || 'bitxhift@gmail.com').toLowerCase();
    if (email.trim().toLowerCase() !== targetEmail) {
      return null;
    }

    if (this.usePostgres()) {
      try {
        const res = await postgres.query('SELECT * FROM admin_users WHERE LOWER(email) = LOWER($1) LIMIT 1', [targetEmail]);
        if (res.rows.length > 0) {
          const row = res.rows[0];
          return {
            id: row.id,
            name: row.name || 'BitXhift SuperAdmin',
            email: targetEmail,
            passwordHash: row.password_hash,
            role: row.role || 'superadmin',
            created_at: row.created_at,
            updated_at: row.updated_at
          };
        }
      } catch (err) {
        console.warn('Postgres getUserByEmail query warning:', err.message);
      }
    }
    // Fallback
    const users = this.getCollection('users');
    const user = users.find((u) => u.email.toLowerCase() === targetEmail);
    if (user) {
      return user;
    }
    // Auto seed fallback single admin account
    const defaultPasswordHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'Smrikaam!123@321!', 10);
    return {
      id: 'usr_admin_01',
      name: 'BitXhift SuperAdmin',
      email: targetEmail,
      passwordHash: defaultPasswordHash,
      role: 'superadmin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  async getUserById(id) {
    if (!id) return null;
    if (this.usePostgres()) {
      try {
        const res = await postgres.query('SELECT * FROM admin_users WHERE id = $1 LIMIT 1', [id]);
        if (res.rows.length > 0) {
          const row = res.rows[0];
          return {
            id: row.id,
            name: row.name,
            email: row.email,
            passwordHash: row.password_hash,
            role: row.role,
            created_at: row.created_at,
            updated_at: row.updated_at
          };
        }
      } catch (err) {
        console.warn('Postgres getUserById query warning:', err.message);
      }
    }
    // Fallback
    const users = this.getCollection('users');
    return users.find((u) => String(u.id) === String(id)) || null;
  }

  async logActivity(title, description, type = 'system') {
    const now = new Date();
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const dateStr = `${now.getDate()} ${monthNames[now.getMonth()]}`;
    const id = `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

    const newLog = {
      id,
      date: dateStr,
      title,
      description,
      type,
      timestamp: now.toISOString()
    };

    // Update local snapshot
    const logs = this.getCollection('activityLogs');
    logs.unshift(newLog);
    if (logs.length > 100) logs.pop();
    this.saveLocalSnapshot();

    if (this.usePostgres()) {
      try {
        await postgres.query(
          'INSERT INTO activity_logs (id, date, title, description, type, timestamp) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
          [newLog.id, newLog.date, newLog.title, newLog.description, newLog.type, newLog.timestamp]
        );
      } catch (err) {
        console.warn('Postgres logActivity write warning:', err.message);
      }
    }

    return newLog;
  }

  async getActivityLogs(limit = 30) {
    if (this.usePostgres()) {
      try {
        const res = await postgres.query('SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT $1', [limit]);
        return res.rows.map((r) => ({
          id: r.id,
          date: r.date,
          title: r.title,
          description: r.description,
          type: r.type,
          timestamp: r.timestamp
        }));
      } catch (err) {
        console.warn('Postgres getActivityLogs query warning:', err.message);
      }
    }
    return this.getCollection('activityLogs').slice(0, limit);
  }

  async getAll(collectionName, { status, search, category, type, limit, sort = 'newest' } = {}) {
    const table = tableMap[collectionName] || collectionName;
    if (this.usePostgres()) {
      try {
        let sql = `SELECT * FROM ${table} WHERE 1=1`;
        const params = [];

        if (status && status !== 'all') {
          params.push(status);
          sql += ` AND status = $${params.length}`;
        }

        if (category) {
          params.push(category.toLowerCase());
          sql += ` AND LOWER(category) = $${params.length}`;
        }

        if (type) {
          params.push(type.toLowerCase());
          if (table === 'reports') {
            sql += ` AND (LOWER(report_type) = $${params.length} OR LOWER(type) = $${params.length})`;
          } else {
            sql += ` AND LOWER(type) = $${params.length}`;
          }
        }

        if (search && search.trim()) {
          params.push(`%${search.trim().toLowerCase()}%`);
          const idx = params.length;
          if (table === 'services') {
            sql += ` AND (LOWER(title) LIKE $${idx} OR LOWER(description) LIKE $${idx} OR LOWER(slug) LIKE $${idx})`;
          } else if (table === 'accelerators' || table === 'industries') {
            sql += ` AND (LOWER(name) LIKE $${idx} OR LOWER(slug) LIKE $${idx})`;
          } else {
            sql += ` AND (LOWER(title) LIKE $${idx} OR LOWER(slug) LIKE $${idx})`;
          }
        }

        const sortDir = sort === 'oldest' ? 'ASC' : 'DESC';
        if (table === 'services') {
          sql += ` ORDER BY display_order ASC, created_at ${sortDir}`;
        } else if (table === 'activity_logs') {
          sql += ` ORDER BY timestamp ${sortDir}`;
        } else {
          sql += ` ORDER BY created_at ${sortDir}`;
        }

        if (limit && limit > 0) {
          params.push(limit);
          sql += ` LIMIT $${params.length}`;
        }

        const res = await postgres.query(sql, params);
        return res.rows.map((row) => this.formatRowToItem(table, row));
      } catch (err) {
        console.warn(`Postgres getAll (${collectionName}) warning:`, err.message);
      }
    }

    // Fallback using local JSON
    let items = [...this.getCollection(collectionName)];
    if (status && status !== 'all') {
      items = items.filter((item) => item.status === status);
    }
    if (category) {
      items = items.filter((item) => (item.category && item.category.toLowerCase() === category.toLowerCase()));
    }
    if (type) {
      items = items.filter((item) => item.reportType && item.reportType.toLowerCase() === type.toLowerCase());
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter((item) => {
        const title = (item.title || item.name || '').toLowerCase();
        const desc = (item.description || item.excerpt || item.summary || '').toLowerCase();
        const slug = (item.slug || '').toLowerCase();
        return title.includes(q) || desc.includes(q) || slug.includes(q);
      });
    }
    items.sort((a, b) => {
      const dateA = new Date(a.created_at || a.published_at || 0).getTime();
      const dateB = new Date(b.created_at || b.published_at || 0).getTime();
      return sort === 'oldest' ? dateA - dateB : dateB - dateA;
    });
    if (limit && limit > 0) {
      items = items.slice(0, limit);
    }
    return items;
  }

  async getById(collectionName, id) {
    const table = tableMap[collectionName] || collectionName;
    if (this.usePostgres()) {
      try {
        const res = await postgres.query(`SELECT * FROM ${table} WHERE id = $1 LIMIT 1`, [id]);
        if (res.rows.length > 0) {
          return this.formatRowToItem(table, res.rows[0]);
        }
        return null;
      } catch (err) {
        console.warn(`Postgres getById (${collectionName}) warning:`, err.message);
      }
    }
    const items = this.getCollection(collectionName);
    return items.find((item) => String(item.id) === String(id)) || null;
  }

  async getBySlug(collectionName, slug) {
    const table = tableMap[collectionName] || collectionName;
    const cleanedSlug = cleanSlug(slug);
    if (this.usePostgres()) {
      try {
        let res = await postgres.query(`SELECT * FROM ${table} WHERE slug = $1 LIMIT 1`, [cleanedSlug]);
        if (res.rows.length === 0 && slug && slug !== cleanedSlug) {
          res = await postgres.query(`SELECT * FROM ${table} WHERE slug = $1 LIMIT 1`, [slug]);
        }
        if (res.rows.length === 0 && cleanedSlug) {
          res = await postgres.query(
            `SELECT * FROM ${table} WHERE slug LIKE $1 OR slug LIKE $2 LIMIT 1`,
            [`%/${cleanedSlug}`, `%/${cleanedSlug}/`]
          );
        }
        if (res.rows.length > 0) {
          return this.formatRowToItem(table, res.rows[0]);
        }
        return null;
      } catch (err) {
        console.warn(`Postgres getBySlug (${collectionName}) warning:`, err.message);
      }
    }
    const items = this.getCollection(collectionName);
    return items.find((item) => cleanSlug(item.slug) === cleanedSlug || item.slug === slug || item.slug === cleanedSlug) || null;
  }

  generateUniqueSlug(collectionName, baseSlug, existingId = null) {
    let slug = cleanSlug(baseSlug);
    if (!slug) slug = `${collectionName.slice(0, 4)}-${Date.now().toString(36)}`;
    const items = this.getCollection(collectionName) || [];
    let candidate = slug;
    let counter = 2;
    while (items.some((item) => String(item.id) !== String(existingId) && cleanSlug(item.slug) === candidate)) {
      candidate = `${slug}-${counter}`;
      counter++;
    }
    return candidate;
  }

  async create(collectionName, data, user = null) {
    const table = tableMap[collectionName] || collectionName;
    const id = data.id || `${collectionName.slice(0, 3)}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const now = new Date().toISOString();
    const sanitizedSlug = this.generateUniqueSlug(collectionName, data.slug || data.title || data.name || '', id);

    const newItem = {
      ...data,
      slug: sanitizedSlug,
      id,
      created_at: now,
      updated_at: now,
      published_at: data.status === 'published' ? (data.published_at || now) : null
    };

    if (this.usePostgres()) {
      try {
        await this.insertRow(table, newItem);
        const title = newItem.title || newItem.name || 'New Item';
        await this.logActivity(
          `Created ${collectionName.slice(0, -1)}: "${title}"`,
          `Status: ${newItem.status || 'draft'} by ${user?.name || 'Admin'}`,
          `${collectionName}_create`
        );
        return newItem;
      } catch (err) {
        console.warn(`Postgres create (${collectionName}) warning:`, err.message);
      }
    }

    // Fallback to local snapshot
    const items = this.getCollection(collectionName);
    items.unshift(newItem);
    this.saveLocalSnapshot();
    const title = newItem.title || newItem.name || 'New Item';
    this.logActivity(`Created ${collectionName.slice(0, -1)}: "${title}"`, `Status: ${newItem.status || 'draft'} by ${user?.name || 'Admin'}`, `${collectionName}_create`);
    return newItem;
  }

  async update(collectionName, id, data, user = null) {
    const existing = await this.getById(collectionName, id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const wasPublished = existing.status === 'published';
    const isNowPublished = data.status === 'published';
    const sanitizedSlug = data.slug !== undefined ? this.generateUniqueSlug(collectionName, data.slug, id) : undefined;

    const updatedItem = {
      ...existing,
      ...data,
      slug: sanitizedSlug !== undefined ? (sanitizedSlug || existing.slug) : existing.slug,
      id: existing.id,
      updated_at: now,
      published_at: isNowPublished && !existing.published_at ? now : (data.published_at || existing.published_at)
    };

    const table = tableMap[collectionName] || collectionName;
    if (this.usePostgres()) {
      try {
        await this.updateRow(table, id, updatedItem);
        const title = updatedItem.title || updatedItem.name || 'Item';
        if (!wasPublished && isNowPublished) {
          await this.logActivity(`Published ${collectionName.slice(0, -1)}: "${title}"`, `Published by ${user?.name || 'Admin'}`, `${collectionName}_publish`);
        } else {
          await this.logActivity(`Updated ${collectionName.slice(0, -1)}: "${title}"`, `Updated by ${user?.name || 'Admin'}`, `${collectionName}_update`);
        }
        return updatedItem;
      } catch (err) {
        console.warn(`Postgres update (${collectionName}) warning:`, err.message);
      }
    }

    // Local snapshot fallback
    const items = this.getCollection(collectionName);
    const index = items.findIndex((item) => String(item.id) === String(id));
    if (index !== -1) {
      items[index] = updatedItem;
      this.saveLocalSnapshot();
    }
    return updatedItem;
  }

  async updateStatus(collectionName, id, status, user = null) {
    const existing = await this.getById(collectionName, id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const publishedAt = status === 'published' && !existing.published_at ? now : existing.published_at;

    const table = tableMap[collectionName] || collectionName;
    if (this.usePostgres()) {
      try {
        await postgres.query(
          `UPDATE ${table} SET status = $1, updated_at = $2, published_at = $3 WHERE id = $4`,
          [status, now, publishedAt, id]
        );
        const title = existing.title || existing.name || 'Item';
        await this.logActivity(`Status changed to ${status} for "${title}"`, `Updated by ${user?.name || 'Admin'}`, `${collectionName}_status`);
        return { ...existing, status, updated_at: now, published_at: publishedAt };
      } catch (err) {
        console.warn(`Postgres updateStatus (${collectionName}) warning:`, err.message);
      }
    }

    // Fallback
    existing.status = status;
    existing.updated_at = now;
    if (status === 'published' && !existing.published_at) existing.published_at = now;
    this.saveLocalSnapshot();
    return existing;
  }

  async delete(collectionName, id, user = null, permanent = false) {
    const existing = await this.getById(collectionName, id);
    if (!existing) return false;

    const title = existing.title || existing.name || 'Item';
    const table = tableMap[collectionName] || collectionName;

    if (this.usePostgres()) {
      try {
        if (permanent || existing.status === 'trash') {
          await postgres.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
          await this.logActivity(`Permanently deleted "${title}"`, `Deleted by ${user?.name || 'Admin'}`, `${collectionName}_delete_permanent`);
        } else {
          await postgres.query(`UPDATE ${table} SET status = 'trash', updated_at = NOW() WHERE id = $1`, [id]);
          await this.logActivity(`Moved "${title}" to Trash`, `Moved to trash by ${user?.name || 'Admin'}`, `${collectionName}_trash`);
        }
        return true;
      } catch (err) {
        console.warn(`Postgres delete (${collectionName}) warning:`, err.message);
      }
    }

    // Fallback
    const items = this.getCollection(collectionName);
    const index = items.findIndex((item) => String(item.id) === String(id));
    if (index !== -1) {
      if (permanent || items[index].status === 'trash') {
        items.splice(index, 1);
      } else {
        items[index].status = 'trash';
        items[index].updated_at = new Date().toISOString();
      }
      this.saveLocalSnapshot();
    }
    return true;
  }

  async restore(collectionName, id, user = null) {
    const existing = await this.getById(collectionName, id);
    if (!existing) return null;

    const table = tableMap[collectionName] || collectionName;
    const now = new Date().toISOString();

    if (this.usePostgres()) {
      try {
        await postgres.query(`UPDATE ${table} SET status = 'draft', updated_at = $1 WHERE id = $2`, [now, id]);
        const title = existing.title || existing.name || 'Item';
        await this.logActivity(`Restored "${title}" from Trash`, `Restored by ${user?.name || 'Admin'}`, `${collectionName}_restore`);
        return { ...existing, status: 'draft', updated_at: now };
      } catch (err) {
        console.warn(`Postgres restore (${collectionName}) warning:`, err.message);
      }
    }

    existing.status = 'draft';
    existing.updated_at = now;
    this.saveLocalSnapshot();
    return existing;
  }

  async bulkAction(collectionName, ids, action, user = null) {
    if (!Array.isArray(ids) || ids.length === 0) return 0;
    const table = tableMap[collectionName] || collectionName;
    const now = new Date().toISOString();

    let count = 0;
    if (this.usePostgres()) {
      try {
        let statusVal = null;
        if (action === 'publish') statusVal = 'published';
        else if (action === 'unpublish') statusVal = 'draft';
        else if (action === 'trash') statusVal = 'trash';
        else if (action === 'restore') statusVal = 'draft';

        if (statusVal) {
          const res = await postgres.query(
            `UPDATE ${table} SET status = $1, updated_at = $2 WHERE id = ANY($3::text[])`,
            [statusVal, now, ids]
          );
          count = res.rowCount;
          await this.logActivity(`Bulk ${action} executed on ${count} ${collectionName}`, `Executed by ${user?.name || 'Admin'}`, `${collectionName}_bulk`);
          return count;
        }
      } catch (err) {
        console.warn(`Postgres bulkAction (${collectionName}) warning:`, err.message);
      }
    }

    // Fallback
    const items = this.getCollection(collectionName);
    ids.forEach((id) => {
      const item = items.find((i) => String(i.id) === String(id));
      if (item) {
        count++;
        if (action === 'publish') item.status = 'published';
        else if (action === 'unpublish') item.status = 'draft';
        else if (action === 'trash') item.status = 'trash';
        else if (action === 'restore') item.status = 'draft';
        item.updated_at = now;
      }
    });
    if (count > 0) this.saveLocalSnapshot();
    return count;
  }

  async getSettings() {
    if (this.usePostgres()) {
      try {
        const res = await postgres.query("SELECT value FROM settings WHERE key = 'site_settings' LIMIT 1");
        if (res.rows.length > 0) {
          return safeParseJson(res.rows[0].value, {});
        }
      } catch (err) {
        console.warn('Postgres getSettings query warning:', err.message);
      }
    }
    return this.data.settings || {};
  }

  async updateSettings(newSettings) {
    const updated = { ...(await this.getSettings()), ...newSettings };
    this.data.settings = updated;
    this.saveLocalSnapshot();

    if (this.usePostgres()) {
      try {
        await postgres.query(
          `INSERT INTO settings (key, value, updated_at) VALUES ('site_settings', $1, NOW())
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
          [JSON.stringify(updated)]
        );
        await this.logActivity('Site Settings Updated', 'System configurations adjusted by Admin', 'settings_update');
      } catch (err) {
        console.warn('Postgres updateSettings query warning:', err.message);
      }
    }

    return updated;
  }

  async getStats() {
    if (this.usePostgres()) {
      try {
        const collections = ['posts', 'services', 'accelerators', 'industries', 'case_studies', 'reports', 'media'];
        const counts = {};

        for (const col of collections) {
          const res = await postgres.query(`SELECT count(*) FROM ${col}`);
          counts[col] = parseInt(res.rows[0].count, 10);
        }

        const pubRes = await postgres.query(
          `SELECT
            (SELECT count(*) FROM posts WHERE status = 'published') +
            (SELECT count(*) FROM services WHERE status = 'published') +
            (SELECT count(*) FROM accelerators WHERE status = 'published') +
            (SELECT count(*) FROM industries WHERE status = 'published') +
            (SELECT count(*) FROM case_studies WHERE status = 'published') +
            (SELECT count(*) FROM reports WHERE status = 'published') AS total_pub`
        );

        const draftRes = await postgres.query(
          `SELECT
            (SELECT count(*) FROM posts WHERE status = 'draft') +
            (SELECT count(*) FROM services WHERE status = 'draft') +
            (SELECT count(*) FROM accelerators WHERE status = 'draft') +
            (SELECT count(*) FROM industries WHERE status = 'draft') +
            (SELECT count(*) FROM case_studies WHERE status = 'draft') +
            (SELECT count(*) FROM reports WHERE status = 'draft') AS total_draft`
        );

        const engRes = await postgres.query(`
          SELECT
            count(*) AS total,
            count(*) FILTER (WHERE status = 'NEW' OR status = 'unread' OR status IS NULL) AS count_new,
            count(*) FILTER (WHERE status = 'CONTACTED') AS count_contacted,
            count(*) FILTER (WHERE status = 'IN_PROGRESS') AS count_in_progress,
            count(*) FILTER (WHERE status = 'QUALIFIED') AS count_qualified,
            count(*) FILTER (WHERE status = 'CONVERTED') AS count_converted,
            count(*) FILTER (WHERE status = 'CLOSED') AS count_closed
          FROM engagements
        `);
        const engRow = engRes.rows[0] || {};

        return {
          totalPosts: counts['posts'] || 0,
          totalServices: counts['services'] || 0,
          totalAccelerators: counts['accelerators'] || 0,
          totalIndustries: counts['industries'] || 0,
          totalCaseStudies: counts['case_studies'] || 0,
          totalReports: counts['reports'] || 0,
          totalMedia: counts['media'] || 0,
          published: parseInt(pubRes.rows[0]?.total_pub || '0', 10),
          drafts: parseInt(draftRes.rows[0]?.total_draft || '0', 10),
          trash: 0,
          totalBookCalls: parseInt(engRow.total || '0', 10),
          newBookCalls: parseInt(engRow.count_new || '0', 10),
          contactedBookCalls: parseInt(engRow.count_contacted || '0', 10),
          inProgressBookCalls: parseInt(engRow.count_in_progress || '0', 10),
          qualifiedBookCalls: parseInt(engRow.count_qualified || '0', 10),
          convertedBookCalls: parseInt(engRow.count_converted || '0', 10),
          closedBookCalls: parseInt(engRow.count_closed || '0', 10),
          postgresStatus: postgres.getStatus()
        };
      } catch (err) {
        console.warn('Postgres getStats warning:', err.message);
      }
    }

    // Fallback
    const localEng = this.getCollection('engagements') || [];
    const contentCollections = ['posts', 'services', 'accelerators', 'industries', 'caseStudies', 'reports'];
    let localPublished = 0;
    let localDrafts = 0;
    let localTrash = 0;
    for (const col of contentCollections) {
      const items = this.getCollection(col) || [];
      for (const it of items) {
        if (it.status === 'published') localPublished++;
        else if (it.status === 'draft') localDrafts++;
        else if (it.status === 'trash') localTrash++;
      }
    }

    return {
      totalPosts: this.getCollection('posts').length,
      totalServices: this.getCollection('services').length,
      totalAccelerators: this.getCollection('accelerators').length,
      totalIndustries: this.getCollection('industries').length,
      totalCaseStudies: this.getCollection('caseStudies').length,
      totalReports: this.getCollection('reports').length,
      totalMedia: this.getCollection('media').length,
      published: localPublished,
      drafts: localDrafts,
      trash: localTrash,
      totalBookCalls: localEng.length,
      newBookCalls: localEng.filter(e => e.status === 'NEW' || e.status === 'unread' || !e.status).length,
      contactedBookCalls: localEng.filter(e => e.status === 'CONTACTED').length,
      inProgressBookCalls: localEng.filter(e => e.status === 'IN_PROGRESS').length,
      qualifiedBookCalls: localEng.filter(e => e.status === 'QUALIFIED').length,
      convertedBookCalls: localEng.filter(e => e.status === 'CONVERTED').length,
      closedBookCalls: localEng.filter(e => e.status === 'CLOSED').length,
      postgresStatus: postgres.getStatus()
    };
  }

  // --- INTERNAL HELPER MAPPING METHODS ---

  formatRowToItem(table, row) {
    if (!row) return null;
    const item = { ...row };

    // Parse JSONB columns
    if (table === 'posts') {
      item.tags = safeParseJson(row.tags);
    } else if (table === 'services') {
      item.businessProblems = safeParseJson(row.business_problems);
      item.capabilities = safeParseJson(row.capabilities);
      item.technology = safeParseJson(row.technology);
      item.industryApplications = safeParseJson(row.industry_applications);
      item.problemStatement = row.problem_statement;
      item.solutionStatement = row.solution_statement;
      item.caseStudy = row.case_study;
    } else if (table === 'accelerators') {
      item.keyFeatures = safeParseJson(row.key_features);
      item.technology = safeParseJson(row.technology);
      item.useCases = safeParseJson(row.use_cases);
      item.shortDescription = row.short_description;
      item.fullDescription = row.full_description;
      item.howItWorks = row.how_it_works;
      item.businessOutcomes = row.business_outcomes;
      item.pdfUrl = row.pdf_url;
    } else if (table === 'industries') {
      item.businessProblems = safeParseJson(row.business_problems);
      item.solutions = safeParseJson(row.solutions);
      item.technology = safeParseJson(row.technology);
      item.useCases = safeParseJson(row.use_cases);
    } else if (table === 'case_studies') {
      item.clientName = row.client_name;
      item.relatedService = row.related_service;
      item.pdfUrl = row.pdf_url;
      item.technologies = safeParseJson(row.technologies);
    } else if (table === 'reports') {
      item.reportType = row.report_type;
      item.fullContent = row.full_content;
      item.tags = safeParseJson(row.tags);
      item.keyFindings = safeParseJson(row.key_findings);
      item.sourceFile = row.source_file;
      item.pdfUrl = row.pdf_url;
      item.docxUrl = row.docx_url;
    } else if (table === 'media') {
      item.originalName = row.original_name;
      item.mimetype = row.mime_type;
      item.metadata = safeParseJson(row.metadata, {});
    } else if (table === 'staffing') {
      item.bullets = safeParseJson(row.bullets);
    } else if (table === 'locations') {
      item.capabilities = safeParseJson(row.capabilities);
    }

    return item;
  }

  async insertRow(table, item) {
    if (table === 'posts') {
      await postgres.query(
        `INSERT INTO posts (id, title, slug, category, excerpt, content, cover_image_url, tags, author, read_time, meta_title, meta_description, status, created_at, updated_at, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          item.id, item.title, item.slug, item.category, item.excerpt, item.content, item.cover_image_url,
          safeStringify(item.tags), item.author, item.read_time, item.meta_title, item.meta_description,
          item.status || 'draft', item.created_at, item.updated_at, item.published_at
        ]
      );
    } else if (table === 'services') {
      await postgres.query(
        `INSERT INTO services (id, title, slug, num, tagline, summary, description, business_problems, capabilities, technology, industry_applications, problem_statement, solution_statement, outcomes, accelerator, case_study, cover_image_url, status, display_order, created_at, updated_at, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
        [
          item.id, item.title, item.slug, item.num, item.tagline, item.summary, item.description,
          safeStringify(item.businessProblems || item.business_problems),
          safeStringify(item.capabilities),
          safeStringify(item.technology),
          safeStringify(item.industryApplications || item.industry_applications),
          item.problemStatement || item.problem_statement,
          item.solutionStatement || item.solution_statement,
          item.outcomes, item.accelerator, item.caseStudy || item.case_study,
          item.cover_image_url, item.status || 'published', item.display_order || 0,
          item.created_at, item.updated_at, item.published_at
        ]
      );
    } else if (table === 'accelerators') {
      await postgres.query(
        `INSERT INTO accelerators (id, name, slug, category, tagline, short_description, full_description, cover_image_url, problem, solution, how_it_works, architecture, key_features, technology, use_cases, business_outcomes, pdf_url, status, created_at, updated_at, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
        [
          item.id, item.name, item.slug, item.category, item.tagline, item.shortDescription || item.short_description,
          item.fullDescription || item.full_description, item.cover_image_url, item.problem, item.solution,
          item.howItWorks || item.how_it_works, item.architecture,
          safeStringify(item.keyFeatures || item.key_features),
          safeStringify(item.technology),
          safeStringify(item.useCases || item.use_cases),
          item.businessOutcomes || item.business_outcomes, item.pdfUrl || item.pdf_url,
          item.status || 'published', item.created_at, item.updated_at, item.published_at
        ]
      );
    } else if (table === 'industries') {
      await postgres.query(
        `INSERT INTO industries (id, name, slug, summary, content, cover_image_url, business_problems, solutions, technology, use_cases, status, created_at, updated_at, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          item.id, item.name, item.slug, item.summary, item.content, item.cover_image_url,
          safeStringify(item.businessProblems || item.business_problems),
          safeStringify(item.solutions),
          safeStringify(item.technology),
          safeStringify(item.useCases || item.use_cases),
          item.status || 'published', item.created_at, item.updated_at, item.published_at
        ]
      );
    } else if (table === 'case_studies') {
      await postgres.query(
        `INSERT INTO case_studies (id, title, client_name, slug, industry, location, accelerator, related_service, challenge, solution, implementation, results, technologies, cover_image_url, pdf_url, status, created_at, updated_at, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
        [
          item.id, item.title, item.clientName || item.client_name || 'Enterprise Client', item.slug, item.industry,
          item.location, item.accelerator, item.relatedService || item.related_service, item.challenge,
          item.solution, item.implementation, item.results, safeStringify(item.technologies),
          item.cover_image_url, item.pdfUrl || item.pdf_url, item.status || 'published', item.created_at, item.updated_at, item.published_at
        ]
      );
    } else if (table === 'reports') {
      await postgres.query(
        `INSERT INTO reports (id, title, slug, date, type, report_type, status, summary, full_content, tags, key_findings, source_file, pdf_url, docx_url, featured, created_at, updated_at, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
        [
          item.id, item.title, item.slug, item.date, item.type || 'FLASH', item.reportType || item.report_type || 'ENGINEERING // DISPATCH', item.status || 'published', item.summary,
          item.fullContent || item.full_content, safeStringify(item.tags), safeStringify(item.keyFindings || item.key_findings),
          item.sourceFile || item.source_file, item.pdfUrl || item.pdf_url, item.docxUrl || item.docx_url,
          item.featured || false, item.created_at, item.updated_at, item.published_at
        ]
      );
    } else if (table === 'media') {
      await postgres.query(
        `INSERT INTO media (id, filename, original_name, url, mime_type, size, type, uploaded_at, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          item.id, item.filename, item.originalName || item.original_name || item.filename, item.url,
          item.mimetype || item.mime_type, item.size, item.type || 'file', item.created_at || item.uploaded_at || new Date(),
          safeStringify(item.metadata || {})
        ]
      );
    } else if (table === 'staffing') {
      await postgres.query(
        `INSERT INTO staffing (id, title, slug, subtitle, "desc", bullets, status, created_at, updated_at, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          item.id, item.title, item.slug, item.subtitle, item.desc, safeStringify(item.bullets),
          item.status || 'published', item.created_at, item.updated_at, item.published_at
        ]
      );
    } else if (table === 'locations') {
      await postgres.query(
        `INSERT INTO locations (id, name, slug, type, address, email, phone, description, capabilities, status, created_at, updated_at, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          item.id, item.name, item.slug, item.type, item.address, item.email, item.phone,
          item.description, safeStringify(item.capabilities), item.status || 'published', item.created_at, item.updated_at, item.published_at
        ]
      );
    }
  }

  async updateRow(table, id, item) {
    if (table === 'posts') {
      await postgres.query(
        `UPDATE posts SET title=$1, slug=$2, category=$3, excerpt=$4, content=$5, cover_image_url=$6, tags=$7, author=$8, read_time=$9, meta_title=$10, meta_description=$11, status=$12, updated_at=$13, published_at=$14 WHERE id=$15`,
        [
          item.title, item.slug, item.category, item.excerpt, item.content, item.cover_image_url,
          safeStringify(item.tags), item.author, item.read_time, item.meta_title, item.meta_description,
          item.status, item.updated_at, item.published_at, id
        ]
      );
    } else if (table === 'services') {
      await postgres.query(
        `UPDATE services SET title=$1, slug=$2, num=$3, tagline=$4, summary=$5, description=$6, business_problems=$7, capabilities=$8, technology=$9, industry_applications=$10, problem_statement=$11, solution_statement=$12, outcomes=$13, accelerator=$14, case_study=$15, cover_image_url=$16, status=$17, display_order=$18, updated_at=$19, published_at=$20 WHERE id=$21`,
        [
          item.title, item.slug, item.num, item.tagline, item.summary, item.description,
          safeStringify(item.businessProblems || item.business_problems),
          safeStringify(item.capabilities),
          safeStringify(item.technology),
          safeStringify(item.industryApplications || item.industry_applications),
          item.problemStatement || item.problem_statement,
          item.solutionStatement || item.solution_statement,
          item.outcomes, item.accelerator, item.caseStudy || item.case_study,
          item.cover_image_url, item.status, item.display_order || 0,
          item.updated_at, item.published_at, id
        ]
      );
    } else if (table === 'accelerators') {
      await postgres.query(
        `UPDATE accelerators SET name=$1, slug=$2, category=$3, tagline=$4, short_description=$5, full_description=$6, cover_image_url=$7, problem=$8, solution=$9, how_it_works=$10, architecture=$11, key_features=$12, technology=$13, use_cases=$14, business_outcomes=$15, pdf_url=$16, status=$17, updated_at=$18, published_at=$19 WHERE id=$20`,
        [
          item.name, item.slug, item.category, item.tagline, item.shortDescription || item.short_description,
          item.fullDescription || item.full_description, item.cover_image_url, item.problem, item.solution,
          item.howItWorks || item.how_it_works, item.architecture,
          safeStringify(item.keyFeatures || item.key_features),
          safeStringify(item.technology),
          safeStringify(item.useCases || item.use_cases),
          item.businessOutcomes || item.business_outcomes, item.pdfUrl || item.pdf_url,
          item.status, item.updated_at, item.published_at, id
        ]
      );
    } else if (table === 'industries') {
      await postgres.query(
        `UPDATE industries SET name=$1, slug=$2, summary=$3, content=$4, cover_image_url=$5, business_problems=$6, solutions=$7, technology=$8, use_cases=$9, status=$10, updated_at=$11, published_at=$12 WHERE id=$13`,
        [
          item.name, item.slug, item.summary, item.content, item.cover_image_url,
          safeStringify(item.businessProblems || item.business_problems),
          safeStringify(item.solutions),
          safeStringify(item.technology),
          safeStringify(item.useCases || item.use_cases),
          item.status, item.updated_at, item.published_at, id
        ]
      );
    } else if (table === 'case_studies') {
      await postgres.query(
        `UPDATE case_studies SET title=$1, client_name=$2, slug=$3, industry=$4, location=$5, accelerator=$6, related_service=$7, challenge=$8, solution=$9, implementation=$10, results=$11, technologies=$12, cover_image_url=$13, pdf_url=$14, status=$15, updated_at=$16, published_at=$17 WHERE id=$18`,
        [
          item.title, item.clientName || item.client_name, item.slug, item.industry,
          item.location, item.accelerator, item.relatedService || item.related_service, item.challenge,
          item.solution, item.implementation, item.results, safeStringify(item.technologies),
          item.cover_image_url, item.pdfUrl || item.pdf_url, item.status, item.updated_at, item.published_at, id
        ]
      );
    } else if (table === 'reports') {
      await postgres.query(
        `UPDATE reports SET title=$1, slug=$2, date=$3, type=$4, report_type=$5, status=$6, summary=$7, full_content=$8, tags=$9, key_findings=$10, source_file=$11, pdf_url=$12, docx_url=$13, featured=$14, updated_at=$15, published_at=$16 WHERE id=$17`,
        [
          item.title, item.slug, item.date, item.type, item.reportType || item.report_type, item.status, item.summary,
          item.fullContent || item.full_content, safeStringify(item.tags), safeStringify(item.keyFindings || item.key_findings),
          item.sourceFile || item.source_file, item.pdfUrl || item.pdf_url, item.docxUrl || item.docx_url,
          item.featured || false, item.updated_at, item.published_at, id
        ]
      );
    } else if (table === 'staffing') {
      await postgres.query(
        `UPDATE staffing SET title=$1, slug=$2, subtitle=$3, "desc"=$4, bullets=$5, status=$6, updated_at=$7, published_at=$8 WHERE id=$9`,
        [item.title, item.slug, item.subtitle, item.desc, safeStringify(item.bullets), item.status, item.updated_at, item.published_at, id]
      );
    } else if (table === 'locations') {
      await postgres.query(
        `UPDATE locations SET name=$1, slug=$2, type=$3, address=$4, email=$5, phone=$6, description=$7, capabilities=$8, status=$9, updated_at=$10, published_at=$11 WHERE id=$12`,
        [
          item.name, item.slug, item.type, item.address, item.email, item.phone,
          item.description, safeStringify(item.capabilities), item.status, item.updated_at, item.published_at, id
        ]
      );
    }
  }

  async createEngagement(payload) {
    const id = `eng_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();

    const record = {
      id,
      full_name: payload.full_name || payload.name,
      company_name: payload.company_name || payload.company || '',
      email: payload.email,
      phone: payload.phone || '',
      job_title: payload.job_title || payload.jobTitle || '',
      requirement_type: payload.requirement_type || payload.service || 'Technology Transformation',
      message: payload.message || '',
      preferred_date: payload.preferred_date || payload.preferredDate || '',
      preferred_time: payload.preferred_time || payload.preferredTime || '',
      source: payload.source || 'Public Website',
      visitor_id: payload.visitor_id || payload.visitorId || '',
      status: payload.status || 'NEW',
      priority: payload.priority || 'MEDIUM',
      assigned_to: payload.assigned_to || payload.assignedTo || '',
      admin_notes: payload.admin_notes || payload.adminNotes || '',
      is_read: false,
      created_at: now,
      updated_at: now
    };

    const engagements = this.getCollection('engagements');
    engagements.unshift(record);
    this.saveLocalSnapshot();

    if (record.visitor_id && payload.consent_linking !== false) {
      try {
        await this.linkVisitorToLead(record.visitor_id, record, payload.consent_linking !== false);
      } catch (err) {
        // Non-blocking fallback
      }
    }

    if (this.usePostgres()) {
      try {
        await postgres.query(
          `INSERT INTO engagements (id, full_name, company_name, email, phone, job_title, requirement_type, message, preferred_date, preferred_time, source, status, priority, assigned_to, admin_notes, is_read, visitor_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
          [
            record.id, record.full_name, record.company_name, record.email, record.phone,
            record.job_title, record.requirement_type, record.message, record.preferred_date,
            record.preferred_time, record.source, record.status, record.priority,
            record.assigned_to, record.admin_notes, record.is_read, record.visitor_id,
            record.created_at, record.updated_at
          ]
        );
      } catch (err) {
        console.warn('Postgres createEngagement write warning:', err.message);
      }
    }

    return record;
  }

  async getEngagements() {
    if (this.usePostgres()) {
      try {
        const res = await postgres.query('SELECT * FROM engagements ORDER BY created_at DESC');
        return res.rows;
      } catch (err) {
        console.warn('Postgres getEngagements query warning:', err.message);
      }
    }
    return this.getCollection('engagements');
  }

  async updateEngagement(id, updates) {
    const now = new Date().toISOString();
    const engagements = this.getCollection('engagements');
    const idx = engagements.findIndex((e) => String(e.id) === String(id));

    let updatedRecord = null;
    if (idx !== -1) {
      engagements[idx] = {
        ...engagements[idx],
        ...updates,
        updated_at: now
      };
      if (updates.status) {
        engagements[idx].is_read = updates.status !== 'NEW' && updates.status !== 'unread';
      }
      updatedRecord = engagements[idx];
      this.saveLocalSnapshot();
    }

    if (this.usePostgres()) {
      try {
        const fields = [];
        const values = [];
        let paramIdx = 1;

        const allowedKeys = [
          'full_name', 'company_name', 'email', 'phone', 'job_title',
          'requirement_type', 'message', 'preferred_date', 'preferred_time',
          'source', 'status', 'priority', 'assigned_to', 'admin_notes', 'is_read'
        ];

        for (const key of allowedKeys) {
          if (updates[key] !== undefined) {
            fields.push(`${key} = $${paramIdx++}`);
            values.push(updates[key]);
          }
        }

        if (fields.length > 0) {
          fields.push(`updated_at = $${paramIdx++}`);
          values.push(now);
          values.push(id);

          const query = `UPDATE engagements SET ${fields.join(', ')} WHERE id = $${paramIdx} RETURNING *`;
          const res = await postgres.query(query, values);
          if (res.rows[0]) updatedRecord = res.rows[0];
        }
      } catch (err) {
        console.warn('Postgres updateEngagement warning:', err.message);
      }
    }

    return updatedRecord;
  }

  async deleteEngagement(id) {
    const engagements = this.getCollection('engagements');
    const idx = engagements.findIndex((e) => String(e.id) === String(id));
    if (idx !== -1) {
      engagements.splice(idx, 1);
      this.saveLocalSnapshot();
    }

    if (this.usePostgres()) {
      try {
        await postgres.query('DELETE FROM engagements WHERE id = $1', [id]);
      } catch (err) {
        console.warn('Postgres deleteEngagement query warning:', err.message);
      }
    }
    return true;
  }

  // ============================================================
  // VISITOR INTELLIGENCE & REVERSE-DNS NETWORK TRACKING
  // ============================================================

  async recordVisitorHit({
    visitorId,
    sessionId,
    path = '/',
    title = '',
    referrer = '',
    anonymizedIp = '0.0.0.0',
    networkOrg = 'Anonymous Visitor',
    networkDomain = null,
    networkType = 'Anonymous / Unresolved',
    networkConfidence = 'Low',
    country = 'Unknown',
    region = '',
    city = '',
    userAgentCategory = 'Desktop (Other)',
    deviceCategory = 'Desktop',
    browserCategory = 'Other',
    referralSource = 'Direct',
    consentStatus = 'Consented',
    duration = 0,
    isOptedOut = false
  }) {
    if (!visitorId) return null;
    const now = new Date().toISOString();

    const visitors = this.getCollection('visitors');
    let visitor = visitors.find((v) => v.id === visitorId);

    if (!visitor) {
      visitor = {
        id: visitorId,
        anonymized_ip: anonymizedIp,
        network_org: networkOrg,
        network_domain: networkDomain,
        network_type: networkType,
        network_confidence: networkConfidence,
        country,
        region,
        city,
        referral_source: referralSource,
        device_category: deviceCategory,
        browser_category: browserCategory,
        consent_status: isOptedOut ? 'Opted Out' : consentStatus,
        first_seen: now,
        last_seen: now,
        total_visits: 1,
        total_pageviews: 1,
        lead_status: 'New',
        admin_notes: '',
        voluntary_name: null,
        voluntary_company: null,
        voluntary_email: null,
        voluntary_phone: null,
        voluntary_lead_id: null,
        is_opted_out: Boolean(isOptedOut),
        created_at: now,
        updated_at: now
      };
      visitors.unshift(visitor);
    } else {
      visitor.last_seen = now;
      visitor.total_pageviews = (visitor.total_pageviews || 0) + 1;
      visitor.updated_at = now;
      if (isOptedOut) {
        visitor.is_opted_out = true;
        visitor.consent_status = 'Opted Out';
      } else if (consentStatus && (!visitor.consent_status || visitor.consent_status === 'Consented' || consentStatus !== 'Consented')) {
        visitor.consent_status = consentStatus;
      }
      if (referralSource && referralSource !== 'Direct' && (!visitor.referral_source || visitor.referral_source === 'Direct')) {
        visitor.referral_source = referralSource;
      }
      if (deviceCategory && (!visitor.device_category || visitor.device_category === 'Desktop')) {
        visitor.device_category = deviceCategory;
      }
      if (browserCategory && (!visitor.browser_category || visitor.browser_category === 'Other')) {
        visitor.browser_category = browserCategory;
      }
      if (anonymizedIp && visitor.anonymized_ip === '0.0.0.0') visitor.anonymized_ip = anonymizedIp;
      if (networkOrg && (!visitor.network_org || visitor.network_org === 'Anonymous Visitor')) {
        visitor.network_org = networkOrg;
        visitor.network_domain = networkDomain;
        visitor.network_type = networkType;
        visitor.network_confidence = networkConfidence;
      }
      if (country && visitor.country === 'Unknown') visitor.country = country;
      if (region && !visitor.region) visitor.region = region;
      if (city && !visitor.city) visitor.city = city;
    }

    // Handle Session & Page Journey
    const sessions = this.getCollection('visitor_sessions');
    const effectiveSessionId = sessionId || `sess_${visitorId}_${now.slice(0, 10)}`;
    let session = sessions.find((s) => s.id === effectiveSessionId);

    const hitPage = {
      path,
      title: title || path,
      timestamp: now,
      duration: duration || 0
    };

    if (!session) {
      session = {
        id: effectiveSessionId,
        visitor_id: visitorId,
        started_at: now,
        last_active_at: now,
        referrer: referralSource || referrer || 'Direct',
        user_agent_category: userAgentCategory,
        device_category: deviceCategory,
        browser_category: browserCategory,
        pages_viewed: [hitPage],
        total_duration_sec: duration || 0,
        created_at: now
      };
      sessions.unshift(session);
      if (visitors.some((v) => v.id === visitorId && v.first_seen !== now)) {
        visitor.total_visits = (visitor.total_visits || 1) + 1;
      }
    } else {
      session.last_active_at = now;
      session.total_duration_sec = (session.total_duration_sec || 0) + (duration || 0);
      if (referralSource && referralSource !== 'Direct' && (!session.referrer || session.referrer === 'Direct')) {
        session.referrer = referralSource;
      }
      if (!Array.isArray(session.pages_viewed)) session.pages_viewed = [];
      const lastPage = session.pages_viewed[session.pages_viewed.length - 1];
      if (!lastPage || lastPage.path !== path) {
        session.pages_viewed.push(hitPage);
      } else if (duration > 0) {
        lastPage.duration = (lastPage.duration || 0) + duration;
      }
    }

    this.saveLocalSnapshot();

    if (this.usePostgres()) {
      try {
        await postgres.query(`
          INSERT INTO visitors (id, anonymized_ip, network_org, network_domain, network_type, network_confidence, country, region, city, first_seen, last_seen, total_visits, total_pageviews, lead_status, admin_notes, is_opted_out, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          ON CONFLICT (id) DO UPDATE SET
            last_seen = EXCLUDED.last_seen,
            total_pageviews = visitors.total_pageviews + 1,
            network_org = COALESCE(NULLIF(visitors.network_org, 'Anonymous Visitor'), EXCLUDED.network_org),
            updated_at = NOW()
        `, [
          visitor.id, visitor.anonymized_ip, visitor.network_org, visitor.network_domain,
          visitor.network_type, visitor.network_confidence, visitor.country, visitor.region,
          visitor.city, visitor.first_seen, visitor.last_seen, visitor.total_visits,
          visitor.total_pageviews, visitor.lead_status, visitor.admin_notes,
          visitor.is_opted_out, visitor.created_at, visitor.updated_at
        ]);

        await postgres.query(`
          INSERT INTO visitor_sessions (id, visitor_id, started_at, last_active_at, referrer, user_agent_category, pages_viewed, total_duration_sec, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO UPDATE SET
            last_active_at = EXCLUDED.last_active_at,
            pages_viewed = EXCLUDED.pages_viewed,
            total_duration_sec = visitor_sessions.total_duration_sec + EXCLUDED.total_duration_sec
        `, [
          session.id, session.visitor_id, session.started_at, session.last_active_at,
          session.referrer, session.user_agent_category, JSON.stringify(session.pages_viewed),
          session.total_duration_sec, session.created_at
        ]);
      } catch (err) {
        console.warn('Postgres recordVisitorHit warning:', err.message);
      }
    }

    return { visitor, session };
  }

  async linkVisitorToLead(visitorId, leadData, consentLinking = true) {
    if (!visitorId) return false;
    const visitors = this.getCollection('visitors');
    const visitor = visitors.find((v) => v.id === visitorId);
    if (!visitor) return false;

    // Strict privacy rule: Do not link identities to past sessions if user opted out or did not consent to linking
    if (visitor.is_opted_out || consentLinking === false) {
      return false;
    }

    visitor.voluntary_lead_id = leadData.id;
    visitor.voluntary_name = leadData.full_name || leadData.name;
    visitor.voluntary_company = leadData.company_name || leadData.company;
    visitor.voluntary_email = leadData.email;
    visitor.voluntary_phone = leadData.phone || '';
    visitor.consent_status = 'Consented & Linked';
    if (visitor.lead_status === 'New') {
      visitor.lead_status = 'Qualified Inbound Lead';
    }
    visitor.network_confidence = 'Verified (Voluntary Submission)';
    visitor.updated_at = new Date().toISOString();

    this.saveLocalSnapshot();

    if (this.usePostgres()) {
      try {
        await postgres.query(`
          UPDATE visitors SET
            voluntary_lead_id = $1, voluntary_name = $2, voluntary_company = $3,
            voluntary_email = $4, voluntary_phone = $5, lead_status = $6,
            network_confidence = $7, updated_at = NOW()
          WHERE id = $8
        `, [
          visitor.voluntary_lead_id, visitor.voluntary_name, visitor.voluntary_company,
          visitor.voluntary_email, visitor.voluntary_phone, visitor.lead_status,
          visitor.network_confidence, visitor.id
        ]);
      } catch (err) {
        console.warn('Postgres linkVisitorToLead warning:', err.message);
      }
    }

    return true;
  }

  async deleteVisitor(visitorId) {
    if (!visitorId) return false;
    const visitors = this.getCollection('visitors');
    const sessions = this.getCollection('visitor_sessions');

    const idx = visitors.findIndex((v) => v.id === visitorId);
    if (idx === -1) return false;

    visitors.splice(idx, 1);
    this.data.visitor_sessions = sessions.filter((s) => s.visitor_id !== visitorId);
    this.saveLocalSnapshot();

    if (this.usePostgres()) {
      try {
        await postgres.query('DELETE FROM visitor_sessions WHERE visitor_id = $1', [visitorId]);
        await postgres.query('DELETE FROM visitors WHERE id = $1', [visitorId]);
      } catch (err) {
        console.warn('Postgres deleteVisitor warning:', err.message);
      }
    }

    return true;
  }

  async getVisitors({ search = '', status = 'all', networkType = 'all', limit = 50, offset = 0 } = {}) {
    let list = this.getCollection('visitors') || [];
    const sessions = this.getCollection('visitor_sessions') || [];

    if (this.usePostgres()) {
      try {
        const res = await postgres.query('SELECT * FROM visitors ORDER BY last_seen DESC LIMIT $1 OFFSET $2', [limit, offset]);
        if (res.rows.length > 0) {
          list = res.rows;
        }
      } catch (err) {
        console.warn('Postgres getVisitors query warning:', err.message);
      }
    }

    let enriched = list.map((v) => {
      const vSessions = sessions.filter((s) => s.visitor_id === v.id);
      vSessions.sort((a, b) => new Date(b.last_active_at) - new Date(a.last_active_at));
      const latestSession = vSessions[0] || null;
      const allPages = vSessions.flatMap((s) => (Array.isArray(s.pages_viewed) ? s.pages_viewed : [])).map((p) => p.path);
      const uniquePages = [...new Set(allPages)];

      return {
        ...v,
        latestSession,
        latestSessionId: latestSession?.id || null,
        referral_source: v.referral_source || latestSession?.referrer || 'Direct',
        device_category: v.device_category || latestSession?.device_category || 'Desktop',
        browser_category: v.browser_category || latestSession?.browser_category || 'Other',
        consent_status: v.consent_status || (v.is_opted_out ? 'Opted Out' : 'Consented'),
        uniquePages,
        sessionCount: vSessions.length
      };
    });

    if (status && status !== 'all') {
      enriched = enriched.filter((v) => (v.lead_status || 'New').toLowerCase() === status.toLowerCase());
    }
    if (networkType && networkType !== 'all') {
      enriched = enriched.filter((v) => (v.network_type || '').toLowerCase().includes(networkType.toLowerCase()));
    }
    if (search) {
      const q = search.toLowerCase();
      enriched = enriched.filter((v) =>
        (v.id || '').toLowerCase().includes(q) ||
        (v.latestSessionId || '').toLowerCase().includes(q) ||
        (v.network_org || '').toLowerCase().includes(q) ||
        (v.voluntary_company || '').toLowerCase().includes(q) ||
        (v.voluntary_name || '').toLowerCase().includes(q) ||
        (v.voluntary_email || '').toLowerCase().includes(q) ||
        (v.voluntary_phone || '').toLowerCase().includes(q) ||
        (v.country || '').toLowerCase().includes(q) ||
        (v.anonymized_ip || '').toLowerCase().includes(q) ||
        (v.referral_source || '').toLowerCase().includes(q) ||
        (v.uniquePages || []).some((p) => p.toLowerCase().includes(q))
      );
    }

    enriched.sort((a, b) => new Date(b.last_seen || b.created_at) - new Date(a.last_seen || a.created_at));

    return {
      total: enriched.length,
      visitors: enriched.slice(offset, offset + limit)
    };
  }

  async getVisitorById(visitorId) {
    if (!visitorId) return null;
    const visitors = this.getCollection('visitors');
    let visitor = visitors.find((v) => v.id === visitorId);
    if (!visitor) return null;

    const sessions = (this.getCollection('visitor_sessions') || [])
      .filter((s) => s.visitor_id === visitorId)
      .sort((a, b) => new Date(b.last_active_at) - new Date(a.last_active_at));

    const latestSession = sessions[0] || null;

    // Check if there is an associated lead in engagements
    let associatedLead = null;
    if (visitor.voluntary_lead_id) {
      const engagements = this.getCollection('engagements') || [];
      associatedLead = engagements.find((e) => e.id === visitor.voluntary_lead_id) || null;
    }

    return {
      ...visitor,
      latestSessionId: latestSession?.id || null,
      referral_source: visitor.referral_source || latestSession?.referrer || 'Direct',
      device_category: visitor.device_category || latestSession?.device_category || 'Desktop',
      browser_category: visitor.browser_category || latestSession?.browser_category || 'Other',
      consent_status: visitor.consent_status || (visitor.is_opted_out ? 'Opted Out' : 'Consented'),
      sessions,
      associatedLead
    };
  }

  async updateVisitorLead(visitorId, updates = {}) {
    const visitors = this.getCollection('visitors');
    const idx = visitors.findIndex((v) => v.id === visitorId);
    if (idx === -1) return null;

    const now = new Date().toISOString();
    visitors[idx] = {
      ...visitors[idx],
      ...updates,
      updated_at: now
    };
    this.saveLocalSnapshot();

    if (this.usePostgres()) {
      try {
        await postgres.query(`
          UPDATE visitors SET
            lead_status = COALESCE($1, lead_status),
            admin_notes = COALESCE($2, admin_notes),
            updated_at = NOW()
          WHERE id = $3
        `, [updates.lead_status, updates.admin_notes, visitorId]);
      } catch (err) {
        console.warn('Postgres updateVisitorLead warning:', err.message);
      }
    }

    return visitors[idx];
  }

  async getVisitorStats() {
    const visitors = this.getCollection('visitors') || [];
    const corporateCount = visitors.filter((v) => (v.network_type || '').includes('Corporate') || (v.network_type || '').includes('Institutional')).length;
    const voluntaryCount = visitors.filter((v) => Boolean(v.voluntary_lead_id)).length;
    const today = new Date().toISOString().slice(0, 10);
    const activeTodayCount = visitors.filter((v) => (v.last_seen || '').slice(0, 10) === today).length;

    return {
      totalVisitors: visitors.length,
      corporateNetworks: corporateCount,
      voluntaryLeads: voluntaryCount,
      activeToday: activeTodayCount
    };
  }

  async purgeOldVisitors(retentionDays = 90) {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
    const visitors = this.getCollection('visitors') || [];
    const sessions = this.getCollection('visitor_sessions') || [];

    const initialVisitorCount = visitors.length;
    const initialSessionCount = sessions.length;

    // Preserve voluntary leads, only purge anonymous inactive visitors
    this.data.visitors = visitors.filter((v) => v.voluntary_lead_id || v.last_seen >= cutoffDate);
    const retainedVisitorIds = new Set(this.data.visitors.map((v) => v.id));
    this.data.visitor_sessions = sessions.filter((s) => retainedVisitorIds.has(s.visitor_id) && s.last_active_at >= cutoffDate);

    this.saveLocalSnapshot();

    if (this.usePostgres()) {
      try {
        await postgres.query('DELETE FROM visitor_sessions WHERE last_active_at < $1', [cutoffDate]);
        await postgres.query('DELETE FROM visitors WHERE last_seen < $1 AND voluntary_lead_id IS NULL', [cutoffDate]);
      } catch (err) {
        console.warn('Postgres purgeOldVisitors warning:', err.message);
      }
    }

    return {
      purgedVisitors: initialVisitorCount - this.data.visitors.length,
      purgedSessions: initialSessionCount - this.data.visitor_sessions.length
    };
  }

  async exportVisitorsCsv() {
    const { visitors } = await this.getVisitors({ limit: 10000 });
    const headers = [
      'Visitor ID',
      'Latest Session ID',
      'Known Name',
      'Email',
      'Phone',
      'First Visit',
      'Last Visit',
      'Pages Viewed',
      'Referral Source',
      'Device Category',
      'Browser Category',
      'Consent Status',
      'Associated Lead',
      'Company',
      'Network / Organization',
      'Network Type',
      'Confidence',
      'Country',
      'Region',
      'City',
      'Lead Status',
      'Admin Notes',
      'Pages Journey'
    ];

    const escapeCsv = (val) => {
      let str = String(val ?? '');
      // Neutralize spreadsheet formula injection characters (=, +, -, @, \t, \r)
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = visitors.map((v) => [
      escapeCsv(v.id),
      escapeCsv(v.latestSessionId || ''),
      escapeCsv(v.voluntary_name || 'Anonymous Visitor'),
      escapeCsv(v.voluntary_email || ''),
      escapeCsv(v.voluntary_phone || ''),
      escapeCsv(v.first_seen),
      escapeCsv(v.last_seen),
      escapeCsv(v.total_pageviews || 1),
      escapeCsv(v.referral_source || 'Direct'),
      escapeCsv(v.device_category || 'Desktop'),
      escapeCsv(v.browser_category || 'Other'),
      escapeCsv(v.consent_status || 'Consented'),
      escapeCsv(v.voluntary_lead_id || ''),
      escapeCsv(v.voluntary_company || ''),
      escapeCsv(v.network_org || 'Anonymous Visitor'),
      escapeCsv(v.network_type || 'Unresolved'),
      escapeCsv(v.network_confidence || 'Low'),
      escapeCsv(v.country || 'Unknown'),
      escapeCsv(v.region || ''),
      escapeCsv(v.city || ''),
      escapeCsv(v.lead_status || 'New'),
      escapeCsv(v.admin_notes || ''),
      escapeCsv((v.uniquePages || []).join(' -> '))
    ]);

    return [headers.map(escapeCsv).join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  }
}

export const db = new Database();
export { postgres };
