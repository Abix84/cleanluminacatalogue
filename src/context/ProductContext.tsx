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
import { localStorageProducts, localStorageImages } from "@/lib/localStorage";
import { toast } from "sonner";

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// ==========================================
// PROVIDER COMPONENT
// ==========================================

export const ProductProvider = ({ children }: { children: ReactNode }) => {
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
   * Adds a new product to localStorage
   */
  const addProduct = async (productData: ProductFormData): Promise<void> => {
    try {
      setError(null);

      let imageUrl: string | null = null;

      // Handle image upload if present
      if (productData.image_url && productData.image_url instanceof File) {
        const file = productData.image_url;
        // Create a temporary product without image first
        const tempProductData = {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          image_url: null,
          utilityCategoryId: productData.utilityCategoryId,
          brandId: productData.brandId,
        };

        const newProduct = await localStorageProducts.create(tempProductData);

        // Now upload the image with the product ID
        imageUrl = await localStorageImages.upload(file, newProduct.id);

        // Update the product with the image URL
        const updatedProduct = await localStorageProducts.update(
          newProduct.id,
          {
            ...newProduct,
            image_url: imageUrl,
          },
        );

        // Add the updated product (with image) to state
        setProducts((prev) =>
          [...prev, updatedProduct].sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        );
        toast.success("Produit ajouté avec succès !");
      } else {
        // No image, create product directly
        const newProduct = await localStorageProducts.create({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          image_url: null,
          utilityCategoryId: productData.utilityCategoryId,
          brandId: productData.brandId,
        });

        setProducts((prev) =>
          [...prev, newProduct].sort((a, b) => a.name.localeCompare(b.name)),
        );
        toast.success("Produit ajouté avec succès !");
      }
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
   * Updates an existing product in localStorage
   */
  const updateProduct = async (
    updatedProduct: Product,
    imageFile?: File,
  ): Promise<void> => {
    try {
      setError(null);

      let imageUrl = updatedProduct.image_url;

      // Handle image upload if a new file is provided
      if (imageFile) {
        // Delete old image if exists
        if (updatedProduct.image_url) {
          try {
            await localStorageImages.delete(updatedProduct.image_url);
          } catch (err) {
            console.warn("Could not delete old image:", err);
          }
        }

        // Upload new image
        imageUrl = await localStorageImages.upload(
          imageFile,
          updatedProduct.id,
        );
      }

      // Update product
      const productToUpdate = {
        ...updatedProduct,
        image_url: imageUrl,
      };

      await localStorageProducts.update(updatedProduct.id, productToUpdate);

      setProducts((prev) =>
        prev
          .map((p) => (p.id === updatedProduct.id ? productToUpdate : p))
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
   * Deletes a product from localStorage
   */
  const deleteProduct = async (productId: string): Promise<void> => {
    try {
      setError(null);

      // Find product to get image URL
      const product = products.find((p) => p.id === productId);

      // Delete image if exists
      if (product?.image_url) {
        try {
          await localStorageImages.delete(product.image_url);
        } catch (err) {
          console.warn("Could not delete product image:", err);
        }
      }

      // Delete product
      await localStorageProducts.delete(productId);

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
 * Hook to use the ProductContext
 * @throws {Error} if used outside of ProductProvider
 */
export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);

  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }

  return context;
};
