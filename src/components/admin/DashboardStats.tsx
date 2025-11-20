import { useProducts } from "@/context/ProductContext";
import { useUtilityCategories } from "@/context/UtilityCategoryContext";
import { useBrands } from "@/context/BrandContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Shapes, DollarSign, Tag } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const DashboardStats = () => {
  const { products } = useProducts();
  const { utilityCategories } = useUtilityCategories();
  const { brands } = useBrands();

  const totalProducts = products.length;
  const totalCategories = utilityCategories.length;
  const totalBrands = brands.length;
  const averagePrice = totalProducts > 0
    ? products.reduce((sum, p) => sum + p.price, 0) / totalProducts
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Produits</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProducts}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Catégories d'Utilité</CardTitle>
          <Shapes className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCategories}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Marques</CardTitle>
          <Tag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalBrands}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Prix Moyen</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPrice(averagePrice)}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;