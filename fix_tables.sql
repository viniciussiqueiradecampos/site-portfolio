
-- =================================================================
-- SQL PARA CORREÇÃO DAS TABELAS BLOG E ANALYTICS
-- Execute este script no SQL Editor do seu Dashboard do Supabase
-- =================================================================

-- 1. Criar ou Atualizar a tabela de Blog
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    category TEXT DEFAULT 'General',
    tags TEXT[] DEFAULT '{}',
    slug TEXT UNIQUE NOT NULL,
    cover_position TEXT DEFAULT 'center',
    visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Garantir que as colunas novas existam caso a tabela já tenha sido criada antes
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS cover_position TEXT DEFAULT 'center';
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT true;

-- 2. Criar ou Atualizar a tabela de Analytics
CREATE TABLE IF NOT EXISTS analytics_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL,
    page_path TEXT,
    project_id TEXT,
    referrer TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar RLS (Segurança)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_logs ENABLE ROW LEVEL SECURITY;

-- 4. Criar Políticas de Acesso Permissivas (Para Desenvolvimento)
DROP POLICY IF EXISTS "Permissive Policy" ON blog_posts;
CREATE POLICY "Permissive Policy" ON blog_posts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permissive Policy" ON analytics_logs;
CREATE POLICY "Permissive Policy" ON analytics_logs FOR ALL USING (true) WITH CHECK (true);

-- 5. Trigger para Updated At
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
