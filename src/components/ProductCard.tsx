import { Product } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { AspectRatio } from "./ui/aspect-ratio";
import { Link } from "react-router-dom";
import { formatPrice } from "@/lib/utils";
import { useUtilityCategories } from "@/context/UtilityCategoryContext";
import { useBrands } from "@/context/BrandContext";
import { Badge } from "./ui/badge";

interface ProductCardProps {
  product: Product;
  onImageClick: (imageUrl: string) => void;
}

const ProductCard = ({ product, onImageClick }: ProductCardProps) => {
  const { getUtilityCategoryById } = useUtilityCategories();
  const { getBrandById } = useBrands();
  const category = product.utilityCategoryId ? getUtilityCategoryById(product.utilityCategoryId) : null;
  const brand = product.brandId ? getBrandById(product.brandId) : null;

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
          {brand && <p className="text-xs text-muted-foreground mb-1">{brand.name}</p>}
          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
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