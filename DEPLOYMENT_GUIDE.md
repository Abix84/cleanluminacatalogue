# 🚀 Guide de Déploiement - Mode Hybride

Ce guide explique comment utiliser l'application **CleanExpress** en mode hybride : développement local et déploiement en production.

---

## 📋 Table des Matières

1. [Vue d'Ensemble](#-vue-densemble)
2. [Configuration Locale](#-configuration-locale)
3. [Configuration Production](#-configuration-production)
4. [Scripts Disponibles](#-scripts-disponibles)
5. [Déploiement Vercel](#-déploiement-vercel)
6. [Déploiement Netlify](#-déploiement-netlify)
7. [Workflow de Développement](#-workflow-de-développement)
8. [Troubleshooting](#-troubleshooting)

---

## 🌍 Vue d'Ensemble

L'application fonctionne en **3 modes** :

| Mode | Fichier Env | Usage |
|------|-------------|-------|
| **Development** | `.env` ou `.env.local` | Développement local |
| **Production** | `.env.production` | Build de production |
| **Preview** | `.env` | Prévisualisation du build |

### Architecture Hybride

```
┌─────────────────────────────────────────────┐
│         Développement Local                 │
│  - .env ou .env.local                       │
│  - Supabase de dev/test                     │
│  - Hot reload                               │
└─────────────────┬───────────────────────────┘
                  │
                  │ git push
                  ↓
┌─────────────────────────────────────────────┐
│         Production (Vercel/Netlify)         │
│  - Variables d'env configurées              │
│  - Supabase de production                   │
│  - Build optimisé                           │
└─────────────────────────────────────────────┘
```

---

## 💻 Configuration Locale

### Étape 1 : Fichiers d'Environnement

Vous avez **3 fichiers** pour gérer les environnements :

#### `.env` (développement par défaut)
```env
VITE_SUPABASE_URL=https://votre-projet-dev.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre_cle_dev
```

#### `.env.local` (environnement local alternatif)
```env
# Pour tester avec un autre projet Supabase
VITE_SUPABASE_URL=https://autre-projet.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=autre_cle
```

#### `.env.production` (production)
```env
VITE_SUPABASE_URL=https://votre-projet-prod.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre_cle_prod
```

### Étape 2 : Ordre de Priorité

Vite charge les fichiers dans cet ordre (le dernier gagne) :

1. `.env` (toujours chargé)
2. `.env.local` (écrase `.env` si présent)
3. `.env.[mode]` (ex: `.env.production`)
4. `.env.[mode].local` (ex: `.env.production.local`)

**Exemple** :
- En mode `dev` : `.env` → `.env.local`
- En mode `production` : `.env` → `.env.production`

### Étape 3 : Configuration Supabase Local

**Option A : Utiliser votre projet Supabase cloud**
```env
# .env.local
VITE_SUPABASE_URL=https://fjfdcxviqmimxavqawoy.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

**Option B : Supabase Local (avancé)**
```bash
# Installer Supabase CLI
npm install -g supabase

# Démarrer Supabase localement
supabase start

# Le CLI affichera l'URL et la clé
```

Puis dans `.env.local` :
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🌐 Configuration Production

### Étape 1 : Créer un Projet Supabase de Production

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un **nouveau projet** (séparé du dev)
3. Nommez-le : `cleanexpress-production`
4. Créez les tables et le bucket (comme en dev)

### Étape 2 : Récupérer les Clés

1. Allez dans **Settings** → **API**
2. Copiez :
   - Project URL
   - `anon` public key

### Étape 3 : Configurer `.env.production`

```env
VITE_SUPABASE_URL=https://votre-projet-prod.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre_cle_prod_anon
```

### Étape 4 : Sécuriser la Production

**Important** : Activez Row Level Security (RLS) sur la production !

```sql
-- Dans Supabase SQL Editor (projet de production)

-- Activer RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE utility_categories ENABLE ROW LEVEL SECURITY;

-- Lecture publique
CREATE POLICY "Public read products" ON products
FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Public read brands" ON brands
FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Public read categories" ON utility_categories
FOR SELECT TO authenticated, anon USING (true);

-- Écriture admin uniquement
CREATE POLICY "Admin write products" ON products
FOR ALL TO authenticated
USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admin write brands" ON brands
FOR ALL TO authenticated
USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admin write categories" ON utility_categories
FOR ALL TO authenticated
USING (auth.jwt()->>'role' = 'admin');
```

---

## 📜 Scripts Disponibles

### Développement

```bash
# Démarrer en mode dev (utilise .env ou .env.local)
pnpm dev

# Forcer l'utilisation de .env.local
pnpm dev:local

# Tester avec les variables de production localement
pnpm dev:prod
```

### Build

```bash
# Build de production (utilise .env.production)
pnpm build

# Build avec variables de dev
pnpm build:local

# Build avec variables de production
pnpm build:prod
```

### Prévisualisation

```bash
# Prévisualiser le build de production
pnpm preview

# Prévisualiser avec variables de dev
pnpm preview:local

# Prévisualiser avec variables de production
pnpm preview:prod
```

---

## ▲ Déploiement Vercel

### Méthode 1 : Via GitHub (Recommandé)

1. **Poussez votre code sur GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connectez-vous à Vercel**
   - Allez sur [vercel.com](https://vercel.com)
   - Cliquez sur "New Project"
   - Importez votre repo GitHub

3. **Configurez les variables d'environnement**
   
   Dans Vercel Dashboard → Settings → Environment Variables :
   
   ```
   VITE_SUPABASE_URL = https://votre-projet-prod.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY = votre_cle_prod
   ```
   
   **Important** : Sélectionnez "Production" pour ces variables

4. **Déployez**
   - Vercel déploiera automatiquement
   - URL disponible en quelques minutes

### Méthode 2 : Via CLI

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Ou directement en production
vercel --prod
```

### Configuration Vercel

Le fichier `vercel.json` est déjà configuré :

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 🎯 Déploiement Netlify

### Méthode 1 : Via GitHub

1. **Poussez sur GitHub**
   ```bash
   git push origin main
   ```

2. **Connectez-vous à Netlify**
   - Allez sur [netlify.com](https://netlify.com)
   - Cliquez sur "Add new site" → "Import an existing project"
   - Connectez votre repo GitHub

3. **Configurez le build**
   ```
   Build command: pnpm build
   Publish directory: dist
   ```

4. **Configurez les variables d'environnement**
   
   Dans Site settings → Environment variables :
   
   ```
   VITE_SUPABASE_URL = https://votre-projet-prod.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY = votre_cle_prod
   ```

5. **Déployez**

### Méthode 2 : Drag & Drop

```bash
# Builder localement
pnpm build

# Glissez-déposez le dossier dist/ sur netlify.com/drop
```

### Configuration Netlify

Créez un fichier `netlify.toml` à la racine (optionnel) :

```toml
[build]
  command = "pnpm build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🔄 Workflow de Développement

### Scénario 1 : Développement Local

```bash
# 1. Développer localement
pnpm dev

# 2. Tester avec les données de dev
# 3. Faire vos modifications
# 4. Committer
git add .
git commit -m "Add new feature"
```

### Scénario 2 : Tester Avant Production

```bash
# 1. Builder avec les variables de production
pnpm build:prod

# 2. Prévisualiser
pnpm preview:prod

# 3. Tester l'application
# 4. Si OK, pousser sur GitHub
git push origin main
```

### Scénario 3 : Déploiement Automatique

```bash
# 1. Pousser sur GitHub
git push origin main

# 2. Vercel/Netlify déploie automatiquement
# 3. Vérifier sur l'URL de production
# 4. Si problème, rollback dans le dashboard
```

---

## 🔀 Stratégie Multi-Environnements

### Recommandation : 3 Environnements

```
Development (Local)
  ↓ git push origin dev
Preview (Branch dev sur Vercel)
  ↓ merge → main
Production (Branch main sur Vercel)
```

### Configuration

**Sur Vercel** :
- Branch `main` → Production
- Branch `dev` → Preview
- Autres branches → Preview automatiques

**Variables par environnement** :
- Production : Variables de prod
- Preview : Variables de dev/staging

---

## 🛡️ Sécurité

### ✅ À Faire

- ✅ Utiliser des projets Supabase séparés (dev/prod)
- ✅ Activer RLS en production
- ✅ Ne jamais commiter `.env` ou `.env.local`
- ✅ Utiliser des clés différentes dev/prod
- ✅ Configurer les CORS dans Supabase
- ✅ Limiter les permissions en production

### ❌ À Ne Pas Faire

- ❌ Utiliser la même base de données dev/prod
- ❌ Commiter les clés dans Git
- ❌ Désactiver RLS en production
- ❌ Utiliser des clés `service_role` côté client
- ❌ Laisser les buckets Storage privés si vous voulez des images publiques

---

## 🐛 Troubleshooting

### Problème : Variables d'environnement non prises en compte

**Cause** : Le serveur n'a pas été redémarré

**Solution** :
```bash
# Arrêter (Ctrl+C)
# Puis relancer
pnpm dev
```

---

### Problème : Build production échoue

**Cause** : Erreur TypeScript ou variables manquantes

**Solution** :
```bash
# Vérifier les erreurs
pnpm lint

# Vérifier que .env.production existe
cat .env.production

# Builder avec logs
pnpm build 2>&1 | tee build.log
```

---

### Problème : Images ne s'affichent pas en production

**Cause** : Bucket Supabase pas configuré

**Solution** :
1. Créer le bucket `product-images` dans le projet de production
2. Le rendre public
3. Vérifier les permissions RLS

---

### Problème : Authentification échoue en production

**Cause** : Redirect URLs non configurés

**Solution** :
1. Allez dans Supabase → Authentication → URL Configuration
2. Ajoutez vos URLs de production :
   ```
   Site URL: https://votre-app.vercel.app
   Redirect URLs:
   - https://votre-app.vercel.app/**
   - http://localhost:5173/** (pour le dev)
   ```

---

### Problème : CORS errors

**Cause** : Domaine non autorisé dans Supabase

**Solution** :
1. Allez dans Supabase → Settings → API
2. Ajoutez votre domaine dans "Allowed origins"

---

## 📊 Checklist de Déploiement

### Avant le Déploiement

- [ ] `.env.production` configuré avec les bonnes clés
- [ ] Bucket `product-images` créé et public en production
- [ ] RLS activé sur toutes les tables en production
- [ ] Redirect URLs configurés dans Supabase
- [ ] Code poussé sur GitHub
- [ ] Build local teste : `pnpm build && pnpm preview`

### Pendant le Déploiement

- [ ] Variables d'environnement configurées sur Vercel/Netlify
- [ ] Build réussi
- [ ] Déploiement terminé
- [ ] URL de production disponible

### Après le Déploiement

- [ ] Tester l'authentification
- [ ] Tester l'ajout d'un produit
- [ ] Tester l'upload d'image
- [ ] Tester les filtres et recherche
- [ ] Vérifier les performances (Lighthouse)
- [ ] Tester sur mobile

---

## 🎓 Ressources

- [Documentation Vite - Env Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Netlify](https://docs.netlify.com)
- [Documentation Supabase](https://supabase.com/docs)

---

## 💡 Conseils

### Pour le Développement

- Utilisez `.env.local` pour vos tests personnels
- Commitez `.env.example` pour documenter les variables requises
- Ne commitez JAMAIS `.env` ou `.env.local`

### Pour la Production

- Utilisez des projets Supabase séparés
- Activez toujours RLS
- Configurez des alertes (Sentry, LogRocket)
- Mettez en place un monitoring (Vercel Analytics)

### Pour le Workflow

- Utilisez des branches (dev, staging, main)
- Testez toujours localement avant de pusher
- Configurez des Preview Deployments pour les PRs
- Documentez vos changements

---

## 🚀 Commandes Rapides

```bash
# Développement local
pnpm dev

# Build et prévisualisation
pnpm build && pnpm preview

# Déploiement Vercel
git push origin main

# Test du build de production localement
pnpm build:prod && pnpm preview:prod

# Vérifier les variables chargées
echo $VITE_SUPABASE_URL
```

---

**Dernière mise à jour** : 2024-01-16  
**Version** : 2.0.0

**🎉 Votre application est maintenant prête pour le mode hybride !**