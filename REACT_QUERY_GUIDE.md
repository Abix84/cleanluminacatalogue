# 🔄 Guide d'Utilisation de React Query

## 📚 Vue d'Ensemble

Des hooks React Query ont été créés pour remplacer progressivement les Contexts existants. Ces hooks offrent :

- ✅ **Cache automatique** - Données mises en cache automatiquement
- ✅ **Pagination côté serveur** - Réduction de la mémoire utilisée
- ✅ **Revalidation intelligente** - Mise à jour automatique des données
- ✅ **Dedupe des requêtes** - Pas de requêtes dupliquées
- ✅ **Optimistic updates** - Mises à jour optimistes pour une meilleure UX

## 🎯 Hooks Disponibles

### Produits

#### `useProductsQuery` - Pagination côté serveur
```typescript
import { useProductsQuery } from "@/hooks/useProductsQuery";

const { data, isLoading, error } = useProductsQuery({
  page: 1,
  pageSize: 20,
  search: "lessive",
  categoryId: "cat-123",
  brandId: "brand-456",
  company: "CleanExpress"
});

// data contient: { data: Product[], total: number, page: number, pageSize: number, totalPages: number }
```

#### `useAllProductsQuery` - Tous les produits (sans pagination)
```typescript
import { useAllProductsQuery } from "@/hooks/useProductsQuery";

const { data, isLoading, error } = useAllProductsQuery({
  search: "lessive",
  categoryId: "cat-123",
  company: "CleanExpress"
});

// data contient: Product[]
```

#### `useProductQuery` - Un produit par ID
```typescript
import { useProductQuery } from "@/hooks/useProductsQuery";

const { data: product, isLoading, error } = useProductQuery(productId);
```

#### Mutations
```typescript
import { 
  useAddProductMutation, 
  useUpdateProductMutation, 
  useDeleteProductMutation 
} from "@/hooks/useProductsQuery";

// Ajouter
const addMutation = useAddProductMutation();
await addMutation.mutateAsync({
  name: "Produit test",
  price: 10.99,
  // ...
});

// Mettre à jour
const updateMutation = useUpdateProductMutation();
await updateMutation.mutateAsync({
  product: updatedProduct,
  imageFile: file
});

// Supprimer
const deleteMutation = useDeleteProductMutation();
await deleteMutation.mutateAsync({
  productId: "prod-123",
  imageUrl: "https://..."
});
```

### Catégories

```typescript
import { 
  useCategoriesQuery,
  useCategoryQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation
} from "@/hooks/useCategoriesQuery";

// Récupérer toutes les catégories
const { data: categories, isLoading } = useCategoriesQuery();

// Récupérer une catégorie par ID
const { data: category } = useCategoryQuery(categoryId);

// Mutations
const addMutation = useAddCategoryMutation();
const updateMutation = useUpdateCategoryMutation();
const deleteMutation = useDeleteCategoryMutation();
```

### Marques

```typescript
import { 
  useBrandsQuery,
  useBrandQuery,
  useAddBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation
} from "@/hooks/useBrandsQuery";

// Récupérer toutes les marques
const { data: brands, isLoading } = useBrandsQuery();

// Récupérer une marque par ID
const { data: brand } = useBrandQuery(brandId);

// Mutations
const addMutation = useAddBrandMutation();
const updateMutation = useUpdateBrandMutation();
const deleteMutation = useDeleteBrandMutation();
```

## 🔄 Migration Progressive

### Option 1 : Utiliser les Hooks React Query (Recommandé)

Les hooks peuvent être utilisés directement dans vos composants :

```typescript
// Dans un composant
import { useProductsQuery } from "@/hooks/useProductsQuery";

function MyComponent() {
  const { data, isLoading } = useProductsQuery({
    page: 1,
    pageSize: 20
  });

  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div>
      {data?.data.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Option 2 : Garder les Contexts (Temporaire)

Les Contexts existants continuent de fonctionner. Vous pouvez migrer progressivement.

## 📊 Avantages de React Query

### 1. Cache Automatique
- Les données sont mises en cache automatiquement
- Pas besoin de gérer manuellement le cache
- Revalidation automatique après les mutations

### 2. Pagination Côté Serveur
- Réduction de la mémoire utilisée (~80%)
- Meilleures performances pour grandes listes
- Chargement plus rapide

### 3. Optimistic Updates
```typescript
const updateMutation = useUpdateProductMutation();

updateMutation.mutate(
  { product: updatedProduct },
  {
    onMutate: async (newProduct) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: productKeys.all });
      const previousProducts = queryClient.getQueryData(productKeys.list());
      queryClient.setQueryData(productKeys.list(), (old: any) => {
        // Mettre à jour optimistiquement
        return { ...old, data: old.data.map(p => p.id === newProduct.id ? newProduct : p) };
      });
      return { previousProducts };
    },
    onError: (err, newProduct, context) => {
      // Rollback en cas d'erreur
      queryClient.setQueryData(productKeys.list(), context.previousProducts);
    },
    onSettled: () => {
      // Revalidation
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  }
);
```

### 4. Dedupe des Requêtes
- Si plusieurs composants utilisent la même query, une seule requête est faite
- Les résultats sont partagés entre les composants

## 🎯 Exemple Complet : ProductList avec Pagination Serveur

```typescript
import { useState } from "react";
import { useProductsQuery } from "@/hooks/useProductsQuery";
import { ProductSkeleton } from "./ProductSkeleton";
import { Pagination } from "./ui/pagination";

function ProductListPaginated() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const pageSize = 20;

  const { data, isLoading, error } = useProductsQuery({
    page,
    pageSize,
    search,
  });

  if (isLoading) return <ProductSkeleton count={pageSize} />;
  if (error) return <div>Erreur: {error.message}</div>;

  return (
    <div>
      {/* Liste des produits */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {data?.data.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <Pagination>
          <PaginationPrevious 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          />
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(p => (
            <PaginationLink
              key={p}
              onClick={() => setPage(p)}
              isActive={p === page}
            >
              {p}
            </PaginationLink>
          ))}
          <PaginationNext
            onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
          />
        </Pagination>
      )}

      {/* Info */}
      <div className="text-sm text-muted-foreground mt-4">
        Affichage de {(page - 1) * pageSize + 1} à {Math.min(page * pageSize, data?.total || 0)} sur {data?.total || 0} produits
      </div>
    </div>
  );
}
```

## 🔧 Configuration React Query

La configuration est déjà faite dans `App.tsx` :

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

## 🚀 Prochaines Étapes

1. **Migrer progressivement** - Utiliser les hooks React Query dans les nouveaux composants
2. **Remplacer les Contexts** - Migrer les composants existants progressivement
3. **Ajouter Real-time** - Utiliser Supabase Real-time avec React Query
4. **Optimiser les requêtes** - Utiliser les vues SQL pour les requêtes complexes

## 📝 Notes

- Les hooks supportent le mode offline (localStorage) et online (Supabase)
- Le cache est partagé entre tous les composants utilisant React Query
- Les mutations invalident automatiquement les queries concernées
- Le dedupe des requêtes réduit le nombre de requêtes réseau

---

**Date de création:** 2025-01-27  
**Version:** 1.0.0

