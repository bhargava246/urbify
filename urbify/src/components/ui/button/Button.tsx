import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "brand" | "accent" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
  }
>;

const variantClass: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  brand: "btn-brand",
  accent: "btn-accent",
  outline: "btn-outline",
  ghost: "btn-ghost"
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg"
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={cn("btn", variantClass[variant], sizeClass[size], className)} {...props}>
      {children}
    </button>
  );
}
