-- Script para corrigir a coluna 'summary' (Olho) e mover o texto
-- Rode no Supabase SQL Editor

-- 1. Criar coluna summary se não existir
ALTER TABLE projects ADD COLUMN IF NOT EXISTS summary TEXT;
COMMENT ON COLUMN projects.summary IS 'Olho / Resumo (Home & Portfolio)';

-- 2. Copiar o conteúdo atual de short_description para summary (já que você disse que estava aparecendo lá)
UPDATE projects 
SET summary = short_description
WHERE (title ILIKE '%Dashboard%' OR title ILIKE '%Cash%') AND short_description IS NOT NULL;

-- 3. Atualizar short_description com o texto que deveria ser a "Descrição Curta" (se você tiver um texto diferente)
-- Se não tiver, pode deixar igual ou mudar aqui. 
-- Exemplo:
-- UPDATE projects SET short_description = 'Texto mais curto...' WHERE title ILIKE '%Dashboard%';

-- 4. Verificar
SELECT title, summary, short_description FROM projects WHERE title ILIKE '%Dashboard%';
