import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Product } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useProducts } from "@/context/ProductContext";
import { useCategories } from "@/context/CategoryContext";
import { formatPrice } from "@/lib/utils";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getProductById } = useProducts();
  const { getCategoryById } = useCategories();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (id) {
      const foundProduct = getProductById(id);
      setTimeout(() => {
        setProduct(foundProduct);
        setLoading(false);
      }, 300);
    } else {
      setLoading(false);
    }
  }, [id, getProductById]);

  const category = product?.categoryId ? getCategoryById(product.categoryId) : null;

  if (loading || product === undefined) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="grid md:grid-cols-2 gap-12">
          <Skeleton className="w-full h-auto aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-2xl font-bold">Produit non trouvé</h2>
        <p className="mt-2 text-muted-foreground">Le produit que vous cherchez n'existe pas.</p>
        <Button asChild className="mt-6">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour au catalogue
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
        <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
                <AspectRatio ratio={1 / 1} className="bg-white rounded-lg border shadow-lg">
                    <img
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        className="rounded-lg object-contain w-full h-full"
                    />
                </AspectRatio>
            </div>
            <div className="flex flex-col">
                {category && (
                    <Badge
                      className="w-fit mb-2"
                      style={{ backgroundColor: category.color, color: '#fff' }}
                    >
                      {category.name}
                    </Badge>
                )}
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{product.name}</h1>
                <div className="text-4xl font-extrabold my-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
                  {formatPrice(product.price)}
                </div>
                <p className="text-muted-foreground leading-relaxed text-base">
                    {product.description || "Aucune description disponible."}
                </p>
            </div>
        </div>
    </div>
  );
};

export default ProductDetail;