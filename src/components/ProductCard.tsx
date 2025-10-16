import { Product } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "./ui/aspect-ratio";
import { Link } from "react-router-dom";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link to={`/product/${product.id}`} className="flex flex-col h-full group">
      <Card className="flex flex-col h-full transition-all duration-200 group-hover:shadow-lg group-hover:-translate-y-1">
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
          <CardTitle className="text-lg font-semibold mb-2 group-hover:text-primary">{product.name}</CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {product.description || "Aucune description disponible."}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between items-center p-4 pt-0">
          <p className="text-lg font-bold text-primary">{formatPrice(product.price)}</p>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProductCard;