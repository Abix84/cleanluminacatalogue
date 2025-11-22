import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    Download,
    Upload,
    Loader2,
    FileSpreadsheet,
    FileJson,
    MoreVertical
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProducts } from "@/context/ProductContextUnified";
import { useUtilityCategories } from "@/context/UtilityCategoryContextUnified";
import { useBrands } from "@/context/BrandContextUnified";
import { exportToCSV, exportToJSON } from "@/lib/exportUtils";
import { toast } from "sonner";
import { ProductFormData } from "@/types";

export const ImportExportButtons = () => {
    const { products, addProduct } = useProducts();
    const { utilityCategories } = useUtilityCategories();
    const { brands } = useBrands();
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExportCSV = () => {
        try {
            exportToCSV(products, utilityCategories, brands, "cleanexpress_produits");
            toast.success("Export CSV réussi", {
                description: `${products.length} produits exportés au format CSV`,
            });
        } catch (error) {
            console.error("Erreur lors de l'export CSV:", error);
            toast.error("Erreur lors de l'export CSV.");
            toast.error("Erreur lors de l'export JSON.");
        }
    };

    const handleExportJSON = () => {
        try {
            const data = {
                products,
                categories: utilityCategories,
                brands,
            };
            exportToJSON(data, "cleanexpress_backup");
            toast.success("Export JSON réussi", {
                description: `Données exportées : ${products.length} produits, ${utilityCategories.length} catégories, ${brands.length} marques`,
            });
        } catch (error) {
            console.error("Erreur lors de l'export JSON:", error);
            toast.error("Erreur lors de l'export JSON.");
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const parseCSV = (text: string) => {
        const lines = text.split("\n");
        // Remove BOM if present
        if (lines[0].charCodeAt(0) === 0xFEFF) {
            lines[0] = lines[0].slice(1);
        }

        const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));

        const result = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Simple CSV parser handling quotes
            const row = [];
            let inQuotes = false;
            let currentValue = "";

            for (let j = 0; j < line.length; j++) {
                const char = line[j];

                if (char === '"') {
                    if (j + 1 < line.length && line[j + 1] === '"') {
                        // Double quote inside quotes
                        currentValue += '"';
                        j++;
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (char === ',' && !inQuotes) {
                    row.push(currentValue);
                    currentValue = "";
                } else {
                    currentValue += char;
                }
            }
            row.push(currentValue);

            if (row.length > 1) { // Avoid empty lines
                const obj: Record<string, string> = {};
                headers.forEach((header, index) => {
                    // Clean quotes from values
                    let value = row[index]?.trim() || "";
                    if (value.startsWith('"') && value.endsWith('"')) {
                        value = value.slice(1, -1);
                    }
                    // Unescape double quotes
                    value = value.replace(/""/g, '"');

                    obj[header] = value;
                });
                result.push(obj);
            }
        }
        return result;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const text = event.target?.result as string;
                const data = parseCSV(text);

                let successCount = 0;
                let errorCount = 0;

                for (const row of data) {
                    try {
                        // Map CSV columns to ProductFormData
                        // Expected headers: ID, Nom, Description, Prix, Catégorie, Marque, Entreprise, Image URL

                        const name = row["Nom"];
                        if (!name) continue; // Skip if no name

                        const price = parseFloat(row["Prix"] || "0");
                        const description = row["Description"] || "";
                        const categoryName = row["Catégorie"];
                        const brandName = row["Marque"];
                        const company = row["Entreprise"] as "CleanExpress" | "Lumina Distribution" | null;
                        const imageUrl = row["Image URL"];

                        // Find Category ID
                        const category = utilityCategories.find(
                            (c) => c.name.toLowerCase() === categoryName?.toLowerCase()
                        );

                        // Find Brand ID
                        const brand = brands.find(
                            (b) => b.name.toLowerCase() === brandName?.toLowerCase()
                        );

                        const newProduct: ProductFormData = {
                            name,
                            description,
                            price,
                            utilityCategoryId: category?.id || null,
                            brandId: brand?.id || null,
                            company: company === "CleanExpress" || company === "Lumina Distribution" ? company : null,
                            image_url: imageUrl || null,
                        };

                        await addProduct(newProduct);
                        successCount++;
                    } catch (err) {
                        console.error("Error importing row:", row, err);
                        errorCount++;
                    }
                }

                toast.success(`Import terminé`, {
                    description: `${successCount} produits ajoutés, ${errorCount} erreurs.`
                });

                // Reset input
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            } catch (error) {
                console.error("Erreur lors de l'import:", error);
                toast.error("Erreur critique lors de l'import du fichier.");
            } finally {
                setIsImporting(false);
            }
        };

        reader.readAsText(file);
    };

    return (
        <div className="flex items-center gap-2">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
            />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Exporter</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExportJSON} className="gap-2 cursor-pointer">
                        <FileJson className="h-4 w-4" />
                        Exporter en JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportCSV} className="gap-2 cursor-pointer">
                        <FileSpreadsheet className="h-4 w-4" />
                        Exporter en CSV
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Button
                variant="outline"
                size="sm"
                onClick={handleImportClick}
                disabled={isImporting}
                className="gap-2"
                title="Importer depuis CSV"
            >
                {isImporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Upload className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Importer CSV</span>
            </Button>
        </div>
    );
};
