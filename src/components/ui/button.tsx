import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-[#06070d] font-semibold hover:shadow-[0_8px_30px_-8px_var(--accent)] hover:brightness-110",
        secondary:
          "glass text-foreground hover:bg-[var(--surface-2)]",
        ghost: "text-muted hover:text-foreground hover:bg-[var(--surface-2)]",
        outline:
          "border border-[var(--border)] text-foreground hover:border-[var(--accent)] hover:text-[var(--accent)]",
        danger: "bg-[var(--danger)] text-white hover:brightness-110",
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-6",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
