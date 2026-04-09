/**
 * Button Component
 * Reusable button with multiple variants for CTAs and actions.
 * Uses Tailwind CSS for styling with orange brand colors.
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base styles applied to all buttons
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        // Primary: Orange - for important CTAs like "Start Project"
        primary:
          "bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 shadow-lg hover:shadow-xl hover:shadow-orange-500/20",
        // Secondary: Outlined - for secondary actions like "View Work"
        secondary:
          "border-2 border-orange-500 text-orange-500 hover:bg-orange-500/10 active:bg-orange-500/20",
        // Ghost: Transparent - for links or minimal actions
        ghost: "text-zinc-300 hover:text-white hover:bg-zinc-800/50 active:bg-zinc-800",
        // Outline: Neutral border - for tertiary actions
        outline:
          "border border-zinc-700 text-zinc-100 hover:border-zinc-500 hover:bg-zinc-900/50 active:bg-zinc-900",
      },
      size: {
        sm: "px-3 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
        icon: "h-10 w-10 p-0",
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
