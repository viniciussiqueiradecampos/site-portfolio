
-- ========================================
-- ABOUT PAGE TABLES
-- ========================================

CREATE TABLE IF NOT EXISTS about_steps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    step_number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT DEFAULT 'Search',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS about_hobbies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    text TEXT NOT NULL,
    position_x TEXT NOT NULL DEFAULT '50%',
    position_y TEXT NOT NULL DEFAULT '50%',
    color TEXT DEFAULT '#ffffff', 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS about_testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_name TEXT NOT NULL,
    author_role TEXT,
    quote TEXT NOT NULL,
    author_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS about_memories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url TEXT NOT NULL,
    position_x TEXT NOT NULL DEFAULT '50%',
    width TEXT NOT NULL DEFAULT '200px',
    aspect_ratio TEXT DEFAULT 'square',
    speed DECIMAL DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE about_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_hobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_memories ENABLE ROW LEVEL SECURITY;

-- Permissive Policies
CREATE POLICY "Permissive Policy" ON about_steps FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permissive Policy" ON about_hobbies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permissive Policy" ON about_testimonials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permissive Policy" ON about_memories FOR ALL USING (true) WITH CHECK (true);

-- Triggers for Updated At
CREATE TRIGGER update_about_steps_updated_at BEFORE UPDATE ON about_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_about_hobbies_updated_at BEFORE UPDATE ON about_hobbies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_about_testimonials_updated_at BEFORE UPDATE ON about_testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_about_memories_updated_at BEFORE UPDATE ON about_memories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed Data for About Page
INSERT INTO content (key, value, category) VALUES
    ('about.profile_photo', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000', 'about'),
    ('about.name_title', 'VINICIUS CAMPOS', 'about'),
    ('about.subtitle', 'or just vinny if you prefer', 'about'),
    ('about.bio_text', 'With the rapid evolution of technology, I''ve focused my career on building digital products that not only look good but function slightly perfectly. I believe in the power of design to solve problems and connect people.', 'about'),
    ('about.spotify_embed_url', 'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0', 'about'),
    ('about.visible', 'true', 'about')
ON CONFLICT (key) DO NOTHING;

INSERT INTO about_steps (step_number, title, description, icon_name) VALUES
    ('01', 'Discovery', 'Understanding the problem and user needs through deep research.', 'Search'),
    ('02', 'Strategy', 'Planning the roadmap and defining the core experience pillars.', 'Map'),
    ('03', 'Design', 'Crafting beautiful, functional interfaces with pixel-perfect precision.', 'PenTool'),
    ('04', 'Development', 'Bringing designs to life with clean, performant code.', 'Code')
ON CONFLICT (id) DO NOTHING;

INSERT INTO about_hobbies (text, position_x, position_y, color) VALUES
    ('Gaming 🎮', '15%', '25%', '#ffffff'),
    ('Coffee ☕', '65%', '20%', '#ffffff'),
    ('Tech 🔧', '35%', '55%', '#ffffff'),
    ('Sci-Fi 🎬', '75%', '65%', '#ffffff'),
    ('Travel 🌍', '20%', '75%', '#ffffff')
ON CONFLICT (id) DO NOTHING;

INSERT INTO about_testimonials (author_name, author_role, quote, author_image) VALUES
    ('Sarah Johnson', 'CTO @ TechStart', 'Vinicius has an eye for design that is rare to find.', ''),
    ('Mark Twain', 'CEO @ LitWorld', 'He transformed our vague ideas into a concrete product.', ''),
    ('Elon Musk', 'CEO @ X', 'Absolutely fantastic work, very fast.', '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO about_memories (image_url, position_x, width, aspect_ratio, speed) VALUES
    ('https://images.unsplash.com/photo-1542621334-a254cf47733d', '10%', '250px', '4/3', 1.2),
    ('https://images.unsplash.com/photo-1517430816045-df4b7de8db2b', '70%', '300px', '16/9', 2.5),
    ('https://images.unsplash.com/photo-1629904853716-6c2982d6d844', '40%', '200px', '1/1', 1.8),
    ('https://images.unsplash.com/photo-1522071820081-009f0129c71c', '80%', '220px', '3/4', 3.2),
    ('https://images.unsplash.com/photo-1600880292203-757bb62b4baf', '5%', '280px', '16/10', 2.0)
ON CONFLICT (id) DO NOTHING;
