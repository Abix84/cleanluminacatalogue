import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ContactInfo, ContactInfoFormData, ApiError } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ContactContextType {
  contactInfo: ContactInfo | null;
  updateContactInfo: (data: ContactInfoFormData) => Promise<void>;
  loading: boolean;
  error: ApiError | null;
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

export const ContactProvider = ({ children }: { children: ReactNode }) => {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("contact_info")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) {
        if (error.code === "PGRST116") {
          setContactInfo(null);
          return;
        }
        throw error;
      }

      if (!data) {
        setContactInfo(null);
        return;
      }

      setContactInfo({
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
      });
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

      // Try to get existing contact info
      const { data: existingData } = await supabase
        .from("contact_info")
        .select("id")
        .limit(1)
        .maybeSingle();

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

      let result;

      if (existingData) {
        // Update existing
        const { data: updated, error } = await supabase
          .from("contact_info")
          .update(contactData)
          .eq("id", existingData.id)
          .select()
          .single();

        if (error) throw error;
        result = updated;
      } else {
        // Create new
        const { data: created, error } = await supabase
          .from("contact_info")
          .insert([contactData])
          .select()
          .single();

        if (error) throw error;
        result = created;
      }

      setContactInfo({
        id: result.id,
        email: result.email,
        phone: result.phone,
        address: result.address,
        city: result.city,
        postalCode: result.postal_code,
        country: result.country,
        website: result.website || undefined,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
      });
      toast.success("Informations de contact mises à jour avec succès !");
    } catch (err: any) {
      let errorMessage = "Erreur lors de la mise à jour des informations de contact.";

      if (err) {
        if (err.code === "42P01" || err.code === "PGRST205") {
          errorMessage = "La table 'contact_info' n'existe pas.";
        } else if (err.code === "42501") {
          errorMessage = "Permission refusée.";
        } else if (err.message) {
          errorMessage = err.message;
        }
      }

      const apiError: ApiError = {
        message: errorMessage,
        details: err,
        code: err?.code,
      };

      setError(apiError);
      toast.error(errorMessage);
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

export const useContact = (): ContactContextType => {
  const context = useContext(ContactContext);

  if (context === undefined) {
    throw new Error("useContact must be used within a ContactProvider");
  }

  return context;
};
