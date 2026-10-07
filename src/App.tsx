import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  StorageService, 
  DEFAULT_THRESHOLDS, 
  DEFAULT_CROPS, 
  DEFAULT_LETTERHEAD 
} from './services/storage';
import { SupabaseService } from './services/supabaseClient';
import { NotificationService } from './services/audioAlert';
import { 
  UserProfile, 
  CropBatch, 
  TelemetryReading, 
  AlertThresholds, 
  SystemAlert, 
  IoTDevice, 
  LetterheadConfig 
} from './types';
import { QRTelemetryPayload } from './services/qrService';

import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { RealTimeCropMap } from './components/RealTimeCropMap';
import { CropManagement } from './components/CropManagement';
import { TelemetryHistory } from './components/TelemetryHistory';
import { HardwareSensors } from './components/HardwareSensors';
import { AlertSettings } from './components/AlertSettings';
import { LetterheadSettings } from './components/LetterheadSettings';
import { ReportsModal } from './components/ReportsModal';
import { QRScannerModal } from './components/QRScannerModal';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { UserAuthModal } from './components/UserAuthModal';
import { SupabaseSyncModal } from './components/SupabaseSyncModal';
import { AuthGate } from './components/AuthGate';

export default function App() {
  // Authentication Gate State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('hydrosense_authenticated') === 'true';
  });

  // Core application state
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => StorageService.getCurrentUser());
  const [users, setUsers] = useState<UserProfile[]>(() => StorageService.getUsers());
  const [crops, setCrops] = useState<CropBatch[]>(() => StorageService.getCrops());
  const [activeCropId, setActiveCropId] = useState<string>(() => StorageService.getActiveCropId());
  const [readings, setReadings] = useState<TelemetryReading[]>(() => StorageService.getReadings());
  const [thresholds, setThresholds] = useState<AlertThresholds>(() => StorageService.getThresholds());
  const [alerts, setAlerts] = useState<SystemAlert[]>(() => StorageService.getAlerts());
  const [devices, setDevices] = useState<IoTDevice[]>(() => StorageService.getDevices());
  const [letterhead, setLetterhead] = useState<LetterheadConfig>(() => StorageService.getLetterhead());
  
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);

  // Modals state
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [reportsModalOpen, setReportsModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);

  // Active crop object
  const activeCrop = useMemo(() => {
    return crops.find(c => c.id === activeCropId) || crops[0] || DEFAULT_CROPS[0];
  }, [crops, activeCropId]);

  // Latest reading for active crop
  const latestReading = useMemo(() => {
    const cropReadings = readings.filter(r => r.cropId === activeCrop.id);
    return cropReadings[0] || null;
  }, [readings, activeCrop]);

  // Check cloud connection on initial load
  useEffect(() => {
    const testCloud = async () => {
      const res = await SupabaseService.testConnection();
      setIsCloudConnected(res.success);
    };
    testCloud();
  }, []);

  // Alert verification function
  const evaluateReadingForAlerts = useCallback((reading: TelemetryReading, cropName: string) => {
    const newAlerts: SystemAlert[] = [];

    // 1. pH Check
    if (reading.ph < thresholds.phMin) {
      newAlerts.push({
        id: `alert_ph_low_${Date.now()}`,
        timestamp: new Date().toISOString(),
        severity: reading.ph < thresholds.phMin - 0.5 ? 'critical' : 'warning',
        param: 'ph',
        title: 'pH Ácido Crítico',
        message: `El pH (${reading.ph.toFixed(2)}) descendió por debajo del mínimo permitido (${thresholds.phMin}) en ${cropName}.`,
        value: reading.ph,
        threshold: thresholds.phMin,
        resolved: false,
      });
    } else if (reading.ph > thresholds.phMax) {
      newAlerts.push({
        id: `alert_ph_high_${Date.now()}`,
        timestamp: new Date().toISOString(),
        severity: reading.ph > thresholds.phMax + 0.5 ? 'critical' : 'warning',
        param: 'ph',
        title: 'pH Alcalino Excesivo',
        message: `El pH (${reading.ph.toFixed(2)}) superó el límite máximo (${thresholds.phMax}) en ${cropName}.`,
        value: reading.ph,
        threshold: thresholds.phMax,
        resolved: false,
      });
    }

    // 2. EC Conductividad Check
    if (reading.ec < thresholds.ecMin) {
      newAlerts.push({
        id: `alert_ec_low_${Date.now()}`,
        timestamp: new Date().toISOString(),
        severity: 'warning',
        param: 'ec',
        title: 'Nutrientes Insuficientes (Baja EC)',
        message: `Conductividad EC (${reading.ec.toFixed(2)} mS/cm) por debajo del objetivo (${thresholds.ecMin}) en ${cropName}.`,
        value: reading.ec,
        threshold: thresholds.ecMin,
        resolved: false,
      });
    } else if (reading.ec > thresholds.ecMax) {
      newAlerts.push({
        id: `alert_ec_high_${Date.now()}`,
        timestamp: new Date().toISOString(),
        severity: 'critical',
        param: 'ec',
        title: 'Salinidad Alta (Sobredosis EC)',
        message: `Riesgo de fitotoxicidad: EC (${reading.ec.toFixed(2)} mS/cm) superó el umbral (${thresholds.ecMax}) en ${cropName}.`,
        value: reading.ec,
        threshold: thresholds.ecMax,
        resolved: false,
      });
    }

    // 3. Water Level Check
    if (reading.waterLevelPct < thresholds.waterLevelMinPct) {
      newAlerts.push({
        id: `alert_level_low_${Date.now()}`,
        timestamp: new Date().toISOString(),
        severity: 'critical',
        param: 'water_level',
        title: 'Nivel Crítico de Agua en Tanque',
        message: `Nivel de solución al ${reading.waterLevelPct}% (${reading.waterLevelLiters}L). Riesgo de cavitación de bombas en ${cropName}.`,
        value: reading.waterLevelPct,
        threshold: thresholds.waterLevelMinPct,
        resolved: false,
      });
    }

    // Process alerts
    if (newAlerts.length > 0) {
      setAlerts(prev => {
        const updated = [...newAlerts, ...prev];
        StorageService.saveAlerts(updated);
        return updated;
      });

      // Sound and Push notification
      if (soundEnabled && thresholds.soundAlarmEnabled) {
        NotificationService.playAlarmTone(newAlerts[0].severity === 'critical' ? 'critical' : 'warning');
      }

      if (thresholds.pushNotificationsEnabled) {
        NotificationService.sendPush(newAlerts[0].title, newAlerts[0].message, newAlerts[0].severity);
      }
    }
  }, [thresholds, soundEnabled]);

  // Simulate or capture real telemetry reading
  const handleSimulateReading = useCallback(() => {
    const now = new Date();
    const randOffset = (Math.random() - 0.5) * 0.2;
    const basePh = 6.05 + randOffset;
    const baseEc = 1.8 + randOffset * 0.8;
    const waterLevel = Math.max(20, Math.min(98, Math.round(75 + (Math.random() - 0.5) * 15)));

    const newReading: TelemetryReading = {
      id: `read_${now.getTime()}`,
      cropId: activeCrop.id,
      timestamp: now.toISOString(),
      ph: Number(basePh.toFixed(2)),
      ec: Number(baseEc.toFixed(2)),
      tdsPpm: Math.round(baseEc * 640),
      waterLevelPct: waterLevel,
      waterLevelLiters: Math.round((waterLevel / 100) * activeCrop.tankCapacityLiters),
      waterTempC: Number((21.5 + (Math.random() - 0.5) * 1.2).toFixed(1)),
      airTempC: Number((24.2 + (Math.random() - 0.5) * 2.0).toFixed(1)),
      humidityPct: Math.round(66 + (Math.random() - 0.5) * 8),
      nutrients: {
        npkRatio: '15-10-30',
        solutionConcentrationPct: 100,
        solADosageMl: 250,
        solBDosageMl: 250,
        solCDosageMl: 80,
        phModifierType: basePh > 6.4 ? 'acid' : 'none',
      },
      sensorSource: Math.random() > 0.5 ? 'ESP32' : 'Arduino',
      deviceId: devices[0]?.id,
      recordedByUserName: currentUser?.fullName || 'Operador',
      notes: `Telemetría recibida de sensor nodo IoT en ${activeCrop.name}`,
    };

    setReadings(prev => {
      const updated = [newReading, ...prev];
      StorageService.saveReadings(updated);
      return updated;
    });

    evaluateReadingForAlerts(newReading, activeCrop.name);
  }, [activeCrop, devices, currentUser, evaluateReadingForAlerts]);

  // Crop management handlers
  const handleSelectCrop = (id: string) => {
    setActiveCropId(id);
    StorageService.setActiveCropId(id);
  };

  const handleSaveCrop = (crop: CropBatch) => {
    const index = crops.findIndex(c => c.id === crop.id);
    let updated: CropBatch[];
    if (index >= 0) {
      updated = [...crops];
      updated[index] = crop;
    } else {
      updated = [crop, ...crops];
    }
    setCrops(updated);
    StorageService.saveCrops(updated);
  };

  const handleDeleteCrop = (id: string) => {
    if (crops.length <= 1) return;
    const updated = crops.filter(c => c.id !== id);
    setCrops(updated);
    StorageService.saveCrops(updated);
    if (activeCropId === id) {
      handleSelectCrop(updated[0].id);
    }
  };

  // Update coordinates from Map
  const handleUpdateCropCoordinates = (cropId: string, lat: number, lng: number) => {
    const updated = crops.map(c => c.id === cropId ? { ...c, latitude: lat, longitude: lng } : c);
    setCrops(updated);
    StorageService.saveCrops(updated);
  };

  // Manual reading handler
  const handleAddManualReading = (reading: TelemetryReading) => {
    setReadings(prev => {
      const updated = [reading, ...prev];
      StorageService.saveReadings(updated);
      return updated;
    });
    const cObj = crops.find(c => c.id === reading.cropId) || activeCrop;
    evaluateReadingForAlerts(reading, cObj.name);
  };

  // QR Import handler
  const handleImportFromQR = (qrData: QRTelemetryPayload) => {
    const now = new Date();
    const reading: TelemetryReading = {
      id: `qr_imported_${now.getTime()}`,
      cropId: activeCrop.id,
      timestamp: qrData.date || now.toISOString(),
      ph: qrData.ph,
      ec: qrData.ec,
      tdsPpm: Math.round(qrData.ec * 640),
      waterLevelPct: qrData.waterLevelPct || 80,
      waterLevelLiters: Math.round(((qrData.waterLevelPct || 80) / 100) * activeCrop.tankCapacityLiters),
      waterTempC: qrData.waterTempC || 21.0,
      airTempC: 23.5,
      humidityPct: 65,
      nutrients: {
        npkRatio: '15-10-30',
        solutionConcentrationPct: 100,
        solADosageMl: 250,
        solBDosageMl: 250,
        solCDosageMl: 80,
      },
      sensorSource: 'Manual',
      notes: `Restaurado vía Código QR [${qrData.id}] Hash: ${qrData.hash}`,
      recordedByUserName: currentUser?.fullName || 'Operador',
    };

    setReadings(prev => {
      const updated = [reading, ...prev];
      StorageService.saveReadings(updated);
      return updated;
    });
    evaluateReadingForAlerts(reading, activeCrop.name);
  };

  // Alert handlers
  const handleResolveAlert = (id: string) => {
    setAlerts(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, resolved: true, resolvedAt: new Date().toISOString() } : a);
      StorageService.saveAlerts(updated);
      return updated;
    });
  };

  const handleClearResolvedAlerts = () => {
    setAlerts(prev => {
      const updated = prev.filter(a => !a.resolved);
      StorageService.saveAlerts(updated);
      return updated;
    });
  };

  const handleSaveThresholds = (newThresholds: AlertThresholds) => {
    setThresholds(newThresholds);
    StorageService.saveThresholds(newThresholds);
  };

  // Users & credentials handlers
  const handleSelectUser = (user: UserProfile) => {
    setCurrentUser(user);
    StorageService.setCurrentUser(user);
  };

  const handleSaveUser = (user: UserProfile) => {
    const idx = users.findIndex(u => u.id === user.id);
    let updated: UserProfile[];
    if (idx >= 0) {
      updated = [...users];
      updated[idx] = user;
    } else {
      updated = [...users, user];
    }
    setUsers(updated);
    StorageService.saveUsers(updated);

    if (currentUser?.id === user.id) {
      setCurrentUser(user);
      StorageService.setCurrentUser(user);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (users.length <= 1) return;
    const updated = users.filter(u => u.id !== userId);
    setUsers(updated);
    StorageService.saveUsers(updated);
  };

  // Authentication callbacks
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    StorageService.setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('hydrosense_authenticated', 'true');
  };

  const handleRegisterUser = (newUser: UserProfile) => {
    handleSaveUser(newUser);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('hydrosense_authenticated', 'false');
  };

  // Letterhead handler
  const handleSaveLetterhead = (config: LetterheadConfig) => {
    setLetterhead(config);
    StorageService.saveLetterhead(config);
  };

  // Data restored from backup
  const handleDataRestored = () => {
    setCurrentUser(StorageService.getCurrentUser());
    setUsers(StorageService.getUsers());
    setCrops(StorageService.getCrops());
    setActiveCropId(StorageService.getActiveCropId());
    setReadings(StorageService.getReadings());
    setThresholds(StorageService.getThresholds());
    setAlerts(StorageService.getAlerts());
    setDevices(StorageService.getDevices());
    setLetterhead(StorageService.getLetterhead());
  };

  // If not authenticated, show AuthGate
  if (!isAuthenticated) {
    return (
      <AuthGate
        onLoginSuccess={handleLoginSuccess}
        users={users}
        onRegisterUser={handleRegisterUser}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        crops={crops}
        activeCropId={activeCropId}
        onSelectCrop={handleSelectCrop}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alerts={alerts}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        isCloudConnected={isCloudConnected}
        onOpenUserModal={() => setUserModalOpen(true)}
        onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
        onOpenBackupModal={() => setBackupModalOpen(true)}
        onOpenQRScannerModal={() => setQrModalOpen(true)}
        onOpenReportsModal={() => setReportsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            crop={activeCrop}
            latestReading={latestReading}
            readings={readings.filter(r => r.cropId === activeCrop.id)}
            thresholds={thresholds}
            alerts={alerts.filter(a => !a.resolved)}
            onResolveAlert={handleResolveAlert}
            onSimulateReading={handleSimulateReading}
            onOpenReportsModal={() => setReportsModalOpen(true)}
            onOpenQRScannerModal={() => setQrModalOpen(true)}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'mapa' && (
          <RealTimeCropMap
            crops={crops}
            activeCropId={activeCropId}
            onSelectCrop={handleSelectCrop}
            onUpdateCropCoordinates={handleUpdateCropCoordinates}
            readings={readings}
          />
        )}

        {activeTab === 'historial' && (
          <TelemetryHistory
            readings={readings}
            crops={crops}
            activeCropId={activeCropId}
            currentUser={currentUser}
            onAddManualReading={handleAddManualReading}
            onOpenReportsModal={() => setReportsModalOpen(true)}
          />
        )}

        {activeTab === 'cultivos' && (
          <CropManagement
            crops={crops}
            activeCropId={activeCropId}
            onSelectCrop={handleSelectCrop}
            onSaveCrop={handleSaveCrop}
            onDeleteCrop={handleDeleteCrop}
          />
        )}

        {activeTab === 'sensores' && (
          <HardwareSensors
            devices={devices}
            activeCrop={activeCrop}
            onSimulateReading={handleSimulateReading}
            onSaveDevice={(dev) => {
              const updated = devices.map(d => d.id === dev.id ? dev : d);
              setDevices(updated);
              StorageService.saveDevices(updated);
            }}
          />
        )}

        {activeTab === 'alertas' && (
          <AlertSettings
            thresholds={thresholds}
            alerts={alerts}
            onSaveThresholds={handleSaveThresholds}
            onResolveAlert={handleResolveAlert}
            onClearResolvedAlerts={handleClearResolvedAlerts}
          />
        )}

        {activeTab === 'membrete' && (
          <LetterheadSettings
            letterhead={letterhead}
            onSaveLetterhead={handleSaveLetterhead}
          />
        )}
      </main>

      {/* Modals */}
      <ReportsModal
        isOpen={reportsModalOpen}
        onClose={() => setReportsModalOpen(false)}
        crops={crops}
        activeCropId={activeCropId}
        readings={readings}
        letterhead={letterhead}
        currentUser={currentUser}
      />

      <QRScannerModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        onImportFromQR={handleImportFromQR}
        crops={crops}
      />

      <BackupRestoreModal
        isOpen={backupModalOpen}
        onClose={() => setBackupModalOpen(false)}
        onDataRestored={handleDataRestored}
      />

      <UserAuthModal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        currentUser={currentUser}
        users={users}
        onSelectUser={handleSelectUser}
        onSaveUser={handleSaveUser}
        onDeleteUser={handleDeleteUser}
        onLogout={handleLogout}
      />

      <SupabaseSyncModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
        crops={crops}
        readings={readings}
        onSyncComplete={() => setIsCloudConnected(true)}
      />
    </div>
  );
}
