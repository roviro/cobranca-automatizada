import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { ChargesPage } from './pages/ChargesPage';
import { ClientsPage } from './pages/ClientsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NewChargeModal } from './components/NewChargeModal';
import { NewClientModal } from './components/NewClientModal';
import { api } from './services/api';
import type { Client, Charge, DashboardStats } from './types';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'charges' | 'clients' | 'settings'>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSweeping, setIsSweeping] = useState(false);

  // Modais
  const [isNewChargeOpen, setIsNewChargeOpen] = useState(false);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [selectedClientIdForCharge, setSelectedClientIdForCharge] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, chargesData, clientsData] = await Promise.all([
        api.getDashboardStats(),
        api.getCharges(),
        api.getClients()
      ]);
      setStats(statsData);
      setCharges(chargesData);
      setClients(clientsData);
    } catch (err: any) {
      console.error(err);
      showToast('Erro ao carregar dados do servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCharge = async (data: {
    clientId: string;
    value: number;
    dueDate: string;
    description: string;
    sendImmediateNotification: boolean;
  }) => {
    await api.createCharge(data);
    showToast(
      data.sendImmediateNotification 
        ? 'Cobrança gerada e disparada no WhatsApp com sucesso!' 
        : 'Cobrança gerada com sucesso!'
    );
    loadData();
  };

  const handleCreateClient = async (data: Partial<Client>) => {
    await api.createClient(data);
    showToast('Cliente cadastrado com sucesso!');
    loadData();
  };

  const handleSendWhatsApp = async (chargeId: string) => {
    try {
      const res = await api.sendManualWhatsApp(chargeId);
      if (res.success) {
        showToast('Notificação com PIX enviada via WhatsApp!');
      } else {
        showToast(`Aviso: ${res.error || 'Verifique sua Evolution API'}`, 'error');
      }
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao enviar mensagem', 'error');
    }
  };

  const handleMarkAsPaid = async (chargeId: string) => {
    try {
      await api.markAsPaid(chargeId);
      showToast('Fatura baixada com sucesso e recibo enviado!');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao baixar fatura', 'error');
    }
  };

  const handleDeleteCharge = async (chargeId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta fatura?')) return;
    try {
      await api.deleteCharge(chargeId);
      showToast('Cobrança excluída.');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao excluir', 'error');
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Ao excluir este cliente, todas as cobranças vinculadas serão removidas. Continuar?')) return;
    try {
      await api.deleteClient(clientId);
      showToast('Cliente excluído.');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao excluir cliente', 'error');
    }
  };

  const handleTriggerSweep = async () => {
    try {
      setIsSweeping(true);
      const res = await api.triggerSweep();
      showToast(`Régua executada: ${res.scanned} faturas verificadas, ${res.sent} mensagens enviadas!`);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao executar régua', 'error');
    } finally {
      setIsSweeping(false);
    }
  };

  const handleCopyPix = (pix: string) => {
    navigator.clipboard.writeText(pix);
    showToast('Código PIX Copia e Cola copiado para a área de transferência!');
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans">
      
      {/* Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenNewCharge={() => setIsNewChargeOpen(true)}
        onTriggerSweep={handleTriggerSweep}
        isSweeping={isSweeping}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'dashboard' && (
          <DashboardPage
            stats={stats}
            loading={loading}
            onOpenNewCharge={() => setIsNewChargeOpen(true)}
            onOpenNewClient={() => setIsNewClientOpen(true)}
            onSendWhatsApp={handleSendWhatsApp}
            onMarkAsPaid={handleMarkAsPaid}
          />
        )}

        {currentTab === 'charges' && (
          <ChargesPage
            charges={charges}
            loading={loading}
            onOpenNewCharge={() => setIsNewChargeOpen(true)}
            onSendWhatsApp={handleSendWhatsApp}
            onMarkAsPaid={handleMarkAsPaid}
            onDeleteCharge={handleDeleteCharge}
            onCopyPix={handleCopyPix}
          />
        )}

        {currentTab === 'clients' && (
          <ClientsPage
            clients={clients}
            loading={loading}
            onOpenNewClient={() => setIsNewClientOpen(true)}
            onOpenChargeForClient={(clientId) => {
              setSelectedClientIdForCharge(clientId);
              setIsNewChargeOpen(true);
            }}
            onDeleteClient={handleDeleteClient}
          />
        )}

        {currentTab === 'settings' && <SettingsPage />}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500 font-mono">
        Roviro Cobrança Automatizada • Desenvolvido para Roviro Dev &amp; Arch • © 2026
      </footer>

      {/* Modais */}
      <NewChargeModal
        isOpen={isNewChargeOpen}
        onClose={() => {
          setIsNewChargeOpen(false);
          setSelectedClientIdForCharge(null);
        }}
        clients={clients}
        initialClientId={selectedClientIdForCharge}
        onSubmit={handleCreateCharge}
        onOpenNewClient={() => setIsNewClientOpen(true)}
      />

      <NewClientModal
        isOpen={isNewClientOpen}
        onClose={() => setIsNewClientOpen(false)}
        onSubmit={handleCreateClient}
      />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold backdrop-blur-md animate-bounce ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/90 border-red-500/40 text-red-300'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

    </div>
  );
}

export default App;
