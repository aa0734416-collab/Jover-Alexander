import React, { useState } from 'react';
import { 
  Download, 
  Upload, 
  Check, 
  X, 
  HardDrive, 
  AlertTriangle, 
  RefreshCw, 
  FileCheck, 
  ShieldCheck 
} from 'lucide-react';
import { StorageService } from '../services/storage';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
}) => {
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    try {
      const jsonBackup = StorageService.exportFullBackup();
      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `HydroSense_Respaldo_Completo_${dateStr}.json`;

      const blob = new Blob([jsonBackup], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsSuccess(true);
      setStatusMessage('¡Archivo de respaldo exportado y guardado en su dispositivo exitosamente!');
    } catch (e: any) {
      setIsSuccess(false);
      setStatusMessage(`Error al generar respaldo: ${e.message}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = StorageService.importBackup(content);
      if (result.success) {
        setIsSuccess(true);
        setStatusMessage(`${result.message} (${result.recordCount} lecturas cargadas).`);
        onDataRestored();
      } else {
        setIsSuccess(false);
        setStatusMessage(result.message);
      }
    };
    reader.onerror = () => {
      setIsSuccess(false);
      setStatusMessage('No se pudo leer el archivo seleccionado.');
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl my-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                Respaldo Local & Restauración (PC y Celular)
              </h2>
              <p className="text-xs text-slate-400">
                Guarde en su almacenamiento interno y vuelva a subir la información cuando lo requiera
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
        <div className="p-4 sm:p-6 space-y-5 text-xs">
          {/* Action 1: Download backup */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">1. Descargar Respaldo al Dispositivo</h3>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Genera un archivo completo con todos sus cultivos hidropónicos, historial cronológico de sensores, credenciales de usuarios, membrete configurado y alertas.
            </p>
            <button
              onClick={handleDownloadBackup}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center justify-center gap-2 transition"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Guardar Archivo de Respaldo (.json)</span>
            </button>
          </div>

          {/* Action 2: Upload and restore */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white text-sm">2. Subir Archivo Descargado para Restaurar</h3>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Seleccione un archivo previamente descargado de HydroSense para recuperar y fusionar toda la base de datos en su dispositivo actual.
            </p>
            <label className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 transition">
              <Upload className="w-4 h-4" />
              <span>Seleccionar Archivo de Respaldo y Subir</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
              isSuccess
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}>
              {isSuccess ? <Check className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />}
              <span>{statusMessage}</span>
            </div>
          )}

          <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80 text-[11px] text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Almacenamiento no volátil garantizado en la memoria interna del navegador (LocalStorage / IndexedDB).</span>
          </div>
        </div>
      </div>
    </div>
  );
};
