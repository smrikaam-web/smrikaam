-- ==============================================================================
-- SMRIKAAM Technologies - Supabase PostgreSQL Schema Migration
-- Migration 01: Core Tables & Constraints
-- Target Supabase Project: bgvayvnpgzfmagsoanem
-- ==============================================================================

-- 1. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(64) DEFAULT 'superadmin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Blog Posts Table
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

-- 3. Services Table
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

-- 4. Accelerators Table (Canonical Products: BitXhift, MigrateMax, ParseMaster, LinkGenX)
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

-- 5. Industries Table
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

-- 6. Case Studies Table
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

-- 7. Flash Reports Table (Includes all canonical columns for Dispatch & Report Workbench)
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
  category VARCHAR(255),
  problem_statement TEXT,
  solution_statement TEXT,
  cover_image_url TEXT,
  related_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- 8. Media Assets Table
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

-- 9. Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id VARCHAR(64) PRIMARY KEY,
  date VARCHAR(64),
  title TEXT NOT NULL,
  description TEXT,
  type VARCHAR(64) DEFAULT 'system',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Staffing Models Table
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

-- 11. Locations Table
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

-- 12. Settings Table
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(255) PRIMARY KEY,
  value JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Engagements Table (Book a Call, Inquiries, Contact Form Submissions)
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
  source VARCHAR(255) DEFAULT 'Book a Call Form',
  status VARCHAR(32) DEFAULT 'NEW',
  priority VARCHAR(32) DEFAULT 'MEDIUM',
  assigned_to VARCHAR(255),
  admin_notes TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
