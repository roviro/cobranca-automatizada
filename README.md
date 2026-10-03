# Roviro Cobrança Automatizada 🚀

Sistema SaaS de emissão de cobranças com **PIX Dinâmico / QR Code** e **réguas automáticas de notificação via WhatsApp**, desenvolvido para eliminar a inadimplência de prestadores de serviços, clínicas, escolas e micro/pequenas empresas.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Descrição |
| :--- | :--- | :--- |
| **Backend & Engine** | **Node.js + Bun + TypeScript** | Servidor de alta performance com rotas REST e agendamento de jobs. |
| **Banco de Dados** | **SQLite nativo (Bun)** | Armazenamento local leve e resiliente com suporte a migração para PostgreSQL. |
| **Frontend** | **React 19 + Vite + Tailwind CSS v4** | Painel executivo no estilo Dark Glassmorphism com Lucide Icons. |
| **Gateway PIX** | **Asaas API v3** | Emissão de PIX Copia e Cola, QR Code e conciliação bancária automática (com fallback simulado para testes). |
| **Mensageria** | **Evolution API v2** | Integração em tempo real com WhatsApp para envio de lembretes, cobranças e recibos. |
| **Agendador** | **Node-cron** | Varredura diária das réguas preventivas e de inadimplência (D-3, D-0, D+3, D+7). |

---

## ⚙️ Funcionalidades Principais

1. **Cockpit Financeiro:**
   - Total pendente a receber, recebido no mês e taxa de inadimplência em tempo real.
   - Histórico em tempo real de mensagens disparadas no WhatsApp.

2. **Gestão de Clientes & Faturas:**
   - Cadastro ágil com WhatsApp, CPF/CNPJ e histórico financeiro.
   - Emissão de cobrança com geração instantânea do código PIX Copia e Cola.
   - Disparo imediato ou agendado pelo WhatsApp com um clique.

3. **Régua Automática Inteligente:**
   - **D-3:** Notificação preventiva 3 dias antes do vencimento com o código PIX.
   - **D-0:** Lembrete amigável no dia do vencimento.
   - **D+3:** Cobrança de pendência sem atrito.
   - **Webhook de Baixa Automática:** Ao receber o pagamento, a fatura é liquidada e o cliente recebe mensagem de agradecimento no WhatsApp.

4. **Configurações Flexíveis:**
   - Alternância entre ambiente Sandbox (testes) e Produção.
   - Editor de templates de mensagens com variáveis dinâmicas (`{nome}`, `{valor}`, `{vencimento}`, `{pix_copia_cola}`).

---

## 🚀 Como Executar

### 1. Iniciar Tudo com 1 Comando:
```bash
./iniciar.sh
```
- **Backend:** `http://localhost:3001`
- **Frontend:** `http://localhost:5173`

---

## 📁 Estrutura de Arquivos
```
cobranca-automatizada/
├── server/
│   ├── src/
│   │   ├── controllers/   # Regras de negócio de clientes, cobranças, webhooks e dashboard
│   │   ├── db/            # Banco SQLite e schema inicial
│   │   ├── jobs/          # Cron da régua de cobrança automática
│   │   ├── services/      # Integrações Asaas, Evolution API e Notificações
│   │   └── index.ts       # Servidor Express
├── client/
│   ├── src/
│   │   ├── components/    # Navbar, Modais de Cobrança e Clientes
│   │   ├── pages/         # Dashboard, Cobranças, Clientes, Configurações
│   │   ├── services/      # Cliente da API
│   │   └── App.tsx        # Aplicação principal
├── iniciar.sh             # Script de inicialização conjunta
└── README.md
```
