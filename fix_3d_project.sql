-- Script de correção para o projeto 3D CONSULTAND DESIGN
-- Rode isso no Supabase SQL Editor

-- Adicionar um texto de exemplo no campo 'summary' (Olho) para ver se aparece no site
UPDATE projects 
SET summary = 'Solução de design 3D inovadora para clientes exigentes que buscam modernidade e eficiência.'
WHERE title ILIKE '%3D Consult%' OR title ILIKE '%3D Design%';

-- Verificar se gravou
SELECT id, title, summary FROM projects WHERE title ILIKE '%3D Consult%' OR title ILIKE '%3D Design%';
