# Configuração de Variáveis de Ambiente na Vercel

## ⚠️ IMPORTANTE: Configure estas variáveis na Vercel

Para que o site funcione corretamente na Vercel, você precisa adicionar as seguintes variáveis de ambiente:

### Passo a Passo:

1. Acesse: https://vercel.com/viniciussiqueiradecampos/site-portfolio/settings/environment-variables

2. Adicione as seguintes variáveis:

#### Variável 1:
- **Name:** `VITE_SUPABASE_URL`
- **Value:** `https://mfjczcgqlgwydlmrutmq.supabase.co`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

#### Variável 2:
- **Name:** `VITE_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mamN6Y2dxbGd3eWRsbXJ1dG1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2Nzc2NzAsImV4cCI6MjA1MzI1MzY3MH0.hLxr0RZycTbW8zAENJvrsw_XjUCuzJXS`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

3. Clique em **Save**

4. Após salvar, faça um **Redeploy** do projeto:
   - Vá em: https://vercel.com/viniciussiqueiradecampos/site-portfolio
   - Clique nos 3 pontinhos (...) no último deployment
   - Clique em **Redeploy**

## ✅ Verificação

Após o redeploy, o site deve:
- Carregar a homepage corretamente
- Exibir o título do hero
- Mostrar os projetos do Supabase na seção Portfolio
- A página /projects deve mostrar os projetos do banco de dados

## 📝 Resumo das Mudanças Feitas

1. ✅ **Dashboard removido do menu público** - Agora é exclusivo do admin
2. ✅ **Projects.tsx integrado com Supabase** - Busca projetos do banco de dados
3. ✅ **Home.tsx já estava integrado** - Portfolio na home já usa Supabase
4. ✅ **AdminProjects gerencia os projetos** - Adicione projetos pela dashboard admin

## 🔗 Links Úteis

- **Site:** https://site-portfolio-plum.vercel.app/
- **Admin:** https://site-portfolio-plum.vercel.app/admin
- **Vercel Dashboard:** https://vercel.com/viniciussiqueiradecampos/site-portfolio
