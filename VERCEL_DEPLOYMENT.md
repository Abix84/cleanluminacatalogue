# 🚀 Guide de Déploiement sur Vercel

Guide complet pour déployer votre application CleanExpress & Lumina Distribution sur Vercel.

---

## 📋 Prérequis

- ✅ Compte Vercel (gratuit sur [vercel.com](https://vercel.com))
- ✅ Compte Supabase avec projet configuré
- ✅ Code source sur GitHub, GitLab ou Bitbucket (recommandé)
- ✅ Node.js 20+ installé localement (pour tester le build)

---

## 🔧 Étape 1 : Préparer le Projet

### 1.1 Vérifier la Configuration

Assurez-vous que les fichiers suivants existent :

- ✅ `vercel.json` (déjà configuré)
- ✅ `package.json` avec les scripts de build

### 1.2 Tester le Build Localement

```bash
# Installer les dépendances
pnpm install

# Tester le build
pnpm build

# Vérifier que le dossier dist/ est créé
ls dist/
```

Si le build fonctionne localement, il fonctionnera sur Vercel.

---

## 🌐 Étape 2 : Configuration Supabase

### 2.1 Créer un Projet Supabase de Production

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un **nouveau projet** pour la production
3. Notez le nom du projet (ex: `cleanexpress-production`)

### 2.2 Configurer la Base de Données

Dans le **SQL Editor** de votre projet Supabase :

1. **Exécutez le script complet** : `supabase/00_COMPLETE_SETUP.sql`
   - Cela créera toutes les tables nécessaires
   - Inclut déjà le rôle "visiteur"

2. **Exécutez la migration** (si vous avez déjà une base existante) :
   - `supabase/add_visiteur_role.sql`

3. **Créer le bucket Storage** :
   - Allez dans **Storage** → **Create bucket**
   - Nom : `product-images`
   - ☑️ **Public bucket** (important !)
   - Créez le bucket

### 2.3 Configurer les Redirect URLs

Dans Supabase → **Authentication** → **URL Configuration** :

1. **Site URL** : `https://votre-app.vercel.app` (vous l'obtiendrez après le déploiement)
2. **Redirect URLs** : Ajoutez :
   ```
   https://votre-app.vercel.app/**
   https://votre-app.vercel.app/callback
   http://localhost:5173/**
   ```

> ⚠️ **Note** : Vous pourrez mettre à jour ces URLs après le premier déploiement.

---

## 🚀 Étape 3 : Déployer sur Vercel

### Option A : Déploiement via Git (Recommandé)

#### 3.1 Connecter le Repository

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **"Add New..."** → **"Project"**
3. Cliquez sur **"Import Git Repository"**
4. Choisissez votre provider (GitHub, GitLab, Bitbucket)
5. Autorisez Vercel à accéder à vos repositories
6. Sélectionnez votre repository

#### 3.2 Configurer le Projet

Vercel détectera automatiquement la configuration, mais vérifiez :

- **Framework Preset** : Vite (détecté automatiquement)
- **Root Directory** : `./` (racine du projet)
- **Build Command** : `pnpm build` (détecté automatiquement)
- **Output Directory** : `dist` (détecté automatiquement)
- **Install Command** : `pnpm install` (détecté automatiquement)

#### 3.3 Ajouter les Variables d'Environnement

Dans **Environment Variables**, ajoutez :

```
VITE_SUPABASE_URL=https://votre-projet-prod.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre_cle_anon_prod
VITE_OFFLINE_MODE=false
```

> 🔑 **Où trouver ces valeurs ?**
> - Dans Supabase : **Settings** → **API**
> - **Project URL** = `VITE_SUPABASE_URL`
> - **anon public key** = `VITE_SUPABASE_PUBLISHABLE_KEY`

#### 3.4 Déployer

1. Cliquez sur **"Deploy"**
2. Attendez que le build se termine (1-3 minutes)
3. Votre site sera disponible sur `https://votre-app.vercel.app`

---

### Option B : Déploiement via CLI Vercel

#### 3.1 Installer Vercel CLI

```bash
npm install -g vercel
# ou
pnpm add -g vercel
```

#### 3.2 Se Connecter

```bash
vercel login
```

#### 3.3 Déployer

```bash
# Depuis la racine du projet
vercel

# Pour la production
vercel --prod
```

Les variables d'environnement peuvent être ajoutées via :
- Le dashboard Vercel (recommandé)
- La commande `vercel env add`

---

## ⚙️ Étape 4 : Configuration Post-Déploiement

### 4.1 Mettre à Jour les Redirect URLs Supabase

Une fois votre site déployé :

1. Copiez l'URL de votre site Vercel (ex: `https://cleanexpress.vercel.app`)
2. Dans Supabase → **Authentication** → **URL Configuration**
3. Mettez à jour :
   - **Site URL** : `https://cleanexpress.vercel.app`
   - **Redirect URLs** : Ajoutez `https://cleanexpress.vercel.app/**`

### 4.2 Vérifier le Fonctionnement

1. Visitez votre site Vercel
2. Testez la connexion
3. Vérifiez que le catalogue s'affiche correctement
4. Testez l'ajout/modification de produits (si admin)

---

## 🔒 Étape 5 : Sécurité (Production)

### 5.1 Activer RLS dans Supabase

Dans le **SQL Editor** de votre projet Supabase de production :

```sql
-- Activer Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE utility_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Lecture pour utilisateurs authentifiés
CREATE POLICY "Authenticated read products" ON products
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated read brands" ON brands
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated read categories" ON utility_categories
FOR SELECT TO authenticated USING (true);

-- Écriture admin uniquement
CREATE POLICY "Admin write products" ON products
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admin write brands" ON brands
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admin write categories" ON utility_categories
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);
```

### 5.2 Vérifier les Variables d'Environnement

Assurez-vous que `VITE_OFFLINE_MODE=false` en production.

---

## 🔄 Étape 6 : Déploiements Automatiques

### 6.1 Configuration Git

Si vous utilisez Git, Vercel déploiera automatiquement :

- ✅ À chaque push sur la branche `main`/`master` (production)
- ✅ Sur les Pull Requests (déploiement de prévisualisation)
- ✅ Sur les autres branches (déploiements de prévisualisation)

### 6.2 Branches de Déploiement

Dans **Project Settings** → **Git** :

- **Production Branch** : `main` ou `master`
- **Preview Deployments** : Activé par défaut

### 6.3 Environnements

Vercel gère automatiquement 3 environnements :

- **Production** : Déploiements depuis la branche principale
- **Preview** : Déploiements depuis les PR et autres branches
- **Development** : Déploiements locaux avec `vercel dev`

Vous pouvez définir des variables d'environnement différentes pour chaque environnement.

---

## 🐛 Dépannage

### Erreur : "Build failed"

**Solution** :
1. Vérifiez les logs de build dans Vercel
2. Testez le build localement : `pnpm build`
3. Vérifiez que Node.js 20 est utilisé (configuré dans `vercel.json`)

### Erreur : "Missing environment variables"

**Solution** :
1. Vérifiez que toutes les variables sont définies dans Vercel
2. Les variables doivent commencer par `VITE_`
3. Redéployez après avoir ajouté les variables
4. Vérifiez que vous avez sélectionné le bon environnement (Production/Preview)

### Erreur : "404 Not Found" sur les routes

**Solution** :
1. Vérifiez que `vercel.json` contient les rewrites
2. Le fichier `vercel.json` doit être à la racine du projet
3. Redéployez après avoir modifié `vercel.json`

### Erreur : "Supabase connection failed"

**Solution** :
1. Vérifiez les variables d'environnement dans Vercel
2. Vérifiez que les Redirect URLs sont configurées dans Supabase
3. Vérifiez que le projet Supabase est actif
4. Vérifiez que vous utilisez les bonnes variables pour l'environnement (Production vs Preview)

---

## 📝 Checklist de Déploiement

- [ ] Build local réussi (`pnpm build`)
- [ ] Projet Supabase de production créé
- [ ] Tables créées dans Supabase (script `00_COMPLETE_SETUP.sql`)
- [ ] Bucket `product-images` créé et public
- [ ] Variables d'environnement ajoutées dans Vercel
- [ ] Site déployé sur Vercel
- [ ] Redirect URLs configurées dans Supabase
- [ ] RLS activé dans Supabase (production)
- [ ] Test de connexion réussi
- [ ] Test d'accès au catalogue réussi

---

## 🎉 C'est Fait !

Votre application est maintenant déployée sur Vercel ! 

**URL de votre site** : `https://votre-app.vercel.app`

---

## 🔄 Déploiements Automatiques

Vercel déploie automatiquement :
- ✅ Chaque push sur `main` → Déploiement de production
- ✅ Chaque Pull Request → Déploiement de prévisualisation
- ✅ Chaque branche → Déploiement de prévisualisation

Chaque déploiement obtient sa propre URL unique pour tester.

---

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Supabase](https://supabase.com/docs)
- [Guide de déploiement Vite](https://vitejs.dev/guide/static-deploy.html#vercel)

---

## 💡 Avantages de Vercel

- ⚡ **Déploiements ultra-rapides** (Edge Network)
- 🔄 **Déploiements automatiques** depuis Git
- 🌍 **CDN global** pour des performances optimales
- 🔍 **Analytics intégrés** (optionnel)
- 🎯 **Preview deployments** pour chaque PR
- 🔒 **HTTPS automatique**
- 📊 **Logs en temps réel**

