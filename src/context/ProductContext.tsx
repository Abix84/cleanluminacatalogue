import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

type ProductFormData = Omit<Product, 'id' | 'image_url'> & {
  image_url?: File | string | null;
};

interface ProductContextType {
  products: Product[];
  addProduct: (product: ProductFormData) => Promise<void>;
  updateProduct: (updatedProduct: Product, imageFile?: File) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  getProductById: (productId: string) => Product | undefined;
  loading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const BUCKET_NAME = 'product-images';

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('name');
    if (error) {
      toast.error("Erreur lors de la récupération des produits.");
      console.error(error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileName = `${uuidv4()}-${file.name}`;
    const { error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file);
    if (error) {
      toast.error("Erreur lors du téléversement de l'image.");
      console.error(error);
      return null;
    }
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
    return data.publicUrl;
  };

  const addProduct = async (productData: ProductFormData) => {
    let imageUrl: string | null = null;
    if (productData.image_url instanceof File) {
      imageUrl = await uploadImage(productData.image_url);
    }

    const productToInsert = { ...productData, image_url: imageUrl };
    
    const { data, error } = await supabase.from('products').insert([productToInsert]).select();
    if (error) {
      toast.error("Erreur lors de l'ajout du produit.");
    } else if (data) {
      setProducts(prev => [...prev, data[0]].sort((a, b) => a.name.localeCompare(b.name)));
    }
  };

  const updateProduct = async (updatedProductData: Product, imageFile?: File) => {
    let imageUrl = updatedProductData.image_url;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    const productToUpdate = { ...updatedProductData, image_url: imageUrl };

    const { error } = await supabase.from('products').update(productToUpdate).eq('id', productToUpdate.id);
    if (error) {
      toast.error("Erreur lors de la mise à jour du produit.");
    } else {
      setProducts(prev =>
        prev.map(p => (p.id === productToUpdate.id ? productToUpdate : p)).sort((a, b) => a.name.localeCompare(b.name))
      );
    }
  };

  const deleteProduct = async (productId: string) => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      toast.error("Erreur lors de la suppression du produit.");
    } else {
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  const getProductById = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, getProductById, loading }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};