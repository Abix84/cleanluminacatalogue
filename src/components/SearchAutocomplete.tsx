import { useState, useMemo, useCallback, useRef } from "react";
import { Search, Clock, X, Trash2 } from "lucide-react";
import { Product } from "@/types";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useBrands } from "@/context/BrandContextUnified";

interface SearchAutocompleteProps {
    value: string;
    onValueChange: (value: string) => void;
    products: Product[];
    className?: string;
}

export const SearchAutocomplete = ({
    value,
    onValueChange,
    products,
    className,
}: SearchAutocompleteProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const { history, addToHistory, removeFromHistory, clearHistory } =
        useSearchHistory();
    const { getBrandById } = useBrands();

    // Get search suggestions based on input
    const suggestions = useMemo(() => {
        if (!value.trim()) return [];

        const searchTerm = value.toLowerCase();
        const matched = products.filter((product) => {
            const nameMatch = product.name.toLowerCase().includes(searchTerm);
            const brand = product.brandId ? getBrandById(product.brandId) : null;
            const brandMatch = brand?.name.toLowerCase().includes(searchTerm);
            return nameMatch || brandMatch;
        });

        // Sort by relevance (exact match first, then partial)
        matched.sort((a, b) => {
            const aName = a.name.toLowerCase();
            const bName = b.name.toLowerCase();
            const aStarts = aName.startsWith(searchTerm);
            const bStarts = bName.startsWith(searchTerm);

            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            return 0;
        });

        return matched.slice(0, 5);
    }, [value, products, getBrandById]);

    // Show dropdown when there are suggestions or history
    const shouldShowDropdown =
        isOpen && (suggestions.length > 0 || history.length > 0);

    const handleSelectSuggestion = useCallback(
        (productName: string) => {
            onValueChange(productName);
            addToHistory(productName);
            setIsOpen(false);
            inputRef.current?.blur();
        },
        [onValueChange, addToHistory]
    );

    const handleSelectHistory = useCallback(
        (query: string) => {
            onValueChange(query);
            setIsOpen(false);
            inputRef.current?.focus();
        },
        [onValueChange]
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onValueChange(e.target.value);
            setHighlightedIndex(-1);
            if (!isOpen) setIsOpen(true);
        },
        [onValueChange, isOpen]
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            const totalItems = history.length + suggestions.length;

            if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlightedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (highlightedIndex >= 0) {
                    if (highlightedIndex < history.length) {
                        // Select from history
                        handleSelectHistory(history[highlightedIndex]);
                    } else {
                        // Select from suggestions
                        const suggestionIndex = highlightedIndex - history.length;
                        handleSelectSuggestion(suggestions[suggestionIndex].name);
                    }
                } else if (value.trim()) {
                    // Just add current value to history
                    addToHistory(value.trim());
                    setIsOpen(false);
                }
            } else if (e.key === "Escape") {
                setIsOpen(false);
                inputRef.current?.blur();
            }
        },
        [
            history,
            suggestions,
            highlightedIndex,
            value,
            handleSelectHistory,
            handleSelectSuggestion,
            addToHistory,
        ]
    );

    return (
        <Popover open={shouldShowDropdown} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <div className={cn("relative", className)}>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        ref={inputRef}
                        type="text"
                        placeholder="Rechercher un produit..."
                        value={value}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsOpen(true)}
                        className="pl-9 pr-9"
                    />
                    {value && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                            onClick={() => {
                                onValueChange("");
                                setHighlightedIndex(-1);
                                inputRef.current?.focus();
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </PopoverTrigger>

            <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0"
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <div className="max-h-[400px] overflow-y-auto">
                    {/* Recent Searches */}
                    {history.length > 0 && (
                        <div className="p-2 border-b">
                            <div className="flex items-center justify-between px-2 py-1 mb-1">
                                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Recherches récentes
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearHistory}
                                    className="h-6 text-xs px-2 hover:text-destructive"
                                >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Effacer
                                </Button>
                            </div>

                            {history.map((query, index) => (
                                <div
                                    key={`history-${index}`}
                                    className={cn(
                                        "flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors",
                                        highlightedIndex === index
                                            ? "bg-accent text-accent-foreground"
                                            : "hover:bg-accent/50"
                                    )}
                                    onClick={() => handleSelectHistory(query)}
                                >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                        <span className="text-sm truncate">{query}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 flex-shrink-0 hover:text-destructive"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFromHistory(query);
                                        }}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                        <div className="p-2">
                            <div className="px-2 py-1 mb-1">
                                <span className="text-xs font-semibold text-muted-foreground">
                                    💡 Suggestions ({suggestions.length})
                                </span>
                            </div>

                            {suggestions.map((product, index) => {
                                const actualIndex = history.length + index;
                                const brand = product.brandId
                                    ? getBrandById(product.brandId)
                                    : null;

                                return (
                                    <div
                                        key={product.id}
                                        className={cn(
                                            "px-3 py-2 rounded-md cursor-pointer transition-colors",
                                            highlightedIndex === actualIndex
                                                ? "bg-accent text-accent-foreground"
                                                : "hover:bg-accent/50"
                                        )}
                                        onClick={() => handleSelectSuggestion(product.name)}
                                    >
                                        <div className="flex items-start gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {product.name}
                                                </p>
                                                {brand && (
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {brand.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* No results */}
                    {value.trim() &&
                        suggestions.length === 0 &&
                        history.length === 0 && (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                Aucune suggestion trouvée
                            </div>
                        )}
                </div>
            </PopoverContent>
        </Popover>
    );
};
