import { useMemo } from "react";
import { useProducts } from "@/context/ProductContextUnified";
import { useUtilityCategories } from "@/context/UtilityCategoryContextUnified";
import { useBrands } from "@/context/BrandContextUnified";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { formatPrice } from "@/lib/utils";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#0088fe",
  "#00c49f",
  "#ffbb28",
  "#ff8042",
];

/**
 * Composant de graphiques pour le dashboard admin
 */
export const DashboardCharts = () => {
  const { products } = useProducts();
  const { utilityCategories } = useUtilityCategories();
  const { brands } = useBrands();

  // Données pour le graphique par catégorie
  const categoryData = useMemo(() => {
    return utilityCategories
      .map((category) => {
        const count = products.filter(
          (p) => p.utilityCategoryId === category.id
        ).length;
        return {
          name: category.name,
          count,
          color: category.color,
        };
      })
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6); // Top 6 catégories
  }, [products, utilityCategories]);

  // Données pour le graphique par marque
  const brandData = useMemo(() => {
    return brands
      .map((brand) => {
        const count = products.filter((p) => p.brandId === brand.id).length;
        return {
          name: brand.name,
          count,
        };
      })
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6); // Top 6 marques
  }, [products, brands]);

  // Distribution des prix (fourchettes)
  const priceDistribution = useMemo(() => {
    const ranges = [
      { name: "0-50€", min: 0, max: 50 },
      { name: "50-100€", min: 50, max: 100 },
      { name: "100-200€", min: 100, max: 200 },
      { name: "200-500€", min: 200, max: 500 },
      { name: "500€+", min: 500, max: Infinity },
    ];

    return ranges.map((range) => {
      const count = products.filter(
        (p) => p.price >= range.min && p.price < range.max
      ).length;
      return {
        name: range.name,
        count,
        totalValue: products
          .filter((p) => p.price >= range.min && p.price < range.max)
          .reduce((sum, p) => sum + p.price, 0),
      };
    });
  }, [products]);

  // Top produits par valeur
  const topProductsByValue = useMemo(() => {
    return [...products]
      .sort((a, b) => b.price - a.price)
      .slice(0, 5)
      .map((product) => ({
        name: product.name.length > 20 
          ? product.name.substring(0, 20) + "..." 
          : product.name,
        price: product.price,
        fullName: product.name,
      }));
  }, [products]);

  // Statistiques avec images
  const imageStats = useMemo(() => {
    const withImages = products.filter((p) => p.image_url).length;
    const withoutImages = products.length - withImages;
    return [
      { name: "Avec images", value: withImages },
      { name: "Sans images", value: withoutImages },
    ];
  }, [products]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Graphique par catégorie - Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Produits par Catégorie</CardTitle>
          <CardDescription>
            Répartition des produits dans les différentes catégories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Nombre de produits" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Graphique par marque - Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Produits par Marque</CardTitle>
          <CardDescription>
            Répartition des produits par marque
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={brandData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" name="Nombre de produits" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribution des prix - Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution des Prix</CardTitle>
          <CardDescription>
            Nombre de produits par fourchette de prix
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priceDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === "count") return value;
                  return formatPrice(value as number);
                }}
                labelFormatter={(label) => `Fourchette: ${label}`}
              />
              <Legend />
              <Bar dataKey="count" fill="#ffc658" name="Nombre de produits" />
              <Bar dataKey="totalValue" fill="#ff7300" name="Valeur totale" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top produits par valeur - Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Produits par Prix</CardTitle>
          <CardDescription>
            Les 5 produits les plus chers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={topProductsByValue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={10}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => formatPrice(value)}
                labelFormatter={(label) => {
                  const product = topProductsByValue.find(p => p.name === label);
                  return product?.fullName || label;
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Prix"
                dot={{ fill: "#8884d8", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Statistiques images - Pie Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Statistiques des Images</CardTitle>
          <CardDescription>
            Proportion des produits avec et sans images
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={imageStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => 
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {imageStats.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === 0 ? "#82ca9d" : "#ffc658"} 
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

