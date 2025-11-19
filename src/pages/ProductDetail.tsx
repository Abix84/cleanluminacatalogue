import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Product } from "@/types";
import { ProductDetailSkeleton } from "@/components/ProductSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useProducts } from "@/context/ProductContextUnified";
import { useUtilityCategories } from "@/context/UtilityCategoryContextUnified";
import { useBrands } from "@/context/BrandContextUnified";
import { formatPrice } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getProductById } = useProducts();
  const { getUtilityCategoryById } = useUtilityCategories();
  const { getBrandById } = useBrands();
  const { isAdmin } = useAuth();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const category = product?.utilityCategoryId ? getUtilityCategoryById(product.utilityCategoryId) : null;
  const brand = product?.brandId ? getBrandById(product.brandId) : null;

  // Déterminer l'URL de retour selon l'entreprise du produit
  const getBackUrl = () => {
    if (!product?.company) return "/";
    if (product.company === "Lumina Distribution") {
      return "/catalogue/lumina-distribution";
    }
    if (product.company === "CleanExpress") {
      return "/catalogue/cleanexpress";
    }
    return "/";
  };

  const handleImageClick = () => {
    if (product?.image_url) {
      setIsModalOpen(true);
    }
  };

  if (loading || product === undefined) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-2xl font-bold">Produit non trouvé</h2>
        <p className="mt-2 text-muted-foreground">Le produit que vous cherchez n'existe pas.</p>
        <Button asChild className="mt-6">
          <Link to={getBackUrl()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour au catalogue
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Button asChild variant="outline" size="sm">
            <Link to={getBackUrl()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au catalogue
            </Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <AspectRatio ratio={1 / 1} className="bg-card rounded-2xl border shadow-2xl shadow-black/5 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />
              <img
                src={product.image_url || "/placeholder.svg"}
                alt={product.name}
                className="rounded-lg object-contain w-full h-full transition-transform duration-300 hover:scale-105 cursor-pointer"
                onClick={handleImageClick}
                loading="lazy"
              />
            </AspectRatio>
          </div>
          <div className="flex flex-col space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {category && (
                  <Badge style={{ backgroundColor: category.color, color: '#fff' }}>
                    {category.name}
                  </Badge>
                )}
                {brand && (
                  <Badge variant="outline">{brand.name}</Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{product.name}</h1>
            </div>
            <p className="text-muted-foreground leading-relaxed text-base">
              {product.description || "Aucune description disponible."}
            </p>
            {isAdmin && (
              <div className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
                {formatPrice(product.price)}
              </div>
            )}
          </div>
        </div>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl p-0 bg-transparent border-0">
          <img src={product.image_url || ''} alt="Aperçu du produit" className="w-full h-auto rounded-lg" />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductDetail;