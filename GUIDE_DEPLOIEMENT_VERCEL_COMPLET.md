# 🚀 Guide Complet de Déploiement sur Vercel

Guide détaillé pas à pas pour déployer votre application CleanExpress & Lumina Distribution sur Vercel.

---

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Préparation du Projet](#préparation-du-projet)
3. [Configuration Supabase](#configuration-supabase)
4. [Déploiement sur Vercel](#déploiement-sur-vercel)
5. [Configuration Post-Déploiement](#configuration-post-déploiement)
6. [Sécurité et Optimisations](#sécurité-et-optimisations)
7. [Déploiements Automatiques](#déploiements-automatiques)
8. [Dépannage](#dépannage)
9. [Checklist Complète](#checklist-complète)

---

## 📋 Prérequis

### 1.1 Comptes Nécessaires

- ✅ **Compte Vercel** : Créez un compte gratuit sur [vercel.com](https://vercel.com)
- ✅ **Compte Supabase** : Créez un compte gratuit sur [supabase.com](https://supabase.com)
- ✅ **Compte Git** : GitHub, GitLab ou Bitbucket (recommandé pour les déploiements automatiques)

### 1.2 Outils Locaux

- ✅ **Node.js 20+** : Téléchargez depuis [nodejs.org](https://nodejs.org)
- ✅ **Git** : Pour versionner votre code
- ✅ **Un éditeur de code** : VS Code recommandé

### 1.3 Vérification de l'Installation

Ouvrez un terminal et vérifiez :

```bash
# Vérifier Node.js
node --version
# Doit afficher v20.x.x ou supérieur

# Vérifier npm/pnpm
pnpm --version
# ou
npm --version

# Vérifier Git
git --version
```

---

## 🔧 Préparation du Projet

### 2.1 Vérifier la Structure du Projet

Assurez-vous que votre projet contient les fichiers suivants :

```
cozy-tardigrade-crawl/
├── package.json          ✅ Doit contenir les scripts de build
├── vite.config.ts        ✅ Configuration Vite
├── vercel.json           ✅ Configuration Vercel (déjà présent)
├── src/                  ✅ Code source
├── public/               ✅ Fichiers statiques
└── supabase/             ✅ Scripts SQL
```

### 2.2 Vérifier le fichier `vercel.json`

Le fichier `vercel.json` doit être présent à la racine et contenir :

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

> ✅ **Note** : Ce fichier est déjà configuré dans votre projet.

### 2.3 Tester le Build Localement

**Étape 1 : Installer les dépendances**

```bash
# Depuis la racine du projet
cd cozy-tardigrade-crawl

# Installer les dépendances
pnpm install
# ou
npm install
```

**Étape 2 : Créer un fichier `.env.local` pour tester**

Créez un fichier `.env.local` à la racine (ne sera pas commité) :

```env
VITE_SUPABASE_URL=https://votre-projet-test.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre_cle_anon_test
VITE_OFFLINE_MODE=false
```

**Étape 3 : Tester le build**

```bash
# Build de production
pnpm build
# ou
npm run build
```

**Étape 4 : Vérifier le résultat**

```bash
# Vérifier que le dossier dist/ est créé
ls dist/
# ou sur Windows
dir dist

# Vous devriez voir :
# - index.html
# - assets/
# - favicon.ico
# - etc.
```

**Étape 5 : Tester en local (optionnel)**

```bash
# Prévisualiser le build
pnpm preview
# ou
npm run preview
```

Ouvrez `http://localhost:4173` dans votre navigateur.

> ✅ **Important** : Si le build fonctionne localement, il fonctionnera sur Vercel.

### 2.4 Préparer le Repository Git

**Si votre code n'est pas encore sur Git :**

```bash
# Initialiser Git (si pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Créer un commit
git commit -m "Initial commit - Prêt pour déploiement Vercel"

# Créer un repository sur GitHub/GitLab/Bitbucket
# Puis connecter :
git remote add origin https://github.com/votre-username/votre-repo.git
git branch -M main
git push -u origin main
```

> ✅ **Note** : Vercel fonctionne mieux avec un repository Git pour les déploiements automatiques.

---

## 🌐 Configuration Supabase

### 3.1 Créer un Projet Supabase de Production

**Étape 1 : Se connecter à Supabase**

1. Allez sur [supabase.com](https://supabase.com)
2. Cliquez sur **"Sign In"** ou **"Start your project"**
3. Connectez-vous avec votre compte

**Étape 2 : Créer un nouveau projet**

1. Cliquez sur **"New Project"**
2. Remplissez les informations :
   - **Name** : `cleanexpress-production` (ou le nom de votre choix)
   - **Database Password** : Créez un mot de passe fort (⚠️ **SAVEZ-LE !**)
   - **Region** : Choisissez la région la plus proche de vos utilisateurs
   - **Pricing Plan** : Free tier (suffisant pour commencer)
3. Cliquez sur **"Create new project"**
4. ⏳ Attendez 2-3 minutes que le projet soit créé

**Étape 3 : Récupérer les clés API**

Une fois le projet créé :

1. Allez dans **Settings** (⚙️) → **API**
2. Notez les informations suivantes :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **anon public key** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key** : (gardez-la secrète, ne l'utilisez pas côté client)

> 📝 **Important** : Gardez ces informations, vous en aurez besoin pour Vercel.

### 3.2 Configurer la Base de Données

**Étape 1 : Ouvrir le SQL Editor**

1. Dans votre projet Supabase, cliquez sur **SQL Editor** dans le menu de gauche
2. Cliquez sur **"New query"**

**Étape 2 : Exécuter le script complet**

1. Ouvrez le fichier `supabase/00_COMPLETE_SETUP.sql` de votre projet local
2. Copiez **TOUT le contenu** du fichier
3. Collez-le dans le SQL Editor de Supabase
4. Cliquez sur **"Run"** (ou appuyez sur `Ctrl+Enter`)
5. ⏳ Attendez que l'exécution se termine (quelques secondes)
6. ✅ Vérifiez qu'il n'y a pas d'erreurs

> ✅ **Ce script crée** :
> - La table `profiles` avec les rôles (admin, vendeur, visiteur)
> - La table `utility_categories`
> - La table `brands`
> - La table `products`
> - La table `favorites` (si présente dans le script)
> - Toutes les fonctions nécessaires
> - Les politiques RLS (Row Level Security)

**Étape 3 : Vérifier les tables créées**

1. Allez dans **Table Editor** dans le menu de gauche
2. Vous devriez voir les tables :
   - ✅ `profiles`
   - ✅ `utility_categories`
   - ✅ `brands`
   - ✅ `products`
   - ✅ `favorites` (si applicable)

### 3.3 Configurer le Storage (Images)

**Étape 1 : Créer le bucket**

1. Allez dans **Storage** dans le menu de gauche
2. Cliquez sur **"Create bucket"**
3. Remplissez :
   - **Name** : `product-images` (exactement ce nom)
   - **Public bucket** : ✅ **COCHEZ CETTE CASE** (très important !)
4. Cliquez sur **"Create bucket"**

**Étape 2 : Configurer les politiques du bucket**

1. Cliquez sur le bucket `product-images` que vous venez de créer
2. Allez dans l'onglet **"Policies"**
3. Cliquez sur **"New Policy"**
4. Sélectionnez **"For full customization"**
5. Ajoutez une politique pour permettre la lecture publique :

```sql
-- Politique de lecture publique
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');
```

6. Ajoutez une politique pour permettre l'upload aux utilisateurs authentifiés :

```sql
-- Politique d'upload pour utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');
```

7. Ajoutez une politique pour permettre la suppression aux admins :

```sql
-- Politique de suppression pour admins
CREATE POLICY "Admins can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

### 3.4 Créer un Utilisateur Admin (Optionnel mais Recommandé)

**Étape 1 : Créer un utilisateur**

1. Allez dans **Authentication** → **Users**
2. Cliquez sur **"Add user"** → **"Create new user"**
3. Remplissez :
   - **Email** : `admin@votre-domaine.com`
   - **Password** : Créez un mot de passe fort
   - **Auto Confirm User** : ✅ Cochez cette case
4. Cliquez sur **"Create user"**

**Étape 2 : Définir le rôle admin**

1. Allez dans **SQL Editor**
2. Exécutez cette requête (remplacez l'email) :

```sql
-- Récupérer l'ID de l'utilisateur
SELECT id FROM auth.users WHERE email = 'admin@votre-domaine.com';

-- Puis créer le profil admin (remplacez l'UUID)
INSERT INTO profiles (id, full_name, role)
VALUES (
  'UUID_DE_L_UTILISATEUR_ICI',
  'Administrateur',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

> ✅ **Note** : Vous pouvez aussi créer le profil admin via l'interface après votre première connexion.

### 3.5 Configurer les Redirect URLs (Temporaire)

**Étape 1 : Accéder aux paramètres d'authentification**

1. Allez dans **Authentication** → **URL Configuration**

**Étape 2 : Configurer les URLs temporaires**

Pour l'instant, configurez avec une URL temporaire :

- **Site URL** : `http://localhost:5173` (pour tester localement)
- **Redirect URLs** : Ajoutez :
  ```
  http://localhost:5173/**
  http://localhost:8080/**
  ```

> ⚠️ **Note** : Nous mettrons à jour ces URLs après le déploiement sur Vercel avec l'URL réelle.

---

## 🚀 Déploiement sur Vercel

### 4.1 Option A : Déploiement via Git (Recommandé)

#### Étape 1 : Connecter le Repository

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **"Sign In"** et connectez-vous
3. Cliquez sur **"Add New..."** → **"Project"**
4. Cliquez sur **"Import Git Repository"**
5. Choisissez votre provider :
   - **GitHub** : Autorisez Vercel à accéder à vos repositories
   - **GitLab** : Connectez votre compte GitLab
   - **Bitbucket** : Connectez votre compte Bitbucket
6. Sélectionnez votre repository `cozy-tardigrade-crawl`
7. Cliquez sur **"Import"**

#### Étape 2 : Configurer le Projet

Vercel détectera automatiquement la configuration, mais vérifiez :

**Configuration du Framework :**
- **Framework Preset** : `Vite` (détecté automatiquement)
- **Root Directory** : `./` (racine du projet)
- **Build Command** : `pnpm build` ou `npm run build`
- **Output Directory** : `dist`
- **Install Command** : `pnpm install` ou `npm install`

**Si vous utilisez pnpm :**
- Cliquez sur **"Override"** à côté de "Build and Output Settings"
- Changez **Install Command** en : `pnpm install`
- Changez **Build Command** en : `pnpm build`

#### Étape 3 : Ajouter les Variables d'Environnement

**Étape 3.1 : Ouvrir la section Environment Variables**

Dans la page de configuration du projet, faites défiler jusqu'à **"Environment Variables"**.

**Étape 3.2 : Ajouter les variables**

Cliquez sur **"Add"** pour chaque variable :

**Variable 1 :**
- **Key** : `VITE_SUPABASE_URL`
- **Value** : `https://xxxxx.supabase.co` (votre Project URL de Supabase)
- **Environment** : Sélectionnez toutes les cases (Production, Preview, Development)

**Variable 2 :**
- **Key** : `VITE_SUPABASE_PUBLISHABLE_KEY`
- **Value** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (votre anon public key)
- **Environment** : Sélectionnez toutes les cases

**Variable 3 :**
- **Key** : `VITE_OFFLINE_MODE`
- **Value** : `false`
- **Environment** : Sélectionnez toutes les cases

> ✅ **Résultat** : Vous devriez avoir 3 variables d'environnement configurées.

#### Étape 4 : Déployer

1. Vérifiez que toutes les configurations sont correctes
2. Cliquez sur **"Deploy"**
3. ⏳ Attendez 1-3 minutes que le build se termine
4. ✅ Une fois terminé, vous verrez :
   - **"Congratulations!"**
   - L'URL de votre site : `https://votre-app.vercel.app`

#### Étape 5 : Accéder à votre Site

1. Cliquez sur **"Visit"** ou copiez l'URL
2. Votre site est maintenant en ligne ! 🎉

### 4.2 Option B : Déploiement via CLI Vercel

#### Étape 1 : Installer Vercel CLI

```bash
# Avec npm
npm install -g vercel

# Avec pnpm
pnpm add -g vercel

# Avec yarn
yarn global add vercel
```

#### Étape 2 : Se Connecter

```bash
vercel login
```

Cela ouvrira votre navigateur pour vous connecter à Vercel.

#### Étape 3 : Déployer

```bash
# Depuis la racine du projet
cd cozy-tardigrade-crawl

# Déploiement de prévisualisation (test)
vercel

# Déploiement de production
vercel --prod
```

#### Étape 4 : Ajouter les Variables d'Environnement via CLI

```bash
# Ajouter une variable
vercel env add VITE_SUPABASE_URL

# Suivez les instructions :
# - Entrez la valeur
# - Sélectionnez les environnements (Production, Preview, Development)

# Répétez pour chaque variable :
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
vercel env add VITE_OFFLINE_MODE
```

> ✅ **Note** : Après avoir ajouté les variables, redéployez avec `vercel --prod`

---

## ⚙️ Configuration Post-Déploiement

### 5.1 Mettre à Jour les Redirect URLs Supabase

**Étape 1 : Récupérer l'URL Vercel**

1. Dans le dashboard Vercel, allez dans votre projet
2. Copiez l'URL de production : `https://votre-app.vercel.app`

**Étape 2 : Configurer dans Supabase**

1. Allez dans votre projet Supabase
2. Allez dans **Authentication** → **URL Configuration**
3. Mettez à jour :

   **Site URL :**
   ```
   https://votre-app.vercel.app
   ```

   **Redirect URLs :** Ajoutez (une par ligne) :
   ```
   https://votre-app.vercel.app/**
   https://votre-app.vercel.app/callback
   http://localhost:5173/**
   http://localhost:8080/**
   ```

4. Cliquez sur **"Save"**

> ✅ **Important** : Ces URLs permettent à Supabase de rediriger correctement après l'authentification.

### 5.2 Vérifier le Fonctionnement

**Test 1 : Accès au Site**

1. Visitez `https://votre-app.vercel.app`
2. ✅ Le site doit se charger sans erreur
3. ✅ Vérifiez la console du navigateur (F12) pour les erreurs

**Test 2 : Authentification**

1. Cliquez sur **"Se connecter"** ou **"Login"**
2. Essayez de vous connecter avec un compte existant
3. ✅ La connexion doit fonctionner
4. ✅ Vous devez être redirigé correctement

**Test 3 : Catalogue**

1. Accédez au catalogue
2. ✅ Les produits doivent s'afficher
3. ✅ Les images doivent se charger

**Test 4 : Fonctionnalités Admin (si admin)**

1. Connectez-vous en tant qu'admin
2. Essayez d'ajouter un produit
3. ✅ L'ajout doit fonctionner
4. ✅ L'upload d'image doit fonctionner

### 5.3 Configurer un Domaine Personnalisé (Optionnel)

**Étape 1 : Ajouter un domaine**

1. Dans le dashboard Vercel, allez dans votre projet
2. Allez dans **Settings** → **Domains**
3. Cliquez sur **"Add"**
4. Entrez votre domaine : `votre-domaine.com`
5. Suivez les instructions pour configurer les DNS

**Étape 2 : Mettre à jour Supabase**

Une fois le domaine configuré, mettez à jour les Redirect URLs dans Supabase avec votre nouveau domaine.

---

## 🔒 Sécurité et Optimisations

### 6.1 Activer Row Level Security (RLS)

**Vérification :**

1. Dans Supabase, allez dans **Table Editor**
2. Sélectionnez une table (ex: `products`)
3. Allez dans l'onglet **"Policies"**
4. Vérifiez que RLS est activé

**Si RLS n'est pas activé :**

Le script `00_COMPLETE_SETUP.sql` devrait déjà avoir configuré RLS, mais si ce n'est pas le cas :

```sql
-- Activer RLS sur toutes les tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE utility_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
```

### 6.2 Vérifier les Variables d'Environnement

**Dans Vercel :**

1. Allez dans **Settings** → **Environment Variables**
2. Vérifiez que :
   - ✅ `VITE_OFFLINE_MODE=false` en production
   - ✅ Les clés Supabase sont correctes
   - ✅ Aucune clé secrète (service_role) n'est exposée

> ⚠️ **Important** : Ne jamais exposer la `service_role key` côté client !

### 6.3 Optimiser les Performances

**Configuration Vercel :**

1. Dans **Settings** → **General**
2. Vérifiez que :
   - ✅ **Node.js Version** : 20.x (ou la dernière LTS)
   - ✅ **Build Command** : Optimisé
   - ✅ **Output Directory** : `dist`

**Optimisations Vite :**

Le fichier `vite.config.ts` est déjà optimisé, mais vous pouvez ajouter :

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
});
```

### 6.4 Activer les Analytics (Optionnel)

1. Dans Vercel, allez dans **Analytics**
2. Activez **Web Analytics** (gratuit)
3. Vous obtiendrez des statistiques sur les visites

---

## 🔄 Déploiements Automatiques

### 7.1 Comprendre les Déploiements Automatiques

Vercel déploie automatiquement :

- ✅ **Production** : Chaque push sur `main` ou `master`
- ✅ **Preview** : Chaque Pull Request
- ✅ **Preview** : Chaque push sur une autre branche

### 7.2 Configuration des Branches

**Dans Vercel :**

1. Allez dans **Settings** → **Git**
2. Configurez :
   - **Production Branch** : `main` (ou `master`)
   - **Preview Deployments** : ✅ Activé
   - **Automatic deployments from Git** : ✅ Activé

### 7.3 Gérer les Environnements

Vous pouvez avoir des variables d'environnement différentes pour :

- **Production** : Variables pour la production
- **Preview** : Variables pour les tests (peut pointer vers un Supabase de test)
- **Development** : Variables pour le développement local

**Pour ajouter une variable spécifique à un environnement :**

1. Allez dans **Settings** → **Environment Variables**
2. Cliquez sur **"Add"**
3. Entrez la clé et la valeur
4. **Décochez** les environnements où vous ne voulez pas cette variable
5. Cliquez sur **"Save"**

### 7.4 Déploiements Manuels

**Via le Dashboard :**

1. Allez dans **Deployments**
2. Cliquez sur **"..."** à côté d'un déploiement
3. Cliquez sur **"Redeploy"**

**Via CLI :**

```bash
# Redéployer la production
vercel --prod

# Redéployer une prévisualisation
vercel
```

---

## 🐛 Dépannage

### 8.1 Erreur : "Build failed"

**Symptômes :**
- Le build échoue dans Vercel
- Message d'erreur dans les logs

**Solutions :**

1. **Vérifier les logs de build :**
   - Dans Vercel, allez dans **Deployments**
   - Cliquez sur le déploiement qui a échoué
   - Lisez les logs pour identifier l'erreur

2. **Tester le build localement :**
   ```bash
   pnpm build
   # ou
   npm run build
   ```
   Si ça échoue localement, corrigez l'erreur avant de redéployer.

3. **Vérifier la version de Node.js :**
   - Dans Vercel : **Settings** → **General** → **Node.js Version**
   - Assurez-vous d'utiliser Node.js 20.x

4. **Vérifier les dépendances :**
   - Vérifiez que `package.json` est correct
   - Essayez de supprimer `node_modules` et `pnpm-lock.yaml` localement
   - Réinstallez : `pnpm install`
   - Testez le build : `pnpm build`

### 8.2 Erreur : "Missing environment variables"

**Symptômes :**
- L'application se charge mais ne peut pas se connecter à Supabase
- Erreur dans la console : "Missing Supabase environment variables"

**Solutions :**

1. **Vérifier les variables dans Vercel :**
   - Allez dans **Settings** → **Environment Variables**
   - Vérifiez que toutes les variables sont présentes :
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_PUBLISHABLE_KEY`
     - `VITE_OFFLINE_MODE`

2. **Vérifier les noms des variables :**
   - Les variables doivent commencer par `VITE_` pour être accessibles dans Vite
   - Vérifiez qu'il n'y a pas de fautes de frappe

3. **Vérifier les environnements :**
   - Assurez-vous que les variables sont activées pour **Production**
   - Si vous testez une preview, activez aussi pour **Preview**

4. **Redéployer après modification :**
   - Après avoir ajouté/modifié des variables, **redéployez** le projet
   - Les variables ne sont pas injectées dans les déploiements existants

### 8.3 Erreur : "404 Not Found" sur les routes

**Symptômes :**
- La page d'accueil fonctionne
- Mais les autres routes (ex: `/catalog`, `/admin`) affichent 404

**Solutions :**

1. **Vérifier `vercel.json` :**
   - Le fichier doit être à la racine du projet
   - Il doit contenir les rewrites :
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

2. **Redéployer :**
   - Après avoir modifié `vercel.json`, redéployez

3. **Vérifier le routing :**
   - Assurez-vous que votre application utilise `react-router-dom` correctement
   - Vérifiez que les routes sont bien définies

### 8.4 Erreur : "Supabase connection failed"

**Symptômes :**
- L'application se charge
- Mais les données ne se chargent pas
- Erreur dans la console concernant Supabase

**Solutions :**

1. **Vérifier les variables d'environnement :**
   - Vérifiez que `VITE_SUPABASE_URL` est correct
   - Vérifiez que `VITE_SUPABASE_PUBLISHABLE_KEY` est correct
   - Vérifiez qu'il n'y a pas d'espaces avant/après les valeurs

2. **Vérifier les Redirect URLs dans Supabase :**
   - Allez dans Supabase → **Authentication** → **URL Configuration**
   - Vérifiez que l'URL Vercel est dans les Redirect URLs
   - Format : `https://votre-app.vercel.app/**`

3. **Vérifier que le projet Supabase est actif :**
   - Dans Supabase, vérifiez que le projet n'est pas en pause
   - Les projets gratuits peuvent être mis en pause après inactivité

4. **Vérifier la console Supabase :**
   - Allez dans **Logs** → **Postgres Logs** dans Supabase
   - Vérifiez s'il y a des erreurs

### 8.5 Erreur : "CORS policy" ou "Access-Control-Allow-Origin"

**Symptômes :**
- Erreur dans la console : "Access to fetch at '...' has been blocked by CORS policy"
- Les requêtes vers Supabase échouent
- L'application ne peut pas charger les données
- **Problème sur Vercel en production**

**Solutions :**

#### Solution 1 : Vérifier les Redirect URLs dans Supabase (CRITIQUE)

1. **Allez dans Supabase Dashboard** → Votre projet
2. **Authentication** → **URL Configuration**
3. **Vérifiez et ajoutez** :

   **Site URL :**
   ```
   https://votre-app.vercel.app
   ```
   (Remplacez par votre URL Vercel réelle)

   **Redirect URLs :** (une par ligne)
   ```
   https://votre-app.vercel.app/**
   https://votre-app.vercel.app/callback
   https://votre-app.vercel.app/auth/callback
   http://localhost:5173/**
   http://localhost:8080/**
   ```

4. **Cliquez sur "Save"**
5. **Attendez 1-2 minutes** pour que les changements prennent effet
6. **Redéployez sur Vercel** si nécessaire

#### Solution 2 : Vérifier les Variables d'Environnement sur Vercel

1. **Allez dans Vercel Dashboard** → Votre projet
2. **Settings** → **Environment Variables**
3. **Vérifiez que vous avez** :
   - `VITE_SUPABASE_URL` = `https://votre-projet.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = `eyJ...` (votre clé anon)
   - `VITE_OFFLINE_MODE` = `false`
4. **Vérifiez que les variables sont activées pour "Production"**
5. **Redéployez** après avoir modifié les variables

#### Solution 3 : Vérifier que vous utilisez le bon projet Supabase

- Assurez-vous que les variables d'environnement sur Vercel pointent vers le **même projet Supabase** que celui où vous avez configuré les Redirect URLs
- Si vous utilisez un projet Supabase différent pour la production, configurez les Redirect URLs dans **ce projet de production**

#### Solution 4 : Vérifier les logs Vercel

1. **Allez dans Vercel Dashboard** → Votre projet → **Deployments**
2. **Cliquez sur le dernier déploiement**
3. **Vérifiez les logs** pour voir si les variables d'environnement sont bien chargées
4. **Vérifiez s'il y a des erreurs** lors du build

#### Solution 5 : Pour le développement local

- Utilisez `pnpm dev` au lieu de `pnpm preview`
- Le mode dev utilise `http://localhost:5173` qui est généralement déjà configuré dans Supabase
- Le preview (`pnpm preview`) peut avoir des problèmes CORS car il utilise un port différent

#### Solution 6 : Vérifier que le projet Supabase est actif

- Vérifiez dans Supabase Dashboard que votre projet n'est pas en pause
- Si le projet est en pause, cliquez sur "Resume" pour le réactiver

### 8.6 Erreur : "Images ne se chargent pas"

**Symptômes :**
- Les produits s'affichent mais sans images
- Erreur 403 ou 404 pour les images

**Solutions :**

1. **Vérifier le bucket Storage :**
   - Dans Supabase → **Storage**
   - Vérifiez que le bucket `product-images` existe
   - Vérifiez qu'il est **Public**

2. **Vérifier les politiques du bucket :**
   - Allez dans le bucket → **Policies**
   - Vérifiez qu'il y a une politique de lecture publique

3. **Vérifier les URLs des images :**
   - Dans la console du navigateur, vérifiez les URLs des images
   - Elles doivent pointer vers `https://xxxxx.supabase.co/storage/v1/object/public/product-images/...`

### 8.7 Erreur : "Authentication failed"

**Symptômes :**
- Impossible de se connecter
- Redirection infinie
- Erreur "Invalid redirect URL"

**Solutions :**

1. **Vérifier les Redirect URLs :**
   - Dans Supabase → **Authentication** → **URL Configuration**
   - Ajoutez toutes les URLs possibles :
     - `https://votre-app.vercel.app/**`
     - `https://votre-app.vercel.app/callback`
     - `https://votre-app.vercel.app/auth/callback`

2. **Vérifier le Site URL :**
   - Le Site URL doit être : `https://votre-app.vercel.app`

3. **Vérifier la configuration d'authentification :**
   - Dans Supabase → **Authentication** → **Providers**
   - Vérifiez que **Email** est activé

### 8.8 Performance : "Site lent"

**Solutions :**

1. **Activer le CDN :**
   - Vercel utilise automatiquement un CDN global
   - Vérifiez dans **Settings** → **General** que c'est activé

2. **Optimiser les images :**
   - Utilisez des formats modernes (WebP)
   - Compressez les images avant upload

3. **Vérifier les dépendances :**
   - Vérifiez que vous n'avez pas de dépendances inutiles
   - Utilisez `pnpm why <package>` pour voir pourquoi une dépendance est installée

4. **Activer la mise en cache :**
   - Vercel met en cache automatiquement les assets statiques
   - Vérifiez les headers de cache dans **Settings** → **Headers**

---

## ✅ Checklist Complète

### Avant le Déploiement

- [ ] Node.js 20+ installé localement
- [ ] Compte Vercel créé
- [ ] Compte Supabase créé
- [ ] Code versionné sur Git (GitHub/GitLab/Bitbucket)
- [ ] Build local réussi (`pnpm build`)
- [ ] Fichier `vercel.json` présent et correct
- [ ] Fichier `package.json` avec les scripts de build

### Configuration Supabase

- [ ] Projet Supabase de production créé
- [ ] Script `00_COMPLETE_SETUP.sql` exécuté
- [ ] Toutes les tables créées (profiles, products, brands, etc.)
- [ ] Bucket `product-images` créé et **public**
- [ ] Politiques du bucket configurées
- [ ] Utilisateur admin créé (optionnel)
- [ ] Clés API récupérées (URL et anon key)

### Déploiement Vercel

- [ ] Repository connecté à Vercel
- [ ] Configuration du projet vérifiée (Framework: Vite, Output: dist)
- [ ] Variables d'environnement ajoutées :
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_PUBLISHABLE_KEY`
  - [ ] `VITE_OFFLINE_MODE=false`
- [ ] Déploiement réussi
- [ ] URL de production obtenue

### Post-Déploiement

- [ ] Redirect URLs configurées dans Supabase avec l'URL Vercel
- [ ] Site URL configurée dans Supabase
- [ ] Test d'accès au site réussi
- [ ] Test d'authentification réussi
- [ ] Test d'affichage du catalogue réussi
- [ ] Test d'upload d'images réussi (si admin)
- [ ] Test d'ajout de produit réussi (si admin)

### Sécurité

- [ ] RLS activé sur toutes les tables
- [ ] Politiques RLS vérifiées
- [ ] Variables d'environnement sécurisées (pas de service_role key)
- [ ] `VITE_OFFLINE_MODE=false` en production
- [ ] HTTPS activé (automatique sur Vercel)

### Optimisations

- [ ] Node.js version optimisée (20.x)
- [ ] Build optimisé
- [ ] Images optimisées
- [ ] Analytics activés (optionnel)

---

## 🎉 Félicitations !

Votre application est maintenant déployée sur Vercel et accessible en production !

**URL de votre site** : `https://votre-app.vercel.app`

### Prochaines Étapes

1. **Partagez votre site** avec vos utilisateurs
2. **Surveillez les performances** via les Analytics Vercel
3. **Configurez un domaine personnalisé** si nécessaire
4. **Mettez à jour régulièrement** votre application
5. **Surveillez les logs** pour détecter les erreurs

### Ressources Utiles

- 📚 [Documentation Vercel](https://vercel.com/docs)
- 📚 [Documentation Supabase](https://supabase.com/docs)
- 📚 [Documentation Vite](https://vitejs.dev)
- 📚 [Documentation React Router](https://reactrouter.com)

### Support

Si vous rencontrez des problèmes :

1. Consultez la section [Dépannage](#dépannage) ci-dessus
2. Vérifiez les logs dans Vercel
3. Vérifiez les logs dans Supabase
4. Consultez la documentation officielle

---

**Bon déploiement ! 🚀**

