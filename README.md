# 🧼 CleanExpress - Catalogue de Produits Détergents

Application web moderne de gestion et consultation d'un catalogue de produits détergents professionnels, développée avec React, TypeScript, et Supabase.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## 📋 Table des Matières

- [Fonctionnalités](#-fonctionnalités)
- [Stack Technique](#-stack-technique)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Démarrage](#-démarrage)
- [Structure du Projet](#-structure-du-projet)
- [Scripts Disponibles](#-scripts-disponibles)
- [Déploiement](#-déploiement)
- [Améliorations Récentes](#-améliorations-récentes)

---

## ✨ Fonctionnalités

### 🌐 Interface Publique
- ✅ **Catalogue de produits** avec grille responsive
- ✅ **Filtrage avancé** par catégorie, marque et recherche textuelle
- ✅ **Tri dynamique** (prix, nom, ordre alphabétique)
- ✅ **Page détail produit** avec informations complètes
- ✅ **Aperçu image** en modal (zoom)
- ✅ **Mode sombre/clair** avec persistance
- ✅ **Design responsive** (mobile, tablette, desktop)

### 🔐 Interface d'Administration
- ✅ **Authentification sécurisée** via Supabase Auth
- ✅ **CRUD complet** sur les produits
- ✅ **Gestion des catégories** d'utilité
- ✅ **Gestion des marques**
- ✅ **Upload d'images** avec Supabase Storage
- ✅ **Dashboard statistiques**
- ✅ **Export JSON** des données
- ✅ **Routes protégées**

### 🛡️ Améliorations Techniques
- ✅ **ErrorBoundary** pour la gestion d'erreurs React
- ✅ **Types TypeScript stricts** (207 lignes de types)
- ✅ **Gestion d'erreurs robuste** dans tous les contexts
- ✅ **Variables d'environnement** sécurisées
- ✅ **Composants réutilisables** (LoadingSpinner, EmptyState)
- ✅ **Hook useToast** personnalisé

---

## 🚀 Stack Technique

### Frontend
- **React 18.3** - Bibliothèque UI
- **TypeScript 5.5** - Typage statique
- **Vite 6.3** - Build tool ultra-rapide
- **React Router 6** - Navigation
- **TailwindCSS 3.4** - Styling utilitaire

### UI Components
- **shadcn/ui** - Composants React de qualité
- **Radix UI** - Primitives accessibles
- **Lucide React** - Icônes

### Backend & Services
- **Supabase** - BaaS (Auth, Database, Storage)
  - PostgreSQL Database
  - Authentication
  - Storage (images produits)
  - Edge Functions

### Formulaires & Validation
- **React Hook Form 7.53** - Gestion de formulaires
- **Zod 3.23** - Validation de schémas

### État Global
- **React Context API** - State management
- **TanStack Query 5.56** - Cache et requêtes asynchrones (installé)

### Notifications
- **Sonner** - Toast notifications élégantes

### Autres
- **date-fns** - Manipulation de dates
- **uuid** - Génération d'identifiants uniques

---

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** >= 18.x
- **pnpm** >= 8.x (ou npm/yarn)
- Un compte **Supabase** (gratuit)

```bash
# Vérifier les versions
node --version
pnpm --version
```

---

## 📥 Installation

### 1. Cloner le repository

```bash
git clone <url-du-repo>
cd cozy-tardigrade-crawl
```

### 2. Installer les dépendances

```bash
pnpm install
```

---

## ⚙️ Configuration

### 1. Variables d'environnement

Créez un fichier `.env` à la racine du projet en copiant `.env.example` :

```bash
cp .env.example .env
```

Remplissez les variables avec vos identifiants Supabase :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre_cle_publique_supabase
```

> 🔑 **Obtenir vos clés Supabase :**
> 1. Allez sur [supabase.com](https://supabase.com)
> 2. Créez un nouveau projet
> 3. Allez dans `Settings` → `API`
> 4. Copiez l'URL et la clé `anon/public`

### 2. Configuration Supabase

#### Base de données

Créez les tables suivantes dans votre projet Supabase (SQL Editor) :

```sql
-- Table des catégories d'utilité
CREATE TABLE utility_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des marques
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des produits
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image_url TEXT,
  utility_category_id UUID REFERENCES utility_categories(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes pour performance
CREATE INDEX idx_products_category ON products(utility_category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_name ON products(name);
```

#### Storage

Créez un bucket pour les images :

1. Allez dans `Storage` dans votre dashboard Supabase
2. Créez un bucket nommé `product-images`
3. Configurez-le en **public** pour permettre l'accès aux images

#### Row Level Security (RLS) - **IMPORTANT pour la production**

```sql
-- Permettre la lecture publique
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE utility_categories ENABLE ROW LEVEL SECURITY;

-- Policies de lecture (public)
CREATE POLICY "Allow public read access on products"
ON products FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Allow public read access on brands"
ON brands FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Allow public read access on categories"
ON utility_categories FOR SELECT
TO authenticated, anon
USING (true);

-- Policies d'écriture (admin uniquement)
-- À adapter selon votre système d'authentification
CREATE POLICY "Allow authenticated users to manage products"
ON products FOR ALL
TO authenticated
USING (true);
```

---

## 🎯 Démarrage

### Mode Développement

```bash
pnpm dev
```

L'application sera disponible sur [http://localhost:5173](http://localhost:5173)

### Build de Production

```bash
pnpm build
```

Les fichiers optimisés seront dans le dossier `dist/`

### Prévisualisation du Build

```bash
pnpm preview
```

### Linter

```bash
pnpm lint
```

---

## 📁 Structure du Projet

```
cozy-tardigrade-crawl/
├── public/                      # Assets statiques
├── src/
│   ├── components/              # Composants React
│   │   ├── admin/              # Composants admin
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── ...
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── ErrorBoundary.tsx   # Gestion d'erreurs ✨
│   │   ├── LoadingSpinner.tsx  # Loading states ✨
│   │   ├── EmptyState.tsx      # États vides ✨
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   ├── ProductCard.tsx
│   │   └── ProductList.tsx
│   ├── context/                # Context API providers
│   │   ├── AuthContext.tsx     # Authentification
│   │   ├── ProductContext.tsx  # Gestion produits ⚡
│   │   ├── BrandContext.tsx    # Gestion marques ⚡
│   │   └── UtilityCategoryContext.tsx ⚡
│   ├── hooks/                  # Custom hooks
│   │   └── useToast.tsx        # Toast notifications ✨
│   ├── integrations/
│   │   └── supabase/
│   │       └── client.ts       # Client Supabase ⚡
│   ├── lib/
│   │   └── utils.ts            # Utilitaires
│   ├── pages/                  # Pages de l'application
│   │   ├── admin/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── AddProduct.tsx
│   │   │   └── EditProduct.tsx
│   │   ├── Index.tsx           # Page d'accueil
│   │   ├── ProductDetail.tsx
│   │   ├── Login.tsx
│   │   └── NotFound.tsx
│   ├── types/
│   │   └── index.ts            # Types TypeScript (207 lignes) ⚡
│   ├── utils/                  # Fonctions utilitaires
│   ├── App.tsx                 # Composant racine
│   ├── main.tsx                # Point d'entrée
│   └── globals.css             # Styles globaux
├── .env                        # Variables d'environnement (gitignored) ⚡
├── .env.example                # Template des variables ✨
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── IMPROVEMENTS.md             # Documentation des améliorations ✨
└── README.md                   # Ce fichier

✨ = Nouveau fichier
⚡ = Fichier amélioré/refactorisé
```

---

## 📜 Scripts Disponibles

| Script | Description |
|--------|-------------|
| `pnpm dev` | Lance le serveur de développement |
| `pnpm build` | Build de production |
| `pnpm build:dev` | Build en mode développement |
| `pnpm preview` | Prévisualise le build de production |
| `pnpm lint` | Vérifie le code avec ESLint |

---

## 🌍 Déploiement

### Vercel (Recommandé)

1. Pushez votre code sur GitHub
2. Importez le projet sur [Vercel](https://vercel.com)
3. Configurez les variables d'environnement :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. Déployez !

Le fichier `vercel.json` est déjà configuré pour le routing SPA.

### Netlify

```bash
pnpm build
```

Glissez-déposez le dossier `dist/` sur [Netlify Drop](https://app.netlify.com/drop)

---

## 🎨 Personnalisation

### Thème Tailwind

Modifiez `tailwind.config.ts` pour personnaliser les couleurs :

```typescript
theme: {
  extend: {
    colors: {
      primary: {...},  // Votre couleur primaire
    }
  }
}
```

### Composants shadcn/ui

Tous les composants sont dans `src/components/ui/` et peuvent être personnalisés directement.

---

## 🛠️ Améliorations Récentes

Consultez [IMPROVEMENTS.md](./IMPROVEMENTS.md) pour une liste détaillée des améliorations apportées, incluant :

- ✅ Variables d'environnement sécurisées
- ✅ ErrorBoundary pour la gestion d'erreurs
- ✅ Types TypeScript stricts (207 lignes)
- ✅ Gestion d'erreurs robuste dans tous les contexts
- ✅ Composants réutilisables (LoadingSpinner, EmptyState)
- ✅ Hook useToast personnalisé

---

## 🐛 Dépannage

### L'application ne démarre pas

```bash
# Nettoyez le cache et réinstallez
rm -rf node_modules .pnpm-store dist
pnpm install
pnpm dev
```

### Erreur "Missing Supabase environment variables"

Assurez-vous que le fichier `.env` existe et contient les bonnes variables.

### Les images ne s'affichent pas

Vérifiez que :
1. Le bucket `product-images` existe dans Supabase Storage
2. Le bucket est configuré en **public**
3. Les URLs d'images sont correctes

---

## 📚 Ressources

- [Documentation React](https://react.dev)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation shadcn/ui](https://ui.shadcn.com)
- [Documentation TailwindCSS](https://tailwindcss.com/docs)
- [Documentation Vite](https://vitejs.dev)

---

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

## 👥 Auteurs

- **Développeur Initial** - [Dyad](https://dyad.sh)

---

## 🙏 Remerciements

- [shadcn](https://twitter.com/shadcn) pour les composants UI
- [Supabase](https://supabase.com) pour le backend
- La communauté React pour les outils exceptionnels

---

**Fait avec ❤️ et [Dyad](https://dyad.sh)**