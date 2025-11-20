import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ProductList from "@/components/ProductList";
import { AdvancedFilters } from "@/components/AdvancedFilters";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/context/ProductContext";
import { useUtilityCategories } from "@/context/UtilityCategoryContext";
import { useBrands } from "@/context/BrandContext";
import { useCompanyTheme } from "@/hooks/useCompanyTheme";
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
  LayoutGrid,
  SlidersHorizontal,
  CheckCircle,
  Home,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import "./Catalog.css";

const Catalog = () => {
  const { brandName } = useParams<{ brandName?: string }>();
  const navigate = useNavigate();
  const { products: allProducts } = useProducts();
  const { utilityCategories } = useUtilityCategories();
  const { brands } = useBrands();
  const { theme, company } = useCompanyTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'categories' | 'brands'>('categories');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState<ProductFilters>({});
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Filter products by company
  const products = useMemo(() => {
    if (!company) return allProducts;
    return allProducts.filter((product) => product.company === company);
  }, [allProducts, company]);

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
        setIsCollapsed(false); // Reset collapse state on mobile
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filter categories and brands for sidebar search
  const filteredCategories = utilityCategories.filter((cat) =>
    cat.name.toLowerCase().includes(sidebarSearchQuery.toLowerCase())
  );

  // Filter brands to show only those with products in the current company
  const filteredBrands = useMemo(() => {
    // Get unique brand IDs from products of the current company
    const companyBrandIds = new Set(
      products
        .filter(p => p.brandId) // Only products with a brand
        .map(p => p.brandId)
    );

    // Filter brands that have products in this company and match search
    return brands.filter((brand) =>
      companyBrandIds.has(brand.id) &&
      brand.name.toLowerCase().includes(sidebarSearchQuery.toLowerCase())
    );
  }, [brands, products, sidebarSearchQuery]);

  // Filtered products count
  const filteredProductsCount = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(p => p.utilityCategoryId === selectedCategory);
    }

    // Filter by brand
    if (selectedBrand) {
      filtered = filtered.filter(p => p.brandId === selectedBrand);
    }

    // Filter by search
    if (debouncedSearchQuery) {
      const searchLower = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      );
    }

    return filtered.length;
  }, [products, selectedCategory, selectedBrand, debouncedSearchQuery]);

  return (
    <div className="catalog-layout">
      {/* Sidebar */}
      <aside className={cn("catalog-sidebar", isCollapsed && "collapsed", isMobileSidebarOpen && "open")}>
        <div className="sidebar-header">
          {!isCollapsed && (
            <div className="sidebar-brand">
              <LayoutGrid className="h-5 w-5" style={{ color: theme.colors.primary }} />
              <div style={{ color: theme.colors.primary }}>
                Filtres
              </div>
            </div>
          )}
          <button
            className="sidebar-toggle"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <div className="sidebar-content">
          {/* Filter Mode Toggle */}
          {!isCollapsed && (
            <div className="filter-mode-toggle">
              <button
                className={cn("mode-btn", filterMode === 'categories' && "active")}
                onClick={() => setFilterMode('categories')}
              >
                <LayoutGrid className="h-4 w-4" />
                Catégories
              </button>
              <button
                className={cn("mode-btn", filterMode === 'brands' && "active")}
                onClick={() => setFilterMode('brands')}
              >
                <Tag className="h-4 w-4" />
                Marques
              </button>
            </div>
          )}

          {/* Search */}
          {!isCollapsed && (
            <div className="sidebar-search">
              <Search />
              <input
                type="text"
                placeholder={`Rechercher ${filterMode === 'categories' ? 'catégories' : 'marques'}...`}
                value={sidebarSearchQuery}
                onChange={(e) => setSidebarSearchQuery(e.target.value)}
              />
            </div>
          )}

          {/* Active Filters Badge */}
          {!isCollapsed && (selectedCategory || selectedBrand) && (
            <div className="active-filters">
              {selectedCategory && (
                <span className="filter-badge">
                  {utilityCategories.find(c => c.id === selectedCategory)?.name}
                  <X className="h-3 w-3" onClick={() => setSelectedCategory(null)} />
                </span>
              )}
              {selectedBrand && (
                <span className="filter-badge">
                  {brands.find(b => b.id === selectedBrand)?.name}
                  <X className="h-3 w-3" onClick={() => setSelectedBrand(null)} />
                </span>
              )}
            </div>
          )}

          {/* Categories or Brands List */}
          <nav className="nav-group">
            {filterMode === 'categories' ? (
              // Categories
              <>
                <button
                  className={cn("nav-item", !selectedCategory && "active")}
                  onClick={() => setSelectedCategory(null)}
                >
                  <Home className="nav-icon" />
                  {!isCollapsed && (
                    <>
                      <span className="nav-label">Toutes catégories</span>
                      <span className="nav-count">{products.length}</span>
                    </>
                  )}
                </button>
                {filteredCategories.map((category) => {
                  const count = products.filter(p => p.utilityCategoryId === category.id).length;
                  return (
                    <button
                      key={category.id}
                      className={cn("nav-item", selectedCategory === category.id && "active")}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <div
                        className="category-dot"
                        style={{ backgroundColor: category.color }}
                      />
                      {!isCollapsed && (
                        <>
                          <span className="nav-label">{category.name}</span>
                          <span className="nav-count">{count}</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </>
            ) : (
              // Brands
              <>
                <button
                  className={cn("nav-item", !selectedBrand && "active")}
                  onClick={() => setSelectedBrand(null)}
                >
                  <Home className="nav-icon" />
                  {!isCollapsed && (
                    <>
                      <span className="nav-label">Toutes marques</span>
                      <span className="nav-count">{products.length}</span>
                    </>
                  )}
                </button>
                {filteredBrands.map((brand) => {
                  const count = products.filter(p => p.brandId === brand.id).length;
                  return (
                    <button
                      key={brand.id}
                      className={cn("nav-item", selectedBrand === brand.id && "active")}
                      onClick={() => setSelectedBrand(brand.id)}
                    >
                      <Tag className="nav-icon" />
                      {!isCollapsed && (
                        <>
                          <span className="nav-label">{brand.name}</span>
                          <span className="nav-count">{count}</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </>
            )}
          </nav>
        </div>

        {/* Footer */}
        {!isCollapsed && (
          <div className="sidebar-footer">
            <div className="footer-stats">
              <Shield className="h-4 w-4 text-blue-500" />
              <span className="text-xs">Garantie Qualité</span>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="catalog-main">
        <header className="catalog-header">
          <div className="header-left">
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            >
              <Menu />
            </button>
            <h1 className="header-title">
              {selectedCategory
                ? utilityCategories.find(c => c.id === selectedCategory)?.name
                : "Tous les produits"}
            </h1>
          </div>

          <div className="header-actions">
            <div className="search-bar">
              <Search />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              className="btn-filter"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <SlidersHorizontal size={16} />
              Filtres
            </button>
          </div>
        </header>

        <div className="catalog-content">
          <div className="section-header">
            <div className="section-title">
              <h2>Catalogue {company}</h2>
              <p className="section-subtitle">
                {filteredProductsCount} produits disponibles
              </p>
            </div>
          </div>

          <AnimatePresence>
            {isFiltersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-8 overflow-hidden"
              >
                <AdvancedFilters
                  filters={advancedFilters}
                  onFiltersChange={setAdvancedFilters}
                  productsCount={filteredProductsCount}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <ProductList
            searchQuery={debouncedSearchQuery}
            categoryFilter={selectedCategory}
            brandFilter={selectedBrand}
            products={products}
            advancedFilters={advancedFilters}
            onAdvancedFiltersChange={setAdvancedFilters}
            hideFilters={true}
          />
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Catalog;
