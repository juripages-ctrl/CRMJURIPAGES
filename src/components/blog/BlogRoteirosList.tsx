'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PenLine, FileText, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import RoteiroPreviewPanel from '@/components/blog/RoteiroPreviewPanel';
import { publicarNoWordPress } from '@/app/dashboard/blog/juju-actions';

export default function BlogRoteirosList({ roteiros, siteId, deleteAction }: { roteiros: any[], siteId?: string, deleteAction?: (formData: FormData) => Promise<void> }) {
  const [selectedRoteiro, setSelectedRoteiro] = useState<any>(null);
  const [showPreviewPanel, setShowPreviewPanel] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleOpenPreview = (roteiro: any) => {
    // Converte para o que o PreviewPanel espera
    setSelectedRoteiro({
      id: roteiro.id,
      titulo: roteiro.titulo || '',
      conteudo: roteiro.conteudo || '',
      imagemUrl: roteiro.imagem_url,
      site_id: roteiro.site_id,
      categoria_wp_id: roteiro.categoria_wp_id
    });
    setShowPreviewPanel(true);
  };

  const handlePublish = async (dados: any) => {
    if (!selectedRoteiro) return;
    try {
      setIsPublishing(true);
      await publicarNoWordPress(selectedRoteiro.id, dados);
      setShowPreviewPanel(false);
      setShowSuccessPopup(true);
    } catch (err: any) {
      alert(`Erro ao publicar: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-[26px] font-medium tracking-tight text-gray-900">Meus Roteiros</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Gerencie seus artigos gerados e rascunhos manuais.</p>
        </div>
        
        <Link href="/dashboard/blog/roteiros" className="flex items-center gap-2 px-5 py-2.5 bg-[#111827] text-white rounded-full text-sm font-medium hover:bg-gray-800 shadow-md hover:shadow-lg transition-all">
          <PenLine className="w-4 h-4" /> Novo Roteiro
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(!roteiros || roteiros.length === 0) ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 bg-[#F2F2F2] rounded-[2rem] border border-[#EFEFEF]">
            <FileText className="w-12 h-12 mb-3 opacity-50" />
            <p>Você ainda não criou nenhum roteiro.</p>
          </div>
        ) : (
          roteiros.map((roteiro) => (
            <div key={roteiro.id} className="relative bg-white border border-[#EFEFEF] rounded-[2rem] overflow-hidden hover:shadow-md hover:border-gray-300 transition-all group flex flex-col shadow-[0_2px_10px_-7px_rgba(17,24,39,0.14)]">
              
              {/* Botão de Excluir que aparece no Hover */}
              <form action={deleteAction} className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <input type="hidden" name="id" value={roteiro.id} />
                <button type="submit" className="p-2 bg-white/90 backdrop-blur rounded-full shadow-sm border border-red-100 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors" title="Excluir Roteiro">
                  <Trash2 className="w-4 h-4" />
                </button>
              </form>
              
              {/* WE DO NOT USE <Link> here anymore! We use <button> or <div onClick> to open the modal */}
              <div onClick={() => handleOpenPreview(roteiro)} className="flex flex-col h-full cursor-pointer relative z-10 text-left">
                <div className="h-32 bg-[#F3F4F6] relative flex items-center justify-center border-b border-[#EFEFEF] overflow-hidden">
                  {roteiro.imagem_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={roteiro.imagem_url} alt="Capa" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <FileText className="w-8 h-8 text-gray-300" />
                  )}
                  
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[11px] font-semibold px-3 py-1 rounded-full shadow-sm border border-[#EFEFEF] text-gray-700 capitalize">
                    {roteiro.origem === 'ia' ? 'IA (Juju)' : 'Manual'}
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-medium text-gray-900 line-clamp-2 leading-snug mb-2 tracking-tight group-hover:text-gray-700 transition-colors">
                    {roteiro.titulo || 'Rascunho sem título'}
                  </h3>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between text-xs">
                    <span className={`px-3 py-1 rounded-full font-semibold border ${
                      roteiro.status === 'publicado' ? 'bg-[#DFFF00]/20 text-gray-900 border-[#DFFF00]/40' :
                      roteiro.status === 'pronto_para_revisao' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-[#F3F4F6] text-gray-600 border-[#EFEFEF]'
                    }`}>
                      {roteiro.status === 'pronto_para_revisao' ? 'Pronto p/ Revisão' : roteiro.status}
                    </span>
                    
                    <span className="text-gray-400 group-hover:text-gray-900 font-medium p-1 transition-colors flex items-center gap-1">
                      Revisar 
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Drawer */}
      {showPreviewPanel && selectedRoteiro && (
        <RoteiroPreviewPanel 
          isOpen={true} 
          onClose={() => setShowPreviewPanel(false)} 
          roteiro={selectedRoteiro}
          editMode={false}
          onPublish={handlePublish}
        />
      )}

      {/* Loading */}
      {isPublishing && (
        <div className="fixed inset-0 z-[60] bg-white/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-xl flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-slate-800 font-medium">Publicando no WordPress...</span>
          </div>
        </div>
      )}

      {/* Success Popup */}
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
                onClick={() => {
                  setShowSuccessPopup(false);
                  window.location.reload(); // Refresh para atualizar o status na galeria
                }} 
                className="w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Voltar para Galeria
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
