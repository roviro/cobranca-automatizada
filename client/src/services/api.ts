import type { Client, Charge, DashboardStats } from '../types';

const BASE_URL = '/api';

export const api = {
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${BASE_URL}/dashboard/stats`);
    if (!res.ok) throw new Error('Falha ao carregar métricas');
    return res.json();
  },

  async getClients(): Promise<Client[]> {
    const res = await fetch(`${BASE_URL}/clients`);
    if (!res.ok) throw new Error('Falha ao carregar clientes');
    return res.json();
  },

  async createClient(data: Partial<Client>): Promise<Client> {
    const res = await fetch(`${BASE_URL}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao criar cliente');
    }
    return res.json();
  },

  async deleteClient(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/clients/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Falha ao excluir cliente');
  },

  async getCharges(status?: string): Promise<Charge[]> {
    const url = status ? `${BASE_URL}/charges?status=${status}` : `${BASE_URL}/charges`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao carregar cobranças');
    return res.json();
  },

  async createCharge(data: {
    clientId: string;
    value: number;
    dueDate: string;
    description?: string;
    billingType?: string;
    sendImmediateNotification?: boolean;
  }): Promise<{ charge: Charge; notification?: any }> {
    const res = await fetch(`${BASE_URL}/charges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao gerar cobrança');
    }
    return res.json();
  },

  async sendManualWhatsApp(chargeId: string): Promise<{ success: boolean; error?: string }> {
    const res = await fetch(`${BASE_URL}/charges/${chargeId}/send-whatsapp`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Erro ao enviar mensagem');
    return res.json();
  },

  async markAsPaid(chargeId: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/charges/${chargeId}/mark-paid`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Erro ao atualizar status');
  },

  async deleteCharge(chargeId: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/charges/${chargeId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Falha ao excluir cobrança');
  },

  async getSettings(): Promise<Record<string, string>> {
    const res = await fetch(`${BASE_URL}/settings`);
    if (!res.ok) throw new Error('Falha ao carregar configurações');
    return res.json();
  },

  async updateSettings(settings: Record<string, string>): Promise<void> {
    const res = await fetch(`${BASE_URL}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Falha ao salvar configurações');
  },

  async testEvolution(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/settings/test-evolution`, { method: 'POST' });
    return res.json();
  },

  async triggerSweep(): Promise<{ scanned: number; sent: number; errors: number }> {
    const res = await fetch(`${BASE_URL}/jobs/trigger-sweep`, { method: 'POST' });
    return res.json();
  }
};
