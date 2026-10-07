import React, { useState } from 'react';
import { 
  History, 
  Calendar, 
  Filter, 
  Plus, 
  Download, 
  Droplet, 
  Activity, 
  Thermometer, 
  Search, 
  FileText,
  X
} from 'lucide-react';
import { TelemetryReading, CropBatch, UserProfile } from '../types';

interface TelemetryHistoryProps {
  readings: TelemetryReading[];
  crops: CropBatch[];
  activeCropId: string;
  currentUser: UserProfile;
  onAddManualReading: (reading: TelemetryReading) => void;
  onOpenReportsModal: () => void;
}

export const TelemetryHistory: React.FC<TelemetryHistoryProps> = ({
  readings,
  crops,
  activeCropId,
  currentUser,
  onAddManualReading,
  onOpenReportsModal,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'dia' | 'mes' | 'año' | 'todos'>('mes');
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>(activeCropId || 'all');
  const [manualModalOpen, setManualModalOpen] = useState(false);

  // New manual entry form state
  const [newReading, setNewReading] = useState({
    ph: 6.0,
    ec: 1.8,
    tdsPpm: 1150,
    waterLevelPct: 80,
    waterLevelLiters: 400,
    waterTempC: 21.5,
    airTempC: 24.0,
    humidityPct: 65,
    npkRatio: '15-10-30',
    solADosageMl: 250,
    solBDosageMl: 250,
    solCDosageMl: 80,
    phModifierType: 'none' as 'acid' | 'base' | 'none',
    notes: 'Muestreo manual con potenciómetro calibrado de campo',
  });

  // Filter readings by crop and period
  const now = new Date();
  const filteredReadings = readings.filter((r) => {
    if (selectedCropFilter !== 'all' && r.cropId !== selectedCropFilter) {
      return false;
    }

    const rDate = new Date(r.timestamp);
    if (filterPeriod === 'dia') {
      return rDate.toDateString() === now.toDateString();
    } else if (filterPeriod === 'mes') {
      const monthAgo = new Date();
      monthAgo.setDate(now.getDate() - 30);
      return rDate >= monthAgo;
    } else if (filterPeriod === 'año') {
      return rDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    const currentCrop = crops.find(c => c.id === (selectedCropFilter !== 'all' ? selectedCropFilter : activeCropId)) || crops[0];

    const reading: TelemetryReading = {
      id: `manual_${Date.now()}`,
      cropId: currentCrop.id,
      timestamp: new Date().toISOString(),
      ph: Number(newReading.ph),
      ec: Number(newReading.ec),
      tdsPpm: Number(newReading.tdsPpm) || Math.round(Number(newReading.ec) * 640),
      waterLevelPct: Number(newReading.waterLevelPct),
      waterLevelLiters: Math.round((Number(newReading.waterLevelPct) / 100) * currentCrop.tankCapacityLiters),
      waterTempC: Number(newReading.waterTempC),
      airTempC: Number(newReading.airTempC),
      humidityPct: Number(newReading.humidityPct),
      nutrients: {
        npkRatio: newReading.npkRatio,
        solutionConcentrationPct: 100,
        solADosageMl: Number(newReading.solADosageMl),
        solBDosageMl: Number(newReading.solBDosageMl),
        solCDosageMl: Number(newReading.solCDosageMl),
        phModifierType: newReading.phModifierType,
      },
      sensorSource: 'Manual',
      recordedByUserId: currentUser.id,
      recordedByUserName: currentUser.fullName,
      notes: newReading.notes,
    };

    onAddManualReading(reading);
    setManualModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            Historial de Telemetría y Parámetros
          </h2>
          <p className="text-xs text-slate-400">
            Registro cronológico de pH, conductividad EC, temperatura, nivel y dosificación de nutrientes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setManualModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Registro Manual</span>
          </button>

          <button
            onClick={onOpenReportsModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/20 transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generar Reporte ({filterPeriod.toUpperCase()})</span>
          </button>
        </div>
      </div>

      {/* Filter Bar: Period & Crop */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Period Selector: Día / Mes / Año / Todos */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'dia', label: 'Día (Hoy)' },
            { id: 'mes', label: 'Mes (30d)' },
            { id: 'año', label: 'Año (Anual)' },
            { id: 'todos', label: 'Todos' },
          ].map((period) => (
            <button
              key={period.id}
              onClick={() => setFilterPeriod(period.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterPeriod === period.id
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* Crop Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Filtrar Lote:</span>
          <select
            value={selectedCropFilter}
            onChange={(e) => setSelectedCropFilter(e.target.value)}
            className="bg-slate-950 text-xs font-semibold text-emerald-400 p-2 rounded-xl border border-slate-800 focus:outline-none"
          >
            <option value="all">Todos los Cultivos</option>
            {crops.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-400">
          Mostrando <strong className="text-white">{filteredReadings.length}</strong> lecturas registradas
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Cultivo / Lote</th>
                <th className="py-3 px-4">pH</th>
                <th className="py-3 px-4">EC (mS/cm)</th>
                <th className="py-3 px-4">TDS (PPM)</th>
                <th className="py-3 px-4">Nivel Agua</th>
                <th className="py-3 px-4">Temp Agua</th>
                <th className="py-3 px-4">Temp Aire / Hum</th>
                <th className="py-3 px-4">Nutrientes (NPK)</th>
                <th className="py-3 px-4">Sensor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredReadings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500 font-sans">
                    No hay registros en el período seleccionado.
                  </td>
                </tr>
              ) : (
                filteredReadings.map((r) => {
                  const cropObj = crops.find((c) => c.id === r.cropId);
                  return (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 text-slate-300 font-sans whitespace-nowrap">
                        {new Date(r.timestamp).toLocaleString('es-ES', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 text-slate-200 font-sans font-medium whitespace-nowrap">
                        {cropObj ? cropObj.name : r.cropId}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          r.ph < 5.5 || r.ph > 6.6
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'text-emerald-400'
                        }`}>
                          {r.ph.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-teal-300 font-bold">
                        {r.ec.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {r.tdsPpm || Math.round(r.ec * 640)}
                      </td>
                      <td className="py-3 px-4 text-cyan-300 whitespace-nowrap">
                        {r.waterLevelPct}% ({r.waterLevelLiters}L)
                      </td>
                      <td className="py-3 px-4 text-blue-300">
                        {r.waterTempC}°C
                      </td>
                      <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                        {r.airTempC}°C / {r.humidityPct}%
                      </td>
                      <td className="py-3 px-4 text-purple-300 font-sans text-[11px] whitespace-nowrap">
                        {r.nutrients?.npkRatio || '15-10-30'} (A:{r.nutrients?.solADosageMl}ml)
                      </td>
                      <td className="py-3 px-4 text-[11px] font-sans">
                        <span className={`px-2 py-0.5 rounded font-semibold ${
                          r.sensorSource === 'ESP32' ? 'bg-cyan-500/10 text-cyan-400' :
                          r.sensorSource === 'Arduino' ? 'bg-emerald-500/10 text-emerald-400' :
                          'bg-amber-500/10 text-amber-400'
                        }`}>
                          {r.sensorSource}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Registrar Lectura Manual de Campo
              </h3>
              <button
                onClick={() => setManualModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManual} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">pH Medido (0 - 14) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newReading.ph}
                    onChange={(e) => setNewReading({ ...newReading, ph: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">EC (mS/cm) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newReading.ec}
                    onChange={(e) => {
                      const ecVal = parseFloat(e.target.value);
                      setNewReading({ ...newReading, ec: ecVal, tdsPpm: Math.round(ecVal * 640) });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nivel Tanque (%) *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={newReading.waterLevelPct}
                    onChange={(e) => setNewReading({ ...newReading, waterLevelPct: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">T. Solución (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newReading.waterTempC}
                    onChange={(e) => setNewReading({ ...newReading, waterTempC: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">T. Ambiente (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newReading.airTempC}
                    onChange={(e) => setNewReading({ ...newReading, airTempC: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Humedad (%)</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={newReading.humidityPct}
                    onChange={(e) => setNewReading({ ...newReading, humidityPct: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Observaciones / Motivo de Medición</label>
                <textarea
                  rows={2}
                  value={newReading.notes}
                  onChange={(e) => setNewReading({ ...newReading, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  Registrar Lectura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
