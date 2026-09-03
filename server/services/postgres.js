import pg from 'pg';
import dotenv from 'dotenv';
import { initialSeedData } from '../data/seedData.js';

dotenv.config();

const { Pool } = pg;

class PostgresService {
  constructor() {
    this.pool = null;
    this.isConnected = false;
    this.connectionError = null;
    this.init();
  }

  init() {
    const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    const connectionString = process.env.DATABASE_URL ||
      process.env.DIRECT_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.SUPABASE_DATABASE_URL;

    if (connectionString) {
      console.log('DATABASE_URL: configured');
    } else {
      console.warn('DATABASE_URL is not configured.');
    }

    if (!connectionString && isProd) {
      console.warn('DATABASE_URL is not configured in this environment. Falling back to local data store.');
      this.connectionError = 'DATABASE_URL missing in production';
      this.isConnected = false;
      return;
    }

    const finalConnString = connectionString ||
      `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || 'postgres'}@${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'smrikaam_db'}`;

    // Determine SSL requirement for Supabase / production
    const isSupabase = finalConnString.includes('supabase') || finalConnString.includes('sslmode=require');
    const sslConfig = (isProd || isSupabase || !finalConnString.includes('localhost'))
      ? { rejectUnauthorized: false }
      : false;

    try {
      if (!this.pool) {
        this.pool = new Pool({
          connectionString: finalConnString,
          ssl: sslConfig,
          connectionTimeoutMillis: 5000,
          idleTimeoutMillis: 30000,
          max: isProd ? 10 : 20
        });

        this.pool.on('error', (err) => {
          console.warn('PostgreSQL Pool background error:', err.message);
          this.isConnected = false;
        });
      }

      // Try initial connection test
      this.testConnection();
    } catch (err) {
      this.connectionError = err.message;
      this.isConnected = false;
      console.warn('PostgreSQL Pool initialization warning:', err.message);
    }
  }

  async testConnection() {
    if (!this.pool) return false;
    try {
      const client = await this.pool.connect();
      const res = await client.query('SELECT NOW()');
      client.release();
      this.isConnected = true;
      this.connectionError = null;
      console.log('✓ PostgreSQL Database Connected Successfully at:', res.rows[0].now);
      
      // Auto run migrations and seeds
      await this.runMigrations();
      return true;
    } catch (err) {
      this.isConnected = false;
      this.connectionError = err.message;
      return false;
    }
  }

  async runMigrations() {
    if (!this.isConnected) return;
    try {
      await this.query(`
        CREATE TABLE IF NOT EXISTS admin_users (
          id VARCHAR(64) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(64) DEFAULT 'superadmin',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS posts (
          id VARCHAR(64) PRIMARY KEY,
          title VARCHAR(500) NOT NULL,
          slug VARCHAR(500) UNIQUE NOT NULL,
          category VARCHAR(255),
          excerpt TEXT,
          content TEXT NOT NULL,
          cover_image_url TEXT,
          tags JSONB DEFAULT '[]'::jsonb,
          author VARCHAR(255) DEFAULT 'SMRIKAAM Engineering Team',
          read_time VARCHAR(64) DEFAULT '5 min read',
          meta_title VARCHAR(500),
          meta_description TEXT,
          status VARCHAR(32) DEFAULT 'draft',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          published_at TIMESTAMPTZ
        );

        CREATE TABLE IF NOT EXISTS services (
          id VARCHAR(64) PRIMARY KEY,
          title VARCHAR(500) NOT NULL,
          slug VARCHAR(500) UNIQUE NOT NULL,
          num VARCHAR(16),
          tagline TEXT,
          summary TEXT,
          description TEXT NOT NULL,
          business_problems JSONB DEFAULT '[]'::jsonb,
          capabilities JSONB DEFAULT '[]'::jsonb,
          technology JSONB DEFAULT '[]'::jsonb,
          industry_applications JSONB DEFAULT '[]'::jsonb,
          problem_statement TEXT,
          solution_statement TEXT,
          outcomes TEXT,
          accelerator VARCHAR(255),
          case_study VARCHAR(255),
          cover_image_url TEXT,
          status VARCHAR(32) DEFAULT 'published',
          display_order INT DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          published_at TIMESTAMPTZ
        );

        CREATE TABLE IF NOT EXISTS accelerators (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          category VARCHAR(255),
          tagline TEXT,
          short_description TEXT,
          full_description TEXT,
          cover_image_url TEXT,
          problem TEXT,
          solution TEXT,
          how_it_works TEXT,
          architecture TEXT,
          key_features JSONB DEFAULT '[]'::jsonb,
          technology JSONB DEFAULT '[]'::jsonb,
          use_cases JSONB DEFAULT '[]'::jsonb,
          business_outcomes TEXT,
          pdf_url TEXT,
          status VARCHAR(32) DEFAULT 'published',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          published_at TIMESTAMPTZ
        );

        CREATE TABLE IF NOT EXISTS industries (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          summary TEXT,
          content TEXT NOT NULL,
          cover_image_url TEXT,
          business_problems JSONB DEFAULT '[]'::jsonb,
          solutions JSONB DEFAULT '[]'::jsonb,
          technology JSONB DEFAULT '[]'::jsonb,
          use_cases JSONB DEFAULT '[]'::jsonb,
          status VARCHAR(32) DEFAULT 'published',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          published_at TIMESTAMPTZ
        );

        CREATE TABLE IF NOT EXISTS case_studies (
          id VARCHAR(64) PRIMARY KEY,
          title VARCHAR(500) NOT NULL,
          client_name VARCHAR(255) NOT NULL,
          slug VARCHAR(500) UNIQUE NOT NULL,
          industry VARCHAR(255),
          location VARCHAR(255),
          accelerator VARCHAR(255),
          related_service VARCHAR(255),
          challenge TEXT,
          solution TEXT,
          implementation TEXT,
          results TEXT,
          technologies JSONB DEFAULT '[]'::jsonb,
          cover_image_url TEXT,
          pdf_url TEXT,
          status VARCHAR(32) DEFAULT 'published',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          published_at TIMESTAMPTZ
        );

        CREATE TABLE IF NOT EXISTS reports (
          id VARCHAR(64) PRIMARY KEY,
          title VARCHAR(500) NOT NULL,
          slug VARCHAR(500) UNIQUE NOT NULL,
          date VARCHAR(64),
          type VARCHAR(64) DEFAULT 'FLASH',
          report_type VARCHAR(64) DEFAULT 'ENGINEERING // DISPATCH',
          status VARCHAR(32) DEFAULT 'published',
          summary TEXT,
          full_content TEXT,
          tags JSONB DEFAULT '[]'::jsonb,
          key_findings JSONB DEFAULT '[]'::jsonb,
          source_file VARCHAR(255),
          pdf_url TEXT,
          docx_url TEXT,
          featured BOOLEAN DEFAULT false,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          published_at TIMESTAMPTZ
        );

        CREATE TABLE IF NOT EXISTS media (
          id VARCHAR(64) PRIMARY KEY,
          filename VARCHAR(255) NOT NULL,
          original_name VARCHAR(255) NOT NULL,
          url TEXT NOT NULL,
          mime_type VARCHAR(128),
          size INT,
          type VARCHAR(64) DEFAULT 'file',
          uploaded_at TIMESTAMPTZ DEFAULT NOW(),
          metadata JSONB DEFAULT '{}'::jsonb
        );

        CREATE TABLE IF NOT EXISTS activity_logs (
          id VARCHAR(64) PRIMARY KEY,
          date VARCHAR(64),
          title TEXT NOT NULL,
          description TEXT,
          type VARCHAR(64) DEFAULT 'system',
          timestamp TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS staffing (
          id VARCHAR(64) PRIMARY KEY,
          title VARCHAR(500) NOT NULL,
          slug VARCHAR(500) UNIQUE NOT NULL,
          subtitle TEXT,
          "desc" TEXT,
          bullets JSONB DEFAULT '[]'::jsonb,
          status VARCHAR(32) DEFAULT 'published',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          published_at TIMESTAMPTZ
        );

        CREATE TABLE IF NOT EXISTS locations (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          type VARCHAR(255),
          address TEXT,
          email VARCHAR(255),
          phone VARCHAR(64),
          description TEXT,
          capabilities JSONB DEFAULT '[]'::jsonb,
          status VARCHAR(32) DEFAULT 'published',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          published_at TIMESTAMPTZ
        );

        CREATE TABLE IF NOT EXISTS settings (
          key VARCHAR(255) PRIMARY KEY,
          value JSONB DEFAULT '{}'::jsonb,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS engagements (
          id VARCHAR(64) PRIMARY KEY,
          full_name VARCHAR(255) NOT NULL,
          company_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(64),
          job_title VARCHAR(255),
          requirement_type VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          preferred_date VARCHAR(64),
          preferred_time VARCHAR(64),
          source VARCHAR(255),
          status VARCHAR(32) DEFAULT 'NEW',
          priority VARCHAR(32) DEFAULT 'MEDIUM',
          assigned_to VARCHAR(255),
          admin_notes TEXT,
          is_read BOOLEAN DEFAULT false,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Safe column migrations for existing tables
        ALTER TABLE engagements ADD COLUMN IF NOT EXISTS job_title VARCHAR(255);
        ALTER TABLE engagements ADD COLUMN IF NOT EXISTS preferred_date VARCHAR(64);
        ALTER TABLE engagements ADD COLUMN IF NOT EXISTS preferred_time VARCHAR(64);
        ALTER TABLE engagements ADD COLUMN IF NOT EXISTS source VARCHAR(255);
        ALTER TABLE engagements ADD COLUMN IF NOT EXISTS priority VARCHAR(32) DEFAULT 'MEDIUM';
        ALTER TABLE engagements ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(255);
        ALTER TABLE engagements ADD COLUMN IF NOT EXISTS admin_notes TEXT;
        ALTER TABLE engagements ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
        ALTER TABLE engagements ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
      `);

      console.log('✓ PostgreSQL tables initialization complete.');
    } catch (err) {
      console.error('PostgreSQL migration error:', err.message);
    }
  }

  ensurePool() {
    if (!this.pool) {
      this.init();
    }
    return this.pool;
  }

  async query(text, params) {
    const pool = this.ensurePool();
    if (!pool) throw new Error('PostgreSQL Pool not initialized');
    try {
      const res = await pool.query(text, params);
      this.isConnected = true;
      return res;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.code === '57P01') {
        this.isConnected = false;
      }
      throw err;
    }
  }

  getStatus() {
    let hostName = process.env.PGHOST || 'localhost';
    if (process.env.DATABASE_URL) {
      try {
        const url = new URL(process.env.DATABASE_URL.replace(/^postgres:/, 'http:').replace(/^postgresql:/, 'http:'));
        hostName = url.hostname || 'remote-supabase';
      } catch {
        hostName = 'configured-database-url';
      }
    }
    return {
      engine: 'PostgreSQL',
      connected: this.isConnected,
      host: hostName,
      port: process.env.PGPORT || 5432,
      database: process.env.PGDATABASE || 'smrikaam_db',
      error: this.connectionError
    };
  }
}

export const postgres = new PostgresService();
