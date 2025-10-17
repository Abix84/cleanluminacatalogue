import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Brand } from '@/types';
import { brandsData as initialBrands } from '@/data/brands';
import { v4 as uuidv4 } from 'uuid';

interface BrandContextType {
  brands: Brand[];
  addBrand: (brand: Omit<Brand, 'id'>) => void;
  updateBrand: (updatedBrand: Brand) => void;
  deleteBrand: (brandId: string) => void;
  getBrandById: (brandId: string) => Brand | undefined;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export const BrandProvider = ({ children }: { children: ReactNode }) => {
  const [brands, setBrands] = useState<Brand[]>(() => {
    try {
      const localData = localStorage.getItem('brands');
      if (localData) {
        return JSON.parse(localData);
      }
    } catch (error) {
      console.error("Could not parse brands from localStorage", error);
    }
    return initialBrands;
  });

  useEffect(() => {
    localStorage.setItem('brands', JSON.stringify(brands));
  }, [brands]);

  const addBrand = (brand: Omit<Brand, 'id'>) => {
    const newBrand = { ...brand, id: uuidv4() };
    setBrands(prev => [...prev, newBrand]);
  };

  const updateBrand = (updatedBrand: Brand) => {
    setBrands(prev =>
      prev.map(b => (b.id === updatedBrand.id ? updatedBrand : b))
    );
  };

  const deleteBrand = (brandId: string) => {
    setBrands(prev => prev.filter(b => b.id !== brandId));
  };

  const getBrandById = (brandId: string) => {
    return brands.find(b => b.id === brandId);
  };

  return (
    <BrandContext.Provider value={{ brands, addBrand, updateBrand, deleteBrand, getBrandById }}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrands = () => {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrands must be used within a BrandProvider');
  }
  return context;
};