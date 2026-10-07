import React, { useState } from 'react';
import { 
  Cloud, 
  Check, 
  Copy, 
  Terminal, 
  RefreshCw, 
  AlertCircle, 
  X, 
  Database, 
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { SupabaseService, SupabaseConfig } from '../services/supabaseClient';
import { CropBatch, TelemetryReading } from '../types';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  crops: CropBatch[];
  readings: TelemetryReading[];
  onSyncComplete: () => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({
  isOpen,
  onClose,
  crops,
  readings,
  onSyncComplete,
}) => {
  const [config, setConfig] = useState<SupabaseConfig>(SupabaseService.getConfig());
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedMigration, setCopiedMigration] = useState(false);

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    SupabaseService.saveConfig(config);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    handleSaveConfig();
    try {
      const res = await SupabaseService.testConnection();
      setTestResult(res);
    } finally {
      setTesting(false);
    }
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    handleSaveConfig();
    try {
      await SupabaseService.syncCropsToCloud(crops);
      await SupabaseService.syncReadingsToCloud(readings);
      const updated = {
        ...config,
        lastSyncAt: new Date().toISOString(),
      };
      setConfig(updated);
      SupabaseService.saveConfig(updated);
      setTestResult({
        success: true,
        message: '¡Cultivos y lecturas sincronizados con la nube de Supabase exitosamente!',
      });
      onSyncComplete();
    } catch (e: any) {
      setTestResult({
        success: false,
        message: `Error durante la sincronización: ${e.message}`,
      });
    } finally {
      setSyncing(false);
    }
  };

  const migrationSql = SupabaseService.getSqlMigration();

  const handleCopyMigration = () => {
    navigator.clipboard.writeText(migrationSql);
    setCopiedMigration(true);
    setTimeout(() => setCopiedMigration(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                Sincronización en la Nube Supabase
              </h2>
              <p className="text-xs text-slate-400">
                Proyecto: <span className="text-cyan-400 font-mono font-bold">pbrdtcbsvckfibafvwkq</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Supabase Connection Settings */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">Parámetros del Proyecto Supabase</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 font-bold">
                pbrdtcbsvckfibafvwkq
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-400 block text-[11px] mb-1">URL de API Supabase:</label>
                <input
                  type="text"
                  readOnly
                  value={config.url}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-300 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-slate-400 block text-[11px] mb-1">
                  Supabase Publishable Key (sb_publishable...):
                </label>
                <input
                  type="password"
                  value={config.anonKey}
                  onChange={(e) => setConfig({ ...config, anonKey: e.target.value })}
                  placeholder="sb_publishable_z9A6iZXPvK0gSXaebIk7KQ_EuOSSgLH"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-emerald-400 font-mono text-[11px] focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-emerald-400 block mt-0.5">✓ Clave pública configurada para el proyecto pbrdtcbsvckfibafvwkq</span>
              </div>

              <div>
                <label className="text-slate-400 block text-[11px] mb-1">
                  JWKS Auth Endpoint:
                </label>
                <input
                  type="text"
                  readOnly
                  value="https://pbrdtcbsvckfibafvwkq.supabase.co/auth/v1/.well-known/jwks.json"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-400 font-mono text-[10px]"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center gap-1.5 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  <span>{testing ? 'Verificando...' : 'Probar Conexión'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSyncNow}
                  disabled={syncing}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1.5 shadow transition"
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span>{syncing ? 'Sincronizando...' : 'Sincronizar a la Nube Ahora'}</span>
                </button>
              </div>
            </div>

            {testResult && (
              <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 mt-2 ${
                testResult.success
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}>
                {testResult.success ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Migration SQL Generator */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Script de Migración SQL para Supabase</span>
                <span className="text-[10px] text-slate-400">
                  Comando CLI: <code className="text-cyan-400 font-mono">supabase migration new new-migration</code>
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyMigration}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold"
              >
                {copiedMigration ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMigration ? '¡Copiado!' : 'Copiar SQL'}</span>
              </button>
            </div>

            <div className="bg-slate-900 rounded-lg p-3 border border-slate-800 font-mono text-[10px] text-slate-300 max-h-48 overflow-y-auto leading-relaxed">
              <pre>{migrationSql}</pre>
            </div>

            <p className="text-[11px] text-slate-400">
              Copie este SQL y péguelo directamente en el <strong>SQL Editor</strong> de su panel de Supabase en el proyecto <code>pbrdtcbsvckfibafvwkq</code> para crear automáticamente las tablas, índices y políticas de seguridad RLS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
