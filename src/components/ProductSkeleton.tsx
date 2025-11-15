import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface ProductSkeletonProps {
  count?: number;
  variant?: "grid" | "list";
}

/**
 * Composant Skeleton amélioré pour les cartes de produits
 * Avec animations fluides et design moderne
 */
export const ProductSkeleton = ({ 
  count = 8, 
  variant = "grid" 
}: ProductSkeletonProps) => {
  if (variant === "list") {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="flex items-center gap-4 p-4">
              <Skeleton className="h-20 w-20 rounded-md flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className="overflow-hidden group animate-in fade-in-50 slide-in-from-bottom-4"
          style={{
            animationDelay: `${i * 50}ms`,
            animationDuration: "500ms",
            animationFillMode: "both",
          }}
        >
          <CardHeader className="p-0">
            <Skeleton className="h-[300px] w-full rounded-t-lg" />
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <div className="flex items-center justify-between w-full">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

/**
 * Skeleton pour une liste de produits en grille (variante compacte)
 */
export const ProductGridSkeleton = ({ count = 12 }: { count?: number }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="animate-in fade-in-50 slide-in-from-bottom-2"
        style={{
          animationDelay: `${i * 30}ms`,
          animationDuration: "400ms",
        }}
      >
        <Card className="overflow-hidden">
          <Skeleton className="aspect-square w-full" />
          <CardContent className="p-3 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-5 w-1/2" />
          </CardContent>
        </Card>
      </div>
    ))}
  </div>
);

/**
 * Skeleton pour la page de détail d'un produit
 */
export const ProductDetailSkeleton = () => (
  <div className="container mx-auto py-8 px-4">
    <Skeleton className="h-9 w-40 mb-6" />
    <div className="grid md:grid-cols-2 gap-12">
      <Skeleton className="w-full aspect-square rounded-lg" />
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-10 w-3/4" />
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  </div>
);

