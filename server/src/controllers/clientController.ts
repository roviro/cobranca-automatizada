import { Request, Response } from "express";
import { db } from "../db/database";
import { asaasService } from "../services/asaasService";

export const clientController = {
  getAll(req: Request, res: Response) {
    try {
      const clients = db.prepare(`
        SELECT 
          c.*,
          COUNT(ch.id) as totalCharges,
          COALESCE(SUM(CASE WHEN ch.status = 'RECEIVED' THEN ch.value ELSE 0 END), 0) as totalPaid
        FROM clients c
        LEFT JOIN charges ch ON c.id = ch.clientId
        GROUP BY c.id
        ORDER BY c.createdAt DESC
      `).all();
      return res.json(clients);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { name, email, phone, cpfCnpj } = req.body;

      if (!name || !phone) {
        return res.status(400).json({ error: "Nome e WhatsApp são obrigatórios." });
      }

      // Cria cliente no Asaas para emissão de PIX/Boletos
      let asaasCustomerId: string | undefined;
      try {
        const asaasCustomer = await asaasService.createCustomer({
          name,
          email,
          phone,
          cpfCnpj
        });
        asaasCustomerId = asaasCustomer.id;
      } catch (e: any) {
        console.warn("[Client] Falha ao sincronizar com Asaas, criando localmente:", e.message);
      }

      const id = `cli_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const createdAt = new Date().toISOString();

      db.prepare(`
        INSERT INTO clients (id, name, email, phone, cpfCnpj, asaasCustomerId, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, name, email || null, phone, cpfCnpj || null, asaasCustomerId || null, createdAt);

      const newClient = db.prepare("SELECT * FROM clients WHERE id = ?").get(id);
      return res.status(201).json(newClient);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      db.prepare("DELETE FROM clients WHERE id = ?").run(id);
      return res.json({ success: true, message: "Cliente excluído com sucesso." });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
};
