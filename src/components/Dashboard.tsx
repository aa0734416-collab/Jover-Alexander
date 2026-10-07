import React from 'react';
import { 
  Droplets, 
  Activity, 
  Thermometer, 
  Gauge, 
  Wind, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  FileText, 
  RotateCw, 
  QrCode, 
  Layers, 
  Zap, 
  Check, 
  TrendingUp, 
  Info,
  Beaker,
  Compass,
  Building2
} from 'lucide-react';
import { TelemetryReading, CropBatch, AlertThresholds, SystemAlert } from '../types';

interface DashboardProps {
  crop: CropBatch;
  latestReading: TelemetryReading | null;
  readings: TelemetryReading[];
  thresholds: AlertThresholds;
  alerts: SystemAlert[];
  onResolveAlert: (id: string) => void;
  onSimulateReading: () => void;
  onOpenReportsModal: () => void;
  onOpenQRScannerModal: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  crop,
  latestReading,
  readings,
  thresholds,
  alerts,
  onResolveAlert,
  onSimulateReading,
  onOpenReportsModal,
  onOpenQRScannerModal,
  onNavigateToTab,
}) => {
  if (!latestReading) {
    return (
      <div className="text-center py-20">
        <Droplets className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-bounce" />
        <h3 className="text-lg font-semibold text-slate-300">Sin lecturas para este cultivo</h3>
        <p className="text-sm text-slate-500 mb-4">Inicie una simulación o conecte su sensor ESP32/Arduino.</p>
        <button
          onClick={onSimulateReading}
          className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-lg text-sm"
        >
          Generar Primera Lectura
        </button>
      </div>
    );
  }

  // Parameter Evaluation
  const isPhOptimal = latestReading.ph >= thresholds.phMin && latestReading.ph <= thresholds.phMax;
  const isEcOptimal = latestReading.ec >= thresholds.ecMin && latestReading.ec <= thresholds.ecMax;
  const isWaterLevelOptimal = latestReading.waterLevelPct >= thresholds.waterLevelMinPct;
  const isWaterTempOptimal = latestReading.waterTempC >= thresholds.waterTempMinC && latestReading.waterTempC <= thresholds.waterTempMaxC;
  const isAirTempOptimal = latestReading.airTempC >= thresholds.airTempMinC && latestReading.airTempC <= thresholds.airTempMaxC;
  const isHumidityOptimal = latestReading.humidityPct >= thresholds.humidityMinPct && latestReading.humidityPct <= thresholds.humidityMaxPct;

  const unresolvedAlerts = alerts.filter(a => !a.resolved);

  // System type icons & descriptions
  const systemDescriptions: Record<string, { label: string; desc: string; flow: string }> = {
    NFT: { label: 'Técnica de Película Nutritiva', desc: 'Flujo continuo laminar sobre raíces en tubos inclinados', flow: 'Recirculación 24/7 (1.5 - 2.0 L/min)' },
    DWC: { label: 'Cultivo en Agua Profunda / Raíz Flotante', desc: 'Raíces sumergidas constantemente en solución oxigenada', flow: 'Burbujeo difusor continuo' },
    Goteo: { label: 'Sistema de Riego por Goteo', desc: 'Goteros regulados sobre sustrato inerte (coco/perlita)', flow: 'Pulsos de 15 min cada 2 horas' },
    Aeroponía: { label: 'Torre Aeropónica de Nebulización', desc: 'Gotículas de 50 micras pulverizadas directamente a raíz desnuda', flow: 'Ciclo 30s ON / 3min OFF' },
    Flujo_Reflujo: { label: 'Inundación y Drenaje (Ebb & Flow)', desc: 'Llenado periódico de la bandeja de cultivo y drenaje gravitacional', flow: 'Inundación 4 veces al día' },
    Kratky: { label: 'Método Pasivo Kratky', desc: 'Solución no circulante de nivel descendente gradual', flow: 'Sistema pasivo sin bombas' },
  };

  const sysInfo = systemDescriptions[crop.systemType] || { label: crop.systemType, desc: 'Sistema hidropónico especializado', flow: 'Monitoreo activo' };

  // Calculate trends from last 12 readings
  const recent12 = readings.slice(0, 12).reverse();

  return (
    <div className="space-y-6">
      {/* Top Banner: Active Crop & Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {crop.systemType}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              Etapa: <strong className="text-white capitalize">{crop.growthStage}</strong>
            </span>
            <span className="text-xs text-slate-400">
              {crop.location}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {crop.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Variedad: <span className="text-slate-200 font-medium">{crop.variety}</span> • {crop.plantCount} Plantas • Tanque {crop.tankCapacityLiters}L
          </p>
        </div>

        {/* Quick actions toolbar */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <button
            onClick={onSimulateReading}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
            title="Capturar o simular telemetría del sensor"
          >
            <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Leer Sensores</span>
          </button>

          <button
            onClick={onOpenReportsModal}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Descargar Informe</span>
          </button>

          <button
            onClick={() => onNavigateToTab('mapa')}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs transition"
            title="Ver Mapa Satelital en Tiempo Real"
          >
            <Compass className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigateToTab('membrete')}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition"
            title="Configurar Membrete Superior e Inferior"
          >
            <Building2 className="w-4 h-4 text-emerald-400" />
          </button>

          <button
            onClick={onOpenQRScannerModal}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition"
            title="Escanear Código QR"
          >
            <QrCode className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigateToTab('sensores')}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition"
            title="Configurar Arduino & ESP32"
          >
            <Cpu className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Unresolved Alerts Bar */}
      {unresolvedAlerts.length > 0 && (
        <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
              <h3 className="text-sm font-bold text-rose-200">
                {unresolvedAlerts.length} Alerta{unresolvedAlerts.length > 1 ? 's' : ''} Fuera de Rango Óptimo
              </h3>
            </div>
            <button
              onClick={() => onNavigateToTab('alertas')}
              className="text-xs text-rose-300 hover:text-white underline font-medium"
            >
              Configurar Umbrales
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {unresolvedAlerts.slice(0, 2).map((al) => (
              <div
                key={al.id}
                className="bg-slate-900/90 border border-rose-900/60 p-2.5 rounded-lg flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-rose-400">{al.title}:</span>{' '}
                  <span className="text-slate-300">{al.message}</span>
                </div>
                <button
                  onClick={() => onResolveAlert(al.id)}
                  className="ml-3 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-semibold whitespace-nowrap"
                >
                  Resolver
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Primary Telemetry Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. pH Level Card */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isPhOptimal 
            ? 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/40' 
            : 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/40'
        }`}>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Potencial pH
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              isPhOptimal ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/20 text-rose-300'
            }`}>
              {isPhOptimal ? 'ÓPTIMO' : 'DESVIADO'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {latestReading.ph.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">pH</span>
          </div>

          {/* Visual gradient bar */}
          <div className="mt-3">
            <div className="h-2 rounded-full w-full bg-slate-800 relative overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(0, (latestReading.ph / 14) * 100))}%`,
                  backgroundColor: latestReading.ph < 5.5 ? '#f59e0b' : latestReading.ph > 6.8 ? '#3b82f6' : '#10b981',
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>0 (Ácido)</span>
              <span className="text-emerald-400 font-mono">Rango: {thresholds.phMin} - {thresholds.phMax}</span>
              <span>14 (Alcalino)</span>
            </div>
          </div>
        </div>

        {/* 2. Salinity / EC Card */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isEcOptimal 
            ? 'bg-slate-900/90 border-slate-800 hover:border-teal-500/40' 
            : 'bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-950/40'
        }`}>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-teal-400" />
              Conductividad EC
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              isEcOptimal ? 'bg-teal-500/10 text-teal-400' : 'bg-amber-500/20 text-amber-300'
            }`}>
              {isEcOptimal ? 'CORRECTO' : 'REVISAR'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {latestReading.ec.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">mS/cm</span>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
            <span>TDS Salinidad:</span>
            <span className="font-mono text-teal-300 font-bold">{latestReading.tdsPpm} PPM</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Rango objetivo: <span className="text-teal-400 font-mono">{thresholds.ecMin} - {thresholds.ecMax} mS/cm</span>
          </div>
        </div>

        {/* 3. Water Level Card */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isWaterLevelOptimal 
            ? 'bg-slate-900/90 border-slate-800 hover:border-cyan-500/40' 
            : 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/40'
        }`}>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              Nivel de Agua
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              isWaterLevelOptimal ? 'bg-cyan-500/10 text-cyan-400' : 'bg-rose-500/20 text-rose-300'
            }`}>
              {latestReading.waterLevelPct}%
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {latestReading.waterLevelLiters}
            </span>
            <span className="text-xs text-slate-400">/ {crop.tankCapacityLiters} L</span>
          </div>

          <div className="mt-3">
            <div className="h-2 rounded-full w-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isWaterLevelOptimal ? 'bg-cyan-400' : 'bg-rose-500 animate-pulse'
                }`}
                style={{ width: `${latestReading.waterLevelPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Mínimo: {thresholds.waterLevelMinPct}%</span>
              <span className="text-cyan-400">Capacidad Total</span>
            </div>
          </div>
        </div>

        {/* 4. Water Solution Temperature Card */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isWaterTempOptimal 
            ? 'bg-slate-900/90 border-slate-800 hover:border-blue-500/40' 
            : 'bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-950/40'
        }`}>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-blue-400" />
              Temp. Solución
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400">
              DS18B20
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {latestReading.waterTempC.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400">°C</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-3">
            Oxigenación disuelta óptima entre 18°C - 24°C
          </div>
          <div className="text-[10px] text-blue-400 font-mono mt-1">
            Obj: {thresholds.waterTempMinC}°C - {thresholds.waterTempMaxC}°C
          </div>
        </div>

        {/* 5. Ambient Temperature & Humidity Card */}
        <div className="p-4 rounded-2xl border bg-slate-900/90 border-slate-800 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-emerald-400" />
              Ambiente / Clima
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
              DHT22
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              {latestReading.airTempC.toFixed(1)}°C
            </span>
            <span className="text-xs text-slate-400">/</span>
            <span className="text-2xl font-black text-teal-300 font-mono">
              {latestReading.humidityPct}%
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-3 flex justify-between">
            <span>Temp. Aire: {latestReading.airTempC}°C</span>
            <span>HR: {latestReading.humidityPct}%</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-1">
            VPD Transpiración Normal
          </div>
        </div>

        {/* 6. Nutrients & Dosing Card */}
        <div className="p-4 rounded-2xl border bg-slate-900/90 border-slate-800 hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Beaker className="w-3.5 h-3.5 text-purple-400" />
              Nutrientes N-P-K
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400">
              {latestReading.nutrients.npkRatio}
            </span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Solución A:</span>
              <span className="font-mono text-purple-300 font-bold">{latestReading.nutrients.solADosageMl} ml</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Solución B:</span>
              <span className="font-mono text-purple-300 font-bold">{latestReading.nutrients.solBDosageMl} ml</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Micronutrientes:</span>
              <span className="font-mono text-purple-300 font-bold">{latestReading.nutrients.solCDosageMl} ml</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 mt-2">
            Corrector pH: <span className="capitalize text-slate-300">{latestReading.nutrients.phModifierType || 'Estable'}</span>
          </div>
        </div>
      </div>

      {/* Hydroponic System Mechanics & Telemetry Trend Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Details Box */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">Arquitectura del Sistema</h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold">
              {crop.systemType}
            </span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="font-semibold text-slate-200">{sysInfo.label}</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">{sysInfo.desc}</p>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5">
              <RotateCw className="w-3 h-3 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>{sysInfo.flow}</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-400">
              <span>Fecha de Siembra:</span>
              <span className="text-slate-200 font-mono">{crop.plantingDate}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-400">
              <span>Cosecha Estimada:</span>
              <span className="text-emerald-400 font-mono font-semibold">{crop.expectedHarvestDate || 'En curso'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-400">
              <span>Fuente Sensor:</span>
              <span className="text-cyan-400 font-mono">{latestReading.sensorSource} ({latestReading.deviceId || 'IoT Bus'})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-400">
              <span>Coordenadas GPS:</span>
              <span className="text-emerald-400 font-mono text-[11px]">{crop.latitude?.toFixed(4)}°, {crop.longitude?.toFixed(4)}°</span>
            </div>
            <div className="flex justify-between py-1 text-slate-400">
              <span>Última Transmisión:</span>
              <span className="text-slate-300 font-mono">{new Date(latestReading.timestamp).toLocaleTimeString('es-ES')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onNavigateToTab('mapa')}
              className="py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 rounded-xl text-xs font-bold border border-emerald-500/30 transition flex items-center justify-center gap-1"
            >
              <span>Ver en Mapa</span>
            </button>
            <button
              onClick={() => onNavigateToTab('cultivos')}
              className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Gestionar Lotes
            </button>
          </div>
        </div>

        {/* 24-Hour Telemetry Mini Chart */}
        <div className="lg:col-span-2 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">Curva de Telemetría (Últimas Lecturas)</h3>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> pH
              </span>
              <span className="flex items-center gap-1 text-teal-300 font-mono text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block" /> EC (mS/cm)
              </span>
              <span className="flex items-center gap-1 text-blue-400 font-mono text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> T. Agua (°C)
              </span>
            </div>
          </div>

          {/* Sparkline Visual Simulation */}
          <div className="h-44 bg-slate-950/80 rounded-xl p-3 border border-slate-800 flex items-end gap-1.5 sm:gap-2 overflow-x-auto">
            {recent12.map((rd, i) => {
              const phHeight = Math.min(100, Math.max(15, ((rd.ph - 4) / 4) * 100));
              const ecHeight = Math.min(100, Math.max(15, (rd.ec / 3.5) * 100));
              const tempHeight = Math.min(100, Math.max(15, ((rd.waterTempC - 10) / 20) * 100));

              return (
                <div key={rd.id || i} className="flex-1 flex flex-col items-center justify-end h-full min-w-[20px] group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col bg-slate-800 border border-slate-700 text-[10px] text-white p-1.5 rounded-lg shadow-xl z-20 whitespace-nowrap pointer-events-none">
                    <span className="font-mono font-bold text-slate-300">{new Date(rd.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-emerald-400">pH: {rd.ph.toFixed(2)}</span>
                    <span className="text-teal-300">EC: {rd.ec.toFixed(2)}</span>
                    <span className="text-blue-300">Agua: {rd.waterTempC}°C</span>
                  </div>

                  <div className="w-full flex items-end justify-center gap-0.5 h-32">
                    <div
                      className="w-1.5 sm:w-2 bg-emerald-500 rounded-t transition-all group-hover:brightness-125"
                      style={{ height: `${phHeight}%` }}
                    />
                    <div
                      className="w-1.5 sm:w-2 bg-teal-400 rounded-t transition-all group-hover:brightness-125"
                      style={{ height: `${ecHeight}%` }}
                    />
                    <div
                      className="w-1.5 sm:w-2 bg-blue-500 rounded-t transition-all group-hover:brightness-125"
                      style={{ height: `${tempHeight}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 font-mono truncate">
                    {new Date(rd.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              Muestreo continuo cada ciclo con validación de rangos biológicos.
            </span>
            <button
              onClick={() => onNavigateToTab('historial')}
              className="text-emerald-400 hover:text-emerald-300 font-semibold underline"
            >
              Ver tabla cronológica completa →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
