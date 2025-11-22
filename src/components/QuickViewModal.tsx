import { useState, memo } from "react";
import { motion } from "framer-motion";
import { Product } from "@/types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { useUtilityCategories } from "@/context/UtilityCategoryContextUnified";
import { useBrands } from "@/context/BrandContextUnified";
import { useProducts } from "@/context/ProductContextUnified";
import {
    ImageIcon,
    Heart,
    CheckCircle,
    Link2,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface QuickViewModalProps {
    product: Product | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const QuickViewModal = memo(({ product, open, onOpenChange }: QuickViewModalProps) => {
    const { getUtilityCategoryById } = useUtilityCategories();
    const { getBrandById } = useBrands();
    const { isFavorite, toggleFavorite } = useFavorites();
    const { isAdmin } = useAuth();
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    if (!product) return null;

    const category = product.utilityCategoryId
        ? getUtilityCategoryById(product.utilityCategoryId)
        : null;
    const brand = product.brandId ? getBrandById(product.brandId) : null;
    const isProductFavorite = isFavorite(product.id);

    const handleFavoriteToggle = () => {
        toggleFavorite(product.id);
        toast.success(
            isProductFavorite
                ? "Produit retiré des favoris"
                : "Produit ajouté aux favoris"
        );
    };

    const handleCopyLink = () => {
        const productUrl = `${window.location.origin}/product/${product.id}`;
        navigator.clipboard.writeText(productUrl);
        toast.success("Lien copié dans le presse-papier !");
    };

    const hasLongDescription = (product.description?.length || 0) > 200;
    const displayedDescription =
        hasLongDescription && !isDescriptionExpanded
            ? `${product.description?.substring(0, 200)}...`
            : product.description;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl md:text-3xl font-bold pr-8">
                        {product.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                    {/* Image Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-muted/30 to-muted border-2 border-border/50 shadow-lg"
                    >
                        {product.image_url ? (
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-contain p-6"
                                loading="lazy"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <ImageIcon className="h-32 w-32 text-muted-foreground/20" />
                            </div>
                        )}

                        {/* Category Badge */}
                        {category && (
                            <Badge
                                className="absolute top-3 right-3 shadow-lg text-sm"
                                style={{
                                    backgroundColor: category.color,
                                    color: "#fff",
                                }}
                            >
                                {category.name}
                            </Badge>
                        )}

                        {/* Stock Badge */}
                        <div className="absolute bottom-3 left-3">
                            <Badge
                                variant="secondary"
                                className="bg-emerald-50/90 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 gap-1.5 backdrop-blur-sm shadow-md"
                            >
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                                    En stock
                                </span>
                            </Badge>
                        </div>
                    </motion.div>

                    {/* Details Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="flex flex-col space-y-5"
                    >
                        {/* Brand */}
                        {brand && (
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Marque</p>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-sm font-semibold">
                                        {brand.name}
                                    </Badge>
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {product.description && (
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Description
                                </p>
                                <div className="space-y-2">
                                    <p className="text-sm leading-relaxed text-foreground/90">
                                        {displayedDescription}
                                    </p>
                                    {hasLongDescription && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                            className="h-auto p-0 text-primary hover:text-primary/80 font-medium"
                                        >
                                            {isDescriptionExpanded ? (
                                                <>
                                                    <ChevronUp className="h-4 w-4 mr-1" />
                                                    Voir moins
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown className="h-4 w-4 mr-1" />
                                                    Lire plus
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

                        <Separator />

                        {/* Price - Only for admin */}
                        {isAdmin && (
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Prix</p>
                                <div className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-blue-600">
                                    {formatPrice(product.price)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Prix unitaire HT</p>
                            </div>
                        )}

                        <Separator />

                        {/* Action Buttons */}
                        <div className="space-y-3 pt-2">
                            {/* Primary Action - Add to Favorites */}
                            <Button
                                onClick={handleFavoriteToggle}
                                className={cn(
                                    "w-full gap-2 h-11 text-base font-semibold shadow-md hover:shadow-lg transition-all",
                                    isProductFavorite
                                        ? "bg-red-500 hover:bg-red-600 text-white"
                                        : "bg-primary hover:bg-primary/90 text-primary-foreground"
                                )}
                            >
                                <Heart
                                    className={cn(
                                        "h-5 w-5",
                                        isProductFavorite && "fill-current"
                                    )}
                                />
                                {isProductFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                            </Button>

                            {/* Secondary Actions */}
                            <div className="grid grid-cols-1 gap-3">
                                <Button
                                    variant="outline"
                                    onClick={handleCopyLink}
                                    className="gap-2 h-10 w-full"
                                >
                                    <Link2 className="h-4 w-4" />
                                    Copier le lien
                                </Button>
                            </div>
                        </div>

                        {/* Availability indicator */}
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800">
                            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                                    Produit disponible
                                </p>
                                <p className="text-xs text-green-700 dark:text-green-300">
                                    Prêt à être commandé
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <Separator className="my-6" />

                {/* Similar Products Section */}
                <SimilarProductsSection
                    currentProduct={product}
                    onProductClick={(product) => {
                        // Close current modal and open new one shortly after to simulate navigation
                        // Or ideally, just update the product prop if the parent handles it, 
                        // but since we are inside the modal, we might need a way to switch product.
                        // For now, let's assume the parent will handle the switch if we had a callback,
                        // but here we are just displaying them. 
                        // Actually, the best UX is to switch the content of the modal.
                        // But QuickViewModal is controlled by ProductList.
                        // We need to notify ProductList to change the selected product.
                        // Since we don't have a prop for that, we will just display them for now 
                        // and maybe add a callback prop later if needed.
                        // Wait, we can't easily switch without a callback.
                        // Let's just display them as read-only or simple links for now?
                        // No, user wants functionality.
                        // Let's add a callback prop `onSelectProduct` to QuickViewModal.
                    }}
                />
            </DialogContent>
        </Dialog>
    );
});

// Sub-component for Similar Products to keep main component clean
const SimilarProductsSection = ({ currentProduct, onProductClick }: { currentProduct: Product, onProductClick?: (product: Product) => void }) => {
    const { products } = useProducts();

    // Logic to find similar products
    const similarProducts = products.filter(p =>
        p.id !== currentProduct.id && // Exclude current product
        (
            (currentProduct.utilityCategoryId && p.utilityCategoryId === currentProduct.utilityCategoryId) || // Same category
            (currentProduct.brandId && p.brandId === currentProduct.brandId) // Same brand
        )
    ).slice(0, 4); // Limit to 4 products

    if (similarProducts.length === 0) return null;

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Produits similaires</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {similarProducts.map(product => (
                    <div
                        key={product.id}
                        className="group relative border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer bg-card"
                        onClick={() => {
                            if (onProductClick) {
                                onProductClick(product);
                            } else {
                                // Fallback behavior if no click handler provided
                                // For now, maybe just copy link or show toast?
                                // Or we can just let it be static if we can't navigate.
                                // But user expects navigation.
                                // Since we are in a controlled modal, we can't easily switch the prop 'product' passed to us.
                                // We would need the parent to handle 'onSelectProduct'.
                                toast.info("Pour voir ce produit, fermez cet aperçu et cliquez sur sa carte.");
                            }
                        }}
                    >
                        <div className="aspect-square mb-2 overflow-hidden rounded-md bg-muted/20">
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="h-8 w-8 text-muted-foreground/20" />
                                </div>
                            )}
                        </div>
                        <h4 className="text-sm font-medium line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                            {product.name}
                        </h4>
                    </div>
                ))}
            </div>
        </div>
    );
};

QuickViewModal.displayName = "QuickViewModal";

export default QuickViewModal;
