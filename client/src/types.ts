export interface Client {
  id: string;
  name: string;
  email?: string;
  phone: string;
  cpfCnpj?: string;
  asaasCustomerId?: string;
  createdAt: string;
  totalCharges?: number;
  totalPaid?: number;
}

export interface Charge {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  asaasPaymentId?: string;
  value: number;
  dueDate: string;
  description?: string;
  billingType: string;
  status: 'PENDING' | 'RECEIVED' | 'OVERDUE';
  pixQrCode?: string;
  pixCopiaECola?: string;
  invoiceUrl?: string;
  createdAt: string;
}

export interface MessageLog {
  id: string;
  chargeId: string;
  clientName: string;
  value: number;
  type: string;
  sentAt: string;
  status: 'SUCCESS' | 'ERROR';
  responsePayload?: string;
}

export interface DashboardStats {
  totalPending: number;
  countPending: number;
  totalReceived: number;
  countReceived: number;
  totalOverdue: number;
  countOverdue: number;
  totalClients: number;
  totalMessagesSent: number;
  recentCharges: Charge[];
  recentLogs: MessageLog[];
}
