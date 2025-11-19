import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ProductList from "@/components/ProductList";
import { AdvancedFilters } from "@/components/AdvancedFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useProducts } from "@/context/ProductContextUnified";
import { useUtilityCategories } from "@/context/UtilityCategoryContextUnified";
import { useBrands } from "@/context/BrandContextUnified";
import { useCompanyTheme } from "@/hooks/useCompanyTheme";
import { useContact } from "@/context/ContactContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { SearchWithSuggestions } from "@/components/SearchWithSuggestions";
import { ProductFilters } from "@/types";
import {
  Search,
  Sparkles,
  Shield,
  Zap,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Home,
  LayoutGrid,
  SlidersHorizontal,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  const { brandName } = useParams<{ brandName?: string }>();
  const navigate = useNavigate();
  const { products: allProducts } = useProducts();
  const { utilityCategories } = useUtilityCategories();
  const { brands } = useBrands();
  const { theme, company } = useCompanyTheme();
  const { contactInfo } = useContact();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState<ProductFilters>({});
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Filtrer les produits par entreprise
  const products = useMemo(() => {
    if (!company) return allProducts;
    const filtered = allProducts.filter((product) => {
      // Si le produit n'a pas de company défini, ne pas l'afficher
      if (!product.company) return false;
      return product.company === company;
    });
    // Debug: vérifier le filtrage
    console.log(`[Catalog] Company: ${company}, Total products: ${allProducts.length}, Filtered: ${filtered.length}`);
    console.log(`[Catalog] Products without company:`, allProducts.filter(p => !p.company).map(p => p.name));
    return filtered;
  }, [allProducts, company]);

  useEffect(() => {
    setIsVisible(true);

    // Auto-collapse sur mobile
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filtrer les marques selon l'entreprise
  const availableBrands = useMemo(() => {
    if (!company) return brands;
    if (company === "Lumina Distribution") {
      return brands.filter((brand) => brand.name === "Force Xpress");
    }
    if (company === "CleanExpress") {
      return brands.filter((brand) => brand.name !== "Force Xpress");
    }
    return brands;
  }, [brands, company]);

  // Calculer le nombre de produits filtrés pour les filtres avancés
  const filteredProductsCount = useMemo(() => {
    let filtered = products;

    // Appliquer les filtres avancés
    if (advancedFilters.categoryId) {
      filtered = filtered.filter(p => p.utilityCategoryId === advancedFilters.categoryId);
    }
    if (advancedFilters.brandId) {
      filtered = filtered.filter(p => p.brandId === advancedFilters.brandId);
    }
    if (advancedFilters.minPrice !== undefined) {
      filtered = filtered.filter(p => p.price >= advancedFilters.minPrice!);
    }
    if (advancedFilters.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.price <= advancedFilters.maxPrice!);
    }
    if (debouncedSearchQuery) {
      const searchLower = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      );
    }
    if (selectedCategory) {
      filtered = filtered.filter(p => p.utilityCategoryId === selectedCategory);
    }

    return filtered.length;
  }, [products, advancedFilters, debouncedSearchQuery, selectedCategory]);

  // Filtrer les catégories selon la recherche dans la sidebar
  const filteredCategories = utilityCategories.filter((cat) =>
    cat.name.toLowerCase().includes(sidebarSearchQuery.toLowerCase()),
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Hero Section - Compact */}
      <section className="relative overflow-hidden border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />

        <div className="container relative mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="flex items-center gap-4">
                  {company ? (
                    <div className="relative group">
                      <div className="absolute -inset-2 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <img
                        src={theme.logo}
                        alt={`${company} Logo`}
                        className="h-16 w-auto object-contain relative z-10 drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <h1
                      className="text-3xl font-extrabold tracking-tight"
                      style={{ color: theme.colors.primary }}
                    >
                      {company || "Catalogue"}
                    </h1>
                    <p className="text-base text-muted-foreground font-medium">
                      Catalogue Professionnel
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

          </motion.div>
        </div>

        <div className="absolute top-0 right-0 -z-10 h-32 w-32 bg-primary/5 rounded-full blur-3xl" />
      </section>

      {/* Main Layout */}
      <div className="relative">
        {/* Mobile Overlay */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Mobile Menu Toggle */}
        <Button
          variant="default"
          size="icon"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 lg:hidden shadow-2xl rounded-full w-12 h-12 sm:w-14 sm:h-14"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          aria-label={isMobileSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {isMobileSidebarOpen ? (
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          ) : (
            <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          )}
        </Button>

        <div className="container mx-auto px-4">
          <div className="flex gap-4 py-4">
            {/* Modern Sidebar */}
            <motion.aside
              initial={{ x: -20, opacity: 0 }}
              animate={{
                x: isSidebarOpen || isMobileSidebarOpen ? 0 : -20,
                opacity: isSidebarOpen || isMobileSidebarOpen ? 1 : 0,
              }}
              className={cn(
                "fixed lg:sticky top-4 left-4 sm:top-6 sm:left-6 lg:left-0 z-40",
                "bg-background/95 backdrop-blur-xl border rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/5",
                "overflow-hidden transition-all duration-300",
                isCollapsed ? "w-16 sm:w-20" : "w-[calc(100vw-2rem)] sm:w-64 lg:w-72 max-w-[90vw] sm:max-w-none",
                "h-[calc(100vh-2rem)] sm:h-[calc(100vh-3rem)] lg:h-[calc(100vh-5rem)]",
                !isSidebarOpen && !isMobileSidebarOpen && "lg:hidden translate-x-[-120%] lg:translate-x-0",
              )}
            >
              <div className="flex flex-col h-full">
                {/* Sidebar Header */}
                <div className="relative px-5 py-6 border-b bg-gradient-to-br from-primary/5 via-primary/3 to-transparent">
                  <div className="flex items-center justify-between mb-4">
                    {!isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                          <LayoutGrid className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold">Navigation</h2>
                          <p className="text-xs text-muted-foreground">
                            {utilityCategories.length} catégories
                          </p>
                        </div>
                      </motion.div>
                    )}

                    <div className="flex items-center gap-1">
                      {!isCollapsed && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-xl hover:bg-muted/50"
                        >
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        className="hidden lg:flex h-8 w-8 rounded-xl hover:bg-muted/50"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                      >
                        {isCollapsed ? (
                          <ChevronRight className="h-4 w-4" />
                        ) : (
                          <ChevronLeft className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Search in Sidebar */}
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="relative"
                    >
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Rechercher..."
                        className="pl-10 h-10 rounded-xl border-muted bg-background/50 focus:bg-background transition-colors"
                        value={sidebarSearchQuery}
                        onChange={(e) => setSidebarSearchQuery(e.target.value)}
                      />
                    </motion.div>
                  )}
                </div>

                {/* Main Menu */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
                  {/* Home/All Products */}
                  <motion.button
                    whileHover={{ x: isCollapsed ? 0 : 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedCategory(null);
                      setIsMobileSidebarOpen(false);
                      document
                        .getElementById("products")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={cn(
                      "w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-200 group",
                      !selectedCategory
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "hover:bg-muted/70 active:bg-muted",
                      isCollapsed && "justify-center px-0",
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center rounded-xl transition-all",
                        !selectedCategory
                          ? "w-9 h-9 bg-white/20"
                          : "w-9 h-9 bg-primary/10 group-hover:bg-primary/15",
                      )}
                    >
                      <Home
                        className={cn(
                          "h-5 w-5 transition-colors",
                          !selectedCategory
                            ? "text-primary-foreground"
                            : "text-primary",
                        )}
                      />
                    </div>

                    {!isCollapsed && (
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-sm leading-tight">
                          Tous les produits
                        </div>
                        <div
                          className={cn(
                            "text-xs mt-0.5",
                            !selectedCategory
                              ? "text-primary-foreground/80"
                              : "text-muted-foreground",
                          )}
                        >
                          {products.length} articles
                        </div>
                      </div>
                    )}
                  </motion.button>

                  <div className="relative py-2">
                    <Separator />
                    {!isCollapsed && (
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 px-2 bg-background text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Catégories
                      </span>
                    )}
                  </div>

                  {/* Categories List */}
                  <AnimatePresence>
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((category, index) => {
                        const categoryProducts = products.filter(
                          (p) => p.utilityCategoryId === category.id,
                        );
                        const isSelected = selectedCategory === category.id;

                        return (
                          <motion.button
                            key={category.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: index * 0.03 }}
                            whileHover={{ x: isCollapsed ? 0 : 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setSelectedCategory(
                                isSelected ? null : category.id,
                              );
                              setIsMobileSidebarOpen(false);
                              document
                                .getElementById("products")
                                ?.scrollIntoView({ behavior: "smooth" });
                            }}
                            className={cn(
                              "w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-200 group",
                              isSelected
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                : "hover:bg-muted/70 active:bg-muted",
                              isCollapsed && "justify-center px-0",
                            )}
                          >
                            <div
                              className={cn(
                                "flex items-center justify-center rounded-xl transition-all w-9 h-9",
                                isSelected ? "bg-white/20" : "",
                              )}
                              style={{
                                backgroundColor: isSelected
                                  ? undefined
                                  : `${category.color}15`,
                              }}
                            >
                              <div
                                className="w-4 h-4 rounded-full shadow-sm"
                                style={{
                                  backgroundColor: isSelected
                                    ? "white"
                                    : category.color,
                                }}
                              />
                            </div>

                            {!isCollapsed && (
                              <div className="flex-1 text-left">
                                <div className="font-semibold text-sm leading-tight">
                                  {category.name}
                                </div>
                                <div
                                  className={cn(
                                    "text-xs mt-0.5",
                                    isSelected
                                      ? "text-primary-foreground/80"
                                      : "text-muted-foreground",
                                  )}
                                >
                                  {categoryProducts.length} produit
                                  {categoryProducts.length > 1 ? "s" : ""}
                                </div>
                              </div>
                            )}
                          </motion.button>
                        );
                      })
                    ) : (
                      <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                        Aucune catégorie trouvée
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Sidebar Footer - Trust Badges */}
                {!isCollapsed && (
                  <div className="border-t bg-muted/20 p-4 space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                      Nos garanties
                    </h3>
                    {[
                      {
                        icon: Shield,
                        title: "Qualité",
                        color: "text-blue-500",
                        bg: "bg-blue-500/10",
                      },
                      {
                        icon: Zap,
                        title: "Efficacité",
                        color: "text-amber-500",
                        bg: "bg-amber-500/10",
                      },
                      {
                        icon: CheckCircle,
                        title: "Certifié",
                        color: "text-green-500",
                        bg: "bg-green-500/10",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl bg-background/50 border border-border/50"
                      >
                        <div className={cn("p-1.5 rounded-lg", item.bg)}>
                          <item.icon
                            className={cn("h-3.5 w-3.5", item.color)}
                          />
                        </div>
                        <span className="text-xs font-medium">
                          {item.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              {/* Barre de navigation avec recherche et filtres */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-16 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b mb-4 -mx-4 px-4 py-3"
              >
                <div className="flex flex-col gap-4">
                  {/* Ligne 1: Recherche et bouton filtres */}
                  <div className="flex gap-3 items-center">
                    <div className="flex-1">
                      <SearchWithSuggestions
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Rechercher un produit, une marque..."
                        showHistory={true}
                        showSuggestions={true}
                      />
                    </div>
                    <Button
                      variant={isFiltersOpen ? "default" : "outline"}
                      onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                      className="gap-2 flex-shrink-0"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      <span className="hidden sm:inline">Filtres</span>
                      {(advancedFilters.categoryId || advancedFilters.brandId || advancedFilters.minPrice || advancedFilters.maxPrice) && (
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                          {[
                            advancedFilters.categoryId && 1,
                            advancedFilters.brandId && 1,
                            (advancedFilters.minPrice || advancedFilters.maxPrice) && 1,
                          ].filter(Boolean).length}
                        </Badge>
                      )}
                    </Button>
                  </div>

                  {/* Ligne 2: Filtres avancés (collapsible) */}
                  <AnimatePresence>
                    {isFiltersOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <AdvancedFilters
                          filters={advancedFilters}
                          onFiltersChange={setAdvancedFilters}
                          productsCount={filteredProductsCount}
                          disableCollapsible={true}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Products Header - Compact */}
              <div className="mb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold break-words">
                      {selectedCategory
                        ? utilityCategories.find(
                          (c) => c.id === selectedCategory,
                        )?.name
                        : "Notre Catalogue"}
                    </h2>
                    <p className="text-xs text-muted-foreground break-words mt-0.5">
                      {selectedCategory
                        ? `${products.filter((p) => p.utilityCategoryId === selectedCategory).length} produit${products.filter((p) => p.utilityCategoryId === selectedCategory).length > 1 ? "s" : ""}`
                        : debouncedSearchQuery
                          ? `${filteredProductsCount} résultat${filteredProductsCount > 1 ? "s" : ""} pour "${debouncedSearchQuery}"`
                          : `${filteredProductsCount} produit${filteredProductsCount > 1 ? "s" : ""} disponible${filteredProductsCount > 1 ? "s" : ""}`}
                    </p>
                  </div>

                  {selectedCategory && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCategory(null)}
                      className="gap-2 rounded-xl w-full sm:w-auto flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                      Effacer
                    </Button>
                  )}
                </div>

                {selectedCategory && (
                  <Badge
                    variant="secondary"
                    className="gap-2 px-3 py-1.5 rounded-xl"
                    style={{
                      backgroundColor: `${utilityCategories.find((c) => c.id === selectedCategory)
                          ?.color
                        }15`,
                      borderColor: utilityCategories.find(
                        (c) => c.id === selectedCategory,
                      )?.color,
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: utilityCategories.find(
                          (c) => c.id === selectedCategory,
                        )?.color,
                      }}
                    />
                    {
                      utilityCategories.find((c) => c.id === selectedCategory)
                        ?.name
                    }
                  </Badge>
                )}
              </div>

              {/* Products List */}
              <section id="products">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <ProductList
                    searchQuery={debouncedSearchQuery}
                    categoryFilter={selectedCategory}
                    products={products}
                    advancedFilters={advancedFilters}
                    onAdvancedFiltersChange={setAdvancedFilters}
                    hideFilters={true}
                  />
                </motion.div>
              </section>
            </main>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <section className="container mx-auto px-4 py-12 mt-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground shadow-2xl"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur">
            <Sparkles className="h-8 w-8" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à commander ?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Contactez-nous pour plus d'informations ou pour passer commande
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="rounded-xl gap-2 shadow-xl font-semibold"
              onClick={() => navigate("/contact")}
            >
              Nous Contacter
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl gap-2 bg-white/10 border-white/20 hover:bg-white/20 text-white font-semibold"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Retour en Haut
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Scroll Progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary origin-left z-50"
        style={{
          scaleX: isVisible ? 1 : 0,
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
};

export default Index;
