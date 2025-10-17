import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UtilityCategory } from '@/types';
import { utilityCategoriesData as initialCategories } from '@/data/utilityCategories';
import { v4 as uuidv4 } from 'uuid';

interface UtilityCategoryContextType {
  utilityCategories: UtilityCategory[];
  addUtilityCategory: (category: Omit<UtilityCategory, 'id'>) => void;
  updateUtilityCategory: (updatedCategory: UtilityCategory) => void;
  deleteUtilityCategory: (categoryId: string) => void;
  getUtilityCategoryById: (categoryId: string) => UtilityCategory | undefined;
}

const UtilityCategoryContext = createContext<UtilityCategoryContextType | undefined>(undefined);

export const UtilityCategoryProvider = ({ children }: { children: ReactNode }) => {
  const [utilityCategories, setUtilityCategories] = useState<UtilityCategory[]>(() => {
    try {
      const localData = localStorage.getItem('utilityCategories');
      if (localData) {
        return JSON.parse(localData);
      }
    } catch (error) {
      console.error("Could not parse utility categories from localStorage", error);
    }
    return initialCategories;
  });

  useEffect(() => {
    localStorage.setItem('utilityCategories', JSON.stringify(utilityCategories));
  }, [utilityCategories]);

  const addUtilityCategory = (category: Omit<UtilityCategory, 'id'>) => {
    const newCategory = { ...category, id: uuidv4() };
    setUtilityCategories(prev => [...prev, newCategory]);
  };

  const updateUtilityCategory = (updatedCategory: UtilityCategory) => {
    setUtilityCategories(prev =>
      prev.map(c => (c.id === updatedCategory.id ? updatedCategory : c))
    );
  };

  const deleteUtilityCategory = (categoryId: string) => {
    setUtilityCategories(prev => prev.filter(c => c.id !== categoryId));
  };

  const getUtilityCategoryById = (categoryId: string) => {
    return utilityCategories.find(c => c.id === categoryId);
  };

  return (
    <UtilityCategoryContext.Provider value={{ utilityCategories, addUtilityCategory, updateUtilityCategory, deleteUtilityCategory, getUtilityCategoryById }}>
      {children}
    </UtilityCategoryContext.Provider>
  );
};

export const useUtilityCategories = () => {
  const context = useContext(UtilityCategoryContext);
  if (context === undefined) {
    throw new Error('useUtilityCategories must be used within a UtilityCategoryProvider');
  }
  return context;
};