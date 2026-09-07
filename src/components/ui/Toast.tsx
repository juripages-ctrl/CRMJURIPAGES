'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { CheckCircle2 } from 'lucide-react'

type ToastContextType = {
  flash: (message: string) => void
}

const ToastContext = createContext<ToastContextType>({ flash: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(false)

  const flash = useCallback((msg: string) => {
    setMessage(msg)
    setVisible(true)
    setTimeout(() => setVisible(false), 2200)
  }, [])

  return (
    <ToastContext.Provider value={{ flash }}>
      {children}
      {visible && (
        <div className="fixed bottom-28 md:bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-auto z-[100] jp-fade-in pointer-events-none flex justify-center md:justify-end">
          <div className="bg-[#111827] text-white rounded-2xl px-5 py-3.5 text-sm font-medium flex items-center gap-2.5 shadow-xl pointer-events-auto max-w-sm">
            <CheckCircle2 className="w-4.5 h-4.5 text-[#DFFF00] shrink-0" />
            <span>{message}</span>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}
