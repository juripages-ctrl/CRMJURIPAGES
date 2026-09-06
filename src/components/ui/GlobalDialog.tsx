import * as React from "react"
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react"

export type DialogType = 'alert' | 'confirm' | 'success' | 'error'

export interface GlobalDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  title?: string
  message: string
  type?: DialogType
  confirmText?: string
  cancelText?: string
}

export function GlobalDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'alert',
  confirmText = 'OK',
  cancelText = 'Cancelar'
}: GlobalDialogProps) {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-12 h-12 text-green-500 mb-4 mx-auto" />
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-500 mb-4 mx-auto" />
      case 'confirm':
        return <AlertCircle className="w-12 h-12 text-orange-500 mb-4 mx-auto" />
      default:
        return <Info className="w-12 h-12 text-blue-500 mb-4 mx-auto" />
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-[100] w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 mx-4 animate-in fade-in zoom-in-95 duration-200 flex flex-col text-center">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {getIcon()}
        
        {title && <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>}
        
        <p className="text-gray-600 mb-6 text-sm">{message}</p>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          {type === 'confirm' && (
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex-1"
            >
              {cancelText}
            </button>
          )}
          
          <button
            onClick={() => {
              if (onConfirm) onConfirm()
              else onClose()
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-white transition-colors flex-1 ${
              type === 'error' ? 'bg-red-600 hover:bg-red-700' :
              type === 'success' ? 'bg-green-600 hover:bg-green-700' :
              type === 'confirm' ? 'bg-orange-600 hover:bg-orange-700' :
              'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
