import { Router } from "express";
import { clientController } from "../controllers/clientController";
import { chargeController } from "../controllers/chargeController";
import { dashboardController } from "../controllers/dashboardController";
import { settingsController } from "../controllers/settingsController";
import { webhookController } from "../controllers/webhookController";

export const apiRouter = Router();

// Dashboard
apiRouter.get("/dashboard/stats", dashboardController.getStats);

// Clientes
apiRouter.get("/clients", clientController.getAll);
apiRouter.post("/clients", clientController.create);
apiRouter.delete("/clients/:id", clientController.delete);

// Cobranças
apiRouter.get("/charges", chargeController.getAll);
apiRouter.post("/charges", chargeController.create);
apiRouter.post("/charges/:id/send-whatsapp", chargeController.sendManualWhatsApp);
apiRouter.post("/charges/:id/mark-paid", chargeController.markAsPaid);
apiRouter.delete("/charges/:id", chargeController.delete);

// Configurações
apiRouter.get("/settings", settingsController.getSettings);
apiRouter.post("/settings", settingsController.updateSettings);
apiRouter.post("/settings/test-evolution", settingsController.testEvolution);
apiRouter.post("/jobs/trigger-sweep", settingsController.triggerSweepManual);

// Webhook Asaas
apiRouter.post("/webhooks/asaas", webhookController.handleAsaas);
