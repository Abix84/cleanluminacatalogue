# 🔄 Guide de Migration - v1.x vers v2.0

Ce guide vous aidera à migrer votre code existant vers la nouvelle version avec toutes les améliorations apportées.

---

## 📋 Vue d'Ensemble

La version 2.0 apporte des améliorations majeures en termes de :
- Sécurité (variables d'environnement)
- Gestion d'erreurs (ErrorBoundary, types ApiError)
- Types TypeScript (types stricts, pas d'`any`)
- Architecture (convertisseurs DB ↔ Frontend)

---

## ⚠️ Breaking Changes

### 1. Variables d'Environnement (OBLIGATOIRE)

**Avant :**
```typescript
// src/integrations/supabase/client.ts
const SUPABASE_URL = "https://...";
const SUPABASE_PUBLISHABLE_KEY = "eyJ...";
```

**Après :**
```typescript
// src/integrations/supabase/client.ts
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
```

**Action requise :**
1. Créez un fichier `.env` à la racine du projet
2. Copiez le contenu de `.env.example`
3. Remplissez vos vraies valeurs Supabase

```bash
# .env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre_cle_anon
```

4. **Redémarrez le serveur de développement**
```bash
pnpm dev
```

---

### 2. Contexts - Nouvelle Propriété `error`

Tous les contexts ont maintenant une propriété `error`.

**Avant :**
```typescript
const { products, loading } = useProducts();
```

**Après :**
```typescript
const { products, loading, error } = useProducts();

// Afficher l'erreur si nécessaire
if (error) {
  return <div>Erreur: {error.message}</div>;
}
```

**Action requise :**
- Aucune si vous n'utilisez pas la destructuration complète
- Ajoutez `error` dans vos destructurations si vous voulez gérer les erreurs

---

### 3. Types TypeScript - ProductFormData

**Avant :**
```typescript
type ProductFormData = Omit<Product, 'id' | 'image_url'> & {
  image_url?: File | string | null;
};
```

**Après :**
```typescript
import { ProductFormData } from '@/types';
// Le type est maintenant exporté depuis types/index.ts
```

**Action requise :**
- Importez les types depuis `@/types` au lieu de les redéfinir
- Supprimez les définitions de types locales

---

## 🆕 Nouvelles Fonctionnalités

### 1. ErrorBoundary

Enveloppe automatiquement toute l'application. Aucune action requise.

**Utilisation personnalisée (optionnel) :**
```typescript
import ErrorBoundary from '@/components/ErrorBoundary';

<ErrorBoundary fallback={<CustomErrorComponent />}>
  <YourComponent />
</ErrorBoundary>
```

---

### 2. LoadingSpinner

Remplacez vos spinners personnalisés par le composant réutilisable.

**Avant :**
```typescript
{loading && <div className="animate-spin">⏳</div>}
```

**Après :**
```typescript
import LoadingSpinner from '@/components/LoadingSpinner';

{loading && <LoadingSpinner size="lg" text="Chargement des produits..." />}
```

**Options disponibles :**
- `variant`: "spinner" | "dots" | "pulse"
- `size`: "sm" | "md" | "lg" | "xl"
- `text`: string (optionnel)
- `fullScreen`: boolean (pour un spinner plein écran)

---

### 3. EmptyState

Remplacez vos messages "pas de résultats" par ce composant.

**Avant :**
```typescript
{products.length === 0 && (
  <div>
    <p>Aucun produit trouvé</p>
  </div>
)}
```

**Après :**
```typescript
import EmptyState from '@/components/EmptyState';
import { PackageSearch } from 'lucide-react';

{products.length === 0 && (
  <EmptyState
    icon={PackageSearch}
    title="Aucun produit trouvé"
    description="Essayez de modifier vos filtres."
    action={{
      label: "Réinitialiser",
      onClick: resetFilters
    }}
  />
)}
```

---

### 4. Hook useToast

Remplacez les appels directs à `sonner` par le hook personnalisé.

**Avant :**
```typescript
import { toast } from 'sonner';

toast.success("Produit ajouté !");
toast.error("Échec");
```

**Après :**
```typescript
import { useToast } from '@/hooks/useToast';

const MyComponent = () => {
  const toast = useToast();
  
  // Messages simples
  toast.success("Produit ajouté !");
  toast.error("Échec");
  toast.warning("Attention");
  toast.info("Information");
  
  // Avec action
  toast.error("Échec de l'enregistrement", {
    action: {
      label: "Réessayer",
      onClick: () => retry()
    }
  });
  
  // Promise-based (automatique)
  toast.promise(saveProduct(data), {
    loading: "Enregistrement...",
    success: "Produit enregistré !",
    error: "Échec"
  });
  
  // Confirmation
  toast.confirm(
    "Supprimer ce produit ?",
    () => deleteProduct(id)
  );
  
  // API Error
  try {
    await supabase...
  } catch (error) {
    toast.apiError(error);
  }
};
```

**Bénéfices :**
- Icônes intégrées automatiquement
- Durées optimisées par type
- Parsing intelligent des erreurs API

---

## 🔧 Modifications Optionnelles

### 1. Utiliser les Nouveaux Types

**Recommandé :**
```typescript
import { 
  Product, 
  ProductFormData,
  Brand,
  BrandFormData,
  UtilityCategory,
  UtilityCategoryFormData,
  ApiError,
  SortOption
} from '@/types';
```

Supprimez toutes les définitions de types locales et utilisez les types centralisés.

---

### 2. Gestion d'Erreurs Améliorée

**Avant :**
```typescript
const fetchData = async () => {
  const { data, error } = await supabase...;
  if (error) {
    console.error(error);
    toast.error("Erreur");
  }
};
```

**Après :**
```typescript
import { useToast } from '@/hooks/useToast';

const fetchData = async () => {
  const toast = useToast();
  
  try {
    const { data, error } = await supabase...;
    if (error) throw error;
    return data;
  } catch (error) {
    toast.apiError(error, "Impossible de charger les données");
    throw error; // Re-throw pour permettre au caller de gérer
  }
};
```

---

## 📊 Checklist de Migration

### Étape 1 : Variables d'Environnement (5 min)
- [ ] Créer le fichier `.env`
- [ ] Copier les valeurs depuis `.env.example`
- [ ] Remplir avec vos vraies clés Supabase
- [ ] Vérifier que `.env` est dans `.gitignore`
- [ ] Redémarrer le serveur de développement

### Étape 2 : Mise à Jour des Imports (10 min)
- [ ] Remplacer les imports de types locaux par `@/types`
- [ ] Importer `useToast` au lieu de `toast` direct
- [ ] Importer les nouveaux composants (`LoadingSpinner`, `EmptyState`)

### Étape 3 : Gestion d'Erreurs (15 min)
- [ ] Ajouter `error` dans les destructurations des contexts
- [ ] Remplacer les `toast.error` simples par `toast.apiError` pour les erreurs API
- [ ] Ajouter des try-catch dans les fonctions async

### Étape 4 : Composants UI (10 min)
- [ ] Remplacer les spinners custom par `<LoadingSpinner />`
- [ ] Remplacer les messages "vide" par `<EmptyState />`
- [ ] Tester l'affichage

### Étape 5 : Tests (15 min)
- [ ] Tester la connexion Supabase
- [ ] Tester le CRUD des produits
- [ ] Tester l'upload d'images
- [ ] Tester les filtres et recherche
- [ ] Tester l'authentification admin

---

## 🆘 Problèmes Courants

### "Cannot find module '@/types'"

**Solution :**
```bash
# Redémarrer le serveur
pnpm dev
```

### "Missing Supabase environment variables"

**Solution :**
- Vérifiez que le fichier `.env` existe
- Vérifiez que les variables commencent par `VITE_`
- Redémarrez le serveur

### Les images ne s'affichent plus

**Solution :**
- Vérifiez les URLs dans Supabase Storage
- Vérifiez que le bucket est public
- Vérifiez les permissions RLS (si activé)

### Erreurs TypeScript après migration

**Solution :**
```bash
# Nettoyer le cache TypeScript
rm -rf node_modules/.vite
pnpm dev
```

---

## 🎯 Recommandations Post-Migration

### 1. Activer Row Level Security (RLS)

**Important pour la sécurité en production !**

```sql
-- Dans Supabase SQL Editor
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE utility_categories ENABLE ROW LEVEL SECURITY;

-- Lecture publique
CREATE POLICY "Public read" ON products
FOR SELECT TO authenticated, anon
USING (true);

-- Écriture admin uniquement
CREATE POLICY "Admin write" ON products
FOR ALL TO authenticated
USING (auth.jwt()->>'role' = 'admin');
```

### 2. Optimiser les Images

Configurez des transformations automatiques dans Supabase :

```typescript
const { data } = supabase.storage
  .from('product-images')
  .getPublicUrl(fileName, {
    transform: {
      width: 800,
      quality: 80,
      format: 'webp'
    }
  });
```

### 3. Ajouter des Tests

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
```

### 4. Configurer le Monitoring

Intégrez Sentry pour tracker les erreurs en production :

```bash
pnpm add @sentry/react
```

---

## 📚 Ressources Complémentaires

- **IMPROVEMENTS.md** - Liste détaillée de toutes les améliorations
- **README.md** - Documentation complète du projet
- **Types TypeScript** - Voir `src/types/index.ts` (commenté en JSDoc)

---

## 💬 Support

Si vous rencontrez des problèmes lors de la migration :

1. Consultez la section "Problèmes Courants" ci-dessus
2. Vérifiez les logs de la console navigateur
3. Vérifiez les logs du terminal
4. Consultez la documentation Supabase

---

## ✅ Validation de la Migration

Après avoir suivi ce guide, vous devriez avoir :

- ✅ Un fichier `.env` configuré
- ✅ L'application qui démarre sans erreurs
- ✅ Toutes les fonctionnalités qui marchent comme avant
- ✅ De nouveaux composants disponibles (LoadingSpinner, EmptyState, etc.)
- ✅ Une meilleure gestion d'erreurs
- ✅ Des types TypeScript stricts

**Temps estimé de migration : 1 heure**

---

**Bonne migration ! 🚀**