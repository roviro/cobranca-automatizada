import axios from "axios";
import { settingsService } from "./settingsService";

export interface SendMessageOptions {
  phone: string;
  text: string;
}

export const evolutionService = {
  formatPhone(phone: string): string {
    let clean = phone.replace(/\D/g, "");
    if (clean.length === 10 || clean.length === 11) {
      clean = "55" + clean;
    }
    return clean;
  },

  getConfig() {
    const baseUrl = settingsService.get("evolution_api_url", "https://api.roviro.com.br").replace(/\/+$/, "");
    const apiKey = settingsService.get("evolution_api_key", "");
    const instance = settingsService.get("evolution_instance", "default");
    return { baseUrl, apiKey, instance };
  },

  async sendTextMessage(options: SendMessageOptions): Promise<{ success: boolean; data?: any; error?: string }> {
    const { baseUrl, apiKey, instance } = this.getConfig();

    if (!baseUrl || !instance) {
      return { success: false, error: "Configurações da Evolution API incompletas (URL ou instância ausentes)" };
    }

    const formattedNumber = this.formatPhone(options.phone);

    try {
      const url = `${baseUrl}/message/sendText/${instance}`;
      const payload = {
        number: formattedNumber,
        options: {
          delay: 1200,
          presence: "composing",
          linkPreview: true
        },
        textMessage: {
          text: options.text
        }
      };

      const response = await axios.post(url, payload, {
        headers: {
          "apikey": apiKey,
          "Content-Type": "application/json"
        },
        timeout: 15000
      });

      return { success: true, data: response.data };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Erro desconhecido ao enviar mensagem via Evolution API";
      console.error(`[Evolution API] Falha no envio para ${formattedNumber}:`, errorMsg);
      return { success: false, error: errorMsg };
    }
  },

  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    const { baseUrl, apiKey, instance } = this.getConfig();
    if (!baseUrl || !apiKey || !instance) {
      return { success: false, message: "URL, API Key ou Nome da Instância não configurados" };
    }

    try {
      const url = `${baseUrl}/instance/connectionState/${instance}`;
      const response = await axios.get(url, {
        headers: { apikey: apiKey },
        timeout: 8000
      });

      const state = response.data?.instance?.state || response.data?.state || "unknown";
      return { 
        success: true, 
        message: `Instância '${instance}' conectada! Status: ${state}`, 
        details: response.data 
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Falha ao testar conexão: ${err.response?.data?.message || err.message}`
      };
    }
  }
};
