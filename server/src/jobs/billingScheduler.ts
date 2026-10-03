import cron from "node-cron";
import { db } from "../db/database";
import { notificationService, ChargeWithClient } from "../services/notificationService";

export async function runBillingSweep(): Promise<{ scanned: number; sent: number; errors: number }> {
  console.log(`[Billing Scheduler] Iniciando varredura de cobranças em ${new Date().toISOString()}...`);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pendingCharges = db.prepare(`
    SELECT 
      c.id, c.clientId, c.value, c.dueDate, c.status, c.pixCopiaECola, c.invoiceUrl, c.description,
      cli.name as clientName, cli.phone as clientPhone
    FROM charges c
    JOIN clients cli ON c.clientId = cli.id
    WHERE c.status IN ('PENDING', 'OVERDUE')
  `).all() as ChargeWithClient[];

  let sent = 0;
  let errors = 0;

  for (const charge of pendingCharges) {
    const [year, month, day] = charge.dueDate.split("-").map(Number);
    const dueDate = new Date(year, month - 1, day);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // D-3: 3 dias antes do vencimento
    if (diffDays === 3) {
      const alreadySent = db.prepare(`
        SELECT id FROM message_logs WHERE chargeId = ? AND type = 'REMINDER_D3'
      `).get(charge.id);

      if (!alreadySent) {
        console.log(`[Régua D-3] Enviando lembrete para ${charge.clientName} (R$ ${charge.value})...`);
        const res = await notificationService.sendChargeNotification(charge, "REMINDER_D3", diffDays);
        if (res.success) sent++; else errors++;
      }
    }

    // D-0: Vence hoje
    if (diffDays === 0) {
      const alreadySent = db.prepare(`
        SELECT id FROM message_logs WHERE chargeId = ? AND type = 'DUE_TODAY'
      `).get(charge.id);

      if (!alreadySent) {
        console.log(`[Régua D-0] Enviando aviso de vencimento hoje para ${charge.clientName}...`);
        const res = await notificationService.sendChargeNotification(charge, "DUE_TODAY", 0);
        if (res.success) sent++; else errors++;
      }
    }

    // D+3: Vencido há 3 dias
    if (diffDays <= -3 && diffDays > -7) {
      // Atualiza status para OVERDUE se ainda estiver PENDING
      if (charge.status === "PENDING") {
        db.prepare("UPDATE charges SET status = 'OVERDUE' WHERE id = ?").run(charge.id);
      }

      const alreadySent = db.prepare(`
        SELECT id FROM message_logs WHERE chargeId = ? AND type = 'OVERDUE_D3'
      `).get(charge.id);

      if (!alreadySent) {
        console.log(`[Régua D+3] Enviando aviso de pendência para ${charge.clientName}...`);
        const res = await notificationService.sendChargeNotification(charge, "OVERDUE_D3", diffDays);
        if (res.success) sent++; else errors++;
      }
    }
  }

  console.log(`[Billing Scheduler] Concluído: ${pendingCharges.length} faturas verificadas, ${sent} enviadas, ${errors} falhas.`);
  return { scanned: pendingCharges.length, sent, errors };
}

export function initBillingScheduler() {
  // Executa todo dia às 08:30 da manhã
  cron.schedule("30 8 * * *", async () => {
    try {
      await runBillingSweep();
    } catch (err) {
      console.error("[Billing Scheduler] Erro ao executar varredura programada:", err);
    }
  });

  console.log("⏰ Agendador de régua de cobrança ativo (executa diariamente às 08:30)");
}
