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
import {
  localStorageProducts,
  localStorageImages,
} from "@/lib/localStorage";

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// ==========================================
// PROVIDER COMPONENT
// ==========================================

export const ProductProviderOffline = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  /**
   * Fetches all products from localStorage
   */
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await localStorageProducts.getAll();
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

  useEffect(() => {
    fetchProducts();
  }, []);

  /**
   * Adds a new product
   */
  const addProduct = async (productData: ProductFormData): Promise<void> => {
    try {
      setError(null);

      let imageUrl: string | null = null;

      // Si une image est fournie, la convertir en base64
      if (productData.image_url instanceof File) {
        imageUrl = await localStorageImages.upload(
          productData.image_url,
          "temp-id" // Sera remplacé après création du produit
        );
      }

      // Créer le produit
      const newProduct = await localStorageProducts.create({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        image_url: imageUrl,
        utilityCategoryId: productData.utilityCategoryId,
        brandId: productData.brandId,
      });

      // Mettre à jour la liste
      setProducts((prev) =>
        [...prev, newProduct].sort((a, b) => a.name.localeCompare(b.name))
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

      let imageUrl = updatedProductData.image_url;

      // Si une nouvelle image est fournie
      if (imageFile) {
        // Supprimer l'ancienne image
        if (imageUrl) {
          await localStorageImages.delete(imageUrl);
        }

        // Uploader la nouvelle
        imageUrl = await localStorageImages.upload(
          imageFile,
          updatedProductData.id
        );
      }

      // Mettre à jour le produit
      const updatedProduct = await localStorageProducts.update(
        updatedProductData.id,
        {
          ...updatedProductData,
          image_url: imageUrl,
        }
      );

      // Mettre à jour la liste
      setProducts((prev) =>
        prev
          .map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
          .sort((a, b) => a.name.localeCompare(b.name))
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

      // Supprimer l'image associée
      if (productToDelete?.image_url) {
        await localStorageImages.delete(productToDelete.image_url);
      }

      // Supprimer le produit
      await localStorageProducts.delete(productId);

      // Mettre à jour la liste
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
 * Hook to use the ProductContext (Offline Mode)
 * @throws {Error} if used outside of ProductProviderOffline
 */
export const useProductsOffline = (): ProductContextType => {
  const context = useContext(ProductContext);

  if (context === undefined) {
    throw new Error("useProductsOffline must be used within a ProductProviderOffline");
  }

  return context;
};
