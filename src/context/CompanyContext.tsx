import { createContext, useContext, useState, ReactNode } from 'react';

type Company = 'CleanExpress' | 'Lumina Distribution';

interface CompanyContextType {
  company: Company | null;
  selectCompany: (company: Company) => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider = ({ children }: { children: ReactNode }) => {
  const [company, setCompany] = useState<Company | null>(null);

  const selectCompany = (selectedCompany: Company) => {
    setCompany(selectedCompany);
  };

  return (
    <CompanyContext.Provider value={{ company, selectCompany }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = (): CompanyContextType => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};
