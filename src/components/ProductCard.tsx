import { Product } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "./ui/aspect-ratio";
import { Link } from "react-router-dom";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onImageClick: (imageUrl: string) => void;
}

const ProductCard = ({ product, onImageClick }: ProductCardProps) => {
  
  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.image_url) {
      onImageClick(product.image_url);
    }
  };

  return (
    <Link to={`/product/${product.id}`} className="flex flex-col h-full group">
      <Card className="flex flex-col h-full transition-all duration-200 group-hover:shadow-lg group-hover:-translate-y-1 overflow-hidden">
        <CardHeader className="p-0">
          <AspectRatio ratio={1 / 1} onClick={handleImageClick} className="cursor-pointer bg-white">
            <img
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              className="rounded-t-lg object-contain w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
          </AspectRatio>
        </CardHeader>
        <CardContent className="flex-grow p-4">
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