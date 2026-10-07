import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Save, 
  Trash2, 
  Sliders, 
  ShieldCheck, 
  Radio,
  Check
} from 'lucide-react';
import { AlertThresholds, SystemAlert } from '../types';
import { NotificationService } from '../services/audioAlert';

interface AlertSettingsProps {
  thresholds: AlertThresholds;
  alerts: SystemAlert[];
  onSaveThresholds: (thresholds: AlertThresholds) => void;
  onResolveAlert: (id: string) => void;
  onClearResolvedAlerts: () => void;
}

export const AlertSettings: React.FC<AlertSettingsProps> = ({
  thresholds,
  alerts,
  onSaveThresholds,
  onResolveAlert,
  onClearResolvedAlerts,
}) => {
  const [formValues, setFormValues] = useState<AlertThresholds>(thresholds);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [pushStatus, setPushStatus] = useState<string>(
    NotificationService.isPermissionGranted() ? 'Concedido' : 'No activado'
  );

  const handleRequestPushPermission = async () => {
    const granted = await NotificationService.requestPermission();
    if (granted) {
      setPushStatus('Concedido');
      setFormValues({ ...formValues, pushNotificationsEnabled: true });
      NotificationService.sendPush('HydroSense Conectado', 'Las notificaciones push en tiempo real están activas.');
    } else {
      setPushStatus('Denegado en el navegador');
    }
  };

  const handleTestSound = () => {
    NotificationService.playAlarmTone('critical');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveThresholds(formValues);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-rose-400" />
            Configuración de Alertas & Notificaciones Push
          </h2>
          <p className="text-xs text-slate-400">
            Defina los límites mínimos y máximos tolerables para disparar notificaciones en tiempo real y alarma acústica
          </p>
        </div>

        <button
          onClick={handleTestSound}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
          title="Emitir tono de prueba Web Audio"
        >
          <Volume2 className="w-4 h-4 text-emerald-400" />
          <span>Probar Alarma Sonora</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form: Threshold limits */}
        <div className="lg:col-span-2 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Rangos Óptimos de Parámetros Hidropónicos
            </h3>

            {/* pH Range */}
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-200">Potencial de Hidrógeno (pH)</span>
                <span className="font-mono text-emerald-400 font-bold">{formValues.phMin} - {formValues.phMax}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block text-[11px] mb-1">Mínimo Tolerable:</label>
                  <input
                    type="number"
                    step="0.05"
                    value={formValues.phMin}
                    onChange={(e) => setFormValues({ ...formValues, phMin: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block text-[11px] mb-1">Máximo Tolerable:</label>
                  <input
                    type="number"
                    step="0.05"
                    value={formValues.phMax}
                    onChange={(e) => setFormValues({ ...formValues, phMax: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* EC Range */}
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-200">Electroconductividad EC (mS/cm)</span>
                <span className="font-mono text-teal-400 font-bold">{formValues.ecMin} - {formValues.ecMax} mS/cm</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block text-[11px] mb-1">Mínimo Tolerable:</label>
                  <input
                    type="number"
                    step="0.05"
                    value={formValues.ecMin}
                    onChange={(e) => setFormValues({ ...formValues, ecMin: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block text-[11px] mb-1">Máximo Tolerable:</label>
                  <input
                    type="number"
                    step="0.05"
                    value={formValues.ecMax}
                    onChange={(e) => setFormValues({ ...formValues, ecMax: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Water Level & Solution Temperature */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-slate-200 block">Nivel Mínimo de Agua (%)</span>
                <input
                  type="number"
                  min="5"
                  max="90"
                  value={formValues.waterLevelMinPct}
                  onChange={(e) => setFormValues({ ...formValues, waterLevelMinPct: parseInt(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
                <span className="text-[10px] text-slate-500 block">Alerta crítica si baja de este porcentaje</span>
              </div>

              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-slate-200 block">Temp. Solución Nutritiva (°C)</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.5"
                    value={formValues.waterTempMinC}
                    onChange={(e) => setFormValues({ ...formValues, waterTempMinC: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                    placeholder="Mín"
                  />
                  <input
                    type="number"
                    step="0.5"
                    value={formValues.waterTempMaxC}
                    onChange={(e) => setFormValues({ ...formValues, waterTempMaxC: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                    placeholder="Máx"
                  />
                </div>
              </div>
            </div>

            {/* Notification & Sound toggles */}
            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-slate-200 text-xs">Canales de Notificación en Vivo</h4>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-300 block">Notificaciones Push del Navegador</span>
                  <span className="text-[10px] text-slate-500">
                    Estado: <strong className="text-emerald-400">{pushStatus}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRequestPushPermission}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold"
                >
                  Permitir Push
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div>
                  <span className="font-semibold text-slate-300 block">Alarma Acústica (Web Audio Buzzer)</span>
                  <span className="text-[10px] text-slate-500">Emite tono ante desviaciones críticas</span>
                </div>
                <input
                  type="checkbox"
                  checked={formValues.soundAlarmEnabled}
                  onChange={(e) => setFormValues({ ...formValues, soundAlarmEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {savedSuccess ? (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                  <Check className="w-4 h-4" /> ¡Umbrales guardados permanentemente!
                </span>
              ) : (
                <span className="text-xs text-slate-500">Guardado en memoria persistente del dispositivo</span>
              )}

              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 text-xs transition"
              >
                Guardar Umbrales
              </button>
            </div>
          </form>
        </div>

        {/* Alerts Log & History */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Bitácora de Alertas Registradas
              </h3>
              {alerts.length > 0 && (
                <button
                  onClick={onClearResolvedAlerts}
                  className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1 transition"
                  title="Limpiar resueltas"
                >
                  <Trash2 className="w-3 h-3" /> Limpiar
                </button>
              )}
            </div>

            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {alerts.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
                  Todos los parámetros dentro del rango óptimo.
                </div>
              ) : (
                alerts.map((al) => (
                  <div
                    key={al.id}
                    className={`p-3 rounded-xl border text-xs transition ${
                      al.resolved
                        ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                        : al.severity === 'critical'
                        ? 'bg-rose-950/30 border-rose-500/40'
                        : 'bg-amber-950/30 border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className={`font-bold ${al.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'}`}>
                        {al.title}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(al.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug mb-2">{al.message}</p>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-mono text-slate-400">
                        Valor: <strong>{al.value}</strong> | Límite: {al.threshold}
                      </span>
                      {!al.resolved && (
                        <button
                          onClick={() => onResolveAlert(al.id)}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                        >
                          Marcar Resuelta
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
