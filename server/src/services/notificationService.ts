import { db } from "../db/database";
import { settingsService } from "./settingsService";
import { evolutionService } from "./evolutionService";

export interface ChargeWithClient {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  value: number;
  dueDate: string;
  status: string;
  pixCopiaECola?: string;
  invoiceUrl?: string;
  description?: string;
}

export const notificationService = {
  formatCurrency(value: number): string {
    return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  },

  renderTemplate(template: string, charge: ChargeWithClient, days = 0): string {
    return template
      .replace(/{nome}/g, charge.clientName)
      .replace(/{valor}/g, this.formatCurrency(charge.value))
      .replace(/{vencimento}/g, this.formatDate(charge.dueDate))
      .replace(/{pix_copia_cola}/g, charge.pixCopiaECola || "Consulte o link da fatura")
      .replace(/{link_fatura}/g, charge.invoiceUrl || "https://roviro.com.br")
      .replace(/{dias}/g, Math.abs(days).toString());
  },

  async sendChargeNotification(
    charge: ChargeWithClient, 
    type: "REMINDER_D3" | "DUE_TODAY" | "OVERDUE_D3" | "CONFIRMATION" | "MANUAL",
    daysDiff = 0
  ): Promise<{ success: boolean; error?: string }> {
    let templateKey = "msg_template_reminder_d3";
    if (type === "DUE_TODAY") templateKey = "msg_template_due_today";
    if (type === "OVERDUE_D3") templateKey = "msg_template_overdue_d3";
    if (type === "CONFIRMATION") templateKey = "msg_template_confirmation";

    const template = settingsService.get(templateKey, "Fatura no valor de R$ {valor} vence em {vencimento}. PIX: {pix_copia_cola}");
    const messageText = this.renderTemplate(template, charge, daysDiff);

    const result = await evolutionService.sendTextMessage({
      phone: charge.clientPhone,
      text: messageText
    });

    const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    db.prepare(`
      INSERT INTO message_logs (id, chargeId, type, sentAt, status, responsePayload)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      logId,
      charge.id,
      type,
      new Date().toISOString(),
      result.success ? "SUCCESS" : "ERROR",
      result.error || JSON.stringify(result.data || {})
    );

    return result;
  }
};
