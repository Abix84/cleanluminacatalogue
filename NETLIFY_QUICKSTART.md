# ⚡ Déploiement Netlify - Guide Rapide

Guide ultra-rapide pour déployer en 5 minutes.

---

## 🚀 Déploiement Express

### 1. Préparer Supabase

```sql
-- Dans Supabase SQL Editor, exécutez :
-- 1. supabase/00_COMPLETE_SETUP.sql (toutes les tables)
-- 2. Créez le bucket "product-images" (Storage → Create bucket → Public)
```

### 2. Déployer sur Netlify

#### Via Git (Recommandé)

1. **Push votre code sur GitHub/GitLab**
2. **Allez sur [app.netlify.com](https://app.netlify.com)**
3. **"Add new site" → "Import an existing project"**
4. **Sélectionnez votre repository**
5. **Configurez** :
   - Build command : `pnpm install && pnpm build`
   - Publish directory : `dist`
6. **Ajoutez les variables d'environnement** :
   ```
   VITE_SUPABASE_URL=https://votre-projet.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=votre_cle_anon
   VITE_OFFLINE_MODE=false
   ```
7. **"Deploy site"** ✅

#### Via Drag & Drop

```bash
# 1. Build local
pnpm install
pnpm build

# 2. Sur Netlify : "Add new site" → "Deploy manually"
# 3. Glissez-déposez le dossier dist/
# 4. Ajoutez les variables d'environnement dans Settings
```

### 3. Configurer Supabase Redirects

Après le déploiement, dans Supabase → **Authentication** → **URL Configuration** :

- **Site URL** : `https://votre-app.netlify.app`
- **Redirect URLs** : `https://votre-app.netlify.app/**`

---

## ✅ Vérification

1. Visitez `https://votre-app.netlify.app`
2. Testez la connexion
3. Vérifiez le catalogue

---

## 📝 Variables d'Environnement Requises

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_OFFLINE_MODE=false
```

---

## 🐛 Problèmes Courants

**Build échoue** → Vérifiez que Node.js 20 est utilisé  
**404 sur les routes** → Vérifiez `public/_redirects`  
**Erreur Supabase** → Vérifiez les variables d'environnement

---

Pour plus de détails, consultez `NETLIFY_DEPLOYMENT.md`

