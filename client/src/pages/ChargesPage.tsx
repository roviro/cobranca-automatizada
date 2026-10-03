import React, { useState } from 'react';
import { Search, Send, Trash2, Copy } from 'lucide-react';
import type { Charge } from '../types';

interface ChargesPageProps {
  charges: Charge[];
  loading: boolean;
  onOpenNewCharge: () => void;
  onSendWhatsApp: (chargeId: string) => void;
  onMarkAsPaid: (chargeId: string) => void;
  onDeleteCharge: (chargeId: string) => void;
  onCopyPix: (pix: string) => void;
}

export const ChargesPage: React.FC<ChargesPageProps> = ({
  charges,
  loading,
  onOpenNewCharge,
  onSendWhatsApp,
  onMarkAsPaid,
  onDeleteCharge,
  onCopyPix
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const getDaysDiffText = (dueDateStr: string, status: string) => {
    if (status === 'RECEIVED') return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [year, month, day] = dueDateStr.split('-').map(Number);
    const dueDate = new Date(year, month - 1, day);
    dueDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return <span className="text-yellow-400 font-bold">Vence HOJE</span>;
    if (diffDays > 0) return <span className="text-slate-400">Vence em {diffDays}d</span>;
    return <span className="text-red-400 font-bold">Atrasado há {Math.abs(diffDays)}d</span>;
  };

  const filteredCharges = charges.filter((c) => {
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    const matchesSearch = c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.clientPhone.includes(searchTerm) ||
                          (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Gestão de Cobranças
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Acompanhe faturas emitidas, copie códigos PIX e acione réguas manuais.
          </p>
        </div>

        <button
          onClick={onOpenNewCharge}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all self-start sm:self-auto"
        >
          <Send className="w-4 h-4" />
          <span>+ Nova Cobrança</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Status Chips */}
        <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/5 rounded-2xl w-full md:w-auto overflow-x-auto">
          {[
            { id: 'ALL', label: 'Todas' },
            { id: 'PENDING', label: 'Pendentes' },
            { id: 'RECEIVED', label: 'Pagas' },
            { id: 'OVERDUE', label: 'Vencidas' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                filterStatus === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

      </div>

      {/* Table */}
      <div className="glass-panel rounded-3xl p-6 border-white/5 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">
            Carregando cobranças...
          </div>
        ) : filteredCharges.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-400">
            Nenhuma cobrança encontrada com os filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-white/5">
                  <th className="pb-3 font-semibold">Cliente</th>
                  <th className="pb-3 font-semibold">Valor</th>
                  <th className="pb-3 font-semibold">Vencimento</th>
                  <th className="pb-3 font-semibold">Descrição</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">PIX</th>
                  <th className="pb-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCharges.map((ch) => (
                  <tr key={ch.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5">
                      <div className="font-bold text-white">{ch.clientName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{ch.clientPhone}</div>
                    </td>

                    <td className="py-3.5 font-mono font-bold text-white text-sm">
                      {formatCurrency(ch.value)}
                    </td>

                    <td className="py-3.5">
                      <div className="font-mono text-slate-200">{formatDate(ch.dueDate)}</div>
                      <div className="text-[10px] font-mono mt-0.5">{getDaysDiffText(ch.dueDate, ch.status)}</div>
                    </td>

                    <td className="py-3.5 text-slate-300 max-w-[180px] truncate" title={ch.description}>
                      {ch.description || '—'}
                    </td>

                    <td className="py-3.5">
                      {ch.status === 'RECEIVED' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold font-mono">
                          PAGO
                        </span>
                      )}
                      {ch.status === 'PENDING' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 text-[10px] font-bold font-mono">
                          PENDENTE
                        </span>
                      )}
                      {ch.status === 'OVERDUE' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] font-bold font-mono">
                          VENCIDO
                        </span>
                      )}
                    </td>

                    <td className="py-3.5">
                      {ch.pixCopiaECola ? (
                        <button
                          onClick={() => onCopyPix(ch.pixCopiaECola!)}
                          title="Copiar código PIX Copia e Cola"
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 hover:text-white hover:bg-cyan-900/60 font-mono text-[10px] transition"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copiar PIX</span>
                        </button>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {ch.status !== 'RECEIVED' && (
                          <>
                            <button
                              onClick={() => onSendWhatsApp(ch.id)}
                              title="Disparar PIX no WhatsApp agora"
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onMarkAsPaid(ch.id)}
                              title="Marcar fatura como Paga"
                              className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold px-2 transition"
                            >
                              Baixa
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => onDeleteCharge(ch.id)}
                          title="Excluir fatura"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
