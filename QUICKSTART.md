# 🚀 Démarrage Rapide - CleanExpress

Guide pour démarrer en 5 minutes.

---

## 📋 Prérequis

- Node.js 18+ installé
- pnpm installé (`npm install -g pnpm`)
- Un compte Supabase (gratuit)

---

## ⚡ Installation en 5 Minutes

### 1️⃣ Installer les dépendances

```bash
pnpm install
```

### 2️⃣ Configurer Supabase

**Option A : Utiliser les clés existantes** _(pour tester rapidement)_

```bash
# Copier l'exemple
cp .env.example .env

# Les clés de développement sont déjà dans .env
# L'app va démarrer immédiatement !
```

**Option B : Utiliser votre propre projet Supabase** _(recommandé)_

1. Allez sur [supabase.com](https://supabase.com) et créez un projet
2. Allez dans `Settings` → `API`
3. Copiez l'URL et la clé `anon/public`
4. Modifiez `.env` :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre_cle_anon
```

### 3️⃣ Créer les tables Supabase

Dans votre projet Supabase → SQL Editor → Nouvelle requête :

```sql
-- Catégories
CREATE TABLE utility_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marques
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Produits
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image_url TEXT,
  utility_category_id UUID REFERENCES utility_categories(id),
  brand_id UUID REFERENCES brands(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_products_category ON products(utility_category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
```

### 4️⃣ Créer le bucket pour les images

1. Dans Supabase → Storage
2. Créer un nouveau bucket : `product-images`
3. Le rendre **public**

### 5️⃣ Démarrer l'application

```bash
pnpm dev
```

Ouvrez [http://localhost:5173](http://localhost:5173) 🎉

---

## 🎯 Premiers Pas

### Accéder à l'admin

1. Allez sur `/login`
2. Créez un compte dans Supabase Auth (Dashboard → Authentication)
3. Connectez-vous
4. Allez sur `/admin`

### Ajouter un produit

1. Cliquez sur "Ajouter" dans le dashboard
2. Remplissez le formulaire
3. Uploadez une image
4. Sauvegardez

### Tester le catalogue public

1. Retournez sur la page d'accueil `/`
2. Testez les filtres et la recherche
3. Cliquez sur un produit pour voir les détails

---

## 📚 Documentation Complète

- **README.md** - Documentation complète
- **IMPROVEMENTS.md** - Détails des améliorations
- **MIGRATION_GUIDE.md** - Guide de migration
- **SUMMARY.md** - Résumé exécutif

---

## 🆘 Problèmes Courants

### "Missing Supabase environment variables"

```bash
# Vérifiez que .env existe
ls -la .env

# Redémarrez le serveur
pnpm dev
```

### "Cannot connect to Supabase"

- Vérifiez que l'URL est correcte
- Vérifiez que la clé est correcte
- Vérifiez votre connexion internet

### Les images ne s'affichent pas

- Vérifiez que le bucket `product-images` existe
- Vérifiez qu'il est **public**

---

## 🎨 Fonctionnalités à Tester

- [ ] Ajouter un produit
- [ ] Modifier un produit
- [ ] Supprimer un produit
- [ ] Uploader une image
- [ ] Filtrer par catégorie
- [ ] Filtrer par marque
- [ ] Rechercher un produit
- [ ] Trier par prix/nom
- [ ] Cliquer sur une image (zoom)
- [ ] Mode sombre/clair

---

## 🚢 Déployer en Production

### Vercel (Recommandé - 2 minutes)

1. Push sur GitHub
2. Importez sur [vercel.com](https://vercel.com)
3. Ajoutez les variables d'environnement
4. Déployez !

### Netlify

```bash
pnpm build
# Glissez-déposez le dossier dist/ sur netlify.com
```

---

## 💡 Conseils

### Données de test

Ajoutez quelques produits de test pour voir l'interface :

- 3-4 catégories (Nettoyage, Désinfection, etc.)
- 2-3 marques (CleanPro, EcoClean, etc.)
- 10-15 produits avec images

### Sécurité (Production)

Activez Row Level Security dans Supabase :

```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON products
FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Admin write" ON products
FOR ALL TO authenticated 
USING (auth.jwt()->>'role' = 'admin');
```

---

## ⏱️ Timeline

- ⚡ **5 min** : Installation + configuration
- 🎨 **10 min** : Ajouter données de test
- 🚀 **5 min** : Déploiement Vercel

**Total : 20 minutes pour être en ligne !**

---

## 🎉 Vous êtes prêt !

L'application est maintenant opérationnelle. Profitez-en ! 🚀

**Besoin d'aide ?** Consultez README.md pour plus de détails.