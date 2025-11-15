# 🚀 Guide de Déploiement sur Netlify

Guide complet pour déployer votre application CleanExpress & Lumina Distribution sur Netlify.

---

## 📋 Prérequis

- ✅ Compte Netlify (gratuit sur [netlify.com](https://netlify.com))
- ✅ Compte Supabase avec projet configuré
- ✅ Code source sur GitHub, GitLab ou Bitbucket (recommandé)
- ✅ Node.js 20+ installé localement (pour tester le build)

---

## 🔧 Étape 1 : Préparer le Projet

### 1.1 Vérifier la Configuration

Assurez-vous que les fichiers suivants existent :

- ✅ `netlify.toml` (déjà configuré)
- ✅ `public/_redirects` (déjà configuré)
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

Si le build fonctionne localement, il fonctionnera sur Netlify.

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

1. **Site URL** : `https://votre-app.netlify.app` (vous l'obtiendrez après le déploiement)
2. **Redirect URLs** : Ajoutez :
   ```
   https://votre-app.netlify.app/**
   https://votre-app.netlify.app/callback
   http://localhost:5173/**
   ```

> ⚠️ **Note** : Vous pourrez mettre à jour ces URLs après le premier déploiement.

---

## 🚀 Étape 3 : Déployer sur Netlify

### Option A : Déploiement via Git (Recommandé)

#### 3.1 Connecter le Repository

1. Allez sur [app.netlify.com](https://app.netlify.com)
2. Cliquez sur **"Add new site"** → **"Import an existing project"**
3. Choisissez votre provider (GitHub, GitLab, Bitbucket)
4. Autorisez Netlify à accéder à vos repositories
5. Sélectionnez votre repository

#### 3.2 Configurer le Build

Netlify détectera automatiquement `netlify.toml`, mais vérifiez :

- **Build command** : `pnpm install && pnpm build`
- **Publish directory** : `dist`
- **Node version** : `20`

#### 3.3 Ajouter les Variables d'Environnement

Dans **Site settings** → **Environment variables**, ajoutez :

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

1. Cliquez sur **"Deploy site"**
2. Attendez que le build se termine (2-5 minutes)
3. Votre site sera disponible sur `https://votre-app.netlify.app`

---

### Option B : Déploiement Manuel (Drag & Drop)

#### 3.1 Build Local

```bash
# Installer les dépendances
pnpm install

# Build pour la production
pnpm build
```

#### 3.2 Déployer

1. Allez sur [app.netlify.com](https://app.netlify.com)
2. Cliquez sur **"Add new site"** → **"Deploy manually"**
3. Glissez-déposez le dossier `dist/` dans la zone de déploiement
4. **Important** : Ajoutez les variables d'environnement dans **Site settings** → **Environment variables**

> ⚠️ **Limitation** : Avec le déploiement manuel, vous devrez redéployer manuellement à chaque changement.

---

## ⚙️ Étape 4 : Configuration Post-Déploiement

### 4.1 Mettre à Jour les Redirect URLs Supabase

Une fois votre site déployé :

1. Copiez l'URL de votre site Netlify (ex: `https://cleanexpress.netlify.app`)
2. Dans Supabase → **Authentication** → **URL Configuration**
3. Mettez à jour :
   - **Site URL** : `https://cleanexpress.netlify.app`
   - **Redirect URLs** : Ajoutez `https://cleanexpress.netlify.app/**`

### 4.2 Vérifier le Fonctionnement

1. Visitez votre site Netlify
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

Si vous utilisez Git, Netlify déploiera automatiquement :

- ✅ À chaque push sur la branche `main`/`master`
- ✅ Sur les Pull Requests (déploiement de prévisualisation)

### 6.2 Branches de Déploiement

Dans **Site settings** → **Build & deploy** → **Branch deploys** :

- **Production branch** : `main` ou `master`
- **Branch deploys** : `All branches` (pour tester les PR)

---

## 🐛 Dépannage

### Erreur : "Build failed"

**Solution** :
1. Vérifiez les logs de build dans Netlify
2. Testez le build localement : `pnpm build`
3. Vérifiez que Node.js 20 est utilisé

### Erreur : "Missing environment variables"

**Solution** :
1. Vérifiez que toutes les variables sont définies dans Netlify
2. Les variables doivent commencer par `VITE_`
3. Redéployez après avoir ajouté les variables

### Erreur : "404 Not Found" sur les routes

**Solution** :
1. Vérifiez que `public/_redirects` existe
2. Vérifiez que `netlify.toml` contient les redirects
3. Le fichier `_redirects` doit être dans `public/`

### Erreur : "Supabase connection failed"

**Solution** :
1. Vérifiez les variables d'environnement dans Netlify
2. Vérifiez que les Redirect URLs sont configurées dans Supabase
3. Vérifiez que le projet Supabase est actif

---

## 📝 Checklist de Déploiement

- [ ] Build local réussi (`pnpm build`)
- [ ] Projet Supabase de production créé
- [ ] Tables créées dans Supabase (script `00_COMPLETE_SETUP.sql`)
- [ ] Bucket `product-images` créé et public
- [ ] Variables d'environnement ajoutées dans Netlify
- [ ] Site déployé sur Netlify
- [ ] Redirect URLs configurées dans Supabase
- [ ] RLS activé dans Supabase (production)
- [ ] Test de connexion réussi
- [ ] Test d'accès au catalogue réussi

---

## 🎉 C'est Fait !

Votre application est maintenant déployée sur Netlify ! 

**URL de votre site** : `https://votre-app.netlify.app`

---

## 📚 Ressources

- [Documentation Netlify](https://docs.netlify.com/)
- [Documentation Supabase](https://supabase.com/docs)
- [Guide de déploiement Vite](https://vitejs.dev/guide/static-deploy.html#netlify)

