import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Allowed image types
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];

// Validate file type
const validateImageType = (file: File): boolean => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    toast.error("Type de fichier non supporté", {
      description: "Veuillez sélectionner une image au format JPG, PNG, WEBP ou SVG.",
    });
    return false;
  }
  return true;
};

// Validate file size (5MB max)
const validateFileSize = (file: File): boolean => {
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    toast.error("Fichier trop volumineux", {
      description: "La taille maximale autorisée est de 5MB.",
    });
    return false;
  }
  return true;
};

/**
 * Upload a product image to Supabase Storage
 * @param file - The image file to upload
 * @param productId - The product ID to associate with the image
 * @returns The public URL of the uploaded image or null if failed
 */
export const uploadProductImage = async (
  file: File,
  productId: string
): Promise<string | null> => {
  try {
    // Validate file
    if (!validateImageType(file) || !validateFileSize(file)) {
      return null;
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const fileName = `${productId}-${Date.now()}.${fileExtension}`;

    // Upload file to product-images bucket
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Erreur lors de l'upload:", error);
      toast.error("Erreur d'upload", {
        description: "Impossible d'uploader l'image. Veuillez réessayer.",
      });
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("product-images")
      .getPublicUrl(data.path);

    toast.success("Image téléchargée avec succès!");
    return publicUrl;
  } catch (error) {
    console.error("Erreur inattendue lors de l'upload:", error);
    toast.error("Erreur inattendue", {
      description: "Une erreur s'est produite lors de l'upload de l'image.",
    });
    return null;
  }
};

/**
 * Delete a product image from Supabase Storage
 * @param url - The public URL of the image to delete
 * @returns Boolean indicating success or failure
 */
export const deleteProductImage = async (url: string): Promise<boolean> => {
  try {
    // Extract the file path from the URL
    // Example URL: https://project.supabase.co/storage/v1/object/public/product-images/filename.jpg
    const urlObj = new URL(url);
    const filePath = urlObj.pathname.split("/").slice(3).join("/"); // Remove /storage/v1/object/public/

    // Delete file from storage
    const { error } = await supabase.storage
      .from("product-images")
      .remove([filePath]);

    if (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur de suppression", {
        description: "Impossible de supprimer l'image. Veuillez réessayer.",
      });
      return false;
    }

    toast.success("Image supprimée avec succès!");
    return true;
  } catch (error) {
    console.error("Erreur inattendue lors de la suppression:", error);
    toast.error("Erreur inattendue", {
      description: "Une erreur s'est produite lors de la suppression de l'image.",
    });
    return false;
  }
};

/**
 * Get public URL for a file in Supabase Storage
 * @param bucketName - The name of the storage bucket
 * @param filePath - The path to the file
 * @returns The public URL of the file
 */
export const getPublicUrl = (bucketName: string, filePath: string): string => {
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

/**
 * Upload a company logo to Supabase Storage
 * @param file - The image file to upload
 * @param companyId - The company ID to associate with the logo
 * @returns The public URL of the uploaded logo or null if failed
 */
export const uploadCompanyLogo = async (
  file: File,
  companyId: string
): Promise<string | null> => {
  try {
    // Validate file
    if (!validateImageType(file) || !validateFileSize(file)) {
      return null;
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const fileName = `${companyId}-logo-${Date.now()}.${fileExtension}`;

    // Upload file to catalogue-logos bucket
    const { data, error } = await supabase.storage
      .from("catalogue-logos")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Erreur lors de l'upload du logo:", error);
      toast.error("Erreur d'upload", {
        description: "Impossible d'uploader le logo. Veuillez réessayer.",
      });
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("catalogue-logos")
      .getPublicUrl(data.path);

    toast.success("Logo téléchargé avec succès!");
    return publicUrl;
  } catch (error) {
    console.error("Erreur inattendue lors de l'upload du logo:", error);
    toast.error("Erreur inattendue", {
      description: "Une erreur s'est produite lors de l'upload du logo.",
    });
    return null;
  }
};

/**
 * Delete a company logo from Supabase Storage
 * @param url - The public URL of the logo to delete
 * @returns Boolean indicating success or failure
 */
export const deleteCompanyLogo = async (url: string): Promise<boolean> => {
  try {
    // Extract the file path from the URL
    const urlObj = new URL(url);
    const filePath = urlObj.pathname.split("/").slice(3).join("/");

    // Delete file from storage
    const { error } = await supabase.storage
      .from("catalogue-logos")
      .remove([filePath]);

    if (error) {
      console.error("Erreur lors de la suppression du logo:", error);
      toast.error("Erreur de suppression", {
        description: "Impossible de supprimer le logo. Veuillez réessayer.",
      });
      return false;
    }

    toast.success("Logo supprimé avec succès!");
    return true;
  } catch (error) {
    console.error("Erreur inattendue lors de la suppression du logo:", error);
    toast.error("Erreur inattendue", {
      description: "Une erreur s'est produite lors de la suppression du logo.",
    });
    return false;
  }
};