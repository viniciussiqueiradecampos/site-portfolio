# Backend Setup Guide - Supabase CMS

## Por que Supabase?

**Supabase** é a melhor opção para o seu projeto porque:
- ✅ **Fácil de configurar** - Setup em minutos
- ✅ **Grátis** - Tier gratuito generoso
- ✅ **Interface Admin** - UI built-in para gerenciar conteúdo
- ✅ **Real-time** - Atualizações automáticas
- ✅ **Autenticação** - Sistema de login já incluído
- ✅ **PostgreSQL** - Banco de dados robusto
- ✅ **TypeScript** - Tipagem completa

## Passo 1: Criar Conta no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login com GitHub
4. Crie um novo projeto:
   - Nome: `portfolio-cms`
   - Database Password: (escolha uma senha forte)
   - Region: `South America (São Paulo)` (mais próximo do Brasil)

## Passo 2: Configurar o Banco de Dados

1. No dashboard do Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Copie e cole TODO o conteúdo do arquivo `supabase-setup.sql`
4. Clique em **Run** (ou pressione Ctrl+Enter)

Isso criará:
- Tabela `content` - Para textos do site
- Tabela `projects` - Para itens do portfolio
- Tabela `cv_sections` - Para seções do CV
- Políticas de segurança (RLS)
- Dados de exemplo

## Passo 3: Obter as Credenciais

1. No dashboard, vá em **Settings** → **API**
2. Copie:
   - `Project URL` (URL do projeto)
   - `anon public` key (chave pública)

## Passo 4: Configurar o Projeto

1. Instale a dependência do Supabase:
```bash
npm install @supabase/supabase-js
```

2. Crie o arquivo `.env` na raiz do projeto:
```bash
cp .env.example .env
```

3. Edite `.env` e adicione suas credenciais:
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

## Passo 5: Usar no Código

O arquivo `src/lib/supabase.ts` já está configurado com funções prontas:

### Buscar conteúdo:
```typescript
import { contentAPI } from './lib/supabase';

// Buscar texto do hero
const heroTitle = await contentAPI.getByKey('hero.title');
console.log(heroTitle?.value); // "figma • UI DESIGN • AI • WEB DESIGN"
```

### Buscar projetos:
```typescript
import { projectsAPI } from './lib/supabase';

const projects = await projectsAPI.getAll();
```

### Atualizar conteúdo (requer autenticação):
```typescript
await contentAPI.update('hero.title', 'Novo título aqui');
```

## Passo 6: Integrar com o Site

Atualize `Home.tsx` para buscar dados do Supabase:

```typescript
import { useEffect, useState } from 'react';
import { contentAPI, projectsAPI } from '../lib/supabase';

export default function Home() {
    const [heroTitle, setHeroTitle] = useState('figma • UI DESIGN • AI • WEB DESIGN');
    const [heroDesc, setHeroDesc] = useState('');
    const [storyText, setStoryText] = useState('');
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        async function loadContent() {
            const title = await contentAPI.getByKey('hero.title');
            const desc = await contentAPI.getByKey('hero.description');
            const story = await contentAPI.getByKey('storytelling.main');
            const projs = await projectsAPI.getAll();

            if (title) setHeroTitle(title.value);
            if (desc) setHeroDesc(desc.value);
            if (story) setStoryText(story.value);
            setProjects(projs);
        }

        loadContent();
    }, []);

    // Use heroTitle, heroDesc, storyText, projects no JSX
}
```

## Passo 7: Gerenciar Conteúdo (Admin)

### Opção 1: Interface do Supabase (Mais Fácil)
1. Vá para o dashboard do Supabase
2. Clique em **Table Editor**
3. Selecione a tabela (`content`, `projects`, ou `cv_sections`)
4. Edite diretamente os valores
5. As mudanças aparecem no site automaticamente!

### Opção 2: Criar Painel Admin Customizado
Posso criar uma página `/admin` no seu site com:
- Login seguro
- Formulários para editar textos
- Upload de imagens
- Gerenciar projetos e CV

Quer que eu crie isso?

## Estrutura do Banco de Dados

### Tabela `content`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| key | text | Identificador único (ex: 'hero.title') |
| value | text | Conteúdo do texto |
| category | text | Categoria ('hero', 'portfolio', 'cv', 'storytelling') |

### Tabela `projects`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| title | text | Nome do projeto |
| description | text | Descrição (opcional) |
| image_url | text | URL da imagem |
| tags | text[] | Array de tags |
| order_index | integer | Ordem de exibição |
| visible | boolean | Se está visível no site |

### Tabela `cv_sections`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| section_type | text | Tipo ('experience', 'education', 'skills') |
| title | text | Título da seção |
| subtitle | text | Subtítulo (opcional) |
| description | text | Descrição (opcional) |
| date_range | text | Período (ex: '2020-2023') |
| order_index | integer | Ordem de exibição |
| visible | boolean | Se está visível no CV |

## Próximos Passos

1. ✅ Configurar Supabase (5 minutos)
2. ✅ Instalar dependência
3. ✅ Adicionar credenciais no `.env`
4. 🔄 Integrar com Home.tsx
5. 🔄 Testar edição de conteúdo
6. 🔄 (Opcional) Criar painel admin customizado

## Suporte

Se tiver dúvidas ou problemas:
1. Verifique se as credenciais no `.env` estão corretas
2. Confirme que o SQL foi executado sem erros
3. Verifique o console do navegador para erros
4. Me pergunte! 😊
