-- Script para atualizar as 'short_description' (Olho / Resumo) dos projetos
-- Rode isso no SQL Editor do Supabase para fazer o texto aparecer

-- 1. Atualizar o Dashboard My Cash com o texto solicitado
UPDATE projects
SET short_description = 'Financial Dashboard developed to help people whose want to calculate their expenses and incomes every month in a easy way.'
WHERE title ILIKE '%Dashboard%' OR title ILIKE '%My Cash%';

-- 2. (Opcional) Preencher outros projetos vazios com uma descrição temporária para teste
-- Descomente a linha abaixo se quiser preencher todos que estão vazios
-- UPDATE projects SET short_description = SUBSTRING(description, 1, 100) || '...' WHERE short_description IS NULL OR short_description = '';

-- 3. Verificar se atualizou
SELECT id, title, short_description FROM projects;
