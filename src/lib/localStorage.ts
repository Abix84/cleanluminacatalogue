// ⚠️ Ce fichier n'est plus utilisé pour la gestion des produits, marques ou catégories.
// Toute la logique catalogue est désormais gérée en ligne via Supabase :
//   - ProductContextUnified (produits)
//   - BrandContext (marques)
//   - UtilityCategoryContext (catégories)
// Ne modifiez plus ce fichier pour ces entités.

import { v4 as uuidv4 } from "uuid";
import { Product, Brand, UtilityCategory } from "@/types";

// ==========================================
// CONFIGURATION
// ==========================================

const STORAGE_KEYS = {
  PRODUCTS: "cleanexpress_products",
  BRANDS: "cleanexpress_brands",
  CATEGORIES: "cleanexpress_categories",
  IMAGES: "cleanexpress_images",
  VERSION: "cleanexpress_version",
};

const CURRENT_VERSION = "1.1.0";

// Délai de simulation (pour simuler une vraie API)
const SIMULATE_DELAY = 100; // ms

// ==========================================
// TYPES
// ==========================================

interface StorageImage {
  id: string;
  productId: string;
  dataUrl: string; // Base64 data URL
  size: number;
  type: string;
  createdAt: string;
}

interface StorageData {
  products: Product[];
  brands: Brand[];
  categories: UtilityCategory[];
  images: StorageImage[];
  version: string;
  lastUpdate: string;
}

// ==========================================
// HELPERS
// ==========================================

/**
 * Simule un délai asynchrone (comme une vraie API)
 */
const delay = (ms: number = SIMULATE_DELAY): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Récupère les données du localStorage
 */
const getData = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

/**
 * Sauvegarde les données dans localStorage
 */
const setData = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
};

/**
 * Convertit un File en base64 data URL
 */
const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Génère des données de démonstration
 */
const generateDemoData = (): void => {
  const demoCategories: UtilityCategory[] = [
    { id: uuidv4(), name: "Lessives liquides et en poudre", color: "#3b82f6" },
    { id: uuidv4(), name: "Assouplissants textiles", color: "#8b5cf6" },
    { id: uuidv4(), name: "Nettoyants multi-usages", color: "#10b981" },
    { id: uuidv4(), name: "Nettoyants sols et surfaces", color: "#14b8a6" },
    { id: uuidv4(), name: "Nettoyants vitres", color: "#06b6d4" },
    { id: uuidv4(), name: "Dégraissants ménagers", color: "#f59e0b" },
    { id: uuidv4(), name: "Produits anti-calcaire", color: "#f97316" },
    { id: uuidv4(), name: "Produits désinfectants", color: "#ef4444" },
    {
      id: uuidv4(),
      name: "Parfums d'ambiance / désodorisants",
      color: "#ec4899",
    },
    { id: uuidv4(), name: "Liquides vaisselle manuelle", color: "#6366f1" },
    { id: uuidv4(), name: "Détergents lave-vaisselle", color: "#8b5cf6" },
    { id: uuidv4(), name: "Rince-éclat / sels régénérants", color: "#a855f7" },
    {
      id: uuidv4(),
      name: "Détergents concentrés professionnels",
      color: "#d946ef",
    },
    {
      id: uuidv4(),
      name: "Nettoyants WC (gel, bloc, désinfectant)",
      color: "#2563eb",
    },
    { id: uuidv4(), name: "Désodorisants WC", color: "#7c3aed" },
    { id: uuidv4(), name: "Déboucheurs canalisation", color: "#db2777" },
    { id: uuidv4(), name: "Nettoyants antibactériens", color: "#059669" },
    { id: uuidv4(), name: "Produits anti-moisissures", color: "#0891b2" },
    { id: uuidv4(), name: "Détergents acides / détartrants", color: "#dc2626" },
    { id: uuidv4(), name: "Dégraissants industriels", color: "#ea580c" },
    { id: uuidv4(), name: "Détergents concentrés pour sols", color: "#65a30d" },
    { id: uuidv4(), name: "Désinfectants professionnels", color: "#16a34a" },
    {
      id: uuidv4(),
      name: "Nettoyants pour vitres / inox / aluminium",
      color: "#0284c7",
    },
    { id: uuidv4(), name: "Savons et gels pour les mains", color: "#7c2d12" },
    {
      id: uuidv4(),
      name: "Produits pour lavage automatique",
      color: "#4c1d95",
    },
    { id: uuidv4(), name: "Shampooings auto", color: "#1e40af" },
    { id: uuidv4(), name: "Nettoyants jantes et pneus", color: "#1e3a8a" },
    { id: uuidv4(), name: "Cires et polish", color: "#701a75" },
    { id: uuidv4(), name: "Nettoyants vitres auto", color: "#0369a1" },
    { id: uuidv4(), name: "Désodorisants auto", color: "#be123c" },
    {
      id: uuidv4(),
      name: "Crèmes et lotions pour les mains",
      color: "#9f1239",
    },
    {
      id: uuidv4(),
      name: "Lingettes nettoyantes / désinfectantes",
      color: "#4338ca",
    },
    { id: uuidv4(), name: "Éponges et lavettes", color: "#15803d" },
    { id: uuidv4(), name: "Balais, serpillières, seaux", color: "#166534" },
    { id: uuidv4(), name: "Brosses, raclettes", color: "#1d4ed8" },
    { id: uuidv4(), name: "Gants de ménage", color: "#be185d" },
    { id: uuidv4(), name: "Seaux essoreurs", color: "#0e7490" },
    { id: uuidv4(), name: "Microfibres", color: "#0d9488" },
    { id: uuidv4(), name: "Chiffons et torchons", color: "#ca8a04" },
    { id: uuidv4(), name: "Pulvérisateurs / vaporisateurs", color: "#c026d3" },
    {
      id: uuidv4(),
      name: "Parfums d'ambiance (liquides, aérosols, diffuseurs)",
      color: "#e11d48",
    },
    { id: uuidv4(), name: "Insecticides / répulsifs", color: "#b91c1c" },
    { id: uuidv4(), name: "Produits anti-odeurs", color: "#7e22ce" },
    {
      id: uuidv4(),
      name: "Produits de désinfection des mains",
      color: "#047857",
    },
    {
      id: uuidv4(),
      name: "Nettoyants inox / aluminium / vitrocéramique",
      color: "#0891b2",
    },
    {
      id: uuidv4(),
      name: "Produits pour marbre et carrelage",
      color: "#0f766e",
    },
    { id: uuidv4(), name: "Bidons (1L, 5L, 20L, 30L, etc.)", color: "#475569" },
    { id: uuidv4(), name: "Sacs poubelles (tous volumes)", color: "#64748b" },
    { id: uuidv4(), name: "Flacons vides et pulvérisateurs", color: "#78716c" },
    { id: uuidv4(), name: "Seaux et fûts industriels", color: "#57534e" },
    { id: uuidv4(), name: "Bouteilles recyclables", color: "#52525b" },
  ];

  const demoBrands: Brand[] = [
    { id: uuidv4(), name: "AMBI FRESH" },
    { id: uuidv4(), name: "ATLAS" },
    { id: uuidv4(), name: "Clean Bag" },
    { id: uuidv4(), name: "Dar Al Alwan" },
    { id: uuidv4(), name: "Decoland" },
    { id: uuidv4(), name: "Délícia" },
    { id: uuidv4(), name: "Extra Clean" },
    { id: uuidv4(), name: "Fabro" },
    { id: uuidv4(), name: "Fibrax" },
    { id: uuidv4(), name: "Firla" },
    { id: uuidv4(), name: "Force Xpress" },
    { id: uuidv4(), name: "Forza Clean" },
    { id: uuidv4(), name: "Frams" },
    { id: uuidv4(), name: "GoldenDam" },
    { id: uuidv4(), name: "Hachfa" },
    { id: uuidv4(), name: "Isabel" },
    { id: uuidv4(), name: "Louganet" },
    { id: uuidv4(), name: "Luxabrosse" },
    { id: uuidv4(), name: "MAMA menage" },
    { id: uuidv4(), name: "Medinet" },
    { id: uuidv4(), name: "Netsol" },
    { id: uuidv4(), name: "oline" },
    { id: uuidv4(), name: "Oriber" },
    { id: uuidv4(), name: "PALC" },
    { id: uuidv4(), name: "Photolab" },
    { id: uuidv4(), name: "SpeedFire" },
    { id: uuidv4(), name: "Swif" },
    { id: uuidv4(), name: "TECMECA" },
    { id: uuidv4(), name: "Toma Net" },
    { id: uuidv4(), name: "Doril" },
    { id: uuidv4(), name: "Doriflor" },
    { id: uuidv4(), name: "Odoris" },
    { id: uuidv4(), name: "Palc" },
    { id: uuidv4(), name: "Lubrex" },
  ];

  const demoProducts: Product[] = [
    {
      id: uuidv4(),
      name: "Lessive liquide concentrée",
      description: "Lessive haute performance pour tous types de textiles",
      price: 12.99,
      image_url: null,
      utilityCategoryId: demoCategories[0].id,
      brandId: demoBrands[0].id,
    },
    {
      id: uuidv4(),
      name: "Assouplissant parfum frais",
      description: "Adoucit et parfume votre linge",
      price: 8.49,
      image_url: null,
      utilityCategoryId: demoCategories[1].id,
      brandId: demoBrands[1].id,
    },
    {
      id: uuidv4(),
      name: "Nettoyant Multi-Surfaces",
      description: "Nettoyant efficace pour toutes les surfaces",
      price: 6.99,
      image_url: null,
      utilityCategoryId: demoCategories[2].id,
      brandId: demoBrands[2].id,
    },
    {
      id: uuidv4(),
      name: "Désinfectant professionnel",
      description: "Élimine 99.9% des bactéries",
      price: 15.49,
      image_url: null,
      utilityCategoryId: demoCategories[7].id,
      brandId: demoBrands[3].id,
    },
    {
      id: uuidv4(),
      name: "Détartrant WC gel",
      description: "Élimine le calcaire rapidement",
      price: 9.99,
      image_url: null,
      utilityCategoryId: demoCategories[13].id,
      brandId: demoBrands[4].id,
    },
  ];

  setData(STORAGE_KEYS.CATEGORIES, demoCategories);
  setData(STORAGE_KEYS.BRANDS, demoBrands);
  setData(STORAGE_KEYS.PRODUCTS, demoProducts);
  setData(STORAGE_KEYS.IMAGES, []);
  setData(STORAGE_KEYS.VERSION, CURRENT_VERSION);
};

/**
 * Initialise le stockage local
 */
export const initializeStorage = (): void => {
  const version = getData(STORAGE_KEYS.VERSION, null);

  if (!version) {
    console.log(
      "🎉 Initialisation du stockage local avec données de démonstration",
    );
    generateDemoData();
  } else if (version !== CURRENT_VERSION) {
    console.log(
      `🔄 Mise à jour des données de ${version} vers ${CURRENT_VERSION}`,
    );
    generateDemoData();
  } else {
    console.log("✅ Stockage local déjà initialisé (version:", version, ")");
  }
};

// ==========================================
// API PRODUCTS
// ==========================================

export const localStorageProducts = {
  /**
   * Récupère tous les produits
   */
  async getAll(): Promise<Product[]> {
    await delay();
    return getData<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  },

  /**
   * Récupère un produit par ID
   */
  async getById(id: string): Promise<Product | null> {
    await delay();
    const products = getData<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    return products.find((p) => p.id === id) || null;
  },

  /**
   * Ajoute un nouveau produit
   */
  async create(productData: Omit<Product, "id">): Promise<Product> {
    await delay();

    const newProduct: Product = {
      ...productData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const products = getData<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    products.push(newProduct);
    setData(STORAGE_KEYS.PRODUCTS, products);

    return newProduct;
  },

  /**
   * Met à jour un produit
   */
  async update(id: string, productData: Partial<Product>): Promise<Product> {
    await delay();

    const products = getData<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new Error(`Product with id ${id} not found`);
    }

    products[index] = {
      ...products[index],
      ...productData,
      id, // S'assurer que l'ID ne change pas
      updatedAt: new Date().toISOString(),
    };

    setData(STORAGE_KEYS.PRODUCTS, products);
    return products[index];
  },

  /**
   * Supprime un produit
   */
  async delete(id: string): Promise<void> {
    await delay();

    // Supprimer le produit
    const products = getData<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const filtered = products.filter((p) => p.id !== id);
    setData(STORAGE_KEYS.PRODUCTS, filtered);

    // Supprimer les images associées
    const images = getData<StorageImage[]>(STORAGE_KEYS.IMAGES, []);
    const filteredImages = images.filter((img) => img.productId !== id);
    setData(STORAGE_KEYS.IMAGES, filteredImages);
  },
};

// ==========================================
// API BRANDS
// ==========================================

export const localStorageBrands = {
  /**
   * Récupère toutes les marques
   */
  async getAll(): Promise<Brand[]> {
    await delay();
    return getData<Brand[]>(STORAGE_KEYS.BRANDS, []);
  },

  /**
   * Récupère une marque par ID
   */
  async getById(id: string): Promise<Brand | null> {
    await delay();
    const brands = getData<Brand[]>(STORAGE_KEYS.BRANDS, []);
    return brands.find((b) => b.id === id) || null;
  },

  /**
   * Ajoute une nouvelle marque
   */
  async create(brandData: Omit<Brand, "id">): Promise<Brand> {
    await delay();

    const newBrand: Brand = {
      ...brandData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const brands = getData<Brand[]>(STORAGE_KEYS.BRANDS, []);
    brands.push(newBrand);
    setData(STORAGE_KEYS.BRANDS, brands);

    return newBrand;
  },

  /**
   * Met à jour une marque
   */
  async update(id: string, brandData: Partial<Brand>): Promise<Brand> {
    await delay();

    const brands = getData<Brand[]>(STORAGE_KEYS.BRANDS, []);
    const index = brands.findIndex((b) => b.id === id);

    if (index === -1) {
      throw new Error(`Brand with id ${id} not found`);
    }

    brands[index] = {
      ...brands[index],
      ...brandData,
      id,
      updatedAt: new Date().toISOString(),
    };

    setData(STORAGE_KEYS.BRANDS, brands);
    return brands[index];
  },

  /**
   * Supprime une marque
   */
  async delete(id: string): Promise<void> {
    await delay();

    const brands = getData<Brand[]>(STORAGE_KEYS.BRANDS, []);
    const filtered = brands.filter((b) => b.id !== id);
    setData(STORAGE_KEYS.BRANDS, filtered);
  },
};

// ==========================================
// API CATEGORIES
// ==========================================

export const localStorageCategories = {
  /**
   * Récupère toutes les catégories
   */
  async getAll(): Promise<UtilityCategory[]> {
    await delay();
    return getData<UtilityCategory[]>(STORAGE_KEYS.CATEGORIES, []);
  },

  /**
   * Récupère une catégorie par ID
   */
  async getById(id: string): Promise<UtilityCategory | null> {
    await delay();
    const categories = getData<UtilityCategory[]>(STORAGE_KEYS.CATEGORIES, []);
    return categories.find((c) => c.id === id) || null;
  },

  /**
   * Ajoute une nouvelle catégorie
   */
  async create(
    categoryData: Omit<UtilityCategory, "id">,
  ): Promise<UtilityCategory> {
    await delay();

    const newCategory: UtilityCategory = {
      ...categoryData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const categories = getData<UtilityCategory[]>(STORAGE_KEYS.CATEGORIES, []);
    categories.push(newCategory);
    setData(STORAGE_KEYS.CATEGORIES, categories);

    return newCategory;
  },

  /**
   * Met à jour une catégorie
   */
  async update(
    id: string,
    categoryData: Partial<UtilityCategory>,
  ): Promise<UtilityCategory> {
    await delay();

    const categories = getData<UtilityCategory[]>(STORAGE_KEYS.CATEGORIES, []);
    const index = categories.findIndex((c) => c.id === id);

    if (index === -1) {
      throw new Error(`Category with id ${id} not found`);
    }

    categories[index] = {
      ...categories[index],
      ...categoryData,
      id,
      updatedAt: new Date().toISOString(),
    };

    setData(STORAGE_KEYS.CATEGORIES, categories);
    return categories[index];
  },

  /**
   * Supprime une catégorie
   */
  async delete(id: string): Promise<void> {
    await delay();

    const categories = getData<UtilityCategory[]>(STORAGE_KEYS.CATEGORIES, []);
    const filtered = categories.filter((c) => c.id !== id);
    setData(STORAGE_KEYS.CATEGORIES, filtered);
  },
};

// ==========================================
// API IMAGES (Stockage en Base64)
// ==========================================

export const localStorageImages = {
  /**
   * Upload une image (convertit en base64)
   */
  async upload(file: File, productId: string): Promise<string> {
    await delay(200); // Simuler un upload plus long

    const dataUrl = await fileToDataUrl(file);

    const image: StorageImage = {
      id: uuidv4(),
      productId,
      dataUrl,
      size: file.size,
      type: file.type,
      createdAt: new Date().toISOString(),
    };

    const images = getData<StorageImage[]>(STORAGE_KEYS.IMAGES, []);
    images.push(image);
    setData(STORAGE_KEYS.IMAGES, images);

    return dataUrl; // Retourne la data URL pour utilisation immédiate
  },

  /**
   * Récupère une image par URL
   */
  async getByUrl(dataUrl: string): Promise<StorageImage | null> {
    await delay();
    const images = getData<StorageImage[]>(STORAGE_KEYS.IMAGES, []);
    return images.find((img) => img.dataUrl === dataUrl) || null;
  },

  /**
   * Supprime une image
   */
  async delete(dataUrl: string): Promise<void> {
    await delay();
    const images = getData<StorageImage[]>(STORAGE_KEYS.IMAGES, []);
    const filtered = images.filter((img) => img.dataUrl !== dataUrl);
    setData(STORAGE_KEYS.IMAGES, filtered);
  },

  /**
   * Récupère toutes les images d'un produit
   */
  async getByProductId(productId: string): Promise<StorageImage[]> {
    await delay();
    const images = getData<StorageImage[]>(STORAGE_KEYS.IMAGES, []);
    return images.filter((img) => img.productId === productId);
  },
};

// ==========================================
// UTILITAIRES
// ==========================================

/**
 * Exporte toutes les données
 */
export const exportData = (): StorageData => {
  return {
    products: getData<Product[]>(STORAGE_KEYS.PRODUCTS, []),
    brands: getData<Brand[]>(STORAGE_KEYS.BRANDS, []),
    categories: getData<UtilityCategory[]>(STORAGE_KEYS.CATEGORIES, []),
    images: getData<StorageImage[]>(STORAGE_KEYS.IMAGES, []),
    version: CURRENT_VERSION,
    lastUpdate: new Date().toISOString(),
  };
};

/**
 * Importe des données
 */
export const importData = (data: StorageData): void => {
  setData(STORAGE_KEYS.PRODUCTS, data.products);
  setData(STORAGE_KEYS.BRANDS, data.brands);
  setData(STORAGE_KEYS.CATEGORIES, data.categories);
  setData(STORAGE_KEYS.IMAGES, data.images);
  setData(STORAGE_KEYS.VERSION, data.version);
};

/**
 * Réinitialise toutes les données
 */
export const resetData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
  localStorage.removeItem(STORAGE_KEYS.BRANDS);
  localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
  localStorage.removeItem(STORAGE_KEYS.IMAGES);
  localStorage.removeItem(STORAGE_KEYS.VERSION);
  generateDemoData();
};

/**
 * Obtient les statistiques de stockage
 */
export const getStorageStats = () => {
  const products = getData<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  const brands = getData<Brand[]>(STORAGE_KEYS.BRANDS, []);
  const categories = getData<UtilityCategory[]>(STORAGE_KEYS.CATEGORIES, []);
  const images = getData<StorageImage[]>(STORAGE_KEYS.IMAGES, []);

  const totalSize = new Blob([JSON.stringify(exportData())]).size;

  return {
    products: products.length,
    brands: brands.length,
    categories: categories.length,
    images: images.length,
    totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
    version: CURRENT_VERSION,
  };
};
