import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ContactInfo, ContactInfoFormData, ApiError } from "@/types";
import { toast } from "sonner";
import { supabase, IS_OFFLINE_MODE } from "@/integrations/supabase/client";

interface ContactContextType {
  contactInfo: ContactInfo | null;
  updateContactInfo: (data: ContactInfoFormData) => Promise<void>;
  loading: boolean;
  error: ApiError | null;
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

const isOfflineMode = IS_OFFLINE_MODE;
const STORAGE_KEY = "contact_info";

// ==========================================
// OFFLINE FUNCTIONS
// ==========================================

const getOfflineContactInfo = (): ContactInfo | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  } catch (error) {
    console.error("Error reading contact info from localStorage:", error);
    return null;
  }
};

const saveOfflineContactInfo = (data: ContactInfoFormData): ContactInfo => {
  const contactInfo: ContactInfo = {
    id: "contact-info-1",
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contactInfo));
  return contactInfo;
};

// ==========================================
// ONLINE FUNCTIONS (SUPABASE)
// ==========================================

const fetchOnlineContactInfo = async (): Promise<ContactInfo | null> => {
  const { data, error } = await supabase
    .from("contact_info")
    .select("*")
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned - no contact info yet
      return null;
    }
    throw error;
  }

  return {
    id: data.id,
    email: data.email,
    phone: data.phone,
    address: data.address,
    city: data.city,
    postalCode: data.postal_code,
    country: data.country,
    website: data.website || undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

const updateOnlineContactInfo = async (
  data: ContactInfoFormData
): Promise<ContactInfo> => {
  try {
    // Try to get existing contact info
    const existing = await fetchOnlineContactInfo().catch(() => null);

    const contactData = {
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      postal_code: data.postalCode,
      country: data.country,
      website: data.website || null,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      // Update existing
      const { data: updated, error } = await supabase
        .from("contact_info")
        .update(contactData)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      return {
        id: updated.id,
        email: updated.email,
        phone: updated.phone,
        address: updated.address,
        city: updated.city,
        postalCode: updated.postal_code,
        country: updated.country,
        website: updated.website || undefined,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      };
    } else {
      // Create new
      const { data: created, error } = await supabase
        .from("contact_info")
        .insert([contactData])
        .select()
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }

      return {
        id: created.id,
        email: created.email,
        phone: created.phone,
        address: created.address,
        city: created.city,
        postalCode: created.postal_code,
        country: created.country,
        website: created.website || undefined,
        createdAt: created.created_at,
        updatedAt: created.updated_at,
      };
    }
  } catch (error: any) {
    // Re-throw avec plus de détails
    if (error?.code === "42P01" || error?.code === "PGRST205") {
      const enhancedError = new Error(
        "La table 'contact_info' n'existe pas. Veuillez exécuter le script SQL dans supabase/create_contact_info_table.sql dans votre projet Supabase (SQL Editor)."
      );
      (enhancedError as any).code = error.code;
      throw enhancedError;
    }
    throw error;
  }
};

// ==========================================
// PROVIDER COMPONENT
// ==========================================

export const ContactProvider = ({ children }: { children: ReactNode }) => {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = isOfflineMode
        ? getOfflineContactInfo()
        : await fetchOnlineContactInfo();

      setContactInfo(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors de la récupération des informations de contact.";
      const apiError: ApiError = {
        message: errorMessage,
        details: err,
      };

      setError(apiError);
      console.error("Error fetching contact info:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const updateContactInfo = async (data: ContactInfoFormData): Promise<void> => {
    try {
      setError(null);

      const updated = isOfflineMode
        ? saveOfflineContactInfo(data)
        : await updateOnlineContactInfo(data);

      setContactInfo(updated);
      toast.success("Informations de contact mises à jour avec succès !");
    } catch (err: any) {
      let errorMessage = "Erreur lors de la mise à jour des informations de contact.";
      
      if (err) {
        // Gérer les erreurs Supabase spécifiques
        if (err.code === "42P01" || err.code === "PGRST205") {
          errorMessage = "La table 'contact_info' n'existe pas dans la base de données. Veuillez exécuter le script SQL de création de table dans Supabase.";
        } else if (err.code === "42501") {
          errorMessage = "Vous n'avez pas les permissions nécessaires pour modifier les informations de contact.";
        } else if (err.message) {
          errorMessage = err.message;
        } else if (typeof err === "string") {
          errorMessage = err;
        }
      }

      const apiError: ApiError = {
        message: errorMessage,
        details: err,
        code: err?.code,
      };

      setError(apiError);
      toast.error(`${errorMessage}${err?.code ? ` (Code: ${err.code})` : ""}`);
      console.error("Error updating contact info:", err);
      throw err;
    }
  };

  const value: ContactContextType = {
    contactInfo,
    updateContactInfo,
    loading,
    error,
  };

  return (
    <ContactContext.Provider value={value}>{children}</ContactContext.Provider>
  );
};

// ==========================================
// HOOK
// ==========================================

export const useContact = (): ContactContextType => {
  const context = useContext(ContactContext);

  if (context === undefined) {
    throw new Error("useContact must be used within a ContactProvider");
  }

  return context;
};

