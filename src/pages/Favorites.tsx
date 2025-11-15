import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useFavorites } from "@/hooks/useFavorites";
import { useProducts } from "@/context/ProductContextUnified";
import { useUtilityCategories } from "@/context/UtilityCategoryContextUnified";
import { useBrands } from "@/context/BrandContextUnified";
import ProductList from "@/components/ProductList";
import { ProductSkeleton } from "@/components/ProductSkeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, HeartOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Favorites = () => {
  const { favorites, isLoading: favoritesLoading, toggleFavorite } = useFavorites();
  const { products: allProducts } = useProducts();
  const { utilityCategories } = useUtilityCategories();
  const { brands } = useBrands();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

  // Récupérer les produits favoris
  const favoriteProducts = useMemo(() => {
    return allProducts.filter((product) => favorites.includes(product.id));
  }, [allProducts, favorites]);

  // Filtrer les produits favoris par recherche
  const filteredFavorites = useMemo(() => {
    if (!debouncedSearchQuery) return favoriteProducts;

    const query = debouncedSearchQuery.toLowerCase();
    return favoriteProducts.filter((product) =>
      product.name.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      brands.find((b) => b.id === product.brandId)?.name.toLowerCase().includes(query) ||
      utilityCategories.find((c) => c.id === product.utilityCategoryId)?.name.toLowerCase().includes(query)
    );
  }, [favoriteProducts, debouncedSearchQuery, brands, utilityCategories]);

  const handleRemoveAll = () => {
    if (favoriteProducts.length === 0) return;

    const count = favoriteProducts.length;
    favoriteProducts.forEach((product) => {
      toggleFavorite(product.id);
    });

    toast.success("Favoris retirés", {
      description: `${count} produit${count > 1 ? "s" : ""} retiré${count > 1 ? "s" : ""} des favoris`,
      duration: 3000,
    });
  };

  if (favoritesLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <ProductSkeleton count={8} />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2 sm:gap-3 flex-wrap">
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 fill-red-500 flex-shrink-0" />
                <span className="break-words">Mes Favoris</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {favoriteProducts.length} produit{favoriteProducts.length > 1 ? "s" : ""} en favoris
              </p>
            </div>

            {favoriteProducts.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveAll}
                className="gap-2 text-destructive hover:text-destructive w-full sm:w-auto flex-shrink-0"
              >
                <Trash2 className="h-4 w-4" />
                <span className="whitespace-nowrap">Retirer tout</span>
              </Button>
            )}
          </div>

          {/* Search Bar */}
          {favoriteProducts.length > 0 && (
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher dans mes favoris..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </motion.div>

        {/* Content */}
        {favoriteProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-12"
          >
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                  <HeartOff className="h-12 w-12 text-muted-foreground" />
                </div>
                <CardTitle className="text-2xl mb-2">Aucun favori</CardTitle>
                <CardDescription className="text-center max-w-md">
                  Vous n'avez pas encore de produits en favoris. Parcourez le catalogue et ajoutez vos produits préférés en cliquant sur l'icône cœur.
                </CardDescription>
                <Button asChild className="mt-6">
                  <a href="/">Parcourir le catalogue</a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : filteredFavorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12"
          >
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Search className="h-16 w-16 text-muted-foreground mb-4" />
                <CardTitle className="text-xl mb-2">Aucun résultat</CardTitle>
                <CardDescription>
                  Aucun favori ne correspond à votre recherche "{debouncedSearchQuery}"
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ProductList
              products={filteredFavorites}
              searchQuery={debouncedSearchQuery}
              hideFilters={true}
            />
          </motion.div>
        )}
    </div>
  );
};

export default Favorites;

