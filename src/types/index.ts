// ==========================================
// DATABASE TYPES (snake_case - from Supabase)
// ==========================================

export interface UtilityCategoryDB {
  id: string;
  name: string;
  color: string;
  created_at?: string;
  updated_at?: string;
}

export interface BrandDB {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductDB {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  utility_category_id: string | null;
  brand_id: string | null;
  company: string | null;
  promo_price?: number | null;
  is_on_sale?: boolean;
  sale_end_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

// ==========================================
// FRONTEND TYPES (camelCase - for React)
// ==========================================

export interface UtilityCategory {
  id: string;
  name: string;
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Brand {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  utilityCategoryId: string | null;
  brandId: string | null;
  company: "CleanExpress" | "Lumina Distribution" | null;
  promo_price?: number | null;
  isOnSale?: boolean;
  saleEndDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// ==========================================
// FORM TYPES
// ==========================================

export type ProductFormData = Omit<
  Product,
  "id" | "image_url" | "createdAt" | "updatedAt"
> & {
  image_url?: File | string | null;
};

export type UtilityCategoryFormData = Omit<
  UtilityCategory,
  "id" | "createdAt" | "updatedAt"
>;

export type BrandFormData = Omit<Brand, "id" | "createdAt" | "updatedAt">;

// ==========================================
// EXTENDED TYPES (with relations)
// ==========================================

export interface ProductWithRelations extends Product {
  category?: UtilityCategory | null;
  brand?: Brand | null;
}

// ==========================================
// FILTER & SORT TYPES
// ==========================================

export type SortOption =
  | "default"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc";

export interface ProductFilters {
  searchTerm?: string;
  categoryId?: string | null;
  brandId?: string | null;
  sortBy?: SortOption;
  minPrice?: number;
  maxPrice?: number;
}

// ==========================================
// API RESPONSE TYPES
// ==========================================

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

// ==========================================
// PAGINATION TYPES
// ==========================================

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ==========================================
// CONTEXT TYPES
// ==========================================

export interface ProductContextType {
  products: Product[];
  addProduct: (product: ProductFormData) => Promise<void>;
  updateProduct: (updatedProduct: Product, imageFile?: File) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  getProductById: (productId: string) => Product | undefined;
  loading: boolean;
  error: ApiError | null;
}

export interface UtilityCategoryContextType {
  utilityCategories: UtilityCategory[];
  addUtilityCategory: (category: UtilityCategoryFormData) => Promise<void>;
  updateUtilityCategory: (updatedCategory: UtilityCategory) => Promise<void>;
  deleteUtilityCategory: (categoryId: string) => Promise<void>;
  getUtilityCategoryById: (categoryId: string) => UtilityCategory | undefined;
  loading: boolean;
  error: ApiError | null;
}

export interface BrandContextType {
  brands: Brand[];
  addBrand: (brand: BrandFormData) => Promise<void>;
  updateBrand: (updatedBrand: Brand) => Promise<void>;
  deleteBrand: (brandId: string) => Promise<void>;
  getBrandById: (brandId: string) => Brand | undefined;
  loading: boolean;
  error: ApiError | null;
}

// ==========================================
// USER & ROLE TYPES
// ==========================================

export type UserRole = 'admin' | 'vendeur' | 'visiteur';
export type Company = "CleanExpress" | "Lumina Distribution" | null;

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserWithRole {
  id: string;
  email: string;
  role: UserRole | null;
  full_name: string | null;
  avatar_url: string | null;
  user_created_at?: string;
  profile_created_at?: string;
  profile_updated_at?: string;
}

// ==========================================
// UTILITY TYPES
// ==========================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ID = string;

// ==========================================
// CONTACT INFO TYPES
// ==========================================

export interface ContactInfo {
  id: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  website?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactInfoFormData {
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  website?: string;
}

// Type guard functions
export const isProduct = (obj: unknown): obj is Product => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "name" in obj &&
    "price" in obj
  );
};

export const isUtilityCategory = (obj: unknown): obj is UtilityCategory => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "name" in obj &&
    "color" in obj
  );
};

export const isBrand = (obj: unknown): obj is Brand => {
  return (
    typeof obj === "object" && obj !== null && "id" in obj && "name" in obj
  );
};
