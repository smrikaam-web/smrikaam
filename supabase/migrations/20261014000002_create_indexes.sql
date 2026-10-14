-- ==============================================================================
-- SMRIKAAM Technologies - Supabase PostgreSQL Schema Migration
-- Migration 02: Performance Indexes & Lookup Constraints
-- Target Supabase Project: bgvayvnpgzfmagsoanem
-- ==============================================================================

-- 1. Posts Indexes
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts (slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts (status);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts (category);

-- 2. Services Indexes
CREATE INDEX IF NOT EXISTS idx_services_slug ON services (slug);
CREATE INDEX IF NOT EXISTS idx_services_status ON services (status);
CREATE INDEX IF NOT EXISTS idx_services_display_order ON services (display_order ASC);

-- 3. Accelerators Indexes
CREATE INDEX IF NOT EXISTS idx_accelerators_slug ON accelerators (slug);
CREATE INDEX IF NOT EXISTS idx_accelerators_status ON accelerators (status);

-- 4. Industries Indexes
CREATE INDEX IF NOT EXISTS idx_industries_slug ON industries (slug);
CREATE INDEX IF NOT EXISTS idx_industries_status ON industries (status);

-- 5. Case Studies Indexes
CREATE INDEX IF NOT EXISTS idx_case_studies_slug ON case_studies (slug);
CREATE INDEX IF NOT EXISTS idx_case_studies_status ON case_studies (status);
CREATE INDEX IF NOT EXISTS idx_case_studies_industry ON case_studies (industry);

-- 6. Reports Indexes
CREATE INDEX IF NOT EXISTS idx_reports_slug ON reports (slug);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports (status);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports (type);
CREATE INDEX IF NOT EXISTS idx_reports_date ON reports (date DESC);

-- 7. Media Indexes
CREATE INDEX IF NOT EXISTS idx_media_filename ON media (filename);
CREATE INDEX IF NOT EXISTS idx_media_type ON media (type);
CREATE INDEX IF NOT EXISTS idx_media_uploaded ON media (uploaded_at DESC);

-- 8. Activity Logs Indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_time ON activity_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON activity_logs (type);

-- 9. Staffing Indexes
CREATE INDEX IF NOT EXISTS idx_staffing_slug ON staffing (slug);
CREATE INDEX IF NOT EXISTS idx_staffing_status ON staffing (status);

-- 10. Locations Indexes
CREATE INDEX IF NOT EXISTS idx_locations_slug ON locations (slug);
CREATE INDEX IF NOT EXISTS idx_locations_status ON locations (status);

-- 11. Engagements Indexes
CREATE INDEX IF NOT EXISTS idx_engagements_created ON engagements (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_engagements_status ON engagements (status);
CREATE INDEX IF NOT EXISTS idx_engagements_email ON engagements (email);
CREATE INDEX IF NOT EXISTS idx_engagements_is_read ON engagements (is_read);
