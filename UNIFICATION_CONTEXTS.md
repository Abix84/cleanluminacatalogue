# 🔄 Unification des Contexts - Mode Offline/Online

## 📋 Résumé des Changements

Les contexts ont été unifiés pour supporter à la fois le mode **offline** (localStorage) et le mode **online** (Supabase) de manière cohérente.

---

## ✅ Problème Résolu

### Avant
- ❌ `ProductContext` utilisait uniquement localStorage
- ❌ `BrandContext` utilisait uniquement Supabase
- ❌ `UtilityCategoryContext` utilisait uniquement Supabase
- ❌ Incohérence entre les modes de stockage

### Après
- ✅ `ProductContextUnified` supporte offline/online
- ✅ `BrandContextUnified` supporte offline/online
- ✅ `UtilityCategoryContextUnified` supporte offline/online
- ✅ Cohérence totale entre tous les contexts

---

## 📁 Fichiers Créés

### 1. `src/context/ProductContextUnified.tsx`
- Support offline : localStorage
- Support online : Supabase
- Gestion des images (Base64 en offline, Storage en online)
- Conversion automatique entre formats DB (snake_case) et frontend (camelCase)

### 2. `src/context/BrandContextUnified.tsx`
- Support offline : localStorage
- Support online : Supabase
- CRUD complet pour les marques

### 3. `src/context/UtilityCategoryContextUnified.tsx`
- Support offline : localStorage
- Support online : Supabase
- CRUD complet pour les catégories d'utilité
- Gestion des couleurs

---

## 🔧 Fichiers Modifiés

### 1. `src/App.tsx`
```typescript
// Avant
import { ProductProvider } from "./context/ProductContext";
import { UtilityCategoryProvider } from "./context/UtilityCategoryContext";
import { BrandProvider } from "./context/BrandContext";

// Après
import { ProductProvider } from "./context/ProductContextUnified";
import { UtilityCategoryProvider } from "./context/UtilityCategoryContextUnified";
import { BrandProvider } from "./context/BrandContextUnified";
```

### 2. `src/context/index.tsx`
- Exports mis à jour pour utiliser les nouveaux contexts unifiés
- Export des constantes de mode (`PRODUCT_MODE`, `BRAND_MODE`, `CATEGORY_MODE`)

### 3. Tous les composants utilisant les contexts
Les imports ont été mis à jour dans :
- `src/pages/Catalog.tsx`
- `src/pages/ProductDetail.tsx`
- `src/pages/admin/Dashboard.tsx`
- `src/pages/admin/AddProduct.tsx`
- `src/pages/admin/EditProduct.tsx`
- `src/components/ProductList.tsx`
- `src/components/ProductCard.tsx`
- `src/components/admin/ProductForm.tsx`
- `src/components/admin/DashboardStats.tsx`
- `src/components/admin/BrandManager.tsx`
- `src/components/admin/UtilityCategoryManager.tsx`
- `src/components/admin/management/BrandManagement.tsx`
- `src/components/admin/management/CategoryManagement.tsx`

---

## 🎯 Fonctionnement

### Détection du Mode

Le mode est détecté automatiquement via la variable d'environnement :

```typescript
const isOfflineMode = IS_OFFLINE_MODE; // depuis @/integrations/supabase/client
```

### Mode Offline

En mode offline (`VITE_OFFLINE_MODE=true`) :
- ✅ Utilisation de `localStorage` pour toutes les données
- ✅ Images stockées en Base64
- ✅ Pas de connexion internet requise
- ✅ Données persistantes dans le navigateur

### Mode Online

En mode online (`VITE_OFFLINE_MODE=false`) :
- ✅ Utilisation de Supabase pour toutes les données
- ✅ Images stockées dans Supabase Storage
- ✅ Synchronisation multi-appareils
- ✅ Authentification requise pour les modifications

---

## 📊 Architecture

### Pattern Unifié

Tous les contexts unifiés suivent le même pattern :

```typescript
// 1. Fonctions offline
const offlineAdd = async (data) => {
  // Utilise localStorage
};

const offlineUpdate = async (data) => {
  // Utilise localStorage
};

const offlineDelete = async (id) => {
  // Utilise localStorage
};

// 2. Fonctions online
const onlineAdd = async (data) => {
  // Utilise Supabase
};

const onlineUpdate = async (data) => {
  // Utilise Supabase
};

const onlineDelete = async (id) => {
  // Utilise Supabase
};

// 3. Provider avec sélection automatique
export const Provider = ({ children }) => {
  const fetchData = async () => {
    if (isOfflineMode) {
      // Utilise fonctions offline
    } else {
      // Utilise fonctions online
    }
  };

  const addData = async (data) => {
    if (isOfflineMode) {
      return await offlineAdd(data);
    } else {
      return await onlineAdd(data);
    }
  };

  // ... autres méthodes
};
```

---

## 🔄 Conversion de Données

### Supabase → Frontend

Les données provenant de Supabase (snake_case) sont converties en format frontend (camelCase) :

```typescript
// Exemple : Product
{
  id: data.id,
  name: data.name,
  description: data.description,
  price: data.price,
  image_url: data.image_url,
  utilityCategoryId: data.utility_category_id, // Conversion
  brandId: data.brand_id, // Conversion
}
```

### Frontend → Supabase

Les données du frontend sont converties en format Supabase avant envoi :

```typescript
// Exemple : Product
{
  name: productData.name,
  description: productData.description,
  price: productData.price,
  image_url: imageUrl,
  utility_category_id: productData.utilityCategoryId, // Conversion
  brand_id: productData.brandId, // Conversion
}
```

---

## 🚀 Utilisation

### Dans un Composant

```typescript
import { useProducts } from "@/context/ProductContextUnified";
import { useBrands } from "@/context/BrandContextUnified";
import { useUtilityCategories } from "@/context/UtilityCategoryContextUnified";

const MyComponent = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { brands, addBrand } = useBrands();
  const { utilityCategories, addUtilityCategory } = useUtilityCategories();

  // Utilisation identique en mode offline ou online
  // Le context gère automatiquement la source de données
};
```

### Vérification du Mode

```typescript
import { PRODUCT_MODE, BRAND_MODE, CATEGORY_MODE } from "@/context";

console.log(PRODUCT_MODE); // "offline" ou "online"
console.log(BRAND_MODE); // "offline" ou "online"
console.log(CATEGORY_MODE); // "offline" ou "online"
```

---

## ✅ Avantages

1. **Cohérence** : Tous les contexts utilisent le même mode
2. **Flexibilité** : Passage facile entre offline/online
3. **Maintenabilité** : Code unifié et plus facile à maintenir
4. **Testabilité** : Facile à tester en mode offline
5. **Performance** : Pas de dépendances inutiles en mode offline

---

## 🔍 Tests

### Mode Offline

1. Définir `VITE_OFFLINE_MODE=true` dans `.env`
2. Démarrer l'application : `pnpm dev`
3. Vérifier que les données sont stockées dans localStorage
4. Tester les opérations CRUD

### Mode Online

1. Définir `VITE_OFFLINE_MODE=false` dans `.env`
2. Configurer les variables Supabase : `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY`
3. Démarrer l'application : `pnpm dev`
4. Vérifier que les données sont stockées dans Supabase
5. Tester les opérations CRUD

---

## 📝 Notes Importantes

1. **Les anciens contexts ne sont pas supprimés** : Ils sont conservés pour référence, mais ne sont plus utilisés
2. **Migration automatique** : Pas besoin de migration de données, le système détecte automatiquement le mode
3. **Compatibilité** : Tous les composants existants fonctionnent sans modification (seuls les imports ont changé)

---

## 🐛 Dépannage

### Erreur "Supabase not initialized"

**Cause** : Tentative d'utiliser Supabase en mode offline

**Solution** : Vérifier que `VITE_OFFLINE_MODE=true` est défini dans `.env`

### Données manquantes

**Cause** : Changement de mode sans migration des données

**Solution** : 
- En mode offline : Les données sont dans localStorage
- En mode online : Les données sont dans Supabase
- Pour migrer : Utiliser la fonction d'export/import

---

## 📚 Références

- [Documentation Supabase](https://supabase.com/docs)
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [React Context API](https://react.dev/reference/react/useContext)

---

**Date de modification** : 2025-01-XX
**Version** : 1.0.0

