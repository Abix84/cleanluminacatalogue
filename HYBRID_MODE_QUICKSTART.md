# 🚀 Mode Hybride - Démarrage Rapide

Guide ultra-rapide pour utiliser CleanExpress en local ET en ligne.

---

## ⚡ En 3 Minutes

### 1️⃣ Configuration (Une Seule Fois)

**Créez les fichiers d'environnement** :

```bash
# Copier l'exemple
cp .env.example .env

# Éditer avec vos clés Supabase
nano .env
```

Contenu du `.env` :
```env
VITE_SUPABASE_URL=https://fjfdcxviqmimxavqawoy.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...votre_cle...
```

### 2️⃣ Développement Local

```bash
# Démarrer l'application
pnpm dev

# Ouvrir dans le navigateur
# http://localhost:5173
```

✅ L'app utilise **votre projet Supabase** (celui dans `.env`)

### 3️⃣ Déploiement en Ligne

**Option A : Vercel (2 clics)**

1. Push sur GitHub : `git push origin main`
2. Importez sur [vercel.com](https://vercel.com)
3. Configurez les variables d'environnement dans Vercel
4. Déployez !

**Option B : Netlify**

1. Push sur GitHub : `git push origin main`
2. Importez sur [netlify.com](https://netlify.com)
3. Build command : `pnpm build`
4. Publish directory : `dist`
5. Ajoutez les variables d'environnement
6. Déployez !

---

## 🎯 Utilisation Quotidienne

### Développer Localement

```bash
# Démarrer
pnpm dev

# L'app tourne sur http://localhost:5173
# Les changements sont appliqués en temps réel
```

### Tester Avant Production

```bash
# Builder
pnpm build

# Prévisualiser
pnpm preview

# L'app de production tourne sur http://localhost:4173
```

### Déployer en Production

```bash
# Commiter vos changements
git add .
git commit -m "Update feature"

# Pousser sur GitHub
git push origin main

# Vercel/Netlify déploie automatiquement !
```

---

## 📂 Structure des Fichiers d'Environnement

```
.env                  → Développement local (gitignored)
.env.local            → Alternative locale (gitignored)
.env.production       → Production (versionnée)
.env.example          → Template (versionnée)
```

### Quand Utiliser Quoi ?

| Fichier | Quand | Commité ? |
|---------|-------|-----------|
| `.env` | Dev local par défaut | ❌ NON |
| `.env.local` | Tests locaux alternatifs | ❌ NON |
| `.env.production` | Build de production | ✅ OUI |
| `.env.example` | Documentation | ✅ OUI |

---

## 🔀 Modes d'Exécution

### Mode Développement (Local)

```bash
pnpm dev              # Utilise .env
pnpm dev:local        # Force .env.local
pnpm dev:prod         # Teste avec variables de prod
```

### Mode Production (Build)

```bash
pnpm build            # Build de prod
pnpm build:local      # Build avec vars de dev
pnpm build:prod       # Build avec vars de prod
```

### Mode Prévisualisation

```bash
pnpm preview          # Preview du build
pnpm preview:local    # Preview avec vars de dev
pnpm preview:prod     # Preview avec vars de prod
```

---

## 🌍 Configuration Multi-Environnements

### Scénario Recommandé

```
┌─────────────────┐
│  Développement  │  → .env (local)
│  Supabase DEV   │
└────────┬────────┘
         │
         ↓ git push
┌─────────────────┐
│   Production    │  → Variables Vercel/Netlify
│  Supabase PROD  │
└─────────────────┘
```

### Variables à Configurer sur Vercel/Netlify

```
VITE_SUPABASE_URL=https://votre-projet-prod.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre_cle_prod
```

**Important** : Utilisez un projet Supabase **différent** pour la production !

---

## 🛡️ Sécurité - Checklist Rapide

### Développement
- ✅ `.env` dans `.gitignore`
- ✅ Données de test uniquement
- ✅ RLS optionnel

### Production
- ✅ Variables dans Vercel/Netlify (pas en dur)
- ✅ Projet Supabase séparé
- ✅ RLS **activé** sur toutes les tables
- ✅ Bucket `product-images` créé et public
- ✅ Redirect URLs configurés

---

## 🔧 Configuration Supabase Production

### Créer le Bucket

1. Supabase Dashboard → Storage
2. Create bucket : `product-images`
3. ☑️ Public bucket
4. Create

### Activer RLS (SQL Editor)

```sql
-- Tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE utility_categories ENABLE ROW LEVEL SECURITY;

-- Lecture publique
CREATE POLICY "Public read" ON products
FOR SELECT TO authenticated, anon USING (true);

-- Écriture admin uniquement
CREATE POLICY "Admin write" ON products
FOR ALL TO authenticated
USING (auth.jwt()->>'role' = 'admin');
```

### Configurer Redirect URLs

Dans Authentication → URL Configuration :

```
Site URL: https://votre-app.vercel.app
Redirect URLs:
- https://votre-app.vercel.app/**
- http://localhost:5173/**
```

---

## 🐛 Problèmes Courants

### "Missing Supabase environment variables"

```bash
# Vérifier que .env existe
ls .env

# Redémarrer le serveur
pnpm dev
```

### Images ne s'affichent pas

```bash
# Utiliser l'outil de diagnostic
# Dans l'app : /admin/diagnostic

# Ou manuellement :
# 1. Créer le bucket product-images
# 2. Le rendre public
```

### Build échoue

```bash
# Vérifier les erreurs
pnpm lint

# Nettoyer et rebuild
rm -rf node_modules dist
pnpm install
pnpm build
```

### Production vs Local différent

```bash
# Tester le build localement
pnpm build:prod
pnpm preview:prod

# Vérifier les variables
echo $VITE_SUPABASE_URL
```

---

## 📝 Workflow Recommandé

### Jour 1 : Setup Initial

```bash
# 1. Configuration
cp .env.example .env
# Éditer .env avec vos clés

# 2. Créer le bucket Supabase
# Dashboard → Storage → Create bucket

# 3. Démarrer
pnpm install
pnpm dev

# 4. Tester
# Aller sur /admin/diagnostic
```

### Développement Quotidien

```bash
# Matin
pnpm dev

# Développer, tester
# ...

# Soir - commiter
git add .
git commit -m "Day's work"
git push origin main

# Déploiement automatique !
```

### Release en Production

```bash
# 1. Tester localement
pnpm build:prod
pnpm preview:prod

# 2. Tester sur /admin/diagnostic

# 3. Si OK, déployer
git push origin main

# 4. Vérifier sur l'URL de production

# 5. Si problème, rollback dans Vercel/Netlify
```

---

## 🎯 Commandes les Plus Utilisées

```bash
# Développement
pnpm dev                    # Démarrer en dev

# Build & Test
pnpm build                  # Builder pour prod
pnpm preview                # Tester le build

# Git
git add .                   # Stager les changements
git commit -m "message"     # Commiter
git push origin main        # Pousser (déploie auto)

# Maintenance
pnpm lint                   # Vérifier le code
pnpm install                # Installer les dépendances
```

---

## 📚 Documentation Complète

- **DEPLOYMENT_GUIDE.md** : Guide complet de déploiement
- **README.md** : Documentation du projet
- **IMPROVEMENTS.md** : Détails des améliorations
- **IMAGE_TROUBLESHOOTING.md** : Problèmes d'images

---

## ✅ Checklist de Départ

**Configuration Initiale**
- [ ] `.env` créé avec vos clés Supabase
- [ ] `pnpm install` exécuté
- [ ] Bucket `product-images` créé dans Supabase
- [ ] Bucket rendu public
- [ ] `pnpm dev` démarre sans erreur

**Premier Test**
- [ ] Application accessible sur http://localhost:5173
- [ ] `/admin/diagnostic` passe tous les tests
- [ ] Connexion admin fonctionne
- [ ] Ajout d'un produit fonctionne
- [ ] Image s'affiche correctement

**Déploiement**
- [ ] Code poussé sur GitHub
- [ ] Projet créé sur Vercel/Netlify
- [ ] Variables d'environnement configurées
- [ ] Build réussi
- [ ] Application en ligne fonctionnelle

---

## 🆘 Besoin d'Aide ?

1. **Diagnostic** : Utilisez `/admin/diagnostic`
2. **Console** : F12 → Vérifiez les erreurs
3. **Logs** : Vercel/Netlify → Function logs
4. **Documentation** : Lisez DEPLOYMENT_GUIDE.md

---

## 🎉 C'est Tout !

Vous êtes maintenant prêt à utiliser CleanExpress en mode hybride !

**Développez localement** → **Poussez sur GitHub** → **Déploiement automatique**

Simple et efficace ! 🚀

---

**Version** : 2.0.0  
**Dernière mise à jour** : 2024-01-16