'use client';

import { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Send, Edit2, Check, FileText, Clock, Sparkles } from 'lucide-react';

interface RoteiroPreviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
  roteiro: {
    titulo: string;
    conteudo: string;
    imagemUrl?: string;
  };
  editMode?: boolean;
  onPublish?: (dados: any) => void;
  wpStatus?: string;
}

export default function RoteiroPreviewPanel({ isOpen, onClose, roteiro, editMode = false, onPublish, wpStatus }: RoteiroPreviewPanelProps) {
  const [titulo, setTitulo] = useState(roteiro.titulo);
  const [conteudo, setConteudo] = useState(roteiro.conteudo);
  const [imagemUrl, setImagemUrl] = useState(roteiro.imagemUrl || '');
  const [isEditing, setIsEditing] = useState(editMode);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTitulo(roteiro.titulo);
      setConteudo(roteiro.conteudo);
      setImagemUrl(roteiro.imagemUrl || '');
      setIsEditing(editMode);
    }
  }, [isOpen, roteiro.titulo, roteiro.conteudo, roteiro.imagemUrl, editMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#F3F4F6] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 rounded-l-[2rem] overflow-hidden border-l border-[#EFEFEF]">
        
        {/* Header do Painel */}
        <div className="flex items-center justify-between p-6 border-b border-[#EFEFEF] bg-white">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-slate-800">
              {isEditing ? 'Editar Roteiro' : 'Pré-visualização do Artigo'}
            </h3>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-xs flex items-center gap-1 text-gray-600 font-medium hover:bg-gray-100 px-3 py-1.5 rounded-full transition-colors"
              >
                <Edit2 className="w-3 h-3" /> Editar
              </button>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="px-5 py-2 text-sm font-medium text-red-500 border border-red-100 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors bg-white shadow-sm"
          >
            Cancelar
          </button>
        </div>

        {/* Corpo (Preview / Edição) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="bg-white rounded-[2rem] shadow-sm border border-[#EFEFEF] overflow-hidden max-w-3xl mx-auto">
            
            {/* Imagem de Capa */}
            <div className="w-full h-64 bg-[#F3F4F6] relative border-b border-[#EFEFEF] flex flex-col items-center justify-center text-gray-400 overflow-hidden group">
              {imagemUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagemUrl} alt="Capa" className="object-cover w-full h-full" />
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-sm font-medium">Nenhuma imagem selecionada</span>
                </>
              )}
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-6">
                  <p className="text-white font-medium mb-3">Alterar Imagem de Capa (URL)</p>
                  <input 
                    type="url" 
                    value={imagemUrl} 
                    onChange={(e) => setImagemUrl(e.target.value)}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="w-full max-w-md px-4 py-2 rounded-lg text-gray-900 border-none outline-none focus:ring-2 focus:ring-[#DFFF00]"
                  />
                </div>
              )}
            </div>

            {/* Conteúdo */}
            <div className="p-8 prose prose-blue max-w-none">
              {isEditing ? (
                <div className="space-y-4">
                  <input 
                    type="text" 
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="w-full text-3xl font-bold text-slate-900 border-none outline-none focus:ring-0 px-0"
                    placeholder="Título do Artigo"
                  />
                  <textarea 
                    value={conteudo}
                    onChange={(e) => setConteudo(e.target.value)}
                    className="w-full h-[500px] text-slate-700 border-none outline-none focus:ring-0 px-0 resize-none"
                    placeholder="Escreva seu artigo aqui..."
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-slate-900 mb-6">{titulo}</h1>
                  <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                    {conteudo}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#EFEFEF] bg-white flex justify-end gap-3">
          
          {isEditing ? (
            <button 
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-colors shadow-sm"
            >
              <Check className="w-4 h-4" /> Salvar Edições
            </button>
          ) : showSchedule ? (
            <div className="flex items-center gap-2 bg-[#F3F4F6] p-1.5 rounded-full border border-[#EFEFEF]">
              <input 
                type="datetime-local" 
                className="px-4 py-2 border-none bg-white rounded-full text-sm outline-none focus:ring-2 focus:ring-black"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
              <button 
                onClick={() => {
                  if(!scheduleDate) return alert('Selecione uma data e hora para agendar.');
                  onPublish && onPublish({ titulo, conteudo, imagemUrl: imagemUrl, status: 'future', date: new Date(scheduleDate).toISOString() })
                }}
                className="px-5 py-2 text-sm font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-colors shadow-sm"
              >
                Confirmar
              </button>
              <button onClick={() => setShowSchedule(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800 font-medium">
                Cancelar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 w-full justify-end">
              {wpStatus !== 'publish' && (
                <>
                  <button 
                    onClick={() => onPublish && onPublish({ titulo, conteudo, imagemUrl: imagemUrl, status: 'draft' })}
                    className="flex items-center gap-2 px-5 py-3 text-[15px] font-semibold text-gray-700 bg-white border border-[#EFEFEF] rounded-xl hover:bg-gray-50 transition-colors flex-1 justify-center"
                  >
                    <FileText className="w-5 h-5 text-gray-400" />
                    Salvar como Rascunho
                  </button>
                  
                  <button 
                    onClick={() => setShowSchedule(true)}
                    className="flex items-center gap-2 px-5 py-3 text-[15px] font-semibold text-[#8B5CF6] bg-white border border-[#DDD6FE] rounded-xl hover:bg-[#F5F3FF] transition-colors flex-1 justify-center"
                  >
                    <Clock className="w-5 h-5" />
                    Agendar Publicação
                  </button>
                </>
              )}

              <button 
                onClick={() => onPublish && onPublish({ titulo, conteudo, imagemUrl: imagemUrl, status: wpStatus || 'publish' })}
                className="flex items-center gap-2 px-5 py-3 text-[15px] font-semibold text-white bg-black rounded-xl hover:bg-gray-900 transition-colors flex-1 justify-center"
              >
                {wpStatus === 'publish' ? (
                   <Check className="w-5 h-5" />
                ) : (
                   <Sparkles className="w-5 h-5 text-yellow-400" />
                )}
                {wpStatus === 'publish' ? 'Atualizar Postagem' : 'Publicar Agora'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
