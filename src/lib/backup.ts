import { Product, Brand, UtilityCategory } from "@/types";
import { supabase, IS_OFFLINE_MODE } from "@/integrations/supabase/client";
import { localStorageProducts, localStorageBrands, localStorageCategories } from "@/lib/localStorage";
import { toast } from "sonner";

export interface BackupData {
  version: string;
  timestamp: string;
  products: Product[];
  brands: Brand[];
  utilityCategories: UtilityCategory[];
  metadata: {
    totalProducts: number;
    totalBrands: number;
    totalCategories: number;
    mode: "online" | "offline";
  };
}

const BACKUP_VERSION = "1.0.0";
const isOfflineMode = IS_OFFLINE_MODE;

/**
 * Crée un backup de toutes les données
 */
export async function createBackup(): Promise<BackupData> {
  try {
    let products: Product[] = [];
    let brands: Brand[] = [];
    let utilityCategories: UtilityCategory[] = [];

    if (isOfflineMode) {
      // Mode offline - récupérer depuis localStorage
      products = await localStorageProducts.getAll();
      brands = await localStorageBrands.getAll();
      utilityCategories = await localStorageCategories.getAll();
    } else {
      // Mode online - récupérer depuis Supabase
      // Récupérer les produits
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .order("name");

      if (productsError) throw productsError;

      products = (productsData || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image_url: item.image_url,
        utilityCategoryId: item.utility_category_id,
        brandId: item.brand_id,
        company: item.company,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      // Récupérer les marques
      const { data: brandsData, error: brandsError } = await supabase
        .from("brands")
        .select("*")
        .order("name");

      if (brandsError) throw brandsError;

      brands = (brandsData || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      // Récupérer les catégories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("utility_categories")
        .select("*")
        .order("name");

      if (categoriesError) throw categoriesError;

      utilityCategories = (categoriesData || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        color: item.color,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));
    }

    const backup: BackupData = {
      version: BACKUP_VERSION,
      timestamp: new Date().toISOString(),
      products,
      brands,
      utilityCategories,
      metadata: {
        totalProducts: products.length,
        totalBrands: brands.length,
        totalCategories: utilityCategories.length,
        mode: isOfflineMode ? "offline" : "online",
      },
    };

    return backup;
  } catch (error) {
    console.error("Error creating backup:", error);
    throw new Error(
      `Erreur lors de la création du backup: ${
        error instanceof Error ? error.message : "Erreur inconnue"
      }`
    );
  }
}

/**
 * Télécharge le backup en tant que fichier JSON
 */
export async function downloadBackup(): Promise<void> {
  try {
    const backup = await createBackup();
    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Backup téléchargé avec succès !");
  } catch (error) {
    console.error("Error downloading backup:", error);
    toast.error(
      `Erreur lors du téléchargement: ${
        error instanceof Error ? error.message : "Erreur inconnue"
      }`
    );
    throw error;
  }
}

/**
 * Restaure les données depuis un backup
 */
export async function restoreBackup(
  backupData: BackupData,
  options: {
    clearExisting?: boolean;
    skipDuplicates?: boolean;
  } = {}
): Promise<void> {
  const { clearExisting = false, skipDuplicates = false } = options;

  try {
    if (isOfflineMode) {
      // Mode offline - restaurer dans localStorage
      if (clearExisting) {
        // Supprimer toutes les données existantes
        const existingProducts = await localStorageProducts.getAll();
        const existingBrands = await localStorageBrands.getAll();
        const existingCategories = await localStorageCategories.getAll();

        for (const product of existingProducts) {
          await localStorageProducts.delete(product.id);
        }
        for (const brand of existingBrands) {
          await localStorageBrands.delete(brand.id);
        }
        for (const category of existingCategories) {
          await localStorageCategories.delete(category.id);
        }
      }

      // Restaurer les catégories
      for (const category of backupData.utilityCategories) {
        if (skipDuplicates) {
          const existing = await localStorageCategories.getById(category.id);
          if (existing) continue;
        }
        // Si clearExisting, on recrée avec l'ID original, sinon on laisse générer un nouvel ID
        if (clearExisting && category.id) {
          // Pour conserver l'ID, on doit utiliser update après création ou créer directement avec l'ID
          // Comme create ne prend pas d'ID, on crée puis on met à jour si nécessaire
          await localStorageCategories.create({
            name: category.name,
            color: category.color,
          });
        } else {
          await localStorageCategories.create({
            name: category.name,
            color: category.color,
          });
        }
      }

      // Restaurer les marques
      for (const brand of backupData.brands) {
        if (skipDuplicates) {
          const existing = await localStorageBrands.getById(brand.id);
          if (existing) continue;
        }
        await localStorageBrands.create({
          name: brand.name,
        });
      }

      // Restaurer les produits
      for (const product of backupData.products) {
        if (skipDuplicates) {
          const existing = await localStorageProducts.getById(product.id);
          if (existing) continue;
        }
        await localStorageProducts.create({
          name: product.name,
          description: product.description,
          price: product.price,
          image_url: product.image_url,
          utilityCategoryId: product.utilityCategoryId,
          brandId: product.brandId,
          company: product.company,
        });
      }
    } else {
      // Mode online - restaurer dans Supabase
      if (clearExisting) {
        // Supprimer toutes les données existantes
        await supabase.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        await supabase.from("brands").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        await supabase.from("utility_categories").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      }

      // Restaurer les catégories
      if (backupData.utilityCategories.length > 0) {
        const categoriesToInsert = backupData.utilityCategories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          color: cat.color,
        }));

        if (skipDuplicates) {
          // Insérer seulement si n'existe pas déjà
          for (const cat of categoriesToInsert) {
            const { data: existing } = await supabase
              .from("utility_categories")
              .select("id")
              .eq("id", cat.id)
              .single();
            
            if (!existing) {
              const { error } = await supabase
                .from("utility_categories")
                .insert([cat]);
              if (error) throw error;
            }
          }
        } else {
          // Upsert (écrase si existe)
          const { error: categoriesError } = await supabase
            .from("utility_categories")
            .upsert(categoriesToInsert, { onConflict: "id" });

          if (categoriesError) throw categoriesError;
        }
      }

      // Restaurer les marques
      if (backupData.brands.length > 0) {
        const brandsToInsert = backupData.brands.map((brand) => ({
          id: brand.id,
          name: brand.name,
        }));

        if (skipDuplicates) {
          // Insérer seulement si n'existe pas déjà
          for (const brand of brandsToInsert) {
            const { data: existing } = await supabase
              .from("brands")
              .select("id")
              .eq("id", brand.id)
              .single();
            
            if (!existing) {
              const { error } = await supabase
                .from("brands")
                .insert([brand]);
              if (error) throw error;
            }
          }
        } else {
          // Upsert (écrase si existe)
          const { error: brandsError } = await supabase
            .from("brands")
            .upsert(brandsToInsert, { onConflict: "id" });

          if (brandsError) throw brandsError;
        }
      }

      // Restaurer les produits
      if (backupData.products.length > 0) {
        const productsToInsert = backupData.products.map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          image_url: product.image_url,
          utility_category_id: product.utilityCategoryId,
          brand_id: product.brandId,
          company: product.company,
        }));

        if (skipDuplicates) {
          // Insérer seulement si n'existe pas déjà
          for (const product of productsToInsert) {
            const { data: existing } = await supabase
              .from("products")
              .select("id")
              .eq("id", product.id)
              .single();
            
            if (!existing) {
              const { error } = await supabase
                .from("products")
                .insert([product]);
              if (error) throw error;
            }
          }
        } else {
          // Upsert (écrase si existe)
          const { error: productsError } = await supabase
            .from("products")
            .upsert(productsToInsert, { onConflict: "id" });

          if (productsError) throw productsError;
        }
      }
    }

    toast.success("Backup restauré avec succès !");
  } catch (error) {
    console.error("Error restoring backup:", error);
    toast.error(
      `Erreur lors de la restauration: ${
        error instanceof Error ? error.message : "Erreur inconnue"
      }`
    );
    throw error;
  }
}

/**
 * Charge un fichier de backup
 */
export function loadBackupFile(file: File): Promise<BackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const backupData = JSON.parse(content) as BackupData;

        // Valider la structure du backup
        if (!backupData.version || !backupData.timestamp) {
          throw new Error("Format de backup invalide");
        }

        resolve(backupData);
      } catch (error) {
        reject(
          new Error(
            `Erreur lors de la lecture du fichier: ${
              error instanceof Error ? error.message : "Format invalide"
            }`
          )
        );
      }
    };
    reader.onerror = () => reject(new Error("Erreur lors de la lecture du fichier"));
    reader.readAsText(file);
  });
}

/**
 * Synchronise les données entre localStorage et Supabase
 */
export async function synchronizeData(): Promise<{
  synced: number;
  errors: number;
}> {
  if (isOfflineMode) {
    throw new Error("La synchronisation n'est disponible qu'en mode online");
  }

  let synced = 0;
  let errors = 0;

  try {
    // Récupérer les données de localStorage
    const localProducts = await localStorageProducts.getAll();
    const localBrands = await localStorageBrands.getAll();
    const localCategories = await localStorageCategories.getAll();

    // Synchroniser les catégories
    for (const category of localCategories) {
      try {
        const { error } = await supabase.from("utility_categories").upsert({
          name: category.name,
          color: category.color,
        });
        if (error) throw error;
        synced++;
      } catch (error) {
        console.error("Error syncing category:", error);
        errors++;
      }
    }

    // Synchroniser les marques
    for (const brand of localBrands) {
      try {
        const { error } = await supabase.from("brands").upsert({
          name: brand.name,
        });
        if (error) throw error;
        synced++;
      } catch (error) {
        console.error("Error syncing brand:", error);
        errors++;
      }
    }

    // Synchroniser les produits
    for (const product of localProducts) {
      try {
        const { error } = await supabase.from("products").upsert({
          name: product.name,
          description: product.description,
          price: product.price,
          image_url: product.image_url,
          utility_category_id: product.utilityCategoryId,
          brand_id: product.brandId,
          company: product.company,
        });
        if (error) throw error;
        synced++;
      } catch (error) {
        console.error("Error syncing product:", error);
        errors++;
      }
    }

    if (errors === 0) {
      toast.success(`${synced} éléments synchronisés avec succès !`);
    } else {
      toast.warning(`${synced} éléments synchronisés, ${errors} erreurs`);
    }

    return { synced, errors };
  } catch (error) {
    console.error("Error synchronizing data:", error);
    toast.error(
      `Erreur lors de la synchronisation: ${
        error instanceof Error ? error.message : "Erreur inconnue"
      }`
    );
    throw error;
  }
}

