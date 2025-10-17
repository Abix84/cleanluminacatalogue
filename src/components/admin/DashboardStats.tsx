import { useProducts } from "@/context/ProductContext";
import { useCategories } from "@/context/CategoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Shapes, DollarSign } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const DashboardStats = () => {
  const { products } = useProducts();
  const { categories } = useCategories();

  const totalProducts = products.length;
  const totalCategories = categories.length;
  const averagePrice = totalProducts > 0
    ? products.reduce((sum, p) => sum + p.price, 0) / totalProducts
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
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
          <CardTitle className="text-sm font-medium">Total Catégories</CardTitle>
          <Shapes className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCategories}</div>
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