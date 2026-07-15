import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "solid" | "outline" | "ghost" | "outline-light";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  fullWidth?: boolean;
}

const base =
  "inline-flex items-center justify-center font-[var(--font-hanken)] font-semibold rounded-full transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b58a3c] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  solid:
    "bg-[#b58a3c] text-[#fbf9f3] hover:bg-[#9e7832] active:scale-[0.98]",
  outline:
    "border-2 border-[#b58a3c] text-[#b58a3c] bg-transparent hover:bg-[rgba(181,138,60,0.08)] active:scale-[0.98]",
  ghost:
    "text-[#b58a3c] underline underline-offset-4 bg-transparent hover:text-[#9e7832]",
  "outline-light":
    "border-2 border-[#fbf9f3] text-[#fbf9f3] bg-transparent hover:bg-[rgba(251,249,243,0.12)] active:scale-[0.98]",
};

const sizes: Record<string, string> = {
  sm: "text-[13px] px-4 py-2",
  md: "text-[14.5px] px-6 py-3",
  lg: "text-[15px] px-7 py-3.5",
};

export default function Button({
  variant = "solid",
  size = "md",
  children,
  fullWidth,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
