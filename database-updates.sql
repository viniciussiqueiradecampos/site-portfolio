-- SQL Script para atualizar a tabela projects com os novos campos
-- Execute este script no Supabase SQL Editor

-- Adicionar novos campos à tabela projects
-- Adicionar novos campos à tabela projects (Executar um por um ou em bloco)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS page_title TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_subtitle TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS duration TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS year TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_steps JSONB DEFAULT '[]'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS highlights JSONB DEFAULT '[]'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS live_url_label TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS download_url_label TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS slug TEXT;

-- Criar índice para o slug (para busca rápida)
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);

-- Adicionar constraint de unicidade para o slug (verificando se já existe)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_project_slug') THEN 
        ALTER TABLE projects ADD CONSTRAINT unique_project_slug UNIQUE (slug); 
    END IF; 
END $$;

-- Função para gerar slug automaticamente se não fornecido
CREATE OR REPLACE FUNCTION generate_project_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
        NEW.slug := regexp_replace(NEW.slug, '^-+|-+$', '', 'g');
        
        -- Garantir unicidade
        WHILE EXISTS (SELECT 1 FROM projects WHERE slug = NEW.slug AND id != NEW.id) LOOP
            NEW.slug := NEW.slug || '-' || substr(md5(random()::text), 1, 6);
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para gerar slug automaticamente
DROP TRIGGER IF EXISTS trigger_generate_project_slug ON projects;
CREATE TRIGGER trigger_generate_project_slug
    BEFORE INSERT OR UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION generate_project_slug();

-- Comentários para documentação
COMMENT ON COLUMN projects.short_description IS 'Texto curto para exibição na home page';
COMMENT ON COLUMN projects.page_title IS 'Título principal da página do projeto (value proposition)';
COMMENT ON COLUMN projects.client_name IS 'Nome do cliente';
COMMENT ON COLUMN projects.client_subtitle IS 'Subtítulo do cliente';
COMMENT ON COLUMN projects.location IS 'Localização do projeto';
COMMENT ON COLUMN projects.duration IS 'Duração do projeto';
COMMENT ON COLUMN projects.project_steps IS 'Array JSON com as etapas do projeto (máx 4): [{"number": "01", "name": "DESCOBERTA", "description": "...", "tags": "..."}]';
COMMENT ON COLUMN projects.highlights IS 'Array JSON com seções highlight: [{"title": "...", "text": "...", "image": "..."}]';
COMMENT ON COLUMN projects.live_url_label IS 'Rótulo personalizado para o link do site ao vivo';
COMMENT ON COLUMN projects.download_url_label IS 'Rótulo personalizado para o link de download';
COMMENT ON COLUMN projects.slug IS 'URL amigável para o projeto (gerado automaticamente se vazio)';
