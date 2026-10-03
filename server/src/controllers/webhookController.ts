import { Request, Response } from "express";
import { db } from "../db/database";
import { notificationService, ChargeWithClient } from "../services/notificationService";

export const webhookController = {
  async handleAsaas(req: Request, res: Response) {
    try {
      const { event, payment } = req.body;
      console.log(`[Asaas Webhook] Evento recebido: ${event} para pagamento: ${payment?.id}`);

      if (!payment?.id) {
        return res.status(200).json({ received: true, note: "Sem id de pagamento" });
      }

      const charge = db.prepare(`
        SELECT c.*, cli.name as clientName, cli.phone as clientPhone
        FROM charges c
        JOIN clients cli ON c.clientId = cli.id
        WHERE c.asaasPaymentId = ?
      `).get(payment.id) as ChargeWithClient | undefined;

      if (!charge) {
        console.warn(`[Asaas Webhook] Cobrança não encontrada no banco local para o ID: ${payment.id}`);
        return res.status(200).json({ received: true, note: "Cobrança não encontrada no banco" });
      }

      if (event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED") {
        db.prepare("UPDATE charges SET status = 'RECEIVED' WHERE id = ?").run(charge.id);
        console.log(`[Asaas Webhook] Fatura ${charge.id} atualizada para RECEIVED.`);

        // Dispara mensagem de confirmação e agradecimento no WhatsApp
        await notificationService.sendChargeNotification(charge, "CONFIRMATION", 0);
      } else if (event === "PAYMENT_OVERDUE") {
        db.prepare("UPDATE charges SET status = 'OVERDUE' WHERE id = ?").run(charge.id);
        console.log(`[Asaas Webhook] Fatura ${charge.id} atualizada para OVERDUE.`);
      }

      return res.status(200).json({ success: true, event });
    } catch (err: any) {
      console.error("[Asaas Webhook] Erro ao processar webhook:", err);
      return res.status(500).json({ error: err.message });
    }
  }
};
