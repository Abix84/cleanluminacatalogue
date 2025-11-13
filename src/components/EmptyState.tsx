import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  };
  children?: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: {
    container: "py-8",
    icon: "h-12 w-12",
    title: "text-base",
    description: "text-xs",
  },
  md: {
    container: "py-12",
    icon: "h-16 w-16",
    title: "text-lg",
    description: "text-sm",
  },
  lg: {
    container: "py-16",
    icon: "h-20 w-20",
    title: "text-xl",
    description: "text-base",
  },
};

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  children,
  size = "md",
  className,
}: EmptyStateProps) => {
  const sizes = sizeClasses[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizes.container,
        className,
      )}
      role="status"
      aria-live="polite"
    >
      {Icon && (
        <div className="mb-4 p-4 bg-muted/50 rounded-full">
          <Icon className={cn(sizes.icon, "text-muted-foreground")} />
        </div>
      )}

      <h3 className={cn("font-semibold text-foreground mb-2", sizes.title)}>
        {title}
      </h3>

      {description && (
        <p className={cn("text-muted-foreground max-w-md mb-6", sizes.description)}>
          {description}
        </p>
      )}

      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || "default"}
          className="mt-2"
        >
          {action.label}
        </Button>
      )}

      {children && <div className="mt-4 w-full">{children}</div>}
    </div>
  );
};

export default EmptyState;
