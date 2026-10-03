import React from 'react';
import { LayoutDashboard, Receipt, Users, Settings, Play, Send } from 'lucide-react';

interface NavbarProps {
  currentTab: 'dashboard' | 'charges' | 'clients' | 'settings';
  setCurrentTab: (tab: 'dashboard' | 'charges' | 'clients' | 'settings') => void;
  onOpenNewCharge: () => void;
  onTriggerSweep: () => void;
  isSweeping: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenNewCharge,
  onTriggerSweep,
  isSweeping
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#080c14]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-cyan-500/25">
            R
          </div>
          <div>
            <div className="font-extrabold text-white text-base tracking-wide flex items-center gap-2">
              ROVIRO <span className="text-cyan-400 font-mono text-xs px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30">COBRANÇA</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Automação de WhatsApp &amp; PIX</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-black/40 p-1.5 rounded-2xl border border-white/5">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              currentTab === 'dashboard'
                ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentTab('charges')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              currentTab === 'charges'
                ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Cobranças</span>
          </button>

          <button
            onClick={() => setCurrentTab('clients')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              currentTab === 'clients'
                ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Clientes</span>
          </button>

          <button
            onClick={() => setCurrentTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              currentTab === 'settings'
                ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configurações</span>
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onTriggerSweep}
            disabled={isSweeping}
            title="Executar régua de cobrança automática agora"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 hover:border-cyan-500/40 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium transition"
          >
            <Play className={`w-3.5 h-3.5 text-cyan-400 ${isSweeping ? 'animate-spin' : ''}`} />
            <span>{isSweeping ? 'Verificando...' : 'Rodar Régua'}</span>
          </button>

          <button
            onClick={onOpenNewCharge}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Nova Cobrança</span>
          </button>
        </div>

      </div>
    </header>
  );
};
