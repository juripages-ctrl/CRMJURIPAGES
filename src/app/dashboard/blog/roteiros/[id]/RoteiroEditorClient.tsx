'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import RoteiroPreviewPanel from '@/components/blog/RoteiroPreviewPanel';
import { publicarNoWordPress } from '../../juju-actions';

export default function RoteiroEditorClient({ roteiro, isAdmin = true }: { roteiro: any, isAdmin?: boolean }) {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handlePublish = async (dados: any) => {
    try {
      setIsPublishing(true);
      
      // Chamada real para a Server Action
      await publicarNoWordPress(roteiro.id, dados);
      
      setShowSuccessPopup(true);
      router.refresh(); // Força a galeria a recarregar o status "publicado" nos bastidores
      
    } catch (err: any) {
      alert(`Erro ao publicar: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="p-8">
      {isPublishing && (
        <div className="fixed inset-0 z-[60] bg-white/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-xl flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-slate-800 font-medium">Publicando no WordPress...</span>
          </div>
        </div>
      )}
      
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[70] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full text-center border border-slate-100 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-5">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Sucesso!</h3>
            <p className="text-sm text-slate-600 mb-8 px-2">O post foi publicado com sucesso e a imagem destacada já foi definida no WordPress.</p>
            
            <div className="flex flex-col gap-3 w-full">
              <button 
                onClick={() => router.push(isAdmin ? `/dashboard/sites/${roteiro.site_id}?tab=blog` : `/dashboard/meus-sites/${roteiro.site_id}?tab=blog`)} 
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                Ir para Aba de Blog
              </button>
              <button 
                onClick={() => router.push('/dashboard/blog')} 
                className="w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Voltar para Galeria
              </button>
            </div>
          </div>
        </div>
      )}
      
      <RoteiroPreviewPanel 
        isOpen={true} 
        onClose={() => router.push('/dashboard/blog')} 
        roteiro={roteiro}
        editMode={false}
        onPublish={handlePublish}
      />
    </div>
  );
}
