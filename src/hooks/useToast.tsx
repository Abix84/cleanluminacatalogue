import { toast as sonnerToast } from "sonner";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react";

// ==========================================
// TYPES
// ==========================================

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  duration?: number;
  description?: string;
  action?: ToastAction;
  onDismiss?: () => void;
  onAutoClose?: () => void;
}

export interface ToastPromiseOptions<T> {
  loading?: string;
  success?: string | ((data: T) => string);
  error?: string | ((error: Error) => string);
  duration?: number;
}

// ==========================================
// DEFAULT OPTIONS
// ==========================================

const DEFAULT_DURATION = 4000;
const SUCCESS_DURATION = 3000;
const ERROR_DURATION = 5000;
const WARNING_DURATION = 4000;
const INFO_DURATION = 3000;

// ==========================================
// HOOK
// ==========================================

/**
 * Custom hook for displaying toast notifications with enhanced functionality
 * Built on top of Sonner for consistent UX
 *
 * @example
 * const toast = useToast();
 *
 * // Simple success
 * toast.success("Saved successfully!");
 *
 * // Error with action
 * toast.error("Failed to save", {
 *   action: { label: "Retry", onClick: () => retry() }
 * });
 *
 * // Promise-based
 * toast.promise(saveData(), {
 *   loading: "Saving...",
 *   success: "Saved!",
 *   error: "Failed to save"
 * });
 */
export const useToast = () => {
  /**
   * Display a success toast
   */
  const success = (message: string, options?: ToastOptions) => {
    return sonnerToast.success(message, {
      duration: options?.duration || SUCCESS_DURATION,
      description: options?.description,
      icon: <CheckCircle2 className="h-5 w-5" />,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
      onDismiss: options?.onDismiss,
      onAutoClose: options?.onAutoClose,
    });
  };

  /**
   * Display an error toast
   */
  const error = (message: string, options?: ToastOptions) => {
    return sonnerToast.error(message, {
      duration: options?.duration || ERROR_DURATION,
      description: options?.description,
      icon: <AlertCircle className="h-5 w-5" />,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
      onDismiss: options?.onDismiss,
      onAutoClose: options?.onAutoClose,
    });
  };

  /**
   * Display a warning toast
   */
  const warning = (message: string, options?: ToastOptions) => {
    return sonnerToast.warning(message, {
      duration: options?.duration || WARNING_DURATION,
      description: options?.description,
      icon: <AlertTriangle className="h-5 w-5" />,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
      onDismiss: options?.onDismiss,
      onAutoClose: options?.onAutoClose,
    });
  };

  /**
   * Display an info toast
   */
  const info = (message: string, options?: ToastOptions) => {
    return sonnerToast.info(message, {
      duration: options?.duration || INFO_DURATION,
      description: options?.description,
      icon: <Info className="h-5 w-5" />,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
      onDismiss: options?.onDismiss,
      onAutoClose: options?.onAutoClose,
    });
  };

  /**
   * Display a default toast
   */
  const message = (text: string, options?: ToastOptions) => {
    return sonnerToast(text, {
      duration: options?.duration || DEFAULT_DURATION,
      description: options?.description,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
      onDismiss: options?.onDismiss,
      onAutoClose: options?.onAutoClose,
    });
  };

  /**
   * Display a loading toast
   */
  const loading = (
    message: string,
    options?: Omit<ToastOptions, "duration">,
  ) => {
    return sonnerToast.loading(message, {
      icon: <Loader2 className="h-5 w-5 animate-spin" />,
      description: options?.description,
      onDismiss: options?.onDismiss,
    });
  };

  /**
   * Handle promise-based operations with loading, success, and error states
   */
  const promise = <T,>(
    promiseFunction: Promise<T>,
    options: ToastPromiseOptions<T>,
  ): Promise<T> => {
    const toastId = loading(options.loading || "Loading...");

    return promiseFunction
      .then((data) => {
        sonnerToast.dismiss(toastId);
        const successMessage =
          typeof options.success === "function"
            ? options.success(data)
            : options.success || "Success!";
        success(successMessage, { duration: options.duration });
        return data;
      })
      .catch((err) => {
        sonnerToast.dismiss(toastId);
        const errorMessage =
          typeof options.error === "function"
            ? options.error(err)
            : options.error || "An error occurred";
        error(errorMessage, { duration: options.duration });
        throw err;
      });
  };

  /**
   * Dismiss a specific toast by ID
   */
  const dismiss = (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  };

  /**
   * Custom toast with full control
   */
  const custom = (
    message: string | React.ReactNode,
    options?: ToastOptions,
  ) => {
    return sonnerToast(message, {
      duration: options?.duration || DEFAULT_DURATION,
      description: options?.description,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
      onDismiss: options?.onDismiss,
      onAutoClose: options?.onAutoClose,
    });
  };

  /**
   * Display a confirmation toast with actions
   */
  const confirm = (
    message: string,
    onConfirm: () => void,
    options?: Omit<ToastOptions, "action">,
  ) => {
    return sonnerToast(message, {
      duration: 10000, // Longer duration for confirmations
      description: options?.description,
      action: {
        label: "Confirmer",
        onClick: onConfirm,
      },
      cancel: {
        label: "Annuler",
        onClick: () => {}, // Empty function to dismiss
      },
      onDismiss: options?.onDismiss,
      onAutoClose: options?.onAutoClose,
    });
  };

  /**
   * Display an API error with user-friendly message
   */
  const apiError = (
    err: unknown,
    fallbackMessage = "Une erreur s'est produite",
  ) => {
    let message = fallbackMessage;

    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === "string") {
      message = err;
    } else if (err && typeof err === "object" && "message" in err) {
      message = String(err.message);
    }

    return error(message, { duration: ERROR_DURATION });
  };

  return {
    success,
    error,
    warning,
    info,
    message,
    loading,
    promise,
    dismiss,
    custom,
    confirm,
    apiError,
  };
};

// ==========================================
// EXPORT TYPE FOR HOOK RETURN
// ==========================================

export type UseToastReturn = ReturnType<typeof useToast>;
