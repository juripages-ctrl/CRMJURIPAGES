import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

export interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export function Drawer({ isOpen, onClose, children, title }: DrawerProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleEscape)
    }
    return () => {
      document.body.style.overflow = "auto"
      window.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full max-w-md transform bg-page shadow-2xl transition-transform duration-300 ease-in-out sm:w-[400px] flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-4 bg-white">
          <h2 className="text-lg font-medium text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </>
  )
}
