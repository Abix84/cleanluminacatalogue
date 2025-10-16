import { Product } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "./ui/aspect-ratio";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="p-4">
        <AspectRatio ratio={4 / 3}>
          <img
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            className="rounded-md object-cover w-full h-full"
          />
        </AspectRatio>
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-0">
        <CardTitle className="text-lg font-semibold mb-2">{product.name}</CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {product.description || "Aucune description disponible."}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 pt-0">
        <p className="text-lg font-bold text-primary">{formatPrice(product.price)}</p>
        <Badge variant={product.quantity > 0 ? "default" : "destructive"}>
          {product.quantity > 0 ? `En stock: ${product.quantity}` : "Rupture"}
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;