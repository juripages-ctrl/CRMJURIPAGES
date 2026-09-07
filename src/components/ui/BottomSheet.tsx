'use client'

import { ReactNode } from 'react'

type BottomSheetProps = {
  open: boolean
  onClose: () => void
  children: ReactNode
}

export function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[80] jp-fade-in md:hidden"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="fixed left-0 right-0 bottom-0 bg-white rounded-t-[2rem] px-5 pt-3 pb-7 jp-sheet-up z-[81] shadow-[0_-20px_50px_-20px_rgba(17,24,39,0.5)] md:hidden max-h-[85vh] overflow-y-auto">
        {/* Drag handle */}
        <div className="w-11 h-[5px] rounded-full bg-gray-200 mx-auto mb-4" />
        {children}
      </div>
    </>
  )
}
