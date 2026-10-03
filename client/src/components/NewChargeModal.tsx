import React, { useState, useEffect } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import type { Client } from '../types';

interface NewChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  initialClientId?: string | null;
  onSubmit: (data: {
    clientId: string;
    value: number;
    dueDate: string;
    description: string;
    sendImmediateNotification: boolean;
  }) => Promise<void>;
  onOpenNewClient: () => void;
}

export const NewChargeModal: React.FC<NewChargeModalProps> = ({
  isOpen,
  onClose,
  clients,
  initialClientId,
  onSubmit,
  onOpenNewClient
}) => {
  const [clientId, setClientId] = useState(initialClientId || '');
  const [value, setValue] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [description, setDescription] = useState('Mensalidade de Serviços');
  const [sendImmediateNotification, setSendImmediateNotification] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialClientId) setClientId(initialClientId);
  }, [initialClientId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setError('Por favor, selecione um cliente.');
      return;
    }
    const numValue = parseFloat(value.replace(',', '.'));
    if (isNaN(numValue) || numValue <= 0) {
      setError('Informe um valor válido maior que zero.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSubmit({
        clientId,
        value: numValue,
        dueDate,
        description,
        sendImmediateNotification
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar cobrança');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 bg-[#0d1322] border border-cyan-500/20 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Emitir Nova Cobrança</h2>
            <p className="text-xs text-slate-400 mt-0.5">Gera PIX Copia e Cola e aciona o WhatsApp</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          
          {/* Cliente */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-300">Cliente *</label>
              <button
                type="button"
                onClick={() => { onClose(); onOpenNewClient(); }}
                className="text-cyan-400 hover:underline text-[11px]"
              >
                + Cadastrar novo cliente
              </button>
            </div>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="">Selecione o cliente...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          {/* Valor e Vencimento */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Valor (R$) *</label>
              <input
                type="text"
                placeholder="Ex: 150.00"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Data de Vencimento *</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">Descrição do Serviço / Fatura</label>
            <input
              type="text"
              placeholder="Ex: Mensalidade - Plano Pro / Consultoria"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Envio Imediato */}
          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 cursor-pointer">
            <input
              type="checkbox"
              checked={sendImmediateNotification}
              onChange={(e) => setSendImmediateNotification(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 accent-cyan-400"
            />
            <div>
              <span className="font-bold text-white text-xs block">Disparar notificação no WhatsApp agora</span>
              <span className="text-[11px] text-slate-400 block">Envia o código PIX Copia e Cola e detalhes da fatura para o cliente na hora.</span>
            </div>
          </label>

          {/* Botões */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Emitindo...' : 'Gerar e Cobrar'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
