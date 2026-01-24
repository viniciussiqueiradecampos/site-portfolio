-- ========================================
-- 1. TABLE DEFINITIONS (Create these FIRST)
-- ========================================

-- Portfolio Content Tables
CREATE TABLE IF NOT EXISTS content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    category TEXT NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    order_index INTEGER DEFAULT 0,
    visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cv_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_type TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    date_range TEXT,
    order_index INTEGER DEFAULT 0,
    visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Career Architect Tables
CREATE TABLE IF NOT EXISTS career_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    current_job_title TEXT,
    target_role TEXT,
    cv_url TEXT,
    cv_skills TEXT[],
    linkedin_url TEXT,
    linkedin_ssi_score INTEGER DEFAULT 0,
    daily_application_goal INTEGER DEFAULT 5,
    preferred_locations TEXT[],
    preferred_salary_min DECIMAL,
    preferred_salary_max DECIMAL,
    preferred_currency TEXT DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    external_id TEXT,
    source TEXT NOT NULL,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    salary_min DECIMAL,
    salary_max DECIMAL,
    currency TEXT DEFAULT 'USD',
    description TEXT,
    requirements TEXT,
    url TEXT,
    posted_date TIMESTAMP WITH TIME ZONE,
    is_low_competition BOOLEAN DEFAULT false,
    competition_score INTEGER,
    tags TEXT[],
    visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES career_profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES job_listings(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'nova',
    match_score INTEGER,
    applied_date TIMESTAMP WITH TIME ZONE,
    interview_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    recruiter_contact TEXT,
    cover_letter TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id, job_id)
);

CREATE TABLE IF NOT EXISTS linkedin_ssi_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES career_profiles(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    establish_brand INTEGER DEFAULT 0,
    find_right_people INTEGER DEFAULT 0,
    engage_insights INTEGER DEFAULT 0,
    build_relationships INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id, date)
);

CREATE TABLE IF NOT EXISTS daily_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES career_profiles(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL,
    description TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS negotiation_scripts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES career_profiles(id) ON DELETE CASCADE,
    job_title TEXT NOT NULL,
    target_salary DECIMAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    script_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_configurations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_name TEXT UNIQUE NOT NULL,
    api_key TEXT,
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. SECURITY POLICIES (RLS) - Enable AFTER Tables Exist
-- ========================================

-- Enable RLS for all
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_ssi_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiation_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_configurations ENABLE ROW LEVEL SECURITY;

-- Create Permissive Policies (Dev Mode)
-- We use DO blocks or simple drops to avoid errors if policies don't exist
-- Note: 'CREATE POLICY IF NOT EXISTS' is not standard SQL in some versions, so we DROP first.

DROP POLICY IF EXISTS "Enable all access for all users" ON content;
CREATE POLICY "Enable all access for all users" ON content FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access for all users" ON projects;
CREATE POLICY "Enable all access for all users" ON projects FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access for all users" ON cv_sections;
CREATE POLICY "Enable all access for all users" ON cv_sections FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access for all users" ON career_profiles;
CREATE POLICY "Enable all access for all users" ON career_profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access for all users" ON job_listings;
CREATE POLICY "Enable all access for all users" ON job_listings FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access for all users" ON job_applications;
CREATE POLICY "Enable all access for all users" ON job_applications FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access for all users" ON linkedin_ssi_metrics;
CREATE POLICY "Enable all access for all users" ON linkedin_ssi_metrics FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access for all users" ON daily_tasks;
CREATE POLICY "Enable all access for all users" ON daily_tasks FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access for all users" ON negotiation_scripts;
CREATE POLICY "Enable all access for all users" ON negotiation_scripts FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access for all users" ON api_configurations;
CREATE POLICY "Enable all access for all users" ON api_configurations FOR ALL USING (true);


-- ========================================
-- 3. TRIGGERS & FUNCTIONS
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_content_updated_at ON content;
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cv_sections_updated_at ON cv_sections;
CREATE TRIGGER update_cv_sections_updated_at BEFORE UPDATE ON cv_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_career_profiles_updated_at ON career_profiles;
CREATE TRIGGER update_career_profiles_updated_at BEFORE UPDATE ON career_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_listings_updated_at ON job_listings;
CREATE TRIGGER update_job_listings_updated_at BEFORE UPDATE ON job_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_applications_updated_at ON job_applications;
CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON job_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_api_configurations_updated_at ON api_configurations;
CREATE TRIGGER update_api_configurations_updated_at BEFORE UPDATE ON api_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ========================================
-- 4. INITIAL DATA SEEDING
-- ========================================
INSERT INTO content (key, value, category) VALUES
    ('hero.title', 'figma • UI DESIGN • AI • WEB DESIGN', 'hero'),
    ('hero.description', 'Lorem ipsum dolor sit amet consectetur. Lorem morbi adipiscing netus nibh ut vel ipsum fringilla cursus. Neque blandit vestibulum sem eu viverra. Massa lorem nisl ultrices ultricies diam vitae nunc. Tristique in blandit imperdiet ante viverra tempus. Sem porttitor urna faucibus lacus. Velit lorem eu morbi vel diam etiam tincidunt dictum nunc. Accumsan varius purus auctor ullamcorper in neque orci ultrices. Purus rhoncus viverra massa sed justo.', 'hero'),
    ('storytelling.main', 'Experience designing products for ambitious companies', 'storytelling')
ON CONFLICT (key) DO NOTHING;

INSERT INTO projects (title, image_url, tags, order_index) VALUES
    ('Fintech Design System', '/src/assets/figma/82e9ebef28e10c78b9e519959ab80d245b276f41.png', ARRAY['TAG-PROJECT', 'TAG-PROJECT', 'TAG-PROJECT'], 1),
    ('AI Storytelling App', '/src/assets/figma/05a77d06d503970b7c5203469e6e67f0a350a703.png', ARRAY['TAG-PROJECT', 'TAG-PROJECT'], 2),
    ('Neon Brand Identity', 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop', ARRAY['TAG-PROJECT'], 3)
ON CONFLICT DO NOTHING;

INSERT INTO career_profiles (user_email, full_name, current_job_title, target_role, daily_application_goal) VALUES
    ('demo@example.com', 'Demo User', 'Product Designer', 'Senior Product Designer', 5)
ON CONFLICT (user_email) DO NOTHING;

INSERT INTO api_configurations (service_name, is_active) VALUES
    ('adzuna', false),
    ('gemini', false),
    ('theirstack', false)
ON CONFLICT (service_name) DO NOTHING;

INSERT INTO cv_sections (section_type, title, subtitle, description, date_range, order_index) VALUES
    ('skills', 'Figma', NULL, 'Design Tool', NULL, 1),
    ('skills', 'React', NULL, 'Frontend Framework', NULL, 2),
    ('skills', 'Design Systems', NULL, 'Architecture', NULL, 3),
    ('skills', 'Prototyping', NULL, 'Interaction Design', NULL, 4),
    ('skills', 'UI/UX', NULL, 'Product Design', NULL, 5),
    ('skills', 'AI Tools', NULL, 'Emerging Tech', NULL, 6),
    ('experience', 'Senior Product Designer', 'Fintech Global', '• Led the redesign of the core banking dashboard.\n• Established a new design system used by 40+ developers.\n• Mentored 3 junior designers and improved team velocity by 20%.', '2024', 10),
    ('experience', 'UI Designer', 'Creative Agency', '• Designed award-winning marketing sites for tech startups.\n• Collaborated directly with clients to define visual direction.', '2022', 11),
    ('education', 'BFA Design & Technology', 'University of Lisbon', NULL, '2018', 20),
    ('education', 'Google UX Design Certificate', 'Coursera / Google', NULL, '2023', 30),
    ('education', 'Advanced React & Redux', 'Udemy', NULL, '2021', 31)
ON CONFLICT DO NOTHING;
