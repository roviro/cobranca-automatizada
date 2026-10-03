import React, { useState } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import type { Client } from '../types';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Client>) => Promise<void>;
}

export const NewClientModal: React.FC<NewClientModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Nome e WhatsApp são obrigatórios.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSubmit({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        cpfCnpj: cpfCnpj.trim() || undefined
      });
      setName('');
      setPhone('');
      setEmail('');
      setCpfCnpj('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8 bg-[#0d1322] border border-cyan-500/20 shadow-2xl relative">
        
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Cadastrar Cliente</h2>
            <p className="text-xs text-slate-400 mt-0.5">Dados para emissão de PIX e WhatsApp</p>
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
          
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">Nome Completo / Razão Social *</label>
            <input
              type="text"
              placeholder="Ex: Barbearia Elite / Carlos Alberto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">WhatsApp com DDD *</label>
            <input
              type="tel"
              placeholder="Ex: 11986531134"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">O número onde o cliente receberá os lembretes e o PIX.</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">E-mail (opcional)</label>
              <input
                type="email"
                placeholder="cliente@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">CPF / CNPJ (opcional)</label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

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
              <UserPlus className="w-3.5 h-3.5" />
              <span>{loading ? 'Salvando...' : 'Salvar Cliente'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
