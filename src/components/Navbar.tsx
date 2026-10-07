import React, { useState } from 'react';
import { 
  Sprout, 
  Bell, 
  Volume2, 
  VolumeX, 
  Cloud, 
  CloudOff, 
  User, 
  Menu, 
  X, 
  ShieldCheck, 
  Settings, 
  FileText, 
  QrCode, 
  Download, 
  Upload, 
  Cpu
} from 'lucide-react';
import { UserProfile, CropBatch, SystemAlert } from '../types';

interface NavbarProps {
  currentUser: UserProfile;
  crops: CropBatch[];
  activeCropId: string;
  onSelectCrop: (id: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  alerts: SystemAlert[];
  soundEnabled: boolean;
  onToggleSound: () => void;
  isCloudConnected: boolean;
  onOpenUserModal: () => void;
  onOpenSupabaseModal: () => void;
  onOpenBackupModal: () => void;
  onOpenQRScannerModal: () => void;
  onOpenReportsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  crops,
  activeCropId,
  onSelectCrop,
  activeTab,
  setActiveTab,
  alerts,
  soundEnabled,
  onToggleSound,
  isCloudConnected,
  onOpenUserModal,
  onOpenSupabaseModal,
  onOpenBackupModal,
  onOpenQRScannerModal,
  onOpenReportsModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unresolvedAlerts = alerts.filter(a => !a.resolved);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sprout className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                  HydroSense IoT
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  v2.5 Pro
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Monitoreo Hidropónico de Precisión & Cloud Sync
              </p>
            </div>
          </div>

          {/* Center Selector: Active Crop */}
          <div className="hidden md:flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Cultivo Activo:</span>
            <select
              value={activeCropId}
              onChange={(e) => onSelectCrop(e.target.value)}
              aria-label="Seleccionar cultivo activo"
              className="bg-transparent text-xs font-semibold text-emerald-400 focus:outline-none cursor-pointer max-w-[200px] truncate"
            >
              {crops.map((crop) => (
                <option key={crop.id} value={crop.id} className="bg-slate-900 text-slate-200">
                  {crop.name} ({crop.systemType})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Nav Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-950/50 p-1 rounded-xl border border-slate-800/80">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'mapa', label: 'Mapa GPS' },
              { id: 'historial', label: 'Historial' },
              { id: 'cultivos', label: 'Cultivos' },
              { id: 'sensores', label: 'Sensores IoT' },
              { id: 'alertas', label: 'Umbrales' },
              { id: 'membrete', label: 'Membrete' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Report Button */}
            <button
              onClick={onOpenReportsModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
              title="Generar y descargar informe con membrete, QR y firmas"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Reportes</span>
            </button>

            {/* QR Scan / Decode Button */}
            <button
              onClick={onOpenQRScannerModal}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 transition border border-slate-700/60"
              title="Escanear Código QR para recuperar o cargar datos"
            >
              <QrCode className="w-4 h-4" />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-lg transition border ${
                soundEnabled
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-slate-200'
              }`}
              title={soundEnabled ? 'Alarma sonora activa' : 'Alarma sonora silenciada'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Cloud Sync Status */}
            <button
              onClick={onOpenSupabaseModal}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
                isCloudConnected
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-slate-200'
              }`}
              title="Estado de sincronización en la nube Supabase (pbrdtcbsvckfibafvwkq)"
            >
              {isCloudConnected ? <Cloud className="w-3.5 h-3.5 text-cyan-400" /> : <CloudOff className="w-3.5 h-3.5" />}
              <span className="hidden xl:inline">{isCloudConnected ? 'Supabase OK' : 'Nube'}</span>
            </button>

            {/* Alerts Bell */}
            <button
              onClick={() => setActiveTab('alertas')}
              className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition border border-slate-700/60"
              title="Alertas activas"
            >
              <Bell className="w-4 h-4" />
              {unresolvedAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unresolvedAlerts.length}
                </span>
              )}
            </button>

            {/* User Profile Badge */}
            <button
              onClick={onOpenUserModal}
              className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition"
              title="Perfil de Usuario y Credenciales"
            >
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="w-6 h-6 rounded-full object-cover border border-emerald-400/50"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-emerald-600/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                  {currentUser.fullName.charAt(0)}
                </div>
              )}
              <div className="text-left hidden md:block">
                <div className="text-xs font-semibold text-slate-200 leading-none truncate max-w-[100px]">
                  {currentUser.fullName.split(' ')[0]}
                </div>
                <div className="text-[10px] text-emerald-400 leading-none mt-0.5 uppercase tracking-wide">
                  {currentUser.role.replace('_', ' ')}
                </div>
              </div>
            </button>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 lg:hidden text-slate-300"
              aria-label="Abrir menú de navegación"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-800 space-y-2">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 mb-3">
              <label className="text-[11px] text-slate-400 block mb-1">Cultivo en monitoreo:</label>
              <select
                value={activeCropId}
                onChange={(e) => {
                  onSelectCrop(e.target.value);
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-slate-900 text-xs font-semibold text-emerald-400 p-1.5 rounded border border-slate-700"
              >
                {crops.map((crop) => (
                  <option key={crop.id} value={crop.id}>
                    {crop.name} ({crop.systemType})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'mapa', label: 'Mapa Satelital GPS' },
                { id: 'historial', label: 'Historial' },
                { id: 'cultivos', label: 'Cultivos' },
                { id: 'sensores', label: 'Sensores IoT' },
                { id: 'alertas', label: 'Alertas & Umbrales' },
                { id: 'membrete', label: 'Membrete & Formatos' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-lg text-left text-xs font-semibold ${
                    activeTab === tab.id
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-950/60 text-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  onOpenReportsModal();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" /> Descargar Informes
              </button>
              <button
                onClick={() => {
                  onOpenBackupModal();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Backup / Subir
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
