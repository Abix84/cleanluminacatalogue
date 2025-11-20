import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  Product,
  ProductFormData,
  ProductContextType,
  ApiError,
} from "@/types";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

// Import des deux sources de données
import { localStorageProducts, localStorageImages } from "@/lib/localStorage";
import { supabase, IS_OFFLINE_MODE } from "@/integrations/supabase/client";

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const BUCKET_NAME = "product-images";
const isOfflineMode = IS_OFFLINE_MODE;

// ==========================================
// OFFLINE FUNCTIONS
// ==========================================

const offlineAddProduct = async (
  productData: ProductFormData,
): Promise<Product> => {
  // Create product without image first
  const tempProductData = {
    name: productData.name,
    description: productData.description,
    price: productData.price,
    image_url: null,
    utilityCategoryId: productData.utilityCategoryId,
    brandId: productData.brandId,
    company: productData.company,
  };

  const newProduct = await localStorageProducts.create(tempProductData);

  // Upload image if present (with the product ID)
  let imageUrl: string | null = null;
  if (productData.image_url instanceof File) {
    imageUrl = await localStorageImages.upload(
      productData.image_url,
      newProduct.id,
    );

    // Update product with image URL
    const updatedProduct = await localStorageProducts.update(newProduct.id, {
      ...newProduct,
      image_url: imageUrl,
    });

    return updatedProduct;
  }

  return newProduct;
};

const offlineUpdateProduct = async (
  updatedProductData: Product,
  imageFile?: File,
): Promise<Product> => {
  let imageUrl = updatedProductData.image_url;

  if (imageFile) {
    if (imageUrl) {
      await localStorageImages.delete(imageUrl);
    }
    imageUrl = await localStorageImages.upload(
      imageFile,
      updatedProductData.id,
    );
  }

  const updatedProduct = await localStorageProducts.update(
    updatedProductData.id,
    {
      ...updatedProductData,
      image_url: imageUrl,
    },
  );

  return updatedProduct;
};

const offlineDeleteProduct = async (
  productId: string,
  imageUrl?: string | null,
): Promise<void> => {
  if (imageUrl) {
    await localStorageImages.delete(imageUrl);
  }
  await localStorageProducts.delete(productId);
};

// ==========================================
// ONLINE FUNCTIONS (SUPABASE)
// ==========================================

/**
 * Nettoie le nom de fichier pour Supabase Storage
 * Remplace les espaces et caractères spéciaux par des tirets
 */
const sanitizeFileName = (fileName: string): string => {
  // Récupérer l'extension
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  // Récupérer le nom sans extension
  const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;

  // Normaliser les caractères accentués (é -> e, etc.)
  const normalized = nameWithoutExt
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // Remplacer les espaces et caractères spéciaux par des tirets
  // Garder seulement les caractères alphanumériques, tirets et underscores
  const sanitized = normalized
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-') // Remplacer les tirets multiples par un seul
    .replace(/^-|-$/g, ''); // Supprimer les tirets en début et fin

  return `${sanitized}.${extension}`;
};

const onlineAddProduct = async (
  productData: ProductFormData,
): Promise<Product> => {
  let imageUrl: string | null = null;

  if (productData.image_url instanceof File) {
    // Nettoyer le nom du fichier pour éviter les erreurs "Invalid key"
    const sanitizedOriginalName = sanitizeFileName(productData.image_url.name);
    const fileName = `${uuidv4()}-${sanitizedOriginalName}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, productData.image_url);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

    imageUrl = data.publicUrl;
  }

  const productToInsert = {
    name: productData.name,
    description: productData.description,
    price: productData.price,
    image_url: imageUrl,
    utility_category_id: productData.utilityCategoryId,
    brand_id: productData.brandId,
    company: productData.company,
  };

  const { data, error } = await supabase
    .from("products")
    .insert([productToInsert])
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    price: data.price,
    image_url: data.image_url,
    utilityCategoryId: data.utility_category_id,
    brandId: data.brand_id,
    company: data.company,
  };
};

const onlineUpdateProduct = async (
  updatedProductData: Product,
  imageFile?: File,
): Promise<Product> => {
  let imageUrl = updatedProductData.image_url;
  const oldImageUrl = updatedProductData.image_url;

  if (imageFile) {
    // Nettoyer le nom du fichier pour éviter les erreurs "Invalid key"
    const sanitizedOriginalName = sanitizeFileName(imageFile.name);
    const fileName = `${uuidv4()}-${sanitizedOriginalName}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, imageFile);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

    imageUrl = data.publicUrl;

    // Supprimer l'ancienne image si elle existe
    if (oldImageUrl) {
      try {
        await supabase.functions.invoke("delete-image", {
          body: { imageUrl: oldImageUrl },
        });
      } catch (error) {
        console.error("Failed to delete old image:", error);
      }
    }
  }

  const productToUpdate = {
    name: updatedProductData.name,
    description: updatedProductData.description,
    price: updatedProductData.price,
    image_url: imageUrl,
    utility_category_id: updatedProductData.utilityCategoryId,
    brand_id: updatedProductData.brandId,
    company: updatedProductData.company,
  };

  const { data, error } = await supabase
    .from("products")
    .update(productToUpdate)
    .eq("id", updatedProductData.id)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    price: data.price,
    image_url: data.image_url,
    utilityCategoryId: data.utility_category_id,
    brandId: data.brand_id,
    company: data.company,
  };
};

const onlineDeleteProduct = async (
  productId: string,
  imageUrl?: string | null,
): Promise<void> => {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);
  if (error) throw error;

  // Supprimer l'image si elle existe
  if (imageUrl) {
    try {
      await supabase.functions.invoke("delete-image", {
        body: { imageUrl },
      });
    } catch (error) {
      console.error("Failed to delete product image:", error);
    }
  }
};

// ==========================================
// HELPER FUNCTION FOR SYNC INITIALIZATION
// ==========================================

/**
 * Synchronously loads products from localStorage for initial state
 * This prevents the race condition where useEffect runs before data is written
 */
const getInitialProducts = (): Product[] => {
  // Always try to load from localStorage first (Cache-First Strategy)
  // if (!isOfflineMode) return []; // REMOVED: We want cache even in online mode

  try {
    const stored = localStorage.getItem('cleanexpress_products');
    if (!stored) return [];

    const products = JSON.parse(stored) as Product[];
    return products.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error reading initial products from localStorage:', error);
    return [];
  }
};

// ==========================================
// PROVIDER COMPONENT

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  // Initialize with data from localStorage if offline mode
  const [products, setProducts] = useState<Product[]>(() => getInitialProducts());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  /**
   * Fetches all products (offline or online)
   */
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      let data: Product[];

      if (isOfflineMode) {
        // Mode Offline - localStorage
        data = await localStorageProducts.getAll();
      } else {
        // Mode Online - Supabase
        const { data: supabaseData, error: fetchError } = await supabase
          .from("products")
          .select("*")
          .order("name");

        if (fetchError) throw fetchError;

        data = (supabaseData || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image_url: item.image_url,
          utility_category_id: item.utility_category_id,
          brand_id: item.brand_id,
          company: item.company,
        }));
      }

      setProducts(data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors de la récupération des produits.";
      const apiError: ApiError = {
        message: errorMessage,
        details: err,
      };

      setError(apiError);
      toast.error(errorMessage);
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les produits au montage et écouter les mises à jour
  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }

    const handleDataSynced = () => {
      fetchProducts();
    };

    window.addEventListener('data-synced', handleDataSynced);

    return () => {
      window.removeEventListener('data-synced', handleDataSynced);
    };
  }, []);

  /**
   * Adds a new product
   */
  const addProduct = async (productData: ProductFormData): Promise<void> => {
    try {
      setError(null);

      const newProduct = isOfflineMode
        ? await offlineAddProduct(productData)
        : await onlineAddProduct(productData);

      setProducts((prev) =>
        [...prev, newProduct].sort((a, b) => a.name.localeCompare(b.name)),
      );

      toast.success("Produit ajouté avec succès !");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors de l'ajout du produit.";
      const apiError: ApiError = {
        message: errorMessage,
        details: err,
      };

      setError(apiError);
      toast.error(errorMessage);
      console.error("Error adding product:", err);
      throw err;
    }
  };

  /**
   * Updates an existing product
   */
  const updateProduct = async (
    updatedProductData: Product,
    imageFile?: File,
  ): Promise<void> => {
    try {
      setError(null);

      const updatedProduct = isOfflineMode
        ? await offlineUpdateProduct(updatedProductData, imageFile)
        : await onlineUpdateProduct(updatedProductData, imageFile);

      setProducts((prev) =>
        prev
          .map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );

      toast.success("Produit mis à jour avec succès !");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors de la mise à jour du produit.";
      const apiError: ApiError = {
        message: errorMessage,
        details: err,
      };

      setError(apiError);
      toast.error(errorMessage);
      console.error("Error updating product:", err);
      throw err;
    }
  };

  /**
   * Deletes a product
   */
  const deleteProduct = async (productId: string): Promise<void> => {
    try {
      setError(null);

      const productToDelete = products.find((p) => p.id === productId);

      if (isOfflineMode) {
        await offlineDeleteProduct(productId, productToDelete?.image_url);
      } else {
        await onlineDeleteProduct(productId, productToDelete?.image_url);
      }

      setProducts((prev) => prev.filter((p) => p.id !== productId));

      toast.success("Produit supprimé avec succès !");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors de la suppression du produit.";
      const apiError: ApiError = {
        message: errorMessage,
        details: err,
      };

      setError(apiError);
      toast.error(errorMessage);
      console.error("Error deleting product:", err);
      throw err;
    }
  };

  /**
   * Gets a product by its ID
   */
  const getProductById = (productId: string): Product | undefined => {
    return products.find((p) => p.id === productId);
  };

  const value: ProductContextType = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    loading,
    error,
  };

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
};

// ==========================================
// HOOK
// ==========================================

/**
 * Hook to use the ProductContext (works in both offline and online modes)
 * @throws {Error} if used outside of ProductProvider
 */
export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);

  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }

  return context;
};

// Export mode info
export const PRODUCT_MODE = isOfflineMode ? "offline" : "online";
