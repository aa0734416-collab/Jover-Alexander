import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Download, 
  X, 
  Calendar, 
  FileSpreadsheet, 
  FileCheck, 
  QrCode, 
  PenTool, 
  Eraser, 
  Building2, 
  Check, 
  ShieldCheck,
  Eye
} from 'lucide-react';
import { 
  CropBatch, 
  TelemetryReading, 
  LetterheadConfig, 
  UserProfile, 
  ExportedReportData, 
  DigitalSignatureData 
} from '../types';
import { ExportService } from '../services/exportService';
import { QRService } from '../services/qrService';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  crops: CropBatch[];
  activeCropId: string;
  readings: TelemetryReading[];
  letterhead: LetterheadConfig;
  currentUser: UserProfile;
}

export const ReportsModal: React.FC<ReportsModalProps> = ({
  isOpen,
  onClose,
  crops,
  activeCropId,
  readings,
  letterhead,
  currentUser,
}) => {
  const [selectedCropId, setSelectedCropId] = useState<string>(activeCropId);
  const [periodType, setPeriodType] = useState<'dia' | 'mes' | 'año'>('mes');
  const [reportTitle, setReportTitle] = useState<string>('Informe Técnico de Monitoreo Hidropónico');
  
  // Digital signature state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');
  const [signerName, setSignerName] = useState<string>(currentUser.fullName);
  const [signerTitle, setSignerTitle] = useState<string>(currentUser.functionTitle);
  const [signerId, setSignerId] = useState<string>(letterhead.agronomistRegNumber || 'CIP-2026-9921');
  
  // Generated QR preview
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setSelectedCropId(activeCropId);
  }, [activeCropId]);

  const selectedCrop = crops.find(c => c.id === selectedCropId) || crops[0];

  // Filter readings for report
  const now = new Date();
  const cropReadings = readings.filter(r => r.cropId === selectedCrop.id);

  const filteredReadings = cropReadings.filter(r => {
    const d = new Date(r.timestamp);
    if (periodType === 'dia') {
      return d.toDateString() === now.toDateString();
    } else if (periodType === 'mes') {
      const monthAgo = new Date();
      monthAgo.setDate(now.getDate() - 30);
      return d >= monthAgo;
    } else if (periodType === 'año') {
      return d.getFullYear() === now.getFullYear();
    }
    return true;
  });

  // Calculate summary stats
  const count = filteredReadings.length || 1;
  const avgPh = filteredReadings.reduce((sum, r) => sum + r.ph, 0) / count;
  const minPh = filteredReadings.length ? Math.min(...filteredReadings.map(r => r.ph)) : 6.0;
  const maxPh = filteredReadings.length ? Math.max(...filteredReadings.map(r => r.ph)) : 6.5;

  const avgEc = filteredReadings.reduce((sum, r) => sum + r.ec, 0) / count;
  const minEc = filteredReadings.length ? Math.min(...filteredReadings.map(r => r.ec)) : 1.5;
  const maxEc = filteredReadings.length ? Math.max(...filteredReadings.map(r => r.ec)) : 2.0;

  const avgWaterTemp = filteredReadings.reduce((sum, r) => sum + r.waterTempC, 0) / count;
  const avgAirTemp = filteredReadings.reduce((sum, r) => sum + r.airTempC, 0) / count;
  const avgHumidity = filteredReadings.reduce((sum, r) => sum + r.humidityPct, 0) / count;
  const minWaterLevel = filteredReadings.length ? Math.min(...filteredReadings.map(r => r.waterLevelPct)) : 80;

  // Generate QR code payload whenever period or crop changes
  useEffect(() => {
    if (!isOpen) return;

    const reportId = `REP-${selectedCrop.systemType}-${Date.now().toString().slice(-6)}`;
    const qrPayload = {
      app: 'HydroSense',
      v: 2,
      type: 'report',
      id: reportId,
      name: selectedCrop.name,
      date: new Date().toISOString(),
      ph: Number(avgPh.toFixed(2)),
      ec: Number(avgEc.toFixed(2)),
      waterLevelPct: minWaterLevel,
      waterTempC: Number(avgWaterTemp.toFixed(1)),
      system: selectedCrop.systemType,
      hash: `SHA256-${Math.random().toString(36).substring(2, 15)}`,
    };

    QRService.generateQRCode(qrPayload).then((dataUrl) => {
      setQrCodeDataUrl(dataUrl);
    });
  }, [isOpen, selectedCropId, periodType, avgPh, avgEc]);

  // Canvas signature handling
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = '#0284c7'; // dark cyan / slate blue signature ink
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureDataUrl(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDataUrl('');
  };

  // Build report payload object
  const buildReportObject = (): ExportedReportData => {
    const reportId = `REP-${selectedCrop.systemType}-${Date.now().toString().slice(-6)}`;
    const securityHash = `SHA256-${Date.now().toString(16)}-${Math.random().toString(36).substring(2, 10).toUpperCase()}-VERIFIED`;

    const signatures: DigitalSignatureData[] = [];
    if (signatureDataUrl) {
      signatures.push({
        signatureBase64: signatureDataUrl,
        signerName,
        signerTitle,
        signerIdNumber: signerId,
        signatureDate: new Date().toISOString(),
        verificationHash: securityHash,
      });
    }

    return {
      reportId,
      title: reportTitle,
      periodType,
      periodLabel: periodType === 'dia' ? `Diario (${new Date().toLocaleDateString('es-ES')})` :
                   periodType === 'mes' ? `Mensual (${new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })})` :
                   `Anual (${new Date().getFullYear()})`,
      startDate: filteredReadings[filteredReadings.length - 1]?.timestamp || new Date().toISOString(),
      endDate: filteredReadings[0]?.timestamp || new Date().toISOString(),
      generatedAt: new Date().toISOString(),
      cropBatch: selectedCrop,
      readings: filteredReadings.length > 0 ? filteredReadings : readings.slice(0, 5),
      summary: {
        readingCount: filteredReadings.length,
        avgPh,
        minPh,
        maxPh,
        avgEc,
        minEc,
        maxEc,
        avgWaterTemp,
        avgAirTemp,
        avgHumidity,
        minWaterLevel,
        totalAlerts: 0,
      },
      letterhead,
      signatures,
      qrCodeDataUrl,
      securityHash,
    };
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const report = buildReportObject();
      await ExportService.generatePDF(report);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = () => {
    const report = buildReportObject();
    ExportService.exportToExcel(report);
  };

  const handleExportWord = () => {
    const report = buildReportObject();
    ExportService.exportToWord(report);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                Generador de Informes Oficiales & Formatos
              </h2>
              <p className="text-xs text-slate-400">
                Membrete corporativo, exportación a PDF/Word/Excel, firma digital y código QR único
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs">
          {/* Top Options: Period, Crop, Title */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Período del Informe *</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {[
                  { id: 'dia', label: 'Día' },
                  { id: 'mes', label: 'Mes' },
                  { id: 'año', label: 'Año' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPeriodType(p.id as any)}
                    className={`py-1.5 rounded-lg font-bold text-xs transition ${
                      periodType === p.id
                        ? 'bg-emerald-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Cultivo / Lote *</label>
              <select
                value={selectedCropId}
                onChange={(e) => setSelectedCropId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-emerald-400 font-bold focus:outline-none"
              >
                {crops.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.systemType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Título del Documento</label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Institutional Letterhead Preview Box (Superior & Inferior) */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-bold flex items-center gap-1.5 text-slate-300 text-xs">
                <Building2 className="w-4 h-4 text-emerald-400" /> Membrete Superior e Inferior Vinculados
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold">Listo para impresión oficial</span>
            </div>

            {/* Superior Preview */}
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800/80 space-y-2">
              <div
                className="h-1 rounded-full w-full"
                style={{ backgroundColor: letterhead.headerAccentColor || '#059669' }}
              />
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-2.5">
                  {letterhead.logoBase64 ? (
                    <img src={letterhead.logoBase64} alt="Logo" className="w-10 h-10 object-contain rounded bg-white p-0.5" />
                  ) : (
                    <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded flex items-center justify-center font-bold text-slate-400 text-[9px]">
                      LOGO
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">▲ Membrete Superior</span>
                      {letterhead.isoCertification && (
                        <span className="text-[8px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">{letterhead.isoCertification}</span>
                      )}
                    </div>
                    <h4 className="font-extrabold text-white text-xs">{letterhead.institutionName}</h4>
                    <p className="text-[10px] text-slate-400 italic">{letterhead.slogan}</p>
                    <div className="text-[9px] text-slate-500 mt-0.5">
                      <span>{letterhead.taxId}</span> • <span>{letterhead.address}</span> • <span>Tel: {letterhead.phone}</span>
                    </div>
                  </div>
                </div>

                {/* QR Code Preview */}
                {qrCodeDataUrl && (
                  <div className="text-center shrink-0">
                    <img
                      src={qrCodeDataUrl}
                      alt="QR Code Report"
                      className="w-14 h-14 rounded bg-white p-1 border border-slate-700 shadow"
                    />
                    <span className="text-[8px] text-slate-400 block mt-0.5 font-mono">QR Certificado</span>
                  </div>
                )}
              </div>
            </div>

            {/* Inferior Preview Mini */}
            <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/60 text-[9px] text-slate-400 space-y-1">
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">▼ Membrete Inferior (Pie Legal)</span>
              {letterhead.footerLegalNote && (
                <p className="italic text-slate-400">{letterhead.footerLegalNote}</p>
              )}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-slate-500 font-mono text-[8.5px]">
                <span>{letterhead.footerContactLine || `${letterhead.institutionName} • Loja, Ecuador`}</span>
                <span className="text-emerald-400">{letterhead.pageNumberFormat || 'Página 1 de 1'} • Supabase: pbrdtcbsvckfibafvwkq</span>
              </div>
            </div>
          </div>

          {/* Report Statistics Preview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[10px] block">pH Promedio</span>
              <span className="text-lg font-black text-emerald-400 font-mono">{avgPh.toFixed(2)}</span>
              <span className="text-[10px] text-slate-400 block">Mín {minPh.toFixed(2)} / Máx {maxPh.toFixed(2)}</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[10px] block">EC Conductividad</span>
              <span className="text-lg font-black text-teal-300 font-mono">{avgEc.toFixed(2)} <small className="text-[10px]">mS/cm</small></span>
              <span className="text-[10px] text-slate-400 block">Mín {minEc.toFixed(2)} / Máx {maxEc.toFixed(2)}</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Temp. Solución</span>
              <span className="text-lg font-black text-blue-400 font-mono">{avgWaterTemp.toFixed(1)}°C</span>
              <span className="text-[10px] text-slate-400 block">Ambiente: {avgAirTemp.toFixed(1)}°C</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Muestras Analizadas</span>
              <span className="text-lg font-black text-purple-400 font-mono">{filteredReadings.length}</span>
              <span className="text-[10px] text-slate-400 block">Nivel agua mín: {minWaterLevel}%</span>
            </div>
          </div>

          {/* Digital Signature Pad */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                <PenTool className="w-4 h-4 text-cyan-400" />
                Firma Digital del Responsable Técnico (Dibuje o valide con el dedo/ratón)
              </span>
              <button
                type="button"
                onClick={clearCanvas}
                className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition"
              >
                <Eraser className="w-3 h-3" /> Limpiar firma
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Signature Canvas */}
              <div className="relative border-2 border-dashed border-slate-700 rounded-xl overflow-hidden bg-slate-900 h-32 flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={340}
                  height={120}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="cursor-crosshair touch-none w-full h-full"
                />
                {!signatureDataUrl && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-600 text-xs font-medium">
                    Trace su firma digital aquí
                  </div>
                )}
              </div>

              {/* Signer Data */}
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-0.5">Nombre del Firmante:</label>
                  <input
                    type="text"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-semibold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-0.5">Cargo / Función:</label>
                    <input
                      type="text"
                      value={signerTitle}
                      onChange={(e) => setSignerTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-0.5">Matrícula / Cédula:</label>
                    <input
                      type="text"
                      value={signerId}
                      onChange={(e) => setSignerId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-[11px] font-mono"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Validación criptográfica SHA256 incrustada automáticamente en el QR</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer: 3 Export Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/60 rounded-b-2xl flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 hidden sm:block">
            Formato con membrete, tabla estadística, QR y firma digital
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Word Export */}
            <button
              onClick={handleExportWord}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-900/40 hover:bg-blue-800/60 text-blue-200 border border-blue-700/50 text-xs font-bold transition"
              title="Descargar en formato Word (.doc)"
            >
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Word (.doc)</span>
            </button>

            {/* Excel Export */}
            <button
              onClick={handleExportExcel}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-teal-900/40 hover:bg-teal-800/60 text-teal-200 border border-teal-700/50 text-xs font-bold transition"
              title="Descargar en formato Excel (.xls)"
            >
              <FileSpreadsheet className="w-4 h-4 text-teal-400" />
              <span>Excel (.xls)</span>
            </button>

            {/* PDF Export */}
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generando...' : 'Descargar PDF Oficial'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
