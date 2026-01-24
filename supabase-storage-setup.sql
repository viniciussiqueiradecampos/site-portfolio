-- ========================================
-- SUPABASE STORAGE SETUP FOR IMAGE UPLOADS
-- ========================================

-- 1. Create Storage Bucket for Project Images
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up Storage Policies (Allow public read, authenticated write)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-images');

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'project-images');

CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'project-images');

CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'project-images');

-- 3. Update projects table to support multiple images
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT '{}';

-- 4. Add job_type and remote_type columns to job_listings
ALTER TABLE job_listings
ADD COLUMN IF NOT EXISTS job_type TEXT, -- 'full-time', 'part-time', 'contract', 'freelance'
ADD COLUMN IF NOT EXISTS remote_type TEXT; -- 'remote', 'hybrid', 'on-site'
