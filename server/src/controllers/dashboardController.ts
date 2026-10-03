import { Request, Response } from "express";
import { db } from "../db/database";

export const dashboardController = {
  getStats(req: Request, res: Response) {
    try {
      const totalPending = db.prepare(`
        SELECT COALESCE(SUM(value), 0) as total, COUNT(id) as count 
        FROM charges WHERE status = 'PENDING'
      `).get() as { total: number; count: number };

      const totalReceived = db.prepare(`
        SELECT COALESCE(SUM(value), 0) as total, COUNT(id) as count 
        FROM charges WHERE status = 'RECEIVED'
      `).get() as { total: number; count: number };

      const totalOverdue = db.prepare(`
        SELECT COALESCE(SUM(value), 0) as total, COUNT(id) as count 
        FROM charges WHERE status = 'OVERDUE'
      `).get() as { total: number; count: number };

      const totalClients = db.prepare(`
        SELECT COUNT(id) as count FROM clients
      `).get() as { count: number };

      const totalMessages = db.prepare(`
        SELECT COUNT(id) as count FROM message_logs WHERE status = 'SUCCESS'
      `).get() as { count: number };

      const recentCharges = db.prepare(`
        SELECT c.*, cli.name as clientName, cli.phone as clientPhone
        FROM charges c
        JOIN clients cli ON c.clientId = cli.id
        ORDER BY c.createdAt DESC
        LIMIT 6
      `).all();

      const recentLogs = db.prepare(`
        SELECT l.*, c.value, cli.name as clientName
        FROM message_logs l
        JOIN charges c ON l.chargeId = c.id
        JOIN clients cli ON c.clientId = cli.id
        ORDER BY l.sentAt DESC
        LIMIT 6
      `).all();

      return res.json({
        totalPending: totalPending.total,
        countPending: totalPending.count,
        totalReceived: totalReceived.total,
        countReceived: totalReceived.count,
        totalOverdue: totalOverdue.total,
        countOverdue: totalOverdue.count,
        totalClients: totalClients.count,
        totalMessagesSent: totalMessages.count,
        recentCharges,
        recentLogs
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
};
