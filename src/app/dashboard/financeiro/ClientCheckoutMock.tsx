'use client'

import { useState } from 'react'
import { QrCode, CreditCard, X, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { mockPayInvoice } from '../clientes/[id]/finance-actions'
import { usePathname } from 'next/navigation'

export function ClientCheckoutMock({ pagamento }: { pagamento: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [method, setMethod] = useState<'pix' | 'credit_card'>('pix')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const pathname = usePathname()

  const handlePay = async () => {
    setLoading(true)
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const res = await mockPayInvoice(pagamento.id, pathname)
    if (res.error) {
      alert(res.error)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => {
        setIsOpen(false)
      }, 2000)
    }
  }

  return (
    <>
      <Button 
        className="bg-black text-[#DFFF00] hover:bg-gray-800"
        size="sm"
        onClick={() => setIsOpen(true)}
      >
        Pagar Fatura
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-semibold text-gray-900">Checkout</h2>
              <button onClick={() => !loading && !success && setIsOpen(false)} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {success ? (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pagamento Aprovado!</h3>
                <p className="text-gray-500">Sua fatura foi quitada com sucesso e a assinatura continua ativa.</p>
              </div>
            ) : (
              <div className="p-6">
                <div className="mb-6 text-center">
                  <p className="text-sm text-gray-500 mb-1">Valor da cobrança</p>
                  <p className="text-4xl font-bold text-gray-900">R$ {Number(pagamento.valor).toFixed(2)}</p>
                  <p className="text-sm font-medium text-black bg-[#DFFF00] inline-block px-3 py-1 rounded-full mt-3">
                    Ref: {pagamento.assinaturas?.planos?.nome}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button 
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-colors ${method === 'pix' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}
                    onClick={() => setMethod('pix')}
                  >
                    <QrCode className={`w-6 h-6 ${method === 'pix' ? 'text-black' : 'text-gray-400'}`} />
                    <span className={`font-medium ${method === 'pix' ? 'text-black' : 'text-gray-500'}`}>PIX</span>
                  </button>
                  <button 
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-colors ${method === 'credit_card' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}
                    onClick={() => setMethod('credit_card')}
                  >
                    <CreditCard className={`w-6 h-6 ${method === 'credit_card' ? 'text-black' : 'text-gray-400'}`} />
                    <span className={`font-medium ${method === 'credit_card' ? 'text-black' : 'text-gray-500'}`}>Cartão</span>
                  </button>
                </div>

                {method === 'pix' ? (
                  <div className="bg-gray-50 rounded-2xl p-6 flex flex-col items-center text-center border border-gray-100 mb-6">
                    <div className="w-40 h-40 bg-white border-2 border-dashed border-gray-300 rounded-xl mb-4 flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-gray-300" />
                      <span className="sr-only">QR Code Simulado</span>
                    </div>
                    <p className="text-sm text-gray-500">Escaneie o código com o app do seu banco para pagar.</p>
                  </div>
                ) : (
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="text-xs font-medium text-gray-500 ml-1">Número do Cartão</label>
                      <input type="text" placeholder="0000 0000 0000 0000" className="w-full mt-1 h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-black focus:ring-1 focus:ring-black" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 ml-1">Validade</label>
                        <input type="text" placeholder="MM/AA" className="w-full mt-1 h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-black focus:ring-1 focus:ring-black" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 ml-1">CVV</label>
                        <input type="text" placeholder="123" className="w-full mt-1 h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-black focus:ring-1 focus:ring-black" />
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full h-12 text-lg font-medium bg-[#DFFF00] text-black hover:bg-[#ccee00]"
                  onClick={handlePay}
                  disabled={loading}
                >
                  {loading ? 'Processando...' : 'Confirmar Pagamento'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
