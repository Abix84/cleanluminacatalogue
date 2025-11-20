import { useState, memo, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Product } from "@/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "./ui/aspect-ratio";
import { Link } from "react-router-dom";
import { formatPrice } from "@/lib/utils";
import { useUtilityCategories } from "@/context/UtilityCategoryContextUnified";
import { useBrands } from "@/context/BrandContextUnified";
import {
  Eye,
  ShoppingCart,
  Sparkles,
  CheckCircle,
  ExternalLink,
  ImageIcon,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/context/AuthContext";

interface ProductCardProps {
  product: Product;
  onImageClick: (imageUrl: string) => void;
  isNew?: boolean;
  isFeatured?: boolean;
  index?: number;
}

const ProductCard = memo(({
  product,
  onImageClick,
  isNew = false,
  isFeatured = false,
  index = 0,
}: ProductCardProps) => {
  const { getUtilityCategoryById } = useUtilityCategories();
  const { getBrandById } = useBrands();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAdmin } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const isProductFavorite = isFavorite(product.id);

  // Calcul direct - pas besoin de useMemo car le calcul est rapide
  const category = product.utilityCategoryId
    ? getUtilityCategoryById(product.utilityCategoryId)
    : null;
  const brand = product.brandId ? getBrandById(product.brandId) : null;

  const handleImageClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (product.image_url) {
        onImageClick(product.image_url);
      }
    },
    [product.image_url, onImageClick]
  );

  const handleQuickView = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  }, []);

  const handleFavoriteToggle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleFavorite(product.id);
    },
    [product.id, toggleFavorite]
  );

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.05,
      },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.2 },
    },
  };

  return (
    <>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -8 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="h-full"
      >
        <Link
          to={`/product/${product.id}`}
          className="flex flex-col h-full group"
        >
          <Card className="flex flex-col h-full overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] bg-card/50 backdrop-blur-sm">
            {/* Image Container */}
            <CardHeader className="p-0 relative overflow-hidden">
              <AspectRatio
                ratio={1 / 1}
                className="bg-gradient-to-br from-muted/30 to-muted relative"
              >
                {/* Image */}
                <motion.img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-contain transition-all duration-500 p-4"
                  loading="lazy"
                  animate={{
                    scale: isHovered ? 1.05 : 1,
                  }}
                />

                {/* Placeholder Icon */}
                {!product.image_url && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="h-20 w-20 text-muted-foreground/20" />
                  </div>
                )}

                {/* Overlay on Hover - Simplified */}
                {isHovered && (
                  <motion.div
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 z-10"
                  >
                    <Button
                      size="sm"
                      variant="secondary"
                      className="gap-2 shadow-lg bg-white/90 hover:bg-white text-foreground backdrop-blur-md border border-white/20"
                      onClick={handleQuickView}
                    >
                      <Eye className="h-4 w-4" />
                      Aperçu
                    </Button>
                    {product.image_url && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="gap-2 shadow-lg"
                        onClick={handleImageClick}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Zoom
                      </Button>
                    )}
                  </motion.div>
                )}

                {/* Badges - Smaller and less intrusive */}
                <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-20">
                  {isNew && (
                    <Badge className="text-[10px] px-1.5 py-0.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-md">
                      <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                      Nouveau
                    </Badge>
                  )}
                  {isFeatured && (
                    <Badge className="text-[10px] px-1.5 py-0.5 bg-gradient-to-r from-orange-500 to-red-600 text-white border-0 shadow-md">
                      <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                      Populaire
                    </Badge>
                  )}
                </div>

                {/* Bouton Favoris */}
                <div className="absolute top-2 right-2 z-20">
                  <Button
                    size="icon"
                    variant="secondary"
                    className={cn(
                      "h-9 w-9 rounded-full shadow-lg transition-all",
                      isProductFavorite
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-white/90 hover:bg-white text-gray-700 backdrop-blur-sm"
                    )}
                    onClick={handleFavoriteToggle}
                    aria-label={isProductFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4 transition-all",
                        isProductFavorite && "fill-current"
                      )}
                    />
                  </Button>
                </div>

              </AspectRatio>
            </CardHeader>

            {/* Content */}
            <CardContent className="flex-grow p-4">
              {/* Brand */}
              {brand && (
                <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                  {brand.name}
                </p>
              )}

              {/* Product Name */}
              <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                {product.name}
              </h3>

              {/* Category Badge */}
              {category && (
                <Badge
                  className="mb-3 text-xs"
                  style={{
                    backgroundColor: category.color,
                    color: "#fff",
                    border: "none",
                  }}
                >
                  {category.name}
                </Badge>
              )}

              {/* Separator */}
              <Separator className="my-3" />

              {/* Price and Availability */}
              <div className="flex flex-col gap-3 mt-auto">
                {isAdmin && (
                  <div className="w-full">
                    <div className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-blue-600">
                      {formatPrice(product.price)}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">Prix unitaire HT</p>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-800/50 gap-1.5 flex-shrink-0 px-2.5 py-1"
                  >
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">En stock</span>
                  </Badge>
                </div>
              </div>
            </CardContent>

            {/* Footer */}
            <CardFooter className="p-4 pt-0">
              <Button
                asChild
                className="w-full gap-2 group-hover:shadow-lg transition-shadow"
              >
                <Link to={`/product/${product.id}`}>
                  <ShoppingCart className="h-4 w-4" />
                  Voir les détails
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </Link>
      </motion.div>

      {/* Quick View Dialog */}
      <Dialog open={isQuickViewOpen} onOpenChange={setIsQuickViewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{product.name}</DialogTitle>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Image */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <ImageIcon className="h-24 w-24 text-muted-foreground/30" />
                </div>
              )}
              {category && (
                <Badge
                  className="absolute top-3 right-3 shadow-lg"
                  style={{
                    backgroundColor: category.color,
                    color: "#fff",
                  }}
                >
                  {category.name}
                </Badge>
              )}
            </div>

            {/* Details */}
            <div className="space-y-4">
              {brand && (
                <div>
                  <p className="text-sm text-muted-foreground">Marque</p>
                  <p className="font-semibold">{brand.name}</p>
                </div>
              )}

              {product.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Description
                  </p>
                  <p className="text-sm leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              <Separator />

              {isAdmin && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Prix</p>
                  <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                    {formatPrice(product.price)}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link to={`/product/${product.id}`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Voir la fiche complète
                  </Link>
                </Button>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-900 dark:text-green-100">
                  Produit disponible
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
