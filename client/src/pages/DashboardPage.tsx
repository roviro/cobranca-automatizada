import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  Send, 
  Users,
  Clock
} from 'lucide-react';
import type { DashboardStats } from '../types';

interface DashboardPageProps {
  stats: DashboardStats | null;
  loading: boolean;
  onOpenNewCharge: () => void;
  onOpenNewClient: () => void;
  onSendWhatsApp: (chargeId: string) => void;
  onMarkAsPaid: (chargeId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  loading,
  onOpenNewCharge,
  onOpenNewClient,
  onSendWhatsApp,
  onMarkAsPaid
}) => {
  if (loading || !stats) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Carregando indicadores financeiros...
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-8">
      
      {/* Welcome & Quick CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Cockpit Financeiro &amp; Cobranças
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Visão geral da sua operação, recebimentos em nuvem e réguas ativas no WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewClient}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 hover:border-cyan-500/40 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>+ Novo Cliente</span>
          </button>

          <button
            onClick={onOpenNewCharge}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Emitir Cobrança</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total a Receber */}
        <div className="glass-panel rounded-2xl p-5 border-cyan-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
            <span>A Receber (Pendentes)</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 grid place-items-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {formatCurrency(stats.totalPending)}
          </div>
          <div className="text-[11px] text-cyan-400/80 mt-1 font-mono">
            {stats.countPending} fatura(s) aguardando
          </div>
        </div>

        {/* Total Recebido */}
        <div className="glass-panel rounded-2xl p-5 border-emerald-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
            <span>Recebido no Mês</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 grid place-items-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {formatCurrency(stats.totalReceived)}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1 font-mono">
            {stats.countReceived} pagamento(s) confirmado(s)
          </div>
        </div>

        {/* Inadimplência */}
        <div className="glass-panel rounded-2xl p-5 border-red-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
            <span>Inadimplentes (Atrasados)</span>
            <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 grid place-items-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-red-400">
            {formatCurrency(stats.totalOverdue)}
          </div>
          <div className="text-[11px] text-red-400/80 mt-1 font-mono">
            {stats.countOverdue} fatura(s) vencida(s)
          </div>
        </div>

        {/* Mensagens WhatsApp */}
        <div className="glass-panel rounded-2xl p-5 border-indigo-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
            <span>Disparos WhatsApp</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 grid place-items-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {stats.totalMessagesSent}
          </div>
          <div className="text-[11px] text-indigo-300/80 mt-1 font-mono">
            {stats.totalClients} clientes cadastrados
          </div>
        </div>

      </div>

      {/* Grid: Cobranças Recentes + Logs do WhatsApp */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Cobranças Recentes (2 colunas) */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border-white/5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h2 className="font-bold text-white text-base">Cobranças Recentes</h2>
            <span className="text-xs text-slate-400">Últimos lançamentos</span>
          </div>

          {stats.recentCharges.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Nenhuma cobrança registrada ainda. Clique em "Emitir Cobrança" para começar!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-white/5">
                    <th className="pb-3 font-semibold">Cliente</th>
                    <th className="pb-3 font-semibold">Valor</th>
                    <th className="pb-3 font-semibold">Vencimento</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.recentCharges.map((ch) => (
                    <tr key={ch.id} className="hover:bg-white/[0.02]">
                      <td className="py-3.5">
                        <div className="font-bold text-white">{ch.clientName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{ch.clientPhone}</div>
                      </td>
                      <td className="py-3.5 font-mono font-bold text-slate-200">
                        {formatCurrency(ch.value)}
                      </td>
                      <td className="py-3.5 font-mono text-slate-300">
                        {formatDate(ch.dueDate)}
                      </td>
                      <td className="py-3.5">
                        {ch.status === 'RECEIVED' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            PAGO
                          </span>
                        )}
                        {ch.status === 'PENDING' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 text-[10px] font-bold">
                            PENDENTE
                          </span>
                        )}
                        {ch.status === 'OVERDUE' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] font-bold">
                            VENCIDO
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {ch.status !== 'RECEIVED' && (
                            <>
                              <button
                                onClick={() => onSendWhatsApp(ch.id)}
                                title="Enviar PIX no WhatsApp agora"
                                className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onMarkAsPaid(ch.id)}
                                title="Marcar como Pago manualmente"
                                className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition text-[11px] font-bold px-2"
                              >
                                Dar Baixa
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Histórico de Disparos WhatsApp (1 coluna) */}
        <div className="glass-panel rounded-3xl p-6 border-white/5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h2 className="font-bold text-white text-base">Disparos Recentes</h2>
            <span className="text-[11px] text-cyan-400 font-mono">WhatsApp Real-time</span>
          </div>

          {stats.recentLogs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Nenhuma mensagem disparada recentemente.
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-2xl bg-black/40 border border-white/5 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{log.clientName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      log.status === 'SUCCESS' ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
                    }`}>
                      {log.status === 'SUCCESS' ? 'ENTREGUE' : 'FALHA'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono">
                    <span>{log.type}</span>
                    <span>{new Date(log.sentAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
