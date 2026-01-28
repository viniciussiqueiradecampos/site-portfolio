# Analytics Setup

Este projeto utiliza um sistema de analytics dual que envia eventos tanto para o **Google Tag Manager (GTM)** quanto para o **Supabase**.

## Configuração

### Google Tag Manager

O GTM está configurado no arquivo `index.html`:

1. **Script no `<head>`**: Inicializa o GTM o mais cedo possível
2. **Noscript no `<body>`**: Fallback para quando JavaScript está desabilitado

**Container ID**: `GTM-M8LDK2JD`

### Eventos Rastreados

O sistema rastreia os seguintes eventos automaticamente:

#### 1. Page Views
- **Home**: `/`
- **Projects**: `/projects`
- **About**: `/about`
- **CV**: `/cv`
- **Blog**: `/blog`
- **Article**: `/blog/:slug`

#### 2. Project Interactions
- **project_click**: Quando um usuário clica em um projeto para ver detalhes
  - Dados enviados: `project_id`, `project_title`

#### 3. CV Downloads
- **cv_download**: Quando um usuário baixa o CV em PDF

## Como Usar

### Importar o módulo de analytics

```typescript
import { trackPageView, trackProjectClick, trackCVDownload } from '../lib/analytics';
```

### Rastrear Page View

```typescript
useEffect(() => {
    trackPageView('/sua-pagina');
}, []);
```

### Rastrear Click em Projeto

```typescript
const handleProjectClick = (project: Project) => {
    trackProjectClick(project.id, project.title);
    // ... resto da lógica
};
```

### Rastrear Download de CV

```typescript
const handleDownload = () => {
    trackCVDownload();
    // ... resto da lógica
};
```

## Estrutura de Dados

### Google Tag Manager (dataLayer)

Cada evento enviado para o GTM inclui:

```javascript
{
    event: 'page_view' | 'project_click' | 'cv_download',
    page_path: '/caminho/da/pagina',
    page_title: 'Título da Página',
    page_location: 'URL completa',
    referrer: 'URL de referência',
    // Dados específicos do evento
    project_id?: 'uuid',
    project_title?: 'Nome do Projeto'
}
```

### Supabase (analytics_logs)

Cada evento salvo no Supabase inclui:

```typescript
{
    event_type: 'page_view' | 'project_click' | 'cv_download',
    page_path: '/caminho/da/pagina',
    project_id?: 'uuid',
    referrer: 'URL de referência',
    user_agent: 'User Agent do navegador',
    created_at: 'timestamp'
}
```

## Dashboard Analytics

O Admin Dashboard exibe estatísticas baseadas nos dados do Supabase:

- **Total de Page Views**
- **Total de Downloads de CV**
- **Total de Clicks em Projetos**
- **Páginas Mais Visitadas**
- **Fontes de Tráfego** (referrers)
- **Histórico de Visualizações** (por dia)

## Debugging

Para verificar se os eventos estão sendo enviados corretamente:

1. **Console do Navegador**: Os eventos são logados com `console.log`
   - `📊 GTM Event:` - Evento enviado para o GTM
   - `💾 Supabase Event:` - Evento salvo no Supabase

2. **Google Tag Manager Preview Mode**: Use o modo de preview do GTM para ver os eventos em tempo real

3. **Supabase Dashboard**: Verifique a tabela `analytics_logs` no Supabase

## Tags Recomendadas no GTM

Configure as seguintes tags no seu container GTM:

### 1. Google Analytics 4 - Page View
- **Trigger**: Custom Event = `page_view`
- **Event Name**: `page_view`
- **Page Path**: `{{Page Path}}`

### 2. Google Analytics 4 - Project Click
- **Trigger**: Custom Event = `project_click`
- **Event Name**: `project_click`
- **Parameters**:
  - `project_id`: `{{Project ID}}`
  - `project_title`: `{{Project Title}}`

### 3. Google Analytics 4 - CV Download
- **Trigger**: Custom Event = `cv_download`
- **Event Name**: `cv_download`

## Variáveis Personalizadas no GTM

Crie as seguintes variáveis de Data Layer:

- `page_path` → Data Layer Variable: `page_path`
- `project_id` → Data Layer Variable: `project_id`
- `project_title` → Data Layer Variable: `project_title`
- `referrer` → Data Layer Variable: `referrer`
