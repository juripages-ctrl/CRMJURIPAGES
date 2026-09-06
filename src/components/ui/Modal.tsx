import * as React from "react"
import { X } from "lucide-react"

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-50 w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 mx-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-5">
          {title && <h2 className="text-xl font-semibold text-gray-900">{title}</h2>}
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mt-2">
          {children}
        </div>
      </div>
    </div>
  )
}
