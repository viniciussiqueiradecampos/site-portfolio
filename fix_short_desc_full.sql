-- Script COMPLETO para corrigir a descrição curta dos projetos
-- Rode este script inteiro no Supabase SQL Editor

-- 1. Se a coluna short_description não existir, cria ela
ALTER TABLE projects ADD COLUMN IF NOT EXISTS short_description TEXT;

-- 2. Atualiza o projeto (Dashboard My Cash)
UPDATE projects 
SET short_description = 'Financial Dashboard developed to help people whose want to calculate their expenses and incomes every month in a easy way.'
WHERE title ILIKE '%Dashboard%' OR title ILIKE '%Cash%';

-- 3. (Opcional) Limpa qualquer short_description errado se quiser resetar
-- UPDATE projects SET short_description = NULL WHERE title NOT ILIKE '%Dashboard%';

-- 4. Confirmação: Mostra os projetos com suas descrições curtas
SELECT id, title, short_description FROM projects ORDER BY created_at DESC;
