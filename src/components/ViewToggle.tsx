import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ViewToggleProps {
    view: "grid" | "list";
    onViewChange: (view: "grid" | "list") => void;
}

export const ViewToggle = ({ view, onViewChange }: ViewToggleProps) => {
    return (
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/50">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewChange("grid")}
                className={cn(
                    "gap-2 h-8 transition-all",
                    view === "grid"
                        ? "bg-background shadow-sm text-foreground hover:bg-background"
                        : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                )}
                aria-label="Vue en grille"
            >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline text-xs font-medium">Grille</span>
            </Button>

            <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewChange("list")}
                className={cn(
                    "gap-2 h-8 transition-all",
                    view === "list"
                        ? "bg-background shadow-sm text-foreground hover:bg-background"
                        : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                )}
                aria-label="Vue en liste"
            >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline text-xs font-medium">Liste</span>
            </Button>
        </div>
    );
};
