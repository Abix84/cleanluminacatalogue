import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from "lucide-react";
import { useUtilityCategories } from "@/context/UtilityCategoryContextUnified";
import { useBrands } from "@/context/BrandContextUnified";
import { ProductFilters } from "@/types";
import { formatPrice } from "@/lib/utils";

interface AdvancedFiltersProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  productsCount?: number;
  disableCollapsible?: boolean; // Pour désactiver le Collapsible interne quand utilisé dans une barre de navigation
}

/**
 * Composant de recherche avancée avec filtres multiples
 */
export const AdvancedFilters = ({
  filters,
  onFiltersChange,
  productsCount = 0,
  disableCollapsible = false,
}: AdvancedFiltersProps) => {
  const { utilityCategories } = useUtilityCategories();
  const { brands } = useBrands();
  const [isOpen, setIsOpen] = useState(false);

  // Calculer les prix min/max depuis les produits (pour le slider)
  // Note: Dans une vraie app, ce serait mieux de le faire côté serveur
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || 1000,
  ]);

  // Sync price range with filters
  useEffect(() => {
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      setPriceRange([
        filters.minPrice || 0,
        filters.maxPrice || 1000,
      ]);
    }
  }, [filters.minPrice, filters.maxPrice]);

  const updateFilter = (key: keyof ProductFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilter = (key: keyof ProductFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      searchTerm: filters.searchTerm, // Garder la recherche
    });
    setPriceRange([0, 1000]);
  };

  const hasActiveFilters = !!(
    filters.categoryId ||
    filters.brandId ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.sortBy
  );

  const filterContent = (
    <div className="space-y-4">
      {/* Filtres Actifs */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pb-4 border-b">
          <span className="text-sm text-muted-foreground self-center">
            Filtres actifs:
          </span>
          {filters.categoryId && (
            <Badge variant="secondary" className="gap-1">
              Catégorie
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => clearFilter("categoryId")}
              />
            </Badge>
          )}
          {filters.brandId && (
            <Badge variant="secondary" className="gap-1">
              Marque
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => clearFilter("brandId")}
              />
            </Badge>
          )}
          {(filters.minPrice || filters.maxPrice) && (
            <Badge variant="secondary" className="gap-1">
              Prix
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  clearFilter("minPrice");
                  clearFilter("maxPrice");
                }}
              />
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-6 text-xs"
          >
            Tout effacer
          </Button>
        </div>
      )}

      {/* Catégorie */}
      <div className="space-y-2">
        <Label htmlFor="category-filter">Catégorie</Label>
        <Select
          value={filters.categoryId || "all"}
          onValueChange={(value) =>
            updateFilter("categoryId", value === "all" ? null : value)
          }
        >
          <SelectTrigger id="category-filter">
            <SelectValue placeholder="Toutes les catégories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {utilityCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Marque */}
      <div className="space-y-2">
        <Label htmlFor="brand-filter">Marque</Label>
        <Select
          value={filters.brandId || "all"}
          onValueChange={(value) =>
            updateFilter("brandId", value === "all" ? null : value)
          }
        >
          <SelectTrigger id="brand-filter">
            <SelectValue placeholder="Toutes les marques" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les marques</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Prix */}
      <div className="space-y-4">
        <Label>Prix (€)</Label>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={(values) => {
              setPriceRange(values as [number, number]);
              updateFilter("minPrice", values[0]);
              updateFilter("maxPrice", values[1]);
            }}
            max={1000}
            min={0}
            step={1}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Min: {formatPrice(priceRange[0])}
            </span>
            <span className="text-muted-foreground">
              Max: {formatPrice(priceRange[1])}
            </span>
          </div>
        </div>
      </div>

      {/* Tri */}
      <div className="space-y-2">
        <Label htmlFor="sort-filter">Trier par</Label>
        <Select
          value={filters.sortBy || "default"}
          onValueChange={(value) =>
            updateFilter("sortBy", value === "default" ? undefined : value)
          }
        >
          <SelectTrigger id="sort-filter">
            <SelectValue placeholder="Par défaut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Par défaut</SelectItem>
            <SelectItem value="price-asc">Prix croissant</SelectItem>
            <SelectItem value="price-desc">Prix décroissant</SelectItem>
            <SelectItem value="name-asc">Nom (A-Z)</SelectItem>
            <SelectItem value="name-desc">Nom (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  // Si disableCollapsible est true, retourner juste le contenu sans Card/Collapsible
  if (disableCollapsible) {
    return filterContent;
  }

  // Sinon, retourner avec Card et Collapsible
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <Card className="border">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <CardTitle className="text-base">Filtres Avancés</CardTitle>
                  <CardDescription className="text-xs">
                    {hasActiveFilters
                      ? `${productsCount} résultat${productsCount > 1 ? "s" : ""} trouvé${productsCount > 1 ? "s" : ""}`
                      : "Filtrer par catégorie, marque, prix..."}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Badge variant="secondary" className="gap-1 text-xs h-5">
                    <Filter className="h-3 w-3" />
                    Actif
                  </Badge>
                )}
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4 pt-4">
            {filterContent}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

