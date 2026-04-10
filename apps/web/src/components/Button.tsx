/**
 * Button Component
 * Reusable button with multiple variants for CTAs and actions.
 * Uses Tailwind CSS for styling with orange brand colors.
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] hover:scale-[1.02] active:scale-95",
        secondary:
          "glass-card border-glass-border text-foreground hover:bg-white/5 active:bg-white/10",
        ghost: "text-foreground/70 hover:text-foreground hover:bg-white/5",
        outline:
          "border border-glass-border text-foreground hover:border-accent/50 hover:bg-accent/5",
      },
      size: {
        sm: "px-4 py-2 text-sm",
        md: "px-8 py-3.5 text-base",
        lg: "px-10 py-5 text-lg",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);

Button.displayName = "Button";

export { Button, buttonVariants };
