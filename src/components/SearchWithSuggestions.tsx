import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { useProducts } from "@/context/ProductContext";
import { useUtilityCategories } from "@/context/UtilityCategoryContext";
import { useBrands } from "@/context/BrandContext";
import { cn } from "@/lib/utils";

interface SearchWithSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
  showHistory?: boolean;
  showSuggestions?: boolean;
}

/**
 * Composant de recherche avec suggestions et historique
 */
export const SearchWithSuggestions = ({
  value,
  onChange,
  onSearch,
  placeholder = "Rechercher un produit, une marque...",
  className,
  showHistory = true,
  showSuggestions = true,
}: SearchWithSuggestionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { history, addToHistory, removeFromHistory, clearHistory, getSuggestions } =
    useSearchHistory();
  const { products } = useProducts();
  const { utilityCategories } = useUtilityCategories();
  const { brands } = useBrands();

  // Générer des suggestions basées sur les produits, catégories et marques
  const generateSuggestions = useCallback(
    (query: string): string[] => {
      if (!query.trim() || !showSuggestions) return [];

      const queryLower = query.trim().toLowerCase();
      const results: string[] = [];

      // Suggestions depuis les produits
      products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(queryLower) ||
            p.description?.toLowerCase().includes(queryLower)
        )
        .slice(0, 3)
        .forEach((p) => {
          if (!results.includes(p.name)) results.push(p.name);
        });

      // Suggestions depuis les catégories
      utilityCategories
        .filter((c) => c.name.toLowerCase().includes(queryLower))
        .slice(0, 2)
        .forEach((c) => {
          if (!results.includes(c.name)) results.push(c.name);
        });

      // Suggestions depuis les marques
      brands
        .filter((b) => b.name.toLowerCase().includes(queryLower))
        .slice(0, 2)
        .forEach((b) => {
          if (!results.includes(b.name)) results.push(b.name);
        });

      return results.slice(0, 5);
    },
    [products, utilityCategories, brands, showSuggestions]
  );

  // Mettre à jour les suggestions quand la query change
  useEffect(() => {
    if (value && isOpen) {
      const historySuggestions = getSuggestions(value, 3);
      const productSuggestions = generateSuggestions(value);
      setSuggestions([...new Set([...historySuggestions, ...productSuggestions])]);
    } else {
      setSuggestions([]);
    }
  }, [value, isOpen, getSuggestions, generateSuggestions]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    addToHistory(selectedValue);
    setIsOpen(false);
    if (onSearch) {
      onSearch(selectedValue);
    }
    inputRef.current?.blur();
  };

  const handleSearch = () => {
    if (value.trim()) {
      addToHistory(value);
      if (onSearch) {
        onSearch(value);
      }
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const hasResults = suggestions.length > 0 || (showHistory && history.length > 0);

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(hasResults)}
          onKeyDown={handleKeyDown}
          className="pl-10 sm:pl-12 pr-10 sm:pr-12 h-12 sm:h-14 text-sm sm:text-base rounded-xl sm:rounded-2xl border-2 focus:border-primary shadow-sm"
        />
        {value && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
            onClick={() => {
              onChange("");
              setIsOpen(false);
              inputRef.current?.focus();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && hasResults && (
        <div className="absolute z-50 w-full mt-2 bg-popover border rounded-lg shadow-lg max-h-[60vh] sm:max-h-[400px] overflow-auto">
          <div className="p-2 space-y-1">
            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" />
                  Suggestions
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`suggestion-${index}`}
                    className="w-full text-left px-2 py-2 rounded-md hover:bg-accent transition-colors text-sm flex items-center justify-between"
                    onClick={() => handleSelect(suggestion)}
                  >
                    <span className="flex items-center gap-2">
                      <Search className="h-3 w-3 text-muted-foreground" />
                      {suggestion}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Historique */}
            {showHistory && history.length > 0 && (
              <div>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    Recherches récentes
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={clearHistory}
                  >
                    Effacer
                  </Button>
                </div>
                {history
                  .filter((item) => !value || item.includes(value.toLowerCase()))
                  .slice(0, 5)
                  .map((item, index) => (
                    <div
                      key={`history-${index}`}
                      className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-accent group"
                    >
                      <button
                        className="flex-1 text-left text-sm flex items-center gap-2"
                        onClick={() => handleSelect(item)}
                      >
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {item}
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromHistory(item);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

