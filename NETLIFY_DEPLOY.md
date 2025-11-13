# 🚀 Guide de Déploiement sur Netlify

Ce guide vous explique comment déployer votre application React/Vite sur Netlify pour la tester.

## 📋 Prérequis

1. Un compte Netlify (gratuit) : [https://app.netlify.com/signup](https://app.netlify.com/signup)
2. Votre projet sur GitHub, GitLab ou Bitbucket
3. Les identifiants de votre projet Supabase

## 🔧 Étape 1 : Préparer le projet

### 1.1 Vérifier les fichiers de configuration

Les fichiers suivants ont été créés automatiquement :
- ✅ `netlify.toml` - Configuration Netlify
- ✅ `public/_redirects` - Redirections pour le routing SPA

### 1.2 Créer un fichier `.env.example` (optionnel mais recommandé)

Créez un fichier `.env.example` à la racine du projet pour documenter les variables d'environnement nécessaires :

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Mode Offline (optionnel)
VITE_OFFLINE_MODE=false
```

## 📤 Étape 2 : Pousser le code sur Git

Assurez-vous que votre code est bien poussé sur votre dépôt Git :

```bash
git add .
git commit -m "Préparation pour déploiement Netlify"
git push origin main
```

## 🌐 Étape 3 : Déployer sur Netlify

### Option A : Déploiement via l'interface Netlify (Recommandé)

1. **Connecter votre dépôt**
   - Allez sur [https://app.netlify.com](https://app.netlify.com)
   - Cliquez sur "Add new site" → "Import an existing project"
   - Connectez votre compte GitHub/GitLab/Bitbucket
   - Sélectionnez votre dépôt

2. **Configurer les paramètres de build**
   - **Build command** : `npm run build`
   - **Publish directory** : `dist`
   - Netlify devrait détecter automatiquement ces paramètres grâce au fichier `netlify.toml`

3. **Configurer les variables d'environnement**
   - Dans la section "Environment variables", ajoutez :
     - `VITE_SUPABASE_URL` : L'URL de votre projet Supabase
     - `VITE_SUPABASE_ANON_KEY` : La clé anonyme de votre projet Supabase
     - `VITE_OFFLINE_MODE` : `false` (pour la production)

   Pour trouver ces valeurs :
   - Allez sur votre projet Supabase
   - Settings → API
   - Copiez "Project URL" → `VITE_SUPABASE_URL`
   - Copiez "anon public" key → `VITE_SUPABASE_ANON_KEY`

4. **Déployer**
   - Cliquez sur "Deploy site"
   - Attendez que le build se termine (2-5 minutes)

### Option B : Déploiement via Netlify CLI

1. **Installer Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Se connecter à Netlify**
   ```bash
   netlify login
   ```

3. **Initialiser le site**
   ```bash
   netlify init
   ```
   - Choisissez "Create & configure a new site"
   - Suivez les instructions

4. **Configurer les variables d'environnement**
   ```bash
   netlify env:set VITE_SUPABASE_URL "your_supabase_url"
   netlify env:set VITE_SUPABASE_ANON_KEY "your_supabase_anon_key"
   netlify env:set VITE_OFFLINE_MODE "false"
   ```

5. **Déployer**
   ```bash
   netlify deploy --prod
   ```

## ✅ Étape 4 : Vérifier le déploiement

1. Une fois le déploiement terminé, Netlify vous donnera une URL (ex: `https://votre-app.netlify.app`)
2. Testez l'application :
   - Vérifiez que la page d'accueil s'affiche
   - Testez la connexion
   - Vérifiez que les produits s'affichent correctement

## 🔒 Étape 5 : Configurer les domaines personnalisés (Optionnel)

1. Dans Netlify, allez dans "Domain settings"
2. Cliquez sur "Add custom domain"
3. Suivez les instructions pour configurer votre domaine

## 🔄 Mises à jour automatiques

Netlify déploie automatiquement votre site à chaque push sur la branche principale (main/master).

Pour désactiver les déploiements automatiques :
- Site settings → Build & deploy → Continuous Deployment → Stop auto publishing

## 🐛 Résolution de problèmes

### Le build échoue

1. Vérifiez les logs de build dans Netlify
2. Testez le build localement : `npm run build`
3. Vérifiez que toutes les variables d'environnement sont configurées

### Les routes ne fonctionnent pas (404)

- Vérifiez que le fichier `public/_redirects` est présent
- Vérifiez que `netlify.toml` contient la redirection `/*`

### Erreurs Supabase

- Vérifiez que les variables d'environnement sont correctement configurées
- Vérifiez que les URLs Supabase sont correctes (sans slash final)
- Vérifiez les règles RLS (Row Level Security) dans Supabase

### Les images ne s'affichent pas

- Vérifiez que le bucket Supabase Storage est public
- Vérifiez les politiques de stockage dans Supabase

## 📝 Checklist de déploiement

- [ ] Code poussé sur Git
- [ ] Variables d'environnement configurées dans Netlify
- [ ] Build réussi
- [ ] Site accessible
- [ ] Connexion fonctionne
- [ ] Produits s'affichent
- [ ] Images s'affichent
- [ ] Routing fonctionne (navigation entre pages)

## 🔗 Liens utiles

- [Documentation Netlify](https://docs.netlify.com/)
- [Netlify CLI](https://cli.netlify.com/)
- [Supabase Documentation](https://supabase.com/docs)

## 📧 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs de build dans Netlify
2. Vérifiez la console du navigateur (F12)
3. Vérifiez les logs Supabase dans le dashboard

