import React, { useState } from 'react';
import { Search, UserPlus, Phone, Mail, Trash2, Send } from 'lucide-react';
import type { Client } from '../types';

interface ClientsPageProps {
  clients: Client[];
  loading: boolean;
  onOpenNewClient: () => void;
  onOpenChargeForClient: (clientId: string) => void;
  onDeleteClient: (clientId: string) => void;
}

export const ClientsPage: React.FC<ClientsPageProps> = ({
  clients,
  loading,
  onOpenNewClient,
  onOpenChargeForClient,
  onDeleteClient
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (val?: number) => {
    return (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Base de Clientes
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Contatos cadastrados para emissão de PIX e réguas de WhatsApp.
          </p>
        </div>

        <button
          onClick={onOpenNewClient}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Cadastrar Cliente</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar por nome, telefone ou e-mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
        />
      </div>

      {/* Grid or Table */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">
          Carregando clientes...
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="py-20 text-center text-xs text-slate-400">
          Nenhum cliente cadastrado ainda. Clique em "+ Cadastrar Cliente" para adicionar.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <div key={client.id} className="glass-panel rounded-2xl p-5 border-white/5 space-y-4 hover:border-cyan-500/30 transition">
              
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">{client.name}</h3>
                  <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-xs mt-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{client.phone}</span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteClient(client.id)}
                  title="Excluir cliente"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {client.email && (
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{client.email}</span>
                </div>
              )}

              <div className="pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-500 block">Cobranças</span>
                  <span className="font-bold text-white font-mono">{client.totalCharges || 0} faturas</span>
                </div>
                <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-500 block">Total Pago</span>
                  <span className="font-bold text-emerald-400 font-mono">{formatCurrency(client.totalPaid)}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onOpenChargeForClient(client.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-cyan-500/10 text-cyan-300 hover:text-cyan-200 border border-white/10 hover:border-cyan-500/30 text-xs font-semibold transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Emitir Cobrança para este Cliente</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
