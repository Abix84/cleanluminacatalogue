import { Product, UtilityCategory, Brand } from "@/types";

/**
 * Exporte les produits en CSV
 */
export const exportToCSV = (
  products: Product[],
  categories: UtilityCategory[],
  brands: Brand[],
  filename: string = "produits_export"
): void => {
  // Créer les en-têtes CSV
  const headers = [
    "ID",
    "Nom",
    "Description",
    "Prix",
    "Catégorie",
    "Marque",
    "Entreprise",
    "Image URL",
    "Date de création",
    "Date de mise à jour",
  ];

  // Créer un map pour les catégories et marques
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const brandMap = new Map(brands.map((b) => [b.id, b.name]));

  // Créer les lignes CSV
  const rows = products.map((product) => {
    const category = product.utilityCategoryId
      ? categoryMap.get(product.utilityCategoryId) || ""
      : "";
    const brand = product.brandId
      ? brandMap.get(product.brandId) || ""
      : "";

    return [
      product.id,
      `"${product.name.replace(/"/g, '""')}"`, // Échapper les guillemets
      `"${(product.description || "").replace(/"/g, '""')}"`,
      product.price.toString(),
      `"${category}"`,
      `"${brand}"`,
      product.company || "",
      product.image_url || "",
      product.createdAt || "",
      product.updatedAt || "",
    ].join(",");
  });

  // Créer le contenu CSV complet
  const csvContent = [headers.join(","), ...rows].join("\n");

  // Créer un BOM pour UTF-8 (support Excel)
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

  // Télécharger le fichier
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Exporte les produits en JSON formaté
 */
export const exportToJSON = (
  data: {
    products: Product[];
    categories: UtilityCategory[];
    brands: Brand[];
  },
  filename: string = "produits_export"
): void => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Formate un produit pour l'export PDF (texte)
 */
export const formatProductForExport = (
  product: Product,
  category?: UtilityCategory,
  brand?: Brand
): string => {
  const lines = [
    `Nom: ${product.name}`,
    brand ? `Marque: ${brand.name}` : "",
    category ? `Catégorie: ${category.name}` : "",
    product.description ? `Description: ${product.description}` : "",
    `Prix: ${product.price.toFixed(2)} €`,
    product.company ? `Entreprise: ${product.company}` : "",
    "",
    "---",
    "",
  ];
  return lines.filter(Boolean).join("\n");
};

/**
 * Génère un texte formaté pour tous les produits (pour PDF simple)
 */
export const generateProductsText = (
  products: Product[],
  categories: UtilityCategory[],
  brands: Brand[]
): string => {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const brandMap = new Map(brands.map((b) => [b.id, b]));

  const header = `CATALOGUE DE PRODUITS\n${"=".repeat(50)}\n\n`;
  const productTexts = products.map((product) => {
    const category = product.utilityCategoryId
      ? categoryMap.get(product.utilityCategoryId)
      : undefined;
    const brand = product.brandId ? brandMap.get(product.brandId) : undefined;
    return formatProductForExport(product, category, brand);
  });

  return header + productTexts.join("");
};

