# Domínio Customizado Vercel - Checklist Completo

## 🔴 Problema
- ✅ Funciona: `https://loja-fast.vercel.app` (ou similar)
- ❌ Não funciona: `https://shop.fastsistemasconstrutivos.com.br`

## 🎯 Causa
Quando funciona no `.vercel.app` mas não no domínio customizado, o problema é **SEMPRE** relacionado a:
1. Configuração DNS incorreta
2. Domínio não adicionado corretamente no Vercel
3. SSL ainda provisionando
4. Cache do navegador ou DNS

---

## ✅ PASSO A PASSO - Siga na ordem!

### 1️⃣ Verificar Domínio no Vercel

Acesse: **https://vercel.com/unitycompany/loja-fast/settings/domains**

#### Deve estar assim:
```
Domain: shop.fastsistemasconstrutivos.com.br
Status: ✅ Valid Configuration
SSL: ✅ Active
```

#### Se NÃO estiver adicionado:
1. Clique em **"Add Domain"**
2. Digite: `shop.fastsistemasconstrutivos.com.br`
3. Clique em **"Add"**

#### Se estiver com erro:
- 🔴 **"Invalid Configuration"** → DNS incorreto (veja passo 2)
- 🟡 **"Pending Verification"** → Aguarde propagação DNS (até 48h)
- ⚪ **"SSL Certificate"** → Aguarde provisionamento (até 24h)

---

### 2️⃣ Configurar DNS Corretamente

Você precisa adicionar um registro no seu provedor de DNS (GoDaddy, Hostgator, Registro.br, etc.)

#### Opção A: CNAME (Recomendado se já existir www)
```
Tipo:  CNAME
Host:  shop
Valor: cname.vercel-dns.com
TTL:   3600 (ou automático)
```

#### Opção B: A Record
```
Tipo:  A
Host:  shop (ou @)
Valor: 76.76.21.21
TTL:   3600
```

**⚠️ IMPORTANTE:**
- Remova qualquer outro registro A ou CNAME conflitante para `shop`
- Se tiver CloudFlare, desative o proxy (nuvem laranja) temporariamente

---

### 3️⃣ Verificar Configuração DNS Atual

Vou te ajudar a verificar. Execute este comando no terminal:

**Windows (PowerShell):**
```powershell
nslookup shop.fastsistemasconstrutivos.com.br
```

**Resultado Esperado:**
```
Name:    shop.fastsistemasconstrutivos.com.br
Address: 76.76.21.21  (ou IP do Vercel)
```

**Ou:**
```
Name:    cname.vercel-dns.com
Address: 76.76.21.21
Aliases: shop.fastsistemasconstrutivos.com.br
```

**Se aparecer outro IP ou "non-existent domain"** → DNS incorreto!

---

### 4️⃣ Verificar Propagação DNS

Acesse: **https://dnschecker.org**

1. Digite: `shop.fastsistemasconstrutivos.com.br`
2. Selecione tipo: `A` ou `CNAME`
3. Clique em **"Search"**

**Resultado esperado:**
- ✅ Verde na maioria dos países
- IP: `76.76.21.21` ou `cname.vercel-dns.com`

**Se aparecer X vermelho em muitos lugares:**
- DNS ainda propagando (aguarde 1-24h)
- DNS incorreto (volte ao passo 2)

---

### 5️⃣ Limpar Cache

Mesmo com DNS correto, você pode estar vendo a versão antiga em cache.

#### No Navegador:
1. Pressione: `Ctrl + Shift + Del` (Windows) ou `Cmd + Shift + Del` (Mac)
2. Marque: **"Imagens e arquivos em cache"** e **"Cookies"**
3. Período: **"Últimas 24 horas"**
4. Clique em **"Limpar dados"**

#### Ou teste em:
- Aba anônima/privada (Ctrl + Shift + N)
- Outro navegador
- Celular 4G (sem WiFi)

#### Cache DNS do Windows:
```powershell
ipconfig /flushdns
```

---

### 6️⃣ Verificar SSL/HTTPS

Se o site carregar mas dar erro de certificado:

1. Aguarde até 24h após adicionar o domínio
2. No Vercel: Settings > Domains > Clique em "Renew Certificate"
3. Se persistir, remova e adicione o domínio novamente

---

### 7️⃣ Verificar Redirects (Se aplicável)

Se você configurou redirect de `www` para `shop` ou vice-versa:

No Vercel: **Settings > Domains**

Exemplo:
```
www.fastsistemasconstrutivos.com.br → Redirect to shop.fastsistemasconstrutivos.com.br
shop.fastsistemasconstrutivos.com.br → Primary (production)
```

---

## 🧪 Teste Rápido

### Teste 1: Ping
```powershell
ping shop.fastsistemasconstrutivos.com.br
```
**Esperado:** Deve responder com IP `76.76.21.21`

### Teste 2: cURL (se tiver instalado)
```powershell
curl -I https://shop.fastsistemasconstrutivos.com.br
```
**Esperado:** Status 200 ou 301/302 (redirect)

### Teste 3: Trace DNS
```powershell
nslookup -type=A shop.fastsistemasconstrutivos.com.br 8.8.8.8
```
Usa o DNS do Google para verificar

---

## 🐛 Problemas Específicos

### "Este site não pode ser acessado"
**Causa:** DNS não resolvendo
**Solução:** Verifique passo 2 e 3 - DNS incorreto

### "ERR_SSL_VERSION_OR_CIPHER_MISMATCH"
**Causa:** SSL ainda provisionando
**Solução:** Aguarde 24h ou force renovação no Vercel

### "404 Not Found"
**Causa:** Domínio correto mas projeto errado no Vercel
**Solução:** Verifique se o domínio está no projeto correto (loja-fast)

### Site carrega mas fica em branco
**Causa:** CORS ou base path errado
**Solução:** Verifique se `vite.config.js` tem `base: '/'` (não `/loja-fast/`)

### "Too Many Redirects"
**Causa:** Loop de redirect (HTTP → HTTPS → HTTP)
**Solução:** 
1. Desative "Force HTTPS" no provedor DNS
2. Deixe o Vercel gerenciar HTTPS
3. Se usar CloudFlare, configure SSL como "Full" ou "Full (Strict)"

---

## 📋 Checklist Final

Antes de pedir ajuda, verifique:

- [ ] Domínio adicionado no Vercel com status "Valid"
- [ ] DNS configurado corretamente (CNAME ou A record)
- [ ] `nslookup` retorna IP do Vercel
- [ ] DNSChecker mostra propagação verde
- [ ] SSL certificado ativo no Vercel
- [ ] Cache do navegador limpo
- [ ] Testado em aba anônima
- [ ] Aguardou pelo menos 30 minutos após configurar DNS
- [ ] `.vercel.app` funciona perfeitamente

---

## 🎯 Próximos Passos

1. Execute o comando `nslookup` e me mostre o resultado
2. Verifique no Vercel se o domínio está com status "Valid"
3. Aguarde 30-60 minutos se acabou de configurar o DNS
4. Teste em aba anônima após limpar cache

---

## 📞 Se Nada Funcionar

Após seguir TODOS os passos acima:

1. **Screenshot do Vercel Domains** (Settings > Domains)
2. **Resultado do nslookup**
3. **Screenshot do DNSChecker**
4. **Print do painel DNS do seu provedor**

Com essas informações consigo identificar o problema exato!

---

## ⏰ Tempos Esperados

| Ação | Tempo |
|------|-------|
| Adicionar domínio no Vercel | Instantâneo |
| Provisionar SSL | 5 minutos - 24h |
| Propagação DNS | 5 minutos - 48h |
| Cache CDN limpar | 5-15 minutos |

**Média realista:** 1-2 horas após configurar tudo corretamente.
