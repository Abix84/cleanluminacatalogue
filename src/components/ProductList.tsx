import { useEffect, useState, useMemo, useRef, useLayoutEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import { ProductSkeleton } from "./ProductSkeleton";
import { AdvancedFilters } from "./AdvancedFilters";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { PackageSearch, Loader2 } from "lucide-react";
import { useProducts } from "@/context/ProductContextUnified";
import { useUtilityCategories } from "@/context/UtilityCategoryContextUnified";
import { useBrands } from "@/context/BrandContextUnified";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Product, ProductFilters } from "@/types";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type SortOption =
  | "default"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc";

interface ProductListProps {
  searchQuery?: string;
  categoryFilter?: string | null;
  brandFilter?: string | null;
  hideFilters?: boolean;
  products?: Product[]; // Produits pré-filtrés (optionnel)
  advancedFilters?: ProductFilters; // Filtres avancés depuis le parent
  onAdvancedFiltersChange?: (filters: ProductFilters) => void; // Callback pour mettre à jour les filtres
}

const STORAGE_KEYS = {
  SCROLL_Y: "dyad_catalog_scroll_y",
  DISPLAY_COUNT: "dyad_catalog_display_count",
  INFINITE_SCROLL: "dyad_catalog_infinite_scroll",
};

const ProductList = ({
  searchQuery = "",
  categoryFilter = null,
  brandFilter = null,
  hideFilters = false,
  products: providedProducts,
  advancedFilters: externalAdvancedFilters,
  onAdvancedFiltersChange,
}: ProductListProps) => {
  const { products: contextProducts } = useProducts();
  // Utiliser les produits fournis en prop, sinon utiliser ceux du contexte
  const allProducts = providedProducts ?? contextProducts;
  const { utilityCategories } = useUtilityCategories();
  const { brands } = useBrands();
  const [loading, setLoading] = useState(true);
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Infinite Scroll State - Initialize from storage if available
  const [isInfiniteScroll, setIsInfiniteScroll] = useState(() => {
    const stored = sessionStorage.getItem(STORAGE_KEYS.INFINITE_SCROLL);
    return stored ? JSON.parse(stored) : true;
  });

  const [displayCount, setDisplayCount] = useState(() => {
    const stored = sessionStorage.getItem(STORAGE_KEYS.DISPLAY_COUNT);
    return stored ? parseInt(stored, 10) : 20;
  });

  const observerTarget = useRef<HTMLDivElement>(null);

  // URL Search Params for pagination
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const setCurrentPage = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", page.toString());
    setSearchParams(newParams);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [internalAdvancedFilters, setInternalAdvancedFilters] = useState<ProductFilters>({});
  const itemsPerPage = 20; // Nombre d'items par page

  // Utiliser les filtres externes si fournis, sinon utiliser les filtres internes
  const advancedFilters = externalAdvancedFilters ?? internalAdvancedFilters;
  const setAdvancedFilters = onAdvancedFiltersChange ?? setInternalAdvancedFilters;

  // Use external filters if provided, otherwise use local state
  const effectiveSearchTerm = searchQuery || localSearchTerm || advancedFilters.searchTerm || "";
  const effectiveCategoryFilter =
    categoryFilter ||
    advancedFilters.categoryId ||
    (selectedCategory === "all" ? null : selectedCategory);
  const effectiveBrandFilter =
    brandFilter ||
    advancedFilters.brandId ||
    (selectedBrand === "all" ? null : selectedBrand);
  const effectiveSortOption = advancedFilters.sortBy || sortOption;

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = allProducts.filter((product) => {
      // Recherche
      const searchTermLower = effectiveSearchTerm.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(searchTermLower) ||
        product.description?.toLowerCase().includes(searchTermLower) ||
        brands.find(b => b.id === product.brandId)?.name.toLowerCase().includes(searchTermLower) ||
        utilityCategories.find(c => c.id === product.utilityCategoryId)?.name.toLowerCase().includes(searchTermLower);

      // Catégorie
      const matchesCategory =
        !effectiveCategoryFilter ||
        product.utilityCategoryId === effectiveCategoryFilter;

      // Marque
      const matchesBrand =
        !effectiveBrandFilter ||
        product.brandId === effectiveBrandFilter;

      // Prix
      const matchesMinPrice =
        !advancedFilters.minPrice || product.price >= advancedFilters.minPrice;
      const matchesMaxPrice =
        !advancedFilters.maxPrice || product.price <= advancedFilters.maxPrice;

      return matchesSearch && matchesCategory && matchesBrand && matchesMinPrice && matchesMaxPrice;
    });

    // Tri
    switch (effectiveSortOption) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    return filtered;
  }, [
    effectiveSearchTerm,
    effectiveCategoryFilter,
    effectiveBrandFilter,
    effectiveSortOption,
    advancedFilters.minPrice,
    advancedFilters.maxPrice,
    allProducts,
    brands,
    utilityCategories,
  ]);

  // Pagination calculs
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Determine which products to display based on mode
  const displayedProducts = isInfiniteScroll
    ? filteredAndSortedProducts.slice(0, displayCount)
    : filteredAndSortedProducts.slice(startIndex, endIndex);

  // Track previous filters to avoid resetting page on initial mount
  const prevFiltersRef = useRef({
    effectiveSearchTerm,
    effectiveCategoryFilter,
    effectiveBrandFilter,
    effectiveSortOption,
    advancedFilters
  });

  // Reset to page 1 or initial display count when filters change
  useEffect(() => {
    const prevFilters = prevFiltersRef.current;
    const hasChanged =
      prevFilters.effectiveSearchTerm !== effectiveSearchTerm ||
      prevFilters.effectiveCategoryFilter !== effectiveCategoryFilter ||
      prevFilters.effectiveBrandFilter !== effectiveBrandFilter ||
      prevFilters.effectiveSortOption !== effectiveSortOption ||
      prevFilters.advancedFilters !== advancedFilters;

    if (hasChanged) {
      if (isInfiniteScroll) {
        setDisplayCount(20);
      } else {
        setCurrentPage(1);
      }
      // Clear stored scroll position on filter change
      sessionStorage.removeItem(STORAGE_KEYS.SCROLL_Y);

      prevFiltersRef.current = {
        effectiveSearchTerm,
        effectiveCategoryFilter,
        effectiveBrandFilter,
        effectiveSortOption,
        advancedFilters
      };
    }
  }, [effectiveSearchTerm, effectiveCategoryFilter, effectiveBrandFilter, effectiveSortOption, advancedFilters, isInfiniteScroll]);

  // Restore scroll position on mount if available
  useLayoutEffect(() => {
    const storedScrollY = sessionStorage.getItem(STORAGE_KEYS.SCROLL_Y);
    if (storedScrollY && !loading) {
      window.scrollTo(0, parseInt(storedScrollY, 10));
      // Optional: Clear after restoring if you only want it to happen once per "back" navigation
      // But keeping it might be safer if the user refreshes. 
      // Let's keep it in storage but maybe clear it if we navigate away? 
      // Actually, sessionStorage is fine.
    }
  }, [loading]);

  // Save state on unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem(STORAGE_KEYS.SCROLL_Y, window.scrollY.toString());
      sessionStorage.setItem(STORAGE_KEYS.DISPLAY_COUNT, displayCount.toString());
      sessionStorage.setItem(STORAGE_KEYS.INFINITE_SCROLL, JSON.stringify(isInfiniteScroll));
    };

    // We also want to save when the component unmounts (navigation)
    return () => {
      handleBeforeUnload();
    };
  }, [displayCount, isInfiniteScroll]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [filteredAndSortedProducts, currentPage, isInfiniteScroll]);

  // Infinite Scroll Observer
  useEffect(() => {
    if (!isInfiniteScroll || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayCount((prev) => Math.min(prev + 20, filteredAndSortedProducts.length));
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [isInfiniteScroll, loading, filteredAndSortedProducts.length]);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  // Fonction pour générer les numéros de page à afficher
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Afficher toutes les pages si <= 5
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logique pour afficher avec ellipsis
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  return (
    <>
      {/* Advanced Filters - Hidden if hideFilters is true or if filters are managed externally */}
      {!hideFilters && !externalAdvancedFilters && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <AdvancedFilters
            filters={advancedFilters}
            onFiltersChange={(filters) => {
              setAdvancedFilters(filters);
              // Sync with local state if filters are cleared
              if (!filters.categoryId && selectedCategory !== "all") {
                setSelectedCategory("all");
              }
              if (!filters.brandId && selectedBrand !== "all") {
                setSelectedBrand("all");
              }
            }}
            productsCount={filteredAndSortedProducts.length}
          />
        </motion.div>
      )}

      {/* Basic Filters - Hidden if hideFilters is true */}
      {!hideFilters && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4 mb-6 sm:mb-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Input
              placeholder="Rechercher un produit..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="lg:col-span-1"
            />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {utilityCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger>
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
            <Select
              value={sortOption}
              onValueChange={(value) => setSortOption(value as SortOption)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Trier par" />
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

          {/* Pagination Mode Toggle */}
          <div className="flex items-center justify-end space-x-2">
            <Switch
              id="infinite-scroll-mode"
              checked={isInfiniteScroll}
              onCheckedChange={setIsInfiniteScroll}
            />
            <Label htmlFor="infinite-scroll-mode">Pagination infinie</Label>
          </div>
        </motion.div>
      )}

      {/* Compact Filters Bar when hideFilters is true */}
      {hideFilters && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4 mb-8"
        >
          <div className="flex gap-4 justify-end">
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="w-[200px]">
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
            <Select
              value={sortOption}
              onValueChange={(value) => setSortOption(value as SortOption)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Trier par" />
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

          {/* Pagination Mode Toggle for Compact View */}
          <div className="flex items-center justify-end space-x-2">
            <Switch
              id="infinite-scroll-mode-compact"
              checked={isInfiniteScroll}
              onCheckedChange={setIsInfiniteScroll}
            />
            <Label htmlFor="infinite-scroll-mode-compact">Pagination infinie</Label>
          </div>
        </motion.div>
      )}

      {loading ? (
        <ProductSkeleton count={itemsPerPage} />
      ) : (
        <>
          {filteredAndSortedProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16"
            >
              <div className="inline-flex p-6 rounded-full bg-muted mb-6">
                <PackageSearch className="h-16 w-16 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Aucun produit trouvé</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Essayez de modifier vos filtres ou votre recherche pour
                découvrir notre gamme de produits.
              </p>
            </motion.div>
          ) : (
            <>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 mb-4"
              >
                {displayedProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onImageClick={handleImageClick}
                    index={index}
                    isNew={index < 2}
                    isFeatured={index === 0}
                  />
                ))}
              </motion.div>

              {/* Infinite Scroll Loader */}
              {isInfiniteScroll && displayCount < filteredAndSortedProducts.length && (
                <div ref={observerTarget} className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}

              {/* Standard Pagination */}
              {!isInfiniteScroll && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mt-6 sm:mt-8">
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    <span className="hidden sm:inline">Affichage de </span>
                    <span className="sm:hidden">{startIndex + 1}-{Math.min(endIndex, filteredAndSortedProducts.length)} / </span>
                    {startIndex + 1} à {Math.min(endIndex, filteredAndSortedProducts.length)}
                    <span className="hidden sm:inline"> sur </span>
                    <span className="sm:hidden"> / </span>
                    {filteredAndSortedProducts.length} produit{filteredAndSortedProducts.length > 1 ? "s" : ""}
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                          }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>

                      {getPageNumbers().map((page, index) => (
                        <PaginationItem key={index}>
                          {page === "ellipsis" ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(page as number);
                              }}
                              isActive={currentPage === page}
                            >
                              {page}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                          }}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-0">
          <motion.img
            src={selectedImage || ""}
            alt="Aperçu du produit"
            className="w-full h-auto rounded-lg shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductList;
