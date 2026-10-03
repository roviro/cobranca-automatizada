import { Database } from "bun:sqlite";
import path from "path";
import fs from "fs";

const dbDir = path.resolve(__dirname, "../../data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "cobrancas.db");
export const db = new Database(dbPath, { create: true });

// Habilita foreign keys e journal WAL para alta performance
db.run("PRAGMA foreign_keys = ON;");
db.run("PRAGMA journal_mode = WAL;");

export function initDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT NOT NULL,
      cpfCnpj TEXT,
      asaasCustomerId TEXT,
      createdAt TEXT NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS charges (
      id TEXT PRIMARY KEY,
      clientId TEXT NOT NULL,
      asaasPaymentId TEXT,
      value REAL NOT NULL,
      dueDate TEXT NOT NULL,
      description TEXT,
      billingType TEXT DEFAULT 'PIX',
      status TEXT NOT NULL DEFAULT 'PENDING',
      pixQrCode TEXT,
      pixCopiaECola TEXT,
      invoiceUrl TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS message_logs (
      id TEXT PRIMARY KEY,
      chargeId TEXT NOT NULL,
      type TEXT NOT NULL,
      sentAt TEXT NOT NULL,
      status TEXT NOT NULL,
      responsePayload TEXT,
      FOREIGN KEY (chargeId) REFERENCES charges(id) ON DELETE CASCADE
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Configurações padrão
  const defaultSettings: Record<string, string> = {
    asaas_api_key: "",
    asaas_environment: "sandbox", // sandbox ou production
    evolution_api_url: "https://api.roviro.com.br",
    evolution_api_key: "",
    evolution_instance: "default",
    company_name: "Roviro Soluções",
    company_phone: "5511986531134",
    msg_template_reminder_d3: "Olá, *{nome}*! 👋\nPassando para avisar que sua fatura de *R$ {valor}* vence em *{vencimento}* ({dias} dias).\n\nPara facilitar, você pode pagar direto via PIX Copia e Cola:\n\n```{pix_copia_cola}```\n\nOu acesse a fatura completa: {link_fatura}\n\nObrigado! 🚀",
    msg_template_due_today: "Olá, *{nome}*! ⏰\nLembrete amigável: sua fatura de *R$ {valor}* vence *HOJE* ({vencimento}).\n\nChave PIX Copia e Cola:\n```{pix_copia_cola}```\n\nLink da fatura: {link_fatura}\n\nQualquer dúvida, estamos à disposição!",
    msg_template_overdue_d3: "Olá, *{nome}*. ⚠️\nIdentificamos que sua fatura de *R$ {valor}* venceu no dia *{vencimento}* e ainda consta como pendente.\n\nEvite encargos ou bloqueio de serviços efetuando o pagamento via PIX:\n```{pix_copia_cola}```\n\nLink da fatura: {link_fatura}\n\nSe já realizou o pagamento, favor desconsiderar.",
    msg_template_confirmation: "Olá, *{nome}*! ✅\nIdentificamos o pagamento da sua fatura no valor de *R$ {valor}* com sucesso!\n\nMuito obrigado pela parceria! 🤝"
  };

  const getStmt = db.prepare("SELECT key FROM settings WHERE key = ?");
  const insertStmt = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");

  for (const [key, value] of Object.entries(defaultSettings)) {
    const existing = getStmt.get(key);
    if (!existing) {
      insertStmt.run(key, value);
    }
  }

  console.log("Banco de dados SQLite inicializado com sucesso em:", dbPath);
}
