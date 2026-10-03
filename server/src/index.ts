import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDatabase } from "./db/database";
import { initBillingScheduler } from "./jobs/billingScheduler";
import { apiRouter } from "./routes/api";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Inicializa banco de dados e agendador
initDatabase();
initBillingScheduler();

// Rotas da API
app.use("/api", apiRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", app: "Cobrança Automatizada Roviro", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando com sucesso em http://localhost:${PORT}`);
  console.log(`📡 API disponível em http://localhost:${PORT}/api`);
});
