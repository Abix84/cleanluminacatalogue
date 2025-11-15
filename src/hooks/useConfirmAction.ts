import { useState, useCallback } from "react";
import { toast } from "sonner";

interface ConfirmActionOptions {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

/**
 * Hook pour gérer les actions de confirmation avec toast
 */
export const useConfirmAction = () => {
  const [isConfirming, setIsConfirming] = useState(false);

  const confirmAction = useCallback(
    (
      action: () => void | Promise<void>,
      options: ConfirmActionOptions = {}
    ): void => {
      const {
        title = "Confirmer l'action",
        description = "Cette action est irréversible. Êtes-vous sûr ?",
        confirmText = "Confirmer",
        cancelText = "Annuler",
        variant = "default",
      } = options;

      setIsConfirming(true);

      // Créer un toast de confirmation personnalisé
      const toastId = toast.loading(title, {
        description,
        duration: Infinity, // Ne pas fermer automatiquement
        action: {
          label: confirmText,
          onClick: async () => {
            try {
              await action();
              toast.dismiss(toastId);
              toast.success("Action confirmée avec succès", {
                duration: 3000,
              });
              setIsConfirming(false);
            } catch (error) {
              toast.dismiss(toastId);
              toast.error(
                error instanceof Error
                  ? error.message
                  : "Une erreur est survenue",
                {
                  duration: 5000,
                }
              );
              setIsConfirming(false);
            }
          },
        },
        cancel: {
          label: cancelText,
          onClick: () => {
            toast.dismiss(toastId);
            toast.info("Action annulée", {
              duration: 2000,
            });
            setIsConfirming(false);
          },
        },
      });
    },
    []
  );

  return {
    confirmAction,
    isConfirming,
  };
};

/**
 * Hook simplifié pour les confirmations avec dialog
 */
export const useSimpleConfirm = () => {
  const confirm = useCallback(
    (
      message: string,
      onConfirm: () => void | Promise<void>,
      onCancel?: () => void
    ): boolean => {
      if (window.confirm(message)) {
        Promise.resolve(onConfirm()).catch((error) => {
          toast.error(
            error instanceof Error ? error.message : "Une erreur est survenue",
            {
              duration: 5000,
            }
          );
        });
        return true;
      } else {
        if (onCancel) onCancel();
        return false;
      }
    },
    []
  );

  return { confirm };
};

