import { useMemo } from "react";
import { useProducts } from "@/context/ProductContext";
import { useUtilityCategories } from "@/context/UtilityCategoryContext";
import { useBrands } from "@/context/BrandContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Tag,
  Layers,
  Image as ImageIcon,
  Award,
  ShoppingCart,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

/**
 * Composant de statistiques avancées pour le dashboard admin
 */
export const AdvancedStats = () => {
  const { products } = useProducts();
  const { utilityCategories } = useUtilityCategories();
  const { brands } = useBrands();

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const productsWithImages = products.filter((p) => p.image_url).length;
    const productsWithoutImages = totalProducts - productsWithImages;

    // Calcul du prix moyen
    const averagePrice =
      totalProducts > 0
        ? products.reduce((sum, p) => sum + p.price, 0) / totalProducts
        : 0;

    // Prix min/max
    const prices = products.map((p) => p.price).filter((p) => p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    // Total valeur du catalogue
    const totalValue = products.reduce((sum, p) => sum + p.price, 0);

    // Catégories les plus utilisées
    const categoryCounts = utilityCategories.map((category) => ({
      category,
      count: products.filter((p) => p.utilityCategoryId === category.id).length,
    }));
    const topCategories = categoryCounts
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Marques les plus utilisées
    const brandCounts = brands.map((brand) => ({
      brand,
      count: products.filter((p) => p.brandId === brand.id).length,
    }));
    const topBrands = brandCounts
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Pourcentage de produits avec images
    const imageCoverage =
      totalProducts > 0
        ? Math.round((productsWithImages / totalProducts) * 100)
        : 0;

    // Pourcentage de produits avec catégorie
    const categorizedProducts = products.filter((p) => p.utilityCategoryId);
    const categoryCoverage =
      totalProducts > 0
        ? Math.round((categorizedProducts.length / totalProducts) * 100)
        : 0;

    // Pourcentage de produits avec marque
    const brandedProducts = products.filter((p) => p.brandId);
    const brandCoverage =
      totalProducts > 0
        ? Math.round((brandedProducts.length / totalProducts) * 100)
        : 0;

    return {
      totalProducts,
      productsWithImages,
      productsWithoutImages,
      averagePrice,
      minPrice,
      maxPrice,
      totalValue,
      topCategories,
      topBrands,
      imageCoverage,
      categoryCoverage,
      brandCoverage,
    };
  }, [products, utilityCategories, brands]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Produits */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Produits</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProducts}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.imageCoverage}% avec images
          </p>
        </CardContent>
      </Card>

      {/* Valeur Totale */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valeur Totale</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPrice(stats.totalValue)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Prix moyen: {formatPrice(stats.averagePrice)}
          </p>
        </CardContent>
      </Card>

      {/* Prix Range */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fourchette Prix</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">
            {formatPrice(stats.minPrice)} - {formatPrice(stats.maxPrice)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Min / Max
          </p>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Images</CardTitle>
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.productsWithImages}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.productsWithoutImages} sans image
          </p>
        </CardContent>
      </Card>

      {/* Top Catégories */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Top Catégories ({stats.categoryCoverage}% du catalogue)
          </CardTitle>
          <CardDescription>
            Catégories les plus utilisées
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.topCategories.length > 0 ? (
            <div className="space-y-2">
              {stats.topCategories.map(({ category, count }) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-2 rounded-lg border"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <Badge variant="secondary">
                    {count} produit{count > 1 ? "s" : ""}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aucune catégorie utilisée
            </p>
          )}
        </CardContent>
      </Card>

      {/* Top Marques */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Top Marques ({stats.brandCoverage}% du catalogue)
          </CardTitle>
          <CardDescription>
            Marques les plus représentées
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.topBrands.length > 0 ? (
            <div className="space-y-2">
              {stats.topBrands.map(({ brand, count }) => (
                <div
                  key={brand.id}
                  className="flex items-center justify-between p-2 rounded-lg border"
                >
                  <span className="font-medium">{brand.name}</span>
                  <Badge variant="secondary">
                    {count} produit{count > 1 ? "s" : ""}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aucune marque utilisée
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

