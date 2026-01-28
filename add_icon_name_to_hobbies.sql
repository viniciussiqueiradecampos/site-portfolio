ALTER TABLE about_hobbies 
ADD COLUMN IF NOT EXISTS icon_name TEXT DEFAULT 'Star';

COMMENT ON COLUMN about_hobbies.icon_name IS 'Icon name from Lucide React library';
