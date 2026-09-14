'use client';

import { FileText, Eye, Save, Sparkles } from 'lucide-react';

interface RoteiroCardProps {
  titulo: string;
  onVer: () => void;
  onSalvar: () => void;
}

export default function RoteiroCard({ titulo, onVer, onSalvar }: RoteiroCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 w-full max-w-sm shadow-sm flex flex-col gap-4 mt-2">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-slate-800 line-clamp-2 leading-snug text-sm">
            {titulo || 'Roteiro sem título'}
          </h4>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Pronto para revisão
          </p>
        </div>
      </div>
      
      <div className="flex gap-2 w-full pt-2 border-t border-slate-100">
        <button 
          onClick={onVer}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
        >
          <Eye className="w-4 h-4" /> Ver
        </button>
        <button 
          onClick={onSalvar}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Save className="w-4 h-4" /> Salvar
        </button>
      </div>
    </div>
  );
}
