import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, AlertCircle, RefreshCw, Key, MessageSquare } from 'lucide-react';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testingEvolution, setTestingEvolution] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getSettings();
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveSuccess(false);
      await api.updateSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEvolution = async () => {
    try {
      setTestingEvolution(true);
      setTestResult(null);
      const res = await api.testEvolution();
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Falha ao conectar com Evolution API' });
    } finally {
      setTestingEvolution(false);
    }
  };

  const updateField = (key: string, val: string) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Carregando configurações...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Configurações do Sistema
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Gerencie chaves de API, credenciais de pagamentos e templates das réguas de WhatsApp.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Configurações salvas e aplicadas com sucesso!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Bloco 1: WhatsApp (Evolution API) */}
        <div className="glass-panel rounded-3xl p-6 border-white/5 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 grid place-items-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">Integração WhatsApp (Evolution API)</h2>
              <p className="text-[11px] text-slate-400">Motor de disparo de mensagens, PIX e confirmações</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1.5">URL da Evolution API</label>
              <input
                type="text"
                value={settings.evolution_api_url || ''}
                onChange={(e) => updateField('evolution_api_url', e.target.value)}
                placeholder="https://api.roviro.com.br"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Nome da Instância</label>
              <input
                type="text"
                value={settings.evolution_instance || ''}
                onChange={(e) => updateField('evolution_instance', e.target.value)}
                placeholder="Ex: default ou roviro"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">API Key da Evolution</label>
              <input
                type="password"
                value={settings.evolution_api_key || ''}
                onChange={(e) => updateField('evolution_api_key', e.target.value)}
                placeholder="Chave secreta de autenticação"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleTestEvolution}
              disabled={testingEvolution}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingEvolution ? 'animate-spin' : ''}`} />
              <span>{testingEvolution ? 'Testando Conexão...' : 'Testar Conexão com WhatsApp'}</span>
            </button>

            {testResult && (
              <span className={`text-xs flex items-center gap-1.5 ${testResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                {testResult.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                {testResult.message}
              </span>
            )}
          </div>
        </div>

        {/* Bloco 2: Pagamentos (Asaas) */}
        <div className="glass-panel rounded-3xl p-6 border-white/5 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 grid place-items-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">Gateway de Cobranças (Asaas)</h2>
              <p className="text-[11px] text-slate-400">Emissão de PIX Dinâmico, QR Code e conciliação bancária</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Ambiente</label>
              <select
                value={settings.asaas_environment || 'sandbox'}
                onChange={(e) => updateField('asaas_environment', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="sandbox">Sandbox (Ambiente de Testes Gratuito)</option>
                <option value="production">Produção (Valores Reais)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Chave de API do Asaas (Access Token)</label>
              <input
                type="password"
                value={settings.asaas_api_key || ''}
                onChange={(e) => updateField('asaas_api_key', e.target.value)}
                placeholder="Se vazio, o sistema simula faturas para testes"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-400 font-mono">
            💡 Dica: Se você não preencher a chave de API do Asaas, o sistema opera em <strong>Modo Simulado</strong>, gerando códigos PIX de teste para você validar toda a régua sem precisar de conta bancária ativa.
          </p>
        </div>

        {/* Bloco 3: Modelos de Mensagem do WhatsApp */}
        <div className="glass-panel rounded-3xl p-6 border-white/5 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 grid place-items-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">Modelos de Mensagem do WhatsApp</h2>
              <p className="text-[11px] text-slate-400">Variáveis disponíveis: <code>{'{nome}'}</code>, <code>{'{valor}'}</code>, <code>{'{vencimento}'}</code>, <code>{'{pix_copia_cola}'}</code>, <code>{'{link_fatura}'}</code></p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Lembrete Preventivo (D-3: 3 dias antes do vencimento)</label>
              <textarea
                rows={4}
                value={settings.msg_template_reminder_d3 || ''}
                onChange={(e) => updateField('msg_template_reminder_d3', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-400 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Lembrete de Vencimento Hoje (D-0)</label>
              <textarea
                rows={4}
                value={settings.msg_template_due_today || ''}
                onChange={(e) => updateField('msg_template_due_today', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-400 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Cobrança Amigável de Inadimplência (D+3: 3 dias de atraso)</label>
              <textarea
                rows={4}
                value={settings.msg_template_overdue_d3 || ''}
                onChange={(e) => updateField('msg_template_overdue_d3', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-400 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Recibo de Confirmação de Pagamento</label>
              <textarea
                rows={3}
                value={settings.msg_template_confirmation || ''}
                onChange={(e) => updateField('msg_template_confirmation', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-400 font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Salvando...' : 'Salvar Todas as Configurações'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
