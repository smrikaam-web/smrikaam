-- ==============================================================================
-- SMRIKAAM Technologies - Supabase PostgreSQL Schema Migration
-- Migration 03: Row Level Security (RLS) & Access Control Policies
-- Target Supabase Project: bgvayvnpgzfmagsoanem
-- ==============================================================================

-- 1. Enable Row Level Security across all 13 application tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE accelerators ENABLE ROW LEVEL SECURITY;
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE staffing ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;

-- 2. Drop any legacy/duplicate policies if re-running (scoped to the 13 SMRIKAAM tables only)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'admin_users', 'posts', 'services', 'accelerators', 'industries',
        'case_studies', 'reports', 'media', 'activity_logs', 'staffing',
        'locations', 'settings', 'engagements'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- 3. Public Read Access Policies (Published Content Only)
CREATE POLICY "Public Read Access on Published Posts"
  ON posts FOR SELECT
  TO anon, authenticated, public
  USING (status = 'published');

CREATE POLICY "Public Read Access on Published Services"
  ON services FOR SELECT
  TO anon, authenticated, public
  USING (status = 'published');

CREATE POLICY "Public Read Access on Published Accelerators"
  ON accelerators FOR SELECT
  TO anon, authenticated, public
  USING (status = 'published');

CREATE POLICY "Public Read Access on Published Industries"
  ON industries FOR SELECT
  TO anon, authenticated, public
  USING (status = 'published');

CREATE POLICY "Public Read Access on Published Case Studies"
  ON case_studies FOR SELECT
  TO anon, authenticated, public
  USING (status = 'published');

CREATE POLICY "Public Read Access on Published Reports"
  ON reports FOR SELECT
  TO anon, authenticated, public
  USING (status = 'published');

CREATE POLICY "Public Read Access on Published Staffing"
  ON staffing FOR SELECT
  TO anon, authenticated, public
  USING (status = 'published');

CREATE POLICY "Public Read Access on Published Locations"
  ON locations FOR SELECT
  TO anon, authenticated, public
  USING (status = 'published');

CREATE POLICY "Public Read Access on Settings"
  ON settings FOR SELECT
  TO anon, authenticated, public
  USING (true);

-- 4. Public Ingestion Policy (Contact & Book a Call Form Submissions)
--    WITH CHECK enforces that anonymous callers may only insert rows that
--    match the safe initial state produced by the Node/Express server:
--      - status  VARCHAR(32)  must be 'NEW'   (schema default: 'NEW')
--      - priority VARCHAR(32) must be 'MEDIUM' (schema default: 'MEDIUM')
--      - assigned_to VARCHAR(255) must be NULL or empty string
--      - admin_notes TEXT must be NULL or empty string
--      - is_read BOOLEAN must be false         (schema default: false)
--    Direct Supabase REST calls that attempt to inject elevated status,
--    priority, or administrative fields will be rejected by PostgreSQL.
CREATE POLICY "Public Ingestion on Engagements"
  ON engagements FOR INSERT
  TO anon, authenticated, public
  WITH CHECK (
    status = 'NEW'
    AND priority = 'MEDIUM'
    AND (assigned_to IS NULL OR assigned_to = '')
    AND (admin_notes IS NULL OR admin_notes = '')
    AND is_read = false
  );

-- 5. Service Role Administrative Full Access Policies
-- The backend server (Node/Express/Vercel) and Supabase Service Role require full CRUD
CREATE POLICY "Service Role Full Access on admin_users"
  ON admin_users FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service Role Full Access on posts"
  ON posts FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service Role Full Access on services"
  ON services FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service Role Full Access on accelerators"
  ON accelerators FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service Role Full Access on industries"
  ON industries FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service Role Full Access on case_studies"
  ON case_studies FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service Role Full Access on reports"
  ON reports FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service Role Full Access on media"
  ON media FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service Role Full Access on activity_logs"
  ON activity_logs FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service Role Full Access on staffing"
  ON staffing FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service Role Full Access on locations"
  ON locations FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service Role Full Access on settings"
  ON settings FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service Role Full Access on engagements"
  ON engagements FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);
