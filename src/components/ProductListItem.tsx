import { motion } from "framer-motion";
import { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Eye, ImageIcon, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import { useUtilityCategories } from "@/context/UtilityCategoryContextUnified";
import { useBrands } from "@/context/BrandContextUnified";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/context/AuthContext";

interface ProductListItemProps {
    product: Product;
    onQuickView: (product: Product) => void;
    onImageClick?: (url: string) => void;
}

export const ProductListItem = ({
    product,
    onQuickView,
    onImageClick,
}: ProductListItemProps) => {
    const { getUtilityCategoryById } = useUtilityCategories();
    const { getBrandById } = useBrands();
    const { isFavorite, toggleFavorite } = useFavorites();
    const { isAdmin } = useAuth();

    const category = product.utilityCategoryId
        ? getUtilityCategoryById(product.utilityCategoryId)
        : null;
    const brand = product.brandId ? getBrandById(product.brandId) : null;
    const isProductFavorite = isFavorite(product.id);

    const isDateValid = !product.saleEndDate || new Date(product.saleEndDate) > new Date();
    const hasPromotion = product.isOnSale && isDateValid && product.promo_price !== null && product.promo_price !== undefined;
    const currentPrice = hasPromotion ? product.promo_price! : product.price;

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleFavorite(product.id);
    };

    const handleQuickViewClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onQuickView(product);
    };

    const handleImageClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (product.image_url && onImageClick) {
            onImageClick(product.image_url);
        }
    };

    const truncatedDescription = product.description
        ? product.description.length > 120
            ? `${product.description.substring(0, 120)}...`
            : product.description
        : "";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onQuickView(product)}
            className="group cursor-pointer bg-card hover:bg-accent/50 border border-border rounded-lg p-4 transition-all duration-300 hover:shadow-md"
        >
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Image */}
                <div
                    onClick={handleImageClick}
                    className="relative flex-shrink-0 w-full sm:w-20 md:w-24 aspect-square bg-gradient-to-br from-muted/30 to-muted rounded-lg overflow-hidden border border-border/50 cursor-pointer hover:border-primary/50 transition-colors"
                >
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-contain p-2"
                            loading="lazy"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <ImageIcon className="h-10 w-10 text-muted-foreground/20" />
                        </div>
                    )}

                    {/* Category Badge on Image */}
                    {category && (
                        <Badge
                            className="absolute top-1 right-1 text-[10px] px-1.5 py-0.5"
                            style={{
                                backgroundColor: category.color,
                                color: "#fff",
                            }}
                        >
                            {category.name}
                        </Badge>
                    )}
                </div>

                {/* Content */}
                <div className="flex-grow min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                        {/* Left Content */}
                        <div className="flex-grow min-w-0">
                            {/* Brand */}
                            {brand && (
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                    {brand.name}
                                </p>
                            )}

                            {/* Product Name */}
                            <h3 className="font-bold text-base mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                                {product.name}
                            </h3>

                            {/* Description */}
                            {truncatedDescription && (
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2 hidden md:block">
                                    {truncatedDescription}
                                </p>
                            )}

                            {/* Price and Stock */}
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                {isAdmin && (
                                    <div className="flex items-baseline gap-2">
                                        <div className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-blue-600">
                                            {formatPrice(currentPrice)}
                                        </div>
                                        {hasPromotion && (
                                            <div className="text-sm text-muted-foreground line-through">
                                                {formatPrice(product.price)}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {hasPromotion && (
                                    <Badge className="bg-red-600 text-white border-0">
                                        Promo
                                    </Badge>
                                )}

                                <Badge
                                    variant="secondary"
                                    className="bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-800/50 gap-1"
                                >
                                    <CheckCircle className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                                        En stock
                                    </span>
                                </Badge>
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex sm:flex-col gap-2 flex-shrink-0">
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleQuickViewClick}
                                className="gap-2 flex-1 sm:flex-initial"
                            >
                                <Eye className="h-4 w-4" />
                                <span className="hidden sm:inline">Aperçu</span>
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleFavoriteClick}
                                className={cn(
                                    "gap-2 flex-1 sm:flex-initial",
                                    isProductFavorite &&
                                    "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900"
                                )}
                            >
                                <Heart
                                    className={cn(
                                        "h-4 w-4",
                                        isProductFavorite && "fill-current"
                                    )}
                                />
                                <span className="hidden sm:inline">
                                    {isProductFavorite ? "Favoris" : "Ajouter"}
                                </span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
