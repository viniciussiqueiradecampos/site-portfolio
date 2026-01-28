# 🛡️ Security & Protection Guide

Este documento descreve todas as medidas de segurança implementadas no site para proteção contra ataques DDoS, vulnerabilidades e acessos maliciosos.

---

## 📋 Índice

1. [Headers de Segurança](#headers-de-segurança)
2. [Rate Limiting](#rate-limiting)
3. [Content Security Policy (CSP)](#content-security-policy)
4. [SSL/TLS Configuration](#ssltls-configuration)
5. [Supabase Security](#supabase-security)
6. [Cloudflare Protection (Recomendado)](#cloudflare-protection)
7. [Monitoring & Alerts](#monitoring--alerts)
8. [Best Practices](#best-practices)

---

## 🔒 Headers de Segurança

### Implementados no `vercel.json`

#### 1. **Strict-Transport-Security (HSTS)**
```
max-age=63072000; includeSubDomains; preload
```
- ✅ Força HTTPS por 2 anos
- ✅ Inclui todos os subdomínios
- ✅ Elegível para HSTS preload list

#### 2. **Content-Security-Policy (CSP)**
- ✅ Previne XSS (Cross-Site Scripting)
- ✅ Previne clickjacking
- ✅ Controla fontes de recursos permitidas
- ✅ Permite apenas scripts de fontes confiáveis

#### 3. **X-Frame-Options**
```
DENY
```
- ✅ Previne clickjacking
- ✅ Impede que o site seja carregado em iframes

#### 4. **X-Content-Type-Options**
```
nosniff
```
- ✅ Previne MIME type sniffing
- ✅ Força o navegador a respeitar o Content-Type declarado

#### 5. **X-XSS-Protection**
```
1; mode=block
```
- ✅ Ativa proteção XSS do navegador
- ✅ Bloqueia a página se detectar ataque

#### 6. **Referrer-Policy**
```
strict-origin-when-cross-origin
```
- ✅ Controla informações de referrer
- ✅ Protege privacidade dos usuários

#### 7. **Permissions-Policy**
```
camera=(), microphone=(), geolocation=(), interest-cohort=()
```
- ✅ Desabilita APIs sensíveis
- ✅ Bloqueia FLoC (Google)
- ✅ Protege privacidade

---

## ⏱️ Rate Limiting

### Sistema de Proteção contra DDoS

Implementado em `src/lib/rateLimiter.ts`:

#### **Níveis de Proteção**

1. **API Rate Limiter** (Geral)
   - 100 requisições por minuto
   - Bloqueio de 15 minutos após exceder
   - Usado para chamadas de API normais

2. **Auth Rate Limiter** (Autenticação)
   - 5 tentativas a cada 5 minutos
   - Bloqueio de 1 hora após exceder
   - Protege contra brute force

3. **Form Rate Limiter** (Formulários)
   - 10 submissões por minuto
   - Bloqueio de 10 minutos após exceder
   - Protege contra spam

#### **Funcionalidades**

- ✅ Fingerprinting do navegador
- ✅ Bloqueio automático de IPs abusivos
- ✅ Limpeza automática de registros antigos
- ✅ Mensagens de erro amigáveis
- ✅ Estatísticas de uso

#### **Como Usar**

```typescript
import { withRateLimit, apiRateLimiter } from './lib/rateLimiter';

// Envolver função com rate limiting
const protectedFunction = withRateLimit(async () => {
    // Sua lógica aqui
}, apiRateLimiter);
```

---

## 🔐 Content Security Policy (CSP)

### Política Implementada

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' 
    https://www.googletagmanager.com 
    https://www.google-analytics.com 
    https://tagmanager.google.com;
style-src 'self' 'unsafe-inline' 
    https://fonts.googleapis.com;
font-src 'self' 
    https://fonts.gstatic.com;
img-src 'self' data: https: blob:;
connect-src 'self' 
    https://*.supabase.co 
    https://www.google-analytics.com 
    https://www.googletagmanager.com;
frame-src https://www.googletagmanager.com;
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests;
```

### O que isso protege?

- ✅ **XSS**: Apenas scripts de fontes confiáveis
- ✅ **Data Injection**: Controle de fontes de dados
- ✅ **Clickjacking**: Bloqueio de frames
- ✅ **Mixed Content**: Upgrade automático para HTTPS

---

## 🔒 SSL/TLS Configuration

### Verificação SSL

#### **Vercel (Automático)**
- ✅ SSL/TLS automático via Let's Encrypt
- ✅ Renovação automática de certificados
- ✅ TLS 1.2+ obrigatório
- ✅ HTTP/2 habilitado

#### **Verificar Manualmente**

1. **SSL Labs Test**
   ```
   https://www.ssllabs.com/ssltest/analyze.html?d=seu-dominio.com
   ```
   - Objetivo: Grade A ou A+

2. **Security Headers Test**
   ```
   https://securityheaders.com/?q=seu-dominio.com
   ```
   - Objetivo: Grade A

3. **Mozilla Observatory**
   ```
   https://observatory.mozilla.org/analyze/seu-dominio.com
   ```
   - Objetivo: Grade A+

#### **Configuração Recomendada**

- ✅ TLS 1.3 (preferencial)
- ✅ TLS 1.2 (mínimo)
- ❌ TLS 1.1 e anteriores (desabilitados)
- ✅ Perfect Forward Secrecy (PFS)
- ✅ OCSP Stapling

---

## 🗄️ Supabase Security

### Row Level Security (RLS)

Certifique-se de que RLS está habilitado em todas as tabelas:

```sql
-- Exemplo: Proteger tabela de analytics
ALTER TABLE analytics_logs ENABLE ROW LEVEL SECURITY;

-- Política: Apenas leitura pública
CREATE POLICY "Allow public read access"
ON analytics_logs FOR SELECT
TO anon
USING (true);

-- Política: Apenas admin pode inserir
CREATE POLICY "Allow authenticated insert"
ON analytics_logs FOR INSERT
TO authenticated
WITH CHECK (true);
```

### API Keys

- ✅ **Anon Key**: Apenas para operações públicas
- ✅ **Service Role Key**: NUNCA expor no frontend
- ✅ Rotação regular de keys (a cada 90 dias)

### Database Security

```sql
-- Limitar conexões
ALTER DATABASE postgres SET max_connections = 100;

-- Timeout de queries
ALTER DATABASE postgres SET statement_timeout = '30s';

-- Prevenir SQL injection (Supabase já faz isso)
-- Sempre use prepared statements
```

---

## ☁️ Cloudflare Protection (Recomendado)

### Configuração Cloudflare (Opcional mas Altamente Recomendado)

#### **1. Adicionar Site ao Cloudflare**
1. Criar conta em cloudflare.com
2. Adicionar seu domínio
3. Atualizar nameservers no registrador

#### **2. Configurações de Segurança**

**SSL/TLS**
- Modo: Full (Strict)
- TLS mínimo: 1.2
- Automatic HTTPS Rewrites: ON
- Always Use HTTPS: ON

**Firewall**
- Security Level: Medium
- Challenge Passage: 30 minutos
- Browser Integrity Check: ON

**DDoS Protection**
- Automático (incluído no plano free)
- HTTP DDoS Attack Protection: ON
- Network DDoS Attack Protection: ON

**Rate Limiting** (Plano Pro+)
```
Rule: Protect API endpoints
- If: URI Path contains "/api/"
- Then: Rate limit 100 requests per minute
```

**Bot Fight Mode**
- Super Bot Fight Mode: ON (Plano Pro+)
- Challenge bots: ON

**Page Rules**
```
1. Cache Everything
   URL: *.js, *.css, *.jpg, *.png, *.svg
   Cache Level: Cache Everything
   Edge Cache TTL: 1 month

2. Security Headers
   URL: *
   Add headers via Workers (see below)
```

#### **3. Cloudflare Workers (Avançado)**

```javascript
// worker.js - Adiciona headers de segurança extras
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const response = await fetch(request)
  const newHeaders = new Headers(response.headers)
  
  // Headers adicionais
  newHeaders.set('X-Robots-Tag', 'index, follow')
  newHeaders.set('X-Powered-By', '') // Remove fingerprinting
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  })
}
```

#### **4. Web Application Firewall (WAF)**

Regras recomendadas:
- OWASP Core Ruleset: ON
- Cloudflare Managed Ruleset: ON
- Custom Rules:
  ```
  - Block countries: (opcional)
  - Block known bad IPs
  - Challenge suspicious user agents
  ```

---

## 📊 Monitoring & Alerts

### Ferramentas Recomendadas

#### **1. Uptime Monitoring**
- **UptimeRobot** (Free): https://uptimerobot.com
  - Verifica a cada 5 minutos
  - Alertas via email/SMS
  - Status page público

#### **2. Security Monitoring**
- **Sucuri SiteCheck**: https://sitecheck.sucuri.net
  - Scan de malware
  - Blacklist monitoring
  - Scan semanal recomendado

#### **3. Performance Monitoring**
- **Google PageSpeed Insights**
- **GTmetrix**
- **WebPageTest**

#### **4. Log Analysis**
- Vercel Analytics (incluído)
- Cloudflare Analytics (se usar)
- Supabase Logs

### Alertas Configurados

Configure alertas para:
- ✅ Site down (>5 minutos)
- ✅ SSL expirando (30 dias antes)
- ✅ Spike de tráfego anormal
- ✅ Erros 500 (>10 em 5 minutos)
- ✅ Rate limit triggers frequentes

---

## ✅ Best Practices

### Checklist de Segurança

#### **Código**
- [ ] Nunca expor API keys no frontend
- [ ] Validar todos os inputs do usuário
- [ ] Sanitizar dados antes de exibir
- [ ] Usar HTTPS em todas as requisições
- [ ] Implementar CSP corretamente
- [ ] Manter dependências atualizadas

#### **Infraestrutura**
- [ ] SSL/TLS configurado corretamente
- [ ] Headers de segurança implementados
- [ ] Rate limiting ativo
- [ ] Backups regulares (Supabase)
- [ ] Logs de acesso habilitados
- [ ] Monitoring ativo

#### **Supabase**
- [ ] RLS habilitado em todas as tabelas
- [ ] Políticas de acesso configuradas
- [ ] API keys rotacionadas regularmente
- [ ] Backups automáticos habilitados
- [ ] Logs de auditoria revisados

#### **Manutenção**
- [ ] Revisar logs semanalmente
- [ ] Atualizar dependências mensalmente
- [ ] Testar backups mensalmente
- [ ] Revisar políticas de segurança trimestralmente
- [ ] Scan de vulnerabilidades mensalmente

### Comandos Úteis

```bash
# Verificar dependências vulneráveis
npm audit

# Corrigir vulnerabilidades automáticas
npm audit fix

# Atualizar todas as dependências
npm update

# Verificar SSL
curl -I https://seu-dominio.com

# Testar headers de segurança
curl -I https://seu-dominio.com | grep -i "x-\|strict\|content-security"
```

---

## 🚨 Resposta a Incidentes

### Em Caso de Ataque DDoS

1. **Identificar**
   - Verificar logs de acesso
   - Identificar IPs maliciosos
   - Verificar padrões de tráfego

2. **Mitigar**
   - Ativar "Under Attack Mode" no Cloudflare
   - Reduzir rate limits temporariamente
   - Bloquear IPs específicos

3. **Recuperar**
   - Verificar integridade dos dados
   - Restaurar serviços gradualmente
   - Documentar o incidente

### Em Caso de Vulnerabilidade

1. **Avaliar**
   - Severidade da vulnerabilidade
   - Dados potencialmente expostos
   - Sistemas afetados

2. **Corrigir**
   - Aplicar patch imediatamente
   - Atualizar dependências
   - Testar correção

3. **Notificar**
   - Usuários afetados (se necessário)
   - Equipe de desenvolvimento
   - Autoridades (se dados sensíveis)

---

## 📞 Contatos de Emergência

### Suporte Técnico
- **Vercel**: https://vercel.com/support
- **Supabase**: https://supabase.com/support
- **Cloudflare**: https://support.cloudflare.com

### Recursos
- **OWASP**: https://owasp.org
- **Mozilla Security**: https://infosec.mozilla.org
- **Vercel Security**: https://vercel.com/docs/security

---

## 📝 Changelog

### 2026-01-28
- ✅ Implementado headers de segurança completos
- ✅ Adicionado rate limiting client-side
- ✅ Configurado CSP
- ✅ Documentação de segurança criada
- ✅ Guia de Cloudflare adicionado

---

**Última atualização**: 2026-01-28  
**Próxima revisão**: 2026-04-28
