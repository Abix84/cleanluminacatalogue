import { Product } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { AspectRatio } from "./ui/aspect-ratio";
import { Link } from "react-router-dom";
import { formatPrice } from "@/lib/utils";
import { useCategories } from "@/context/CategoryContext";
import { Badge } from "./ui/badge";

interface ProductCardProps {
  product: Product;
  onImageClick: (imageUrl: string) => void;
}

const ProductCard = ({ product, onImageClick }: ProductCardProps) => {
  const { getCategoryById } = useCategories();
  const category = product.categoryId ? getCategoryById(product.categoryId) : null;

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.image_url) {
      onImageClick(product.image_url);
    }
  };

  return (
    <Link to={`/product/${product.id}`} className="flex flex-col h-full group">
      <Card className="flex flex-col h-full transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:-translate-y-2 overflow-hidden">
        <CardHeader className="p-0 relative">
          <AspectRatio ratio={1 / 1} onClick={handleImageClick} className="cursor-pointer bg-white">
            <img
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              className="rounded-t-lg object-contain w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
          </AspectRatio>
          {category && (
            <Badge
              className="absolute top-3 right-3"
              style={{ backgroundColor: category.color, color: '#fff' }}
            >
              {category.name}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="flex-grow p-4">
          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description || "Aucune description disponible."}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
            {formatPrice(product.price)}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProductCard;