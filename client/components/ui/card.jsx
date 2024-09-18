import { cn } from "@/app/lib/utils";
import React from "react";

export function Card({ children, className = "" }) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div className={cn("px-6 py-5 border-b border-gray-200", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }) {
  return (
    <h3 className={cn("text-2xl font-bold leading-7 text-gray-900", className)}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={cn("px-6 py-5", className)}>{children}</div>;
}

// Fix: Use React.forwardRef for CardFooter
export const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

// Fix: Use React.forwardRef for CardDescription
export const CardDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";
