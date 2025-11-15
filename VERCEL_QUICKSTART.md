# ⚡ Déploiement Vercel - Guide Rapide

Guide ultra-rapide pour déployer en 5 minutes.

---

## 🚀 Déploiement Express

### 1. Préparer Supabase

```sql
-- Dans Supabase SQL Editor, exécutez :
-- 1. supabase/00_COMPLETE_SETUP.sql (toutes les tables)
-- 2. Créez le bucket "product-images" (Storage → Create bucket → Public)
```

### 2. Déployer sur Vercel

#### Via Git (Recommandé)

1. **Push votre code sur GitHub/GitLab**
2. **Allez sur [vercel.com](https://vercel.com)**
3. **"Add New..." → "Project"**
4. **"Import Git Repository"**
5. **Sélectionnez votre repository**
6. **Ajoutez les variables d'environnement** :
   ```
   VITE_SUPABASE_URL=https://votre-projet.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=votre_cle_anon
   VITE_OFFLINE_MODE=false
   ```
7. **"Deploy"** ✅

#### Via CLI

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer
vercel --prod
```

### 3. Configurer Supabase Redirects

Après le déploiement, dans Supabase → **Authentication** → **URL Configuration** :

- **Site URL** : `https://votre-app.vercel.app`
- **Redirect URLs** : `https://votre-app.vercel.app/**`

---

## ✅ Vérification

1. Visitez `https://votre-app.vercel.app`
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

**Build échoue** → Vérifiez les logs dans Vercel  
**404 sur les routes** → Vérifiez `vercel.json`  
**Erreur Supabase** → Vérifiez les variables d'environnement

---

## 🎯 Fonctionnalités Vercel

- ⚡ Déploiements automatiques depuis Git
- 🔄 Preview deployments pour chaque PR
- 🌍 CDN global
- 📊 Analytics intégrés

---

Pour plus de détails, consultez `VERCEL_DEPLOYMENT.md`

