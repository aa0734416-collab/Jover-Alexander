import React, { useState, useRef, useEffect } from 'react';
import { 
  QrCode, 
  Camera, 
  Upload, 
  Check, 
  X, 
  AlertCircle, 
  Database, 
  Sprout, 
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { QRService, QRTelemetryPayload } from '../services/qrService';
import { TelemetryReading, CropBatch } from '../types';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportFromQR: (data: QRTelemetryPayload) => void;
  crops: CropBatch[];
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onImportFromQR,
  crops,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'manual'>('upload');
  const [decodedData, setDecodedData] = useState<QRTelemetryPayload | null>(null);
  const [rawText, setRawText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setDecodedData(null);
      setErrorMessage('');
    }
  }, [isOpen]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    try {
      setErrorMessage('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);

      // Periodically scan if BarcodeDetector is supported
      if ('BarcodeDetector' in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
        const interval = setInterval(async () => {
          if (!videoRef.current || !streamRef.current) {
            clearInterval(interval);
            return;
          }
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const codeValue = barcodes[0].rawValue;
              handleParseText(codeValue);
              clearInterval(interval);
              stopCamera();
            }
          } catch {
            // ignore scan frame errors
          }
        }, 600);
      }
    } catch (err: any) {
      setErrorMessage(`No se pudo acceder a la cámara: ${err.message || 'Permiso denegado'}`);
      setIsCameraActive(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage('');
    const qrString = await QRService.decodeFromImageFile(file);
    if (qrString) {
      handleParseText(qrString);
    } else {
      // Fallback: If image cannot be read directly via BarcodeDetector, allow paste or prompt sample
      setErrorMessage('No se detectó un código QR nítido en la imagen. Intente pegar el contenido o seleccionar otro archivo.');
    }
  };

  const handleParseText = (text: string) => {
    setRawText(text);
    const parsed = QRService.parseQRText(text);
    if (parsed) {
      setDecodedData(parsed);
      setErrorMessage('');
    } else {
      setErrorMessage('El código escaneado no contiene la estructura de datos de HydroSense.');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;
    handleParseText(rawText);
  };

  const handleApplyToApp = () => {
    if (!decodedData) return;
    onImportFromQR(decodedData);
    onClose();
  };

  // Provide a quick demo button to simulate scanning a real report QR
  const handleLoadSampleQR = () => {
    const sample: QRTelemetryPayload = {
      app: 'HydroSense',
      v: 2,
      type: 'report',
      id: `REP-NFT-${Date.now().toString().slice(-6)}`,
      name: crops[0]?.name || 'Lechuga Batavia NFT',
      date: new Date().toISOString(),
      ph: 5.95,
      ec: 1.85,
      waterLevelPct: 88,
      waterTempC: 21.4,
      system: crops[0]?.systemType || 'NFT',
      hash: 'SHA256-4c99b8f10e4a3b8d-AGRO-VERIFIED',
    };
    setDecodedData(sample);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                Escáner & Recuperación de Datos QR
              </h2>
              <p className="text-xs text-slate-400">
                Escanee el código QR de un informe o lote para restaurar su telemetría en la aplicación
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Mode Switcher */}
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                setActiveTab('upload');
                stopCamera();
              }}
              className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                activeTab === 'upload' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Subir Imagen</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('camera');
                startCamera();
              }}
              className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                activeTab === 'camera' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Cámara Web/Móvil</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('manual');
                stopCamera();
              }}
              className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                activeTab === 'manual' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Código / Texto</span>
            </button>
          </div>

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center space-y-3 bg-slate-950/60">
              <QrCode className="w-12 h-12 text-slate-500 mx-auto" />
              <div>
                <p className="font-semibold text-slate-200">Seleccione la imagen del informe con el código QR</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Captura de pantalla, foto o archivo de reporte descargado</p>
              </div>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold cursor-pointer transition">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Explorar Archivo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Camera Tab */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800">
                <video
                  ref={videoRef}
                  playsInline
                  className="w-full h-full object-cover"
                />
                {!isCameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-slate-950/90 text-slate-400 space-y-2">
                    <Camera className="w-8 h-8 text-slate-600 animate-pulse" />
                    <span>Inicie la cámara para apuntar al código QR</span>
                    <button
                      onClick={startCamera}
                      className="px-3 py-1.5 bg-cyan-500 text-slate-950 font-bold rounded-lg"
                    >
                      Activar Cámara
                    </button>
                  </div>
                )}
                {isCameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-cyan-400/80 rounded-2xl animate-pulse" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Manual Tab */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <label className="block text-slate-300 font-semibold">Pegar Contenido JSON o Hash del Código QR:</label>
              <textarea
                rows={4}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder='{"app":"HydroSense","id":"REP-NFT-99182","ph":6.12,"ec":1.85...}'
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold rounded-xl border border-slate-700"
              >
                Decodificar Texto
              </button>
            </form>
          )}

          {/* Quick Demo Helper Button */}
          {!decodedData && (
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={handleLoadSampleQR}
                className="text-[11px] text-cyan-400 hover:underline flex items-center justify-center gap-1 mx-auto"
              >
                <span>Probar con datos de código QR de ejemplo</span>
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Decoded Data Preview Card */}
          {decodedData && (
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/60 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Información Recuperada Exitosamente
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 font-bold">
                  {decodedData.id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Cultivo / Lote:</span>
                  <span className="font-bold text-white">{decodedData.name}</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Sistema:</span>
                  <span className="font-mono text-emerald-400 font-bold">{decodedData.system}</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">pH Registrado:</span>
                  <span className="font-mono text-emerald-400 font-bold">{decodedData.ph}</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">EC Conductividad:</span>
                  <span className="font-mono text-teal-400 font-bold">{decodedData.ec} mS/cm</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 font-mono truncate">
                Hash Autenticidad: {decodedData.hash}
              </div>

              <button
                type="button"
                onClick={handleApplyToApp}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Subir & Cargar Información en la App</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
