import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "spinner" | "dots" | "pulse";
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

const dotSizeClasses = {
  sm: "h-2 w-2",
  md: "h-3 w-3",
  lg: "h-4 w-4",
  xl: "h-5 w-5",
};

const SpinnerVariant = ({ size = "md", className }: { size?: "sm" | "md" | "lg" | "xl"; className?: string }) => (
  <Loader2 className={cn("animate-spin text-primary", sizeClasses[size], className)} />
);

const DotsVariant = ({ size = "md", className }: { size?: "sm" | "md" | "lg" | "xl"; className?: string }) => (
  <div className={cn("flex space-x-1", className)}>
    <div
      className={cn(
        "rounded-full bg-primary animate-bounce",
        dotSizeClasses[size]
      )}
      style={{ animationDelay: "0ms" }}
    />
    <div
      className={cn(
        "rounded-full bg-primary animate-bounce",
        dotSizeClasses[size]
      )}
      style={{ animationDelay: "150ms" }}
    />
    <div
      className={cn(
        "rounded-full bg-primary animate-bounce",
        dotSizeClasses[size]
      )}
      style={{ animationDelay: "300ms" }}
    />
  </div>
);

const PulseVariant = ({ size = "md", className }: { size?: "sm" | "md" | "lg" | "xl"; className?: string }) => (
  <div className="relative">
    <div
      className={cn(
        "rounded-full bg-primary/20 animate-ping absolute",
        sizeClasses[size],
        className
      )}
    />
    <div
      className={cn(
        "rounded-full bg-primary",
        sizeClasses[size],
        className
      )}
    />
  </div>
);

const LoadingSpinner = ({
  size = "md",
  variant = "spinner",
  className,
  text,
  fullScreen = false,
}: LoadingSpinnerProps) => {
  const renderVariant = () => {
    switch (variant) {
      case "dots":
        return <DotsVariant size={size} className={className} />;
      case "pulse":
        return <PulseVariant size={size} className={className} />;
      case "spinner":
      default:
        return <SpinnerVariant size={size} className={className} />;
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      {renderVariant()}
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        role="status"
        aria-live="polite"
        aria-label="Chargement en cours"
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="Chargement en cours"
    >
      {content}
    </div>
  );
};

export default LoadingSpinner;
