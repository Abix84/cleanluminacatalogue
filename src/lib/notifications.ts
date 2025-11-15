import { toast } from "sonner";

/**
 * Types de notifications disponibles
 */
export type NotificationType = "success" | "error" | "warning" | "info";

/**
 * Options pour les notifications
 */
export interface NotificationOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Système de notifications amélioré avec types et options
 */
export const notifications = {
  /**
   * Notification de succès
   */
  success: (message: string, options?: NotificationOptions) => {
    return toast.success(message, {
      description: options?.description,
      duration: options?.duration || 3000,
      action: options?.action,
      cancel: options?.cancel,
    });
  },

  /**
   * Notification d'erreur
   */
  error: (message: string, options?: NotificationOptions) => {
    return toast.error(message, {
      description: options?.description,
      duration: options?.duration || 5000,
      action: options?.action,
      cancel: options?.cancel,
    });
  },

  /**
   * Notification d'avertissement
   */
  warning: (message: string, options?: NotificationOptions) => {
    return toast.warning(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action,
      cancel: options?.cancel,
    });
  },

  /**
   * Notification d'information
   */
  info: (message: string, options?: NotificationOptions) => {
    return toast.info(message, {
      description: options?.description,
      duration: options?.duration || 3000,
      action: options?.action,
      cancel: options?.cancel,
    });
  },

  /**
   * Notification de chargement
   */
  loading: (message: string, options?: NotificationOptions) => {
    return toast.loading(message, {
      description: options?.description,
      duration: options?.duration || Infinity,
      action: options?.action,
      cancel: options?.cancel,
    });
  },

  /**
   * Notification de promesse (loading -> success/error)
   */
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  },
};

/**
 * Notifications spécifiques aux actions du catalogue
 */
export const catalogNotifications = {
  productCreated: (productName: string) => {
    return notifications.success("Produit créé avec succès", {
      description: `"${productName}" a été ajouté au catalogue`,
      duration: 3000,
    });
  },

  productUpdated: (productName: string) => {
    return notifications.success("Produit mis à jour", {
      description: `"${productName}" a été modifié avec succès`,
      duration: 3000,
    });
  },

  productDeleted: (productName: string) => {
    return notifications.success("Produit supprimé", {
      description: `"${productName}" a été retiré du catalogue`,
      duration: 3000,
    });
  },

  exportSuccess: (format: "JSON" | "CSV", count: number) => {
    return notifications.success(`Export ${format} réussi`, {
      description: `${count} produit${count > 1 ? "s" : ""} exporté${count > 1 ? "s" : ""} avec succès`,
      duration: 4000,
    });
  },

  exportError: (format: "JSON" | "CSV", error: Error) => {
    return notifications.error(`Erreur lors de l'export ${format}`, {
      description: error.message,
      duration: 5000,
    });
  },
};

/**
 * Notifications spécifiques aux favoris
 */
export const favoritesNotifications = {
  added: (productName: string) => {
    return notifications.success("Ajouté aux favoris", {
      description: `"${productName}" a été ajouté à vos favoris`,
      duration: 2000,
    });
  },

  removed: (productName: string) => {
    return notifications.info("Retiré des favoris", {
      description: `"${productName}" a été retiré de vos favoris`,
      duration: 2000,
    });
  },

  allRemoved: (count: number) => {
    return notifications.success("Favoris retirés", {
      description: `${count} produit${count > 1 ? "s" : ""} retiré${count > 1 ? "s" : ""} des favoris`,
      duration: 3000,
    });
  },
};

