import type { Client, Charge, DashboardStats } from '../types';

const BASE_URL = '/api';

// --- MOCK STORAGE PARA AMBIENTE DE DEMO ONLINE ---
const STORAGE_KEYS = {
  CLIENTS: 'roviro_cobranca_clients',
  CHARGES: 'roviro_cobranca_charges',
  SETTINGS: 'roviro_cobranca_settings'
};

function getStoredOrInit<T>(key: string, initData: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(initData));
      return initData;
    }
    return JSON.parse(item);
  } catch {
    return initData;
  }
}

function saveStore<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Falha ao salvar no localStorage demo:', e);
  }
}

const todayStr = new Date().toISOString().split('T')[0];
const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
const yesterdayStr = new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0];
const lastWeekStr = new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0];

const defaultClients: Client[] = [
  { id: 'cli_1', name: 'TechSolutions Ltda', email: 'contato@techsolutions.com.br', phone: '11999887766', cpfCnpj: '23.456.789/0001-12', createdAt: lastWeekStr },
  { id: 'cli_2', name: 'Studio Criativo Design', email: 'financeiro@studiocriativo.art', phone: '11988776655', cpfCnpj: '34.567.890/0001-23', createdAt: lastWeekStr },
  { id: 'cli_3', name: 'Dra. Patrícia Lima', email: 'patricia@clinica.com.br', phone: '11977665544', cpfCnpj: '123.456.789-00', createdAt: lastWeekStr },
  { id: 'cli_4', name: 'Mecânica e Autopeças Silva', email: 'carlos@mecanicasilva.com.br', phone: '11966554433', cpfCnpj: '45.678.901/0001-34', createdAt: lastWeekStr }
];

const defaultCharges: Charge[] = [
  {
    id: 'chg_1',
    clientId: 'cli_1',
    clientName: 'TechSolutions Ltda',
    clientPhone: '11999887766',
    value: 1250.00,
    dueDate: tomorrowStr,
    status: 'PENDING',
    description: 'Manutenção Mensal Servidores Nuvem',
    billingType: 'PIX',
    pixCopiaECola: '00020101021226840014br.gov.bcb.pix2562pix.asaas.com/qr/stat/f73a38bdf85802BR5913Roviro Solucao6009Sao Paulo62070503***6304D1A4',
    invoiceUrl: 'https://sandbox.asaas.com/i/demo_fatura_1',
    createdAt: lastWeekStr
  },
  {
    id: 'chg_2',
    clientId: 'cli_2',
    clientName: 'Studio Criativo Design',
    clientPhone: '11988776655',
    value: 3400.00,
    dueDate: todayStr,
    status: 'PENDING',
    description: 'Desenvolvimento Web & Integrações API',
    billingType: 'PIX',
    pixCopiaECola: '00020101021226840014br.gov.bcb.pix2562pix.asaas.com/qr/stat/982c7105802BR5913Roviro Solucao6009Sao Paulo62070503***6304E2B5',
    invoiceUrl: 'https://sandbox.asaas.com/i/demo_fatura_2',
    createdAt: lastWeekStr
  },
  {
    id: 'chg_3',
    clientId: 'cli_3',
    clientName: 'Dra. Patrícia Lima',
    clientPhone: '11977665544',
    value: 890.00,
    dueDate: yesterdayStr,
    status: 'OVERDUE',
    description: 'Consultoria de Automação & WhatsApp',
    billingType: 'PIX',
    pixCopiaECola: '00020101021226840014br.gov.bcb.pix2562pix.asaas.com/qr/stat/12a885802BR5913Roviro Solucao6009Sao Paulo62070503***6304F3C6',
    invoiceUrl: 'https://sandbox.asaas.com/i/demo_fatura_3',
    createdAt: lastWeekStr
  },
  {
    id: 'chg_4',
    clientId: 'cli_4',
    clientName: 'Mecânica e Autopeças Silva',
    clientPhone: '11966554433',
    value: 2500.00,
    dueDate: lastWeekStr,
    status: 'RECEIVED',
    description: 'Implantação de Sistema Operacional',
    billingType: 'PIX',
    pixCopiaECola: '00020101021226840014br.gov.bcb.pix2562pix.asaas.com/qr/stat/33d445802BR5913Roviro Solucao6009Sao Paulo62070503***6304A1B2',
    invoiceUrl: 'https://sandbox.asaas.com/i/demo_fatura_4',
    createdAt: lastWeekStr
  }
];

const defaultSettings: Record<string, string> = {
  asaas_api_key: 'demo_asaas_key_prod_roviro',
  asaas_environment: 'sandbox',
  evolution_api_url: 'https://api.roviro.com.br',
  evolution_api_key: 'demo_token_roviro_evolution',
  evolution_instance: 'cobranca_producao',
  company_name: 'Roviro Soluções & Engenharia',
  company_phone: '5511986531134'
};

function computeStats(charges: Charge[], clientsCount: number): DashboardStats {
  let totalReceived = 0;
  let totalPending = 0;
  let totalOverdue = 0;
  let countReceived = 0;
  let countPending = 0;
  let countOverdue = 0;

  for (const c of charges) {
    if (c.status === 'RECEIVED') {
      totalReceived += c.value;
      countReceived++;
    } else if (c.status === 'OVERDUE') {
      totalOverdue += c.value;
      countOverdue++;
    } else {
      totalPending += c.value;
      countPending++;
    }
  }

  return {
    totalReceived,
    totalPending,
    totalOverdue,
    countReceived,
    countPending,
    countOverdue,
    totalClients: clientsCount,
    totalMessagesSent: charges.length * 2,
    recentCharges: charges.slice(0, 5),
    recentLogs: [
      {
        id: 'log_1',
        chargeId: 'chg_1',
        clientName: 'TechSolutions Ltda',
        value: 1250,
        type: 'D-3 Lembrete',
        sentAt: 'Hoje 08:30',
        status: 'SUCCESS'
      },
      {
        id: 'log_2',
        chargeId: 'chg_2',
        clientName: 'Studio Criativo Design',
        value: 3400,
        type: 'Vencimento Hoje',
        sentAt: 'Hoje 09:15',
        status: 'SUCCESS'
      }
    ]
  };
}

// --- API EXPORT COM FALLBACK RESILIENTE PARA DEMO ---
export const api = {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const res = await fetch(`${BASE_URL}/dashboard/stats`);
      if (res.ok) return await res.json();
    } catch {}
    const charges = getStoredOrInit(STORAGE_KEYS.CHARGES, defaultCharges);
    const clients = getStoredOrInit(STORAGE_KEYS.CLIENTS, defaultClients);
    return computeStats(charges, clients.length);
  },

  async getClients(): Promise<Client[]> {
    try {
      const res = await fetch(`${BASE_URL}/clients`);
      if (res.ok) return await res.json();
    } catch {}
    return getStoredOrInit(STORAGE_KEYS.CLIENTS, defaultClients);
  },

  async createClient(data: Partial<Client>): Promise<Client> {
    try {
      const res = await fetch(`${BASE_URL}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch {}
    const clients = getStoredOrInit(STORAGE_KEYS.CLIENTS, defaultClients);
    const newClient: Client = {
      id: 'cli_' + Date.now(),
      name: data.name || 'Novo Cliente',
      email: data.email || '',
      phone: data.phone || '',
      cpfCnpj: data.cpfCnpj || '',
      createdAt: new Date().toISOString().split('T')[0]
    };
    clients.unshift(newClient);
    saveStore(STORAGE_KEYS.CLIENTS, clients);
    return newClient;
  },

  async deleteClient(id: string): Promise<void> {
    try {
      const res = await fetch(`${BASE_URL}/clients/${id}`, { method: 'DELETE' });
      if (res.ok) return;
    } catch {}
    const clients = getStoredOrInit(STORAGE_KEYS.CLIENTS, defaultClients).filter(c => c.id !== id);
    saveStore(STORAGE_KEYS.CLIENTS, clients);
  },

  async getCharges(status?: string): Promise<Charge[]> {
    try {
      const url = status ? `${BASE_URL}/charges?status=${status}` : `${BASE_URL}/charges`;
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch {}
    const all = getStoredOrInit(STORAGE_KEYS.CHARGES, defaultCharges);
    if (!status || status === 'ALL') return all;
    return all.filter(c => c.status === status);
  },

  async createCharge(data: {
    clientId: string;
    value: number;
    dueDate: string;
    description?: string;
    billingType?: string;
    sendImmediateNotification?: boolean;
  }): Promise<{ charge: Charge; notification?: any }> {
    try {
      const res = await fetch(`${BASE_URL}/charges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch {}
    const clients = getStoredOrInit(STORAGE_KEYS.CLIENTS, defaultClients);
    const client = clients.find(c => c.id === data.clientId) || { name: 'Cliente Geral', phone: '11999999999' };
    const charges = getStoredOrInit(STORAGE_KEYS.CHARGES, defaultCharges);
    const chargeId = 'chg_' + Date.now();
    const newCharge: Charge = {
      id: chargeId,
      clientId: data.clientId,
      clientName: client.name,
      clientPhone: client.phone,
      value: Number(data.value),
      dueDate: data.dueDate,
      status: 'PENDING',
      description: data.description || 'Cobrança Avulsa',
      billingType: data.billingType || 'PIX',
      pixCopiaECola: `00020101021226840014br.gov.bcb.pix2562pix.asaas.com/qr/stat/${chargeId}5802BR5913Roviro Solucao6009Sao Paulo62070503***6304${chargeId.slice(-4)}`,
      invoiceUrl: `https://sandbox.asaas.com/i/${chargeId}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    charges.unshift(newCharge);
    saveStore(STORAGE_KEYS.CHARGES, charges);
    return { charge: newCharge };
  },

  async sendManualWhatsApp(chargeId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${BASE_URL}/charges/${chargeId}/send-whatsapp`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch {}
    return { success: true };
  },

  async markAsPaid(chargeId: string): Promise<void> {
    try {
      const res = await fetch(`${BASE_URL}/charges/${chargeId}/mark-paid`, { method: 'POST' });
      if (res.ok) return;
    } catch {}
    const charges = getStoredOrInit(STORAGE_KEYS.CHARGES, defaultCharges).map(c => {
      if (c.id === chargeId) return { ...c, status: 'RECEIVED' as const };
      return c;
    });
    saveStore(STORAGE_KEYS.CHARGES, charges);
  },

  async deleteCharge(chargeId: string): Promise<void> {
    try {
      const res = await fetch(`${BASE_URL}/charges/${chargeId}`, { method: 'DELETE' });
      if (res.ok) return;
    } catch {}
    const charges = getStoredOrInit(STORAGE_KEYS.CHARGES, defaultCharges).filter(c => c.id !== chargeId);
    saveStore(STORAGE_KEYS.CHARGES, charges);
  },

  async getSettings(): Promise<Record<string, string>> {
    try {
      const res = await fetch(`${BASE_URL}/settings`);
      if (res.ok) return await res.json();
    } catch {}
    return getStoredOrInit(STORAGE_KEYS.SETTINGS, defaultSettings);
  },

  async updateSettings(settings: Record<string, string>): Promise<void> {
    try {
      const res = await fetch(`${BASE_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) return;
    } catch {}
    saveStore(STORAGE_KEYS.SETTINGS, settings);
  },

  async testEvolution(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${BASE_URL}/settings/test-evolution`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch {}
    return { success: true, message: 'Conexão Evolution API verificada com sucesso (Simulação Demo).' };
  },

  async triggerSweep(): Promise<{ scanned: number; sent: number; errors: number }> {
    try {
      const res = await fetch(`${BASE_URL}/jobs/trigger-sweep`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch {}
    return { scanned: 4, sent: 2, errors: 0 };
  }
};
