import { useState } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onImageClick: (imageUrl: string) => void;
  isNew?: boolean;
  isFeatured?: boolean;
  index?: number;
}

const ProductCard = ({
  product,
  onImageClick,
  isNew = false,
  isFeatured = false,
  index = 0,
}: ProductCardProps) => {
  const { getUtilityCategoryById } = useUtilityCategories();
  const { getBrandById } = useBrands();
  const [isHovered, setIsHovered] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const category = product.utilityCategoryId
    ? getUtilityCategoryById(product.utilityCategoryId)
    : null;
  const brand = product.brandId ? getBrandById(product.brandId) : null;

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.image_url) {
      onImageClick(product.image_url);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

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
          <Card className="flex flex-col h-full overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
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
                  className="w-full h-full object-contain transition-all duration-500"
                  animate={{
                    scale: isHovered ? 1.1 : 1,
                  }}
                />

                {/* Placeholder Icon */}
                {!product.image_url && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="h-20 w-20 text-muted-foreground/20" />
                  </div>
                )}

                {/* Overlay on Hover */}
                {isHovered && (
                  <motion.div
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 z-10"
                  >
                    <Button
                      size="sm"
                      variant="secondary"
                      className="gap-2 shadow-lg"
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

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
                  {isNew && (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Nouveau
                    </Badge>
                  )}
                  {isFeatured && (
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white border-0 shadow-lg">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Populaire
                    </Badge>
                  )}
                </div>

                {/* Category Badge */}
                {category && (
                  <Badge
                    className="absolute top-3 right-3 shadow-lg backdrop-blur-sm z-20"
                    style={{
                      backgroundColor: `${category.color}dd`,
                      color: "#fff",
                      border: "none",
                    }}
                  >
                    {category.name}
                  </Badge>
                )}

                {/* Available Badge */}
                <div className="absolute bottom-3 left-3 z-20">
                  <Badge
                    variant="secondary"
                    className="bg-white/90 backdrop-blur-sm gap-1 shadow-lg"
                  >
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-xs">Disponible</span>
                  </Badge>
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
              <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                {product.name}
              </h3>

              {/* Description */}
              {product.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {product.description}
                </p>
              )}

              {/* Separator */}
              <Separator className="my-3" />

              {/* Price */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-blue-600">
                    {formatPrice(product.price)}
                  </div>
                  <p className="text-xs text-muted-foreground">Prix unitaire</p>
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

              <div>
                <p className="text-sm text-muted-foreground mb-2">Prix</p>
                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                  {formatPrice(product.price)}
                </div>
              </div>

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
};

export default ProductCard;
