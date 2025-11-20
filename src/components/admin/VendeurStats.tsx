import { useProducts } from "@/context/ProductContext";
import { useBrands } from "@/context/BrandContext";
import { useUtilityCategories } from "@/context/UtilityCategoryContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, Tags, Layers, ImageIcon, TrendingUp, Eye } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const VendeurStats = () => {
  const { products } = useProducts();
  const { brands } = useBrands();
  const { utilityCategories } = useUtilityCategories();

  // Calculer les statistiques
  const stats = {
    totalProducts: products.length,
    productsWithImages: products.filter((p) => p.image_url).length,
    totalCategories: utilityCategories.length,
    totalBrands: brands.length,
    averagePrice: products.length > 0
      ? products.reduce((sum, p) => sum + Number(p.price), 0) / products.length
      : 0,
    minPrice: products.length > 0
      ? Math.min(...products.map((p) => Number(p.price)))
      : 0,
    maxPrice: products.length > 0
      ? Math.max(...products.map((p) => Number(p.price)))
      : 0,
  };

  // Produits les plus chers (top 5)
  const topProducts = [...products]
    .sort((a, b) => Number(b.price) - Number(a.price))
    .slice(0, 5);

  // Marques les plus représentées
  const brandCounts = products.reduce((acc, product) => {
    if (product.brandId) {
      acc[product.brandId] = (acc[product.brandId] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topBrands = Object.entries(brandCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Produits
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.productsWithImages} avec images
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Catégories</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              Catégories disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marques</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBrands}</div>
            <p className="text-xs text-muted-foreground">
              Marques disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prix moyen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(stats.averagePrice)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPrice(stats.minPrice)} - {formatPrice(stats.maxPrice)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Produits les plus chers et marques les plus représentées */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top produits */}
        <Card>
          <CardHeader>
            <CardTitle>Produits Premium</CardTitle>
            <CardDescription>
              Les 5 produits les plus chers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        {product.image_url && (
                          <p className="text-xs text-muted-foreground">
                            Avec image
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatPrice(product.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun produit disponible
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top marques */}
        <Card>
          <CardHeader>
            <CardTitle>Marques Populaires</CardTitle>
            <CardDescription>
              Les marques les plus représentées
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topBrands.length > 0 ? (
              <div className="space-y-3">
                {topBrands.map(([brandId, count], index) => {
                  // Trouver le nom de la marque
                  const brand = brands.find((b) => b.id === brandId);
                  return (
                    <div
                      key={brandId}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {brand?.name || "Marque inconnue"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {count} produit{count > 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune marque disponible
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendeurStats;

