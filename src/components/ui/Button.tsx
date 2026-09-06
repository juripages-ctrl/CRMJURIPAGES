import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "text" | "icon" | "iconActive" | "iconHover" | "ghost"
  size?: "default" | "sm" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-full transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50",
          {
            // Variants
            "bg-black text-white hover:bg-gray-800 shadow-md": variant === "default",
            "bg-white border border-gray-200 hover:bg-gray-50 text-sm font-medium": variant === "outline",
            "text-gray-500 hover:text-black font-medium text-sm": variant === "text",
            "text-gray-500 hover:text-black hover:bg-gray-100 font-medium text-sm": variant === "ghost",
            "bg-black text-white shadow-lg": variant === "iconActive",
            "text-gray-400 hover:bg-white hover:text-black border border-transparent hover:shadow-sm": variant === "iconHover",
            "bg-white hover:bg-gray-50": variant === "icon", // Small tag-like icon button
            
            // Sizes
            "h-9 px-4 py-2": size === "default" && variant !== "iconActive" && variant !== "iconHover" && variant !== "icon",
            "h-8 px-3 text-xs": size === "sm",
            "w-10 h-10": size === "icon" && (variant === "iconActive" || variant === "iconHover"),
            "w-8 h-8": size === "icon" && variant === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
