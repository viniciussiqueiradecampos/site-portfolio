
-- Script para adicionar a coluna gallery_videos na tabela projects
-- Rode este script no SQL Editor do seu Dashboard no Supabase

ALTER TABLE projects ADD COLUMN IF NOT EXISTS gallery_videos TEXT[] DEFAULT '{}';

-- Comentário opcional para documentar a coluna
COMMENT ON COLUMN projects.gallery_videos IS 'Lista de URLs de vídeos para a galeria do projeto';
