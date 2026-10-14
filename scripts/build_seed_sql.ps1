# PowerShell script to convert verified cms_db.json into clean SQL seed statements
$ErrorActionPreference = 'Stop'

function Coalesce($a, $b) {
    if ($null -ne $a -and $a -ne '') { return $a }
    return $b
}

function SqlStr($val, $default = 'NULL') {
    if ($null -eq $val -or $val -eq '') {
        if ($default -eq 'NULL') { return 'NULL' }
        return "'$($default.Replace("'", "''"))'"
    }
    return "'$(([string]$val).Replace("'", "''"))'"
}

function SqlJson($val) {
    if ($null -eq $val) { return "'[]'::jsonb" }
    $json = $val | ConvertTo-Json -Compress -Depth 10
    return "'$($json.Replace("'", "''"))'::jsonb"
}

function SqlBool($val) {
    if ($val) { return 'TRUE' }
    return 'FALSE'
}

function SqlInt($val, $default = 0) {
    if ($null -eq $val -or $val -eq '') { return [string]$default }
    return [string][int]$val
}

function SqlDate($val) {
    if ($null -eq $val -or $val -eq '') { return 'NOW()' }
    return "'$(([string]$val).Replace("'", "''"))'::timestamptz"
}

$db = Get-Content -Raw "server/data/cms_db.json" | ConvertFrom-Json
$sql = [System.Text.StringBuilder]::new()

[void]$sql.AppendLine("-- ==============================================================================")
[void]$sql.AppendLine("-- SMRIKAAM Technologies - Supabase PostgreSQL Schema Migration")
[void]$sql.AppendLine("-- Migration 04: Seed Verified Historical Data (Idempotent ON CONFLICT)")
[void]$sql.AppendLine("-- Target Supabase Project: bgvayvnpgzfmagsoanem")
[void]$sql.AppendLine("-- ==============================================================================`n")

# 1. Admin Users
[void]$sql.AppendLine("-- 1. Admin Users (1 Verified SuperAdmin)")
foreach ($u in $db.users) {
    $id = SqlStr $u.id
    $email = SqlStr $u.email
    $pwd = SqlStr (Coalesce $u.passwordHash $u.password_hash)
    $name = SqlStr $u.name
    $role = SqlStr (Coalesce $u.role 'superadmin')
    $created = SqlDate $u.created_at
    $updated = SqlDate $u.updated_at
    [void]$sql.AppendLine("INSERT INTO admin_users (id, email, password_hash, name, role, created_at, updated_at)")
    [void]$sql.AppendLine("VALUES ($id, $email, $pwd, $name, $role, $created, $updated)")
    [void]$sql.AppendLine("ON CONFLICT (id) DO UPDATE SET")
    [void]$sql.AppendLine("  email = EXCLUDED.email, password_hash = EXCLUDED.password_hash, name = EXCLUDED.name, role = EXCLUDED.role, updated_at = NOW();`n")
}

# 2. Blog Posts
[void]$sql.AppendLine("-- 2. Blog Posts (4 Verified Articles)")
foreach ($p in $db.posts) {
    $id = SqlStr $p.id
    $title = SqlStr $p.title
    $slug = SqlStr $p.slug
    $cat = SqlStr $p.category
    $excerpt = SqlStr $p.excerpt
    $content = SqlStr $p.content
    $cover = SqlStr $p.cover_image_url
    $tags = SqlJson $p.tags
    $author = SqlStr (Coalesce $p.author 'SMRIKAAM Engineering Team')
    $readTime = SqlStr (Coalesce $p.read_time '5 min read')
    $metaTitle = SqlStr (Coalesce $p.meta_title $p.title)
    $metaDesc = SqlStr (Coalesce $p.meta_description $p.excerpt)
    $status = SqlStr (Coalesce $p.status 'published')
    $created = SqlDate $p.created_at
    $updated = SqlDate $p.updated_at
    $published = SqlDate $p.published_at
    [void]$sql.AppendLine("INSERT INTO posts (id, title, slug, category, excerpt, content, cover_image_url, tags, author, read_time, meta_title, meta_description, status, created_at, updated_at, published_at)")
    [void]$sql.AppendLine("VALUES ($id, $title, $slug, $cat, $excerpt, $content, $cover, $tags, $author, $readTime, $metaTitle, $metaDesc, $status, $created, $updated, $published)")
    [void]$sql.AppendLine("ON CONFLICT (id) DO UPDATE SET")
    [void]$sql.AppendLine("  title = EXCLUDED.title, slug = EXCLUDED.slug, category = EXCLUDED.category, excerpt = EXCLUDED.excerpt,")
    [void]$sql.AppendLine("  content = EXCLUDED.content, cover_image_url = EXCLUDED.cover_image_url, tags = EXCLUDED.tags,")
    [void]$sql.AppendLine("  author = EXCLUDED.author, read_time = EXCLUDED.read_time, meta_title = EXCLUDED.meta_title,")
    [void]$sql.AppendLine("  meta_description = EXCLUDED.meta_description, status = EXCLUDED.status, updated_at = NOW();`n")
}

# 3. Services
[void]$sql.AppendLine("-- 3. Services (10 Verified Offerings)")
foreach ($s in $db.services) {
    $id = SqlStr $s.id
    $title = SqlStr $s.title
    $slug = SqlStr $s.slug
    $num = SqlStr $s.num
    $tagline = SqlStr $s.tagline
    $summary = SqlStr $s.summary
    $desc = SqlStr (Coalesce $s.description $s.content)
    $bizProb = SqlJson (Coalesce $s.businessProblems $s.business_problems)
    $caps = SqlJson $s.capabilities
    $tech = SqlJson $s.technology
    $indApps = SqlJson (Coalesce $s.industryApplications $s.industry_applications)
    $prob = SqlStr (Coalesce $s.problemStatement $s.problem_statement)
    $sol = SqlStr (Coalesce $s.solutionStatement $s.solution_statement)
    $outcomes = SqlStr $s.outcomes
    $acc = SqlStr $s.accelerator
    $cs = SqlStr (Coalesce $s.caseStudy $s.case_study)
    $cover = SqlStr $s.cover_image_url
    $status = SqlStr (Coalesce $s.status 'published')
    $order = SqlInt (Coalesce $s.display_order $s.num)
    $created = SqlDate $s.created_at
    $updated = SqlDate $s.updated_at
    $published = SqlDate $s.published_at

    [void]$sql.AppendLine("INSERT INTO services (id, title, slug, num, tagline, summary, description, business_problems, capabilities, technology, industry_applications, problem_statement, solution_statement, outcomes, accelerator, case_study, cover_image_url, status, display_order, created_at, updated_at, published_at)")
    [void]$sql.AppendLine("VALUES ($id, $title, $slug, $num, $tagline, $summary, $desc, $bizProb, $caps, $tech, $indApps, $prob, $sol, $outcomes, $acc, $cs, $cover, $status, $order, $created, $updated, $published)")
    [void]$sql.AppendLine("ON CONFLICT (id) DO UPDATE SET")
    [void]$sql.AppendLine("  title = EXCLUDED.title, slug = EXCLUDED.slug, num = EXCLUDED.num, tagline = EXCLUDED.tagline, summary = EXCLUDED.summary,")
    [void]$sql.AppendLine("  description = EXCLUDED.description, business_problems = EXCLUDED.business_problems, capabilities = EXCLUDED.capabilities,")
    [void]$sql.AppendLine("  technology = EXCLUDED.technology, industry_applications = EXCLUDED.industry_applications, problem_statement = EXCLUDED.problem_statement,")
    [void]$sql.AppendLine("  solution_statement = EXCLUDED.solution_statement, outcomes = EXCLUDED.outcomes, accelerator = EXCLUDED.accelerator,")
    [void]$sql.AppendLine("  case_study = EXCLUDED.case_study, cover_image_url = EXCLUDED.cover_image_url, status = EXCLUDED.status, display_order = EXCLUDED.display_order, updated_at = NOW();`n")
}

# 4. Accelerators
[void]$sql.AppendLine("-- 4. Accelerators (4 Verified Canonical Products: BitXhift, MigrateMax, ParseMaster, LinkGenX)")
foreach ($a in $db.accelerators) {
    $id = SqlStr $a.id
    $name = SqlStr $a.name
    $slug = SqlStr $a.slug
    $cat = SqlStr $a.category
    $tagline = SqlStr $a.tagline
    $shortDesc = SqlStr (Coalesce $a.shortDescription $a.short_description)
    $fullDesc = SqlStr (Coalesce $a.fullDescription $a.full_description)
    $cover = SqlStr $a.cover_image_url
    $prob = SqlStr $a.problem
    $sol = SqlStr $a.solution
    $how = SqlStr (Coalesce $a.howItWorks $a.how_it_works)
    $arch = SqlStr $a.architecture
    $feat = SqlJson (Coalesce $a.keyFeatures $a.key_features)
    $tech = SqlJson $a.technology
    $useCases = SqlJson (Coalesce $a.useCases $a.use_cases)
    $outcomes = SqlStr (Coalesce $a.businessOutcomes $a.business_outcomes)
    $pdf = SqlStr (Coalesce $a.pdfUrl $a.pdf_url)
    $status = SqlStr (Coalesce $a.status 'published')
    $created = SqlDate $a.created_at
    $updated = SqlDate $a.updated_at
    $published = SqlDate $a.published_at

    [void]$sql.AppendLine("INSERT INTO accelerators (id, name, slug, category, tagline, short_description, full_description, cover_image_url, problem, solution, how_it_works, architecture, key_features, technology, use_cases, business_outcomes, pdf_url, status, created_at, updated_at, published_at)")
    [void]$sql.AppendLine("VALUES ($id, $name, $slug, $cat, $tagline, $shortDesc, $fullDesc, $cover, $prob, $sol, $how, $arch, $feat, $tech, $useCases, $outcomes, $pdf, $status, $created, $updated, $published)")
    [void]$sql.AppendLine("ON CONFLICT (id) DO UPDATE SET")
    [void]$sql.AppendLine("  name = EXCLUDED.name, slug = EXCLUDED.slug, category = EXCLUDED.category, tagline = EXCLUDED.tagline,")
    [void]$sql.AppendLine("  short_description = EXCLUDED.short_description, full_description = EXCLUDED.full_description, cover_image_url = EXCLUDED.cover_image_url,")
    [void]$sql.AppendLine("  problem = EXCLUDED.problem, solution = EXCLUDED.solution, how_it_works = EXCLUDED.how_it_works, architecture = EXCLUDED.architecture,")
    [void]$sql.AppendLine("  key_features = EXCLUDED.key_features, technology = EXCLUDED.technology, use_cases = EXCLUDED.use_cases,")
    [void]$sql.AppendLine("  business_outcomes = EXCLUDED.business_outcomes, pdf_url = EXCLUDED.pdf_url, status = EXCLUDED.status, updated_at = NOW();`n")
}

# 5. Industries
[void]$sql.AppendLine("-- 5. Industries (11 Verified Sectors)")
foreach ($ind in $db.industries) {
    $id = SqlStr $ind.id
    $name = SqlStr $ind.name
    $slug = SqlStr $ind.slug
    $summary = SqlStr $ind.summary
    $content = SqlStr $ind.content
    $cover = SqlStr $ind.cover_image_url
    $bizProb = SqlJson (Coalesce $ind.businessProblems $ind.business_problems)
    $solutions = SqlJson $ind.solutions
    $tech = SqlJson $ind.technology
    $useCases = SqlJson (Coalesce $ind.useCases $ind.use_cases)
    $status = SqlStr (Coalesce $ind.status 'published')
    $created = SqlDate $ind.created_at
    $updated = SqlDate $ind.updated_at
    $published = SqlDate $ind.published_at

    [void]$sql.AppendLine("INSERT INTO industries (id, name, slug, summary, content, cover_image_url, business_problems, solutions, technology, use_cases, status, created_at, updated_at, published_at)")
    [void]$sql.AppendLine("VALUES ($id, $name, $slug, $summary, $content, $cover, $bizProb, $solutions, $tech, $useCases, $status, $created, $updated, $published)")
    [void]$sql.AppendLine("ON CONFLICT (id) DO UPDATE SET")
    [void]$sql.AppendLine("  name = EXCLUDED.name, slug = EXCLUDED.slug, summary = EXCLUDED.summary, content = EXCLUDED.content,")
    [void]$sql.AppendLine("  cover_image_url = EXCLUDED.cover_image_url, business_problems = EXCLUDED.business_problems, solutions = EXCLUDED.solutions,")
    [void]$sql.AppendLine("  technology = EXCLUDED.technology, use_cases = EXCLUDED.use_cases, status = EXCLUDED.status, updated_at = NOW();`n")
}

# 6. Case Studies
[void]$sql.AppendLine("-- 6. Case Studies (2 Verified Studies)")
foreach ($cs in $db.caseStudies) {
    $id = SqlStr $cs.id
    $title = SqlStr $cs.title
    $client = SqlStr (Coalesce $cs.client_name $cs.client)
    $slug = SqlStr $cs.slug
    $ind = SqlStr $cs.industry
    $loc = SqlStr $cs.location
    $acc = SqlStr $cs.accelerator
    $relServ = SqlStr (Coalesce $cs.relatedService $cs.related_service)
    $chal = SqlStr $cs.challenge
    $sol = SqlStr $cs.solution
    $impl = SqlStr $cs.implementation
    $res = SqlStr $cs.results
    $tech = SqlJson $cs.technologies
    $cover = SqlStr $cs.cover_image_url
    $pdf = SqlStr (Coalesce $cs.pdfUrl $cs.pdf_url)
    $status = SqlStr (Coalesce $cs.status 'published')
    $created = SqlDate $cs.created_at
    $updated = SqlDate $cs.updated_at
    $published = SqlDate $cs.published_at

    [void]$sql.AppendLine("INSERT INTO case_studies (id, title, client_name, slug, industry, location, accelerator, related_service, challenge, solution, implementation, results, technologies, cover_image_url, pdf_url, status, created_at, updated_at, published_at)")
    [void]$sql.AppendLine("VALUES ($id, $title, $client, $slug, $ind, $loc, $acc, $relServ, $chal, $sol, $impl, $res, $tech, $cover, $pdf, $status, $created, $updated, $published)")
    [void]$sql.AppendLine("ON CONFLICT (id) DO UPDATE SET")
    [void]$sql.AppendLine("  title = EXCLUDED.title, client_name = EXCLUDED.client_name, slug = EXCLUDED.slug, industry = EXCLUDED.industry,")
    [void]$sql.AppendLine("  location = EXCLUDED.location, accelerator = EXCLUDED.accelerator, related_service = EXCLUDED.related_service,")
    [void]$sql.AppendLine("  challenge = EXCLUDED.challenge, solution = EXCLUDED.solution, implementation = EXCLUDED.implementation,")
    [void]$sql.AppendLine("  results = EXCLUDED.results, technologies = EXCLUDED.technologies, cover_image_url = EXCLUDED.cover_image_url,")
    [void]$sql.AppendLine("  pdf_url = EXCLUDED.pdf_url, status = EXCLUDED.status, updated_at = NOW();`n")
}

# 7. Flash Reports
[void]$sql.AppendLine("-- 7. Flash Reports (3 Verified Reports)")
foreach ($rep in $db.reports) {
    $id = SqlStr $rep.id
    $title = SqlStr $rep.title
    $rawSlug = $rep.slug
    if (-not $rawSlug) {
        $rawSlug = ($rep.title.ToLower() -replace '[^a-z0-9]+', '-').Trim('-')
    }
    $slug = SqlStr $rawSlug
    $date = SqlStr $rep.date
    $type = SqlStr (Coalesce $rep.type 'FLASH')
    $repType = SqlStr (Coalesce $rep.reportType (Coalesce $rep.report_type 'ENGINEERING // DISPATCH'))
    $status = SqlStr (Coalesce $rep.status 'published')
    $summary = SqlStr (Coalesce $rep.summary $rep.problemStatement)
    $content = SqlStr (Coalesce $rep.full_content $rep.solutionStatement)
    $tags = SqlJson (Coalesce $rep.tags $rep.techStack)
    $keyFindings = SqlJson (Coalesce $rep.key_findings @())
    $sourceFile = SqlStr (Coalesce $rep.sourceFile $rep.source_file)
    $pdf = SqlStr (Coalesce $rep.pdfUrl $rep.pdf_url)
    $docx = SqlStr (Coalesce $rep.docxUrl $rep.docx_url)
    $featured = SqlBool ($rep.featured)
    $cat = SqlStr $rep.category
    $prob = SqlStr (Coalesce $rep.problemStatement $rep.problem_statement)
    $sol = SqlStr (Coalesce $rep.solutionStatement $rep.solution_statement)
    $cover = SqlStr $rep.cover_image_url
    $related = SqlStr (Coalesce $rep.relatedContent $rep.related_content)
    $created = SqlDate $rep.created_at
    $updated = SqlDate $rep.updated_at
    $published = SqlDate $rep.published_at

    [void]$sql.AppendLine("INSERT INTO reports (id, title, slug, date, type, report_type, status, summary, full_content, tags, key_findings, source_file, pdf_url, docx_url, featured, category, problem_statement, solution_statement, cover_image_url, related_content, created_at, updated_at, published_at)")
    [void]$sql.AppendLine("VALUES ($id, $title, $slug, $date, $type, $repType, $status, $summary, $content, $tags, $keyFindings, $sourceFile, $pdf, $docx, $featured, $cat, $prob, $sol, $cover, $related, $created, $updated, $published)")
    [void]$sql.AppendLine("ON CONFLICT (id) DO UPDATE SET")
    [void]$sql.AppendLine("  title = EXCLUDED.title, slug = EXCLUDED.slug, date = EXCLUDED.date, type = EXCLUDED.type,")
    [void]$sql.AppendLine("  report_type = EXCLUDED.report_type, status = EXCLUDED.status, summary = EXCLUDED.summary,")
    [void]$sql.AppendLine("  full_content = EXCLUDED.full_content, tags = EXCLUDED.tags, key_findings = EXCLUDED.key_findings,")
    [void]$sql.AppendLine("  category = EXCLUDED.category, problem_statement = EXCLUDED.problem_statement, solution_statement = EXCLUDED.solution_statement,")
    [void]$sql.AppendLine("  cover_image_url = EXCLUDED.cover_image_url, related_content = EXCLUDED.related_content, updated_at = NOW();`n")
}

# 8. Media Assets
[void]$sql.AppendLine("-- 8. Media Assets (4 Verified Storage Assets)")
foreach ($m in $db.media) {
    $id = SqlStr $m.id
    $filename = SqlStr $m.filename
    $origName = SqlStr (Coalesce $m.originalName (Coalesce $m.original_name $m.filename))
    $url = SqlStr $m.url
    $mime = SqlStr (Coalesce $m.mimetype $m.mime_type)
    $size = SqlInt $m.size
    $type = SqlStr (Coalesce $m.type 'file')
    $uploaded = SqlDate (Coalesce $m.uploaded_at $m.created_at)
    $meta = SqlJson (Coalesce $m.metadata @{})

    [void]$sql.AppendLine("INSERT INTO media (id, filename, original_name, url, mime_type, size, type, uploaded_at, metadata)")
    [void]$sql.AppendLine("VALUES ($id, $filename, $origName, $url, $mime, $size, $type, $uploaded, $meta)")
    [void]$sql.AppendLine("ON CONFLICT (id) DO UPDATE SET")
    [void]$sql.AppendLine("  filename = EXCLUDED.filename, original_name = EXCLUDED.original_name, url = EXCLUDED.url, mime_type = EXCLUDED.mime_type;`n")
}

# 9. Activity Logs
[void]$sql.AppendLine("-- 9. Activity Logs (60 Historical Logs)")
foreach ($log in $db.activityLogs) {
    $id = SqlStr $log.id
    $date = SqlStr $log.date
    $title = SqlStr $log.title
    $desc = SqlStr $log.description
    $type = SqlStr (Coalesce $log.type 'system')
    $ts = SqlDate $log.timestamp

    [void]$sql.AppendLine("INSERT INTO activity_logs (id, date, title, description, type, timestamp)")
    [void]$sql.AppendLine("VALUES ($id, $date, $title, $desc, $type, $ts)")
    [void]$sql.AppendLine("ON CONFLICT (id) DO NOTHING;")
}
[void]$sql.AppendLine("")

# 10. Staffing
[void]$sql.AppendLine("-- 10. Staffing Models (4 Verified Models)")
foreach ($st in $db.staffing) {
    $id = SqlStr $st.id
    $title = SqlStr $st.title
    $slug = SqlStr $st.slug
    $sub = SqlStr $st.subtitle
    $desc = SqlStr (Coalesce $st.desc $st.description)
    $bullets = SqlJson $st.bullets
    $status = SqlStr (Coalesce $st.status 'published')
    $created = SqlDate $st.created_at
    $updated = SqlDate $st.updated_at
    $published = SqlDate $st.published_at

    [void]$sql.AppendLine("INSERT INTO staffing (id, title, slug, subtitle, ""desc"", bullets, status, created_at, updated_at, published_at)")
    [void]$sql.AppendLine("VALUES ($id, $title, $slug, $sub, $desc, $bullets, $status, $created, $updated, $published)")
    [void]$sql.AppendLine("ON CONFLICT (id) DO UPDATE SET")
    [void]$sql.AppendLine("  title = EXCLUDED.title, slug = EXCLUDED.slug, subtitle = EXCLUDED.subtitle, ""desc"" = EXCLUDED.""desc"",")
    [void]$sql.AppendLine("  bullets = EXCLUDED.bullets, status = EXCLUDED.status, updated_at = NOW();`n")
}

# 11. Locations
[void]$sql.AppendLine("-- 11. Locations (3 Verified Centers)")
foreach ($loc in $db.locations) {
    $id = SqlStr $loc.id
    $name = SqlStr $loc.name
    $slug = SqlStr $loc.slug
    $type = SqlStr (Coalesce $loc.type 'Office')
    $addr = SqlStr $loc.address
    $email = SqlStr $loc.email
    $phone = SqlStr $loc.phone
    $desc = SqlStr $loc.description
    $caps = SqlJson $loc.capabilities
    $status = SqlStr (Coalesce $loc.status 'published')
    $created = SqlDate $loc.created_at
    $updated = SqlDate $loc.updated_at
    $published = SqlDate $loc.published_at

    [void]$sql.AppendLine("INSERT INTO locations (id, name, slug, type, address, email, phone, description, capabilities, status, created_at, updated_at, published_at)")
    [void]$sql.AppendLine("VALUES ($id, $name, $slug, $type, $addr, $email, $phone, $desc, $caps, $status, $created, $updated, $published)")
    [void]$sql.AppendLine("ON CONFLICT (id) DO UPDATE SET")
    [void]$sql.AppendLine("  name = EXCLUDED.name, slug = EXCLUDED.slug, type = EXCLUDED.type, address = EXCLUDED.address,")
    [void]$sql.AppendLine("  email = EXCLUDED.email, phone = EXCLUDED.phone, description = EXCLUDED.description,")
    [void]$sql.AppendLine("  capabilities = EXCLUDED.capabilities, status = EXCLUDED.status, updated_at = NOW();`n")
}

# 12. Settings
[void]$sql.AppendLine("-- 12. Settings (Site Settings)")
$setJson = SqlJson $db.settings
[void]$sql.AppendLine("INSERT INTO settings (key, value, updated_at)")
[void]$sql.AppendLine("VALUES ('site_settings', $setJson, NOW())")
[void]$sql.AppendLine("ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();`n")

# 13. Engagements
[void]$sql.AppendLine("-- 13. Engagements (7 Verified Client Inquiries)")
foreach ($eng in $db.engagements) {
    $id = SqlStr $eng.id
    $fullName = SqlStr (Coalesce $eng.full_name $eng.name)
    $comp = SqlStr (Coalesce $eng.company_name $eng.company)
    $email = SqlStr $eng.email
    $phone = SqlStr $eng.phone
    $job = SqlStr (Coalesce $eng.job_title $eng.jobTitle)
    $req = SqlStr (Coalesce $eng.requirement_type $eng.service)
    $msg = SqlStr $eng.message
    $prefDate = SqlStr (Coalesce $eng.preferred_date $eng.preferredDate)
    $prefTime = SqlStr (Coalesce $eng.preferred_time $eng.preferredTime)
    $source = SqlStr (Coalesce $eng.source 'Book a Call Form')
    $status = SqlStr (Coalesce $eng.status 'NEW')
    $priority = SqlStr (Coalesce $eng.priority 'MEDIUM')
    $assigned = SqlStr (Coalesce $eng.assigned_to $eng.assignedTo)
    $notes = SqlStr (Coalesce $eng.admin_notes $eng.adminNotes)
    $isRead = SqlBool ($eng.is_read)
    $created = SqlDate $eng.created_at
    $updated = SqlDate $eng.updated_at

    [void]$sql.AppendLine("INSERT INTO engagements (id, full_name, company_name, email, phone, job_title, requirement_type, message, preferred_date, preferred_time, source, status, priority, assigned_to, admin_notes, is_read, created_at, updated_at)")
    [void]$sql.AppendLine("VALUES ($id, $fullName, $comp, $email, $phone, $job, $req, $msg, $prefDate, $prefTime, $source, $status, $priority, $assigned, $notes, $isRead, $created, $updated)")
    [void]$sql.AppendLine("ON CONFLICT (id) DO UPDATE SET")
    [void]$sql.AppendLine("  full_name = EXCLUDED.full_name, company_name = EXCLUDED.company_name, email = EXCLUDED.email, phone = EXCLUDED.phone,")
    [void]$sql.AppendLine("  job_title = EXCLUDED.job_title, requirement_type = EXCLUDED.requirement_type, message = EXCLUDED.message,")
    [void]$sql.AppendLine("  status = EXCLUDED.status, priority = EXCLUDED.priority, assigned_to = EXCLUDED.assigned_to,")
    [void]$sql.AppendLine("  admin_notes = EXCLUDED.admin_notes, is_read = EXCLUDED.is_read, updated_at = NOW();`n")
}

$destPath = "supabase/migrations/20261014000004_seed_verified_data.sql"
[System.IO.File]::WriteAllText($destPath, $sql.ToString(), [System.Text.Encoding]::UTF8)
$len = $sql.Length
Write-Host "Successfully generated $destPath ($len characters)"
