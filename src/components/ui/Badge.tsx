import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "active" | "success" | "outline" | "destructive"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2",
        {
          "bg-white border border-gray-100 text-gray-400 px-3 py-1": variant === "default",
          "bg-black text-white shadow-md px-3 py-1": variant === "active",
          "bg-green-100 text-green-600": variant === "success",
          "bg-transparent border border-gray-200 text-gray-500 px-3 py-1": variant === "outline",
          "bg-red-100 text-red-600": variant === "destructive",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
