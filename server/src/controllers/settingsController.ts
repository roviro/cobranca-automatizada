import { Request, Response } from "express";
import { settingsService } from "../services/settingsService";
import { evolutionService } from "../services/evolutionService";
import { runBillingSweep } from "../jobs/billingScheduler";

export const settingsController = {
  getSettings(req: Request, res: Response) {
    try {
      const all = settingsService.getAll();
      return res.json(all);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  updateSettings(req: Request, res: Response) {
    try {
      const settings = req.body;
      settingsService.setMany(settings);
      return res.json({ success: true, message: "Configurações salvas com sucesso!" });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  async testEvolution(req: Request, res: Response) {
    try {
      const result = await evolutionService.testConnection();
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  async triggerSweepManual(req: Request, res: Response) {
    try {
      const result = await runBillingSweep();
      return res.json({ success: true, ...result });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
};
