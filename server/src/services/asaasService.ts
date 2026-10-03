import axios from "axios";
import { settingsService } from "./settingsService";

export interface AsaasCustomerInput {
  name: string;
  email?: string;
  phone: string;
  cpfCnpj?: string;
}

export interface AsaasPaymentInput {
  customerId: string;
  value: number;
  dueDate: string; // YYYY-MM-DD
  description?: string;
  billingType?: "PIX" | "BOLETO" | "UNDEFINED";
}

export const asaasService = {
  getConfig() {
    const env = settingsService.get("asaas_environment", "sandbox");
    const baseUrl = env === "production" 
      ? "https://api.asaas.com/v3" 
      : "https://sandbox.asaas.com/api/v3";
    const apiKey = settingsService.get("asaas_api_key", "");
    return { baseUrl, apiKey, isSimulated: !apiKey };
  },

  getClient() {
    const { baseUrl, apiKey } = this.getConfig();
    return axios.create({
      baseURL: baseUrl,
      headers: {
        access_token: apiKey,
        "Content-Type": "application/json"
      },
      timeout: 15000
    });
  },

  async createCustomer(input: AsaasCustomerInput): Promise<{ id: string; name: string }> {
    const { isSimulated } = this.getConfig();

    if (isSimulated) {
      console.log("[Asaas Service] Modo Simulado: Criando cliente local...");
      return {
        id: `sim_cus_${Date.now()}`,
        name: input.name
      };
    }

    try {
      const client = this.getClient();
      const response = await client.post("/customers", {
        name: input.name,
        email: input.email || undefined,
        mobilePhone: input.phone,
        cpfCnpj: input.cpfCnpj || undefined
      });
      return {
        id: response.data.id,
        name: response.data.name
      };
    } catch (err: any) {
      const errorMsg = err.response?.data?.errors?.[0]?.description || err.message;
      throw new Error(`Erro ao criar cliente no Asaas: ${errorMsg}`);
    }
  },

  async createCharge(input: AsaasPaymentInput): Promise<{
    id: string;
    invoiceUrl: string;
    pixQrCode?: string;
    pixCopiaECola?: string;
    value: number;
    dueDate: string;
  }> {
    const { isSimulated } = this.getConfig();

    if (isSimulated) {
      console.log("[Asaas Service] Modo Simulado: Gerando cobrança PIX de teste...");
      const simulatedId = `sim_pay_${Date.now()}`;
      const fakeCopiaECola = `00020126580014br.gov.bcb.pix0136${crypto.randomUUID()}520400005303986540${input.value.toFixed(2)}5802BR5916Roviro Solucoes6009SAO PAULO62070503***6304`;
      
      return {
        id: simulatedId,
        invoiceUrl: `https://roviro.com.br/fatura/${simulatedId}`,
        pixCopiaECola: fakeCopiaECola,
        pixQrCode: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150'><rect width='100%' height='100%' fill='%23080c14'/><text x='50%' y='50%' fill='%2338bdf8' font-size='12' text-anchor='middle' alignment-baseline='middle'>QR CODE PIX SIMULADO</text></svg>",
        value: input.value,
        dueDate: input.dueDate
      };
    }

    try {
      const client = this.getClient();
      const response = await client.post("/payments", {
        customer: input.customerId,
        billingType: input.billingType || "PIX",
        value: input.value,
        dueDate: input.dueDate,
        description: input.description || "Fatura de Serviços",
        postalService: false
      });

      const payment = response.data;
      let pixData: { encodedImage?: string; payload?: string } = {};

      if (payment.billingType === "PIX" || payment.billingType === "UNDEFINED") {
        try {
          const pixRes = await client.get(`/payments/${payment.id}/pixQrCode`);
          pixData = pixRes.data;
        } catch (e) {
          console.warn("[Asaas Service] Não foi possível carregar QR Code do PIX agora:", e);
        }
      }

      return {
        id: payment.id,
        invoiceUrl: payment.invoiceUrl || payment.bankSlipUrl,
        pixQrCode: pixData.encodedImage ? `data:image/png;base64,${pixData.encodedImage}` : undefined,
        pixCopiaECola: pixData.payload,
        value: payment.value,
        dueDate: payment.dueDate
      };
    } catch (err: any) {
      const errorMsg = err.response?.data?.errors?.[0]?.description || err.message;
      throw new Error(`Erro ao gerar fatura no Asaas: ${errorMsg}`);
    }
  }
};
