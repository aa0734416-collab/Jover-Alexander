import {
  CropBatch,
  TelemetryReading,
  AlertThresholds,
  SystemAlert,
  UserProfile,
  IoTDevice,
  LetterheadConfig,
  ExportedReportData,
} from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: 'hydrosense_current_user',
  ALL_USERS: 'hydrosense_users_db',
  CROPS: 'hydrosense_crops',
  ACTIVE_CROP_ID: 'hydrosense_active_crop_id',
  READINGS: 'hydrosense_telemetry_readings',
  THRESHOLDS: 'hydrosense_alert_thresholds',
  ALERTS: 'hydrosense_system_alerts',
  DEVICES: 'hydrosense_iot_devices',
  LETTERHEAD: 'hydrosense_letterhead_config',
  SUPABASE_CONFIG: 'hydrosense_supabase_config',
};

// Default Initial Data
export const DEFAULT_THRESHOLDS: AlertThresholds = {
  phMin: 5.6,
  phMax: 6.5,
  ecMin: 1.4,
  ecMax: 2.2,
  waterLevelMinPct: 35,
  waterTempMinC: 18.0,
  waterTempMaxC: 24.0,
  airTempMinC: 18.0,
  airTempMaxC: 28.0,
  humidityMinPct: 50,
  humidityMaxPct: 80,
  pushNotificationsEnabled: true,
  soundAlarmEnabled: true,
};

export const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'usr_admin_1',
    username: 'admin',
    passwordHash: 'admin123', // Demo persistent password
    pinCode: '7788',
    fullName: 'Ing. Jover Aguilar',
    role: 'super_admin',
    functionTitle: 'Director Técnico y Especialista en Hidroponía',
    phone: '+593 99 123 4567',
    email: 'jover.aguilar@unl.edu.ec',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    createdAt: '2026-01-10T08:00:00Z',
    isActive: true,
  },
  {
    id: 'usr_agronomo_2',
    username: 'carmen_agro',
    passwordHash: 'agro2026',
    pinCode: '1234',
    fullName: 'Dra. Carmen Mendoza',
    role: 'agronomo',
    functionTitle: 'Agrónoma Investigadora de Nutrición Vegetal',
    phone: '+593 98 456 7890',
    email: 'cmendoza@hidrocultivos.org',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    createdAt: '2026-02-01T09:30:00Z',
    isActive: true,
  },
  {
    id: 'usr_operador_3',
    username: 'marcos_op',
    passwordHash: 'operador123',
    pinCode: '4321',
    fullName: 'Téc. Marcos Rivas',
    role: 'operador',
    functionTitle: 'Operador de Turno - Calibración y Dosificación',
    phone: '+593 97 888 9911',
    email: 'mrivas@hidrocultivos.org',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    createdAt: '2026-02-15T11:00:00Z',
    isActive: true,
  },
];

export const DEFAULT_CROPS: CropBatch[] = [
  {
    id: 'crop_nft_01',
    name: 'Lechuga Batavia NFT - Modulo A1',
    variety: 'Lactuca sativa var. capitata (Batavia Verde)',
    systemType: 'NFT',
    plantingDate: '2026-09-10',
    expectedHarvestDate: '2026-10-25',
    growthStage: 'vegetativo',
    tankCapacityLiters: 450,
    plantCount: 640,
    location: 'Invernadero Principal - Bancada 01',
    latitude: -4.032745,
    longitude: -79.202318,
    altitudeMeters: 2154,
    active: true,
    notes: 'Flujo constante de lámina de nutrientes a 1.8 L/min. Bomba sumergible con respaldo UPS.',
  },
  {
    id: 'crop_dwc_02',
    name: 'Albahaca Genovesa DWC - Raíz Flotante',
    variety: 'Ocimum basilicum (Genovese Gigante)',
    systemType: 'DWC',
    plantingDate: '2026-09-18',
    expectedHarvestDate: '2026-11-05',
    growthStage: 'vegetativo',
    tankCapacityLiters: 600,
    plantCount: 320,
    location: 'Invernadero B - Tanque Flotante #2',
    latitude: -4.033120,
    longitude: -79.201850,
    altitudeMeters: 2150,
    active: true,
    notes: 'Oxigenación por difusores de aire venturi 24/7. Alta demanda de potasio.',
  },
  {
    id: 'crop_goteo_03',
    name: 'Tomate Cherry Pera - Sustrato & Goteo',
    variety: 'Solanum lycopersicum var. cerasiforme',
    systemType: 'Goteo',
    plantingDate: '2026-08-01',
    expectedHarvestDate: '2026-11-20',
    growthStage: 'pre_cosecha',
    tankCapacityLiters: 1200,
    plantCount: 200,
    location: 'Nave 3 - Sustrato fibra de coco perlita',
    latitude: -4.032410,
    longitude: -79.203100,
    altitudeMeters: 2158,
    active: true,
    notes: 'Goteros autocompensantes 2 L/h. Riego escalonado 8 pulsos por día.',
  },
  {
    id: 'crop_aero_04',
    name: 'Fresas Diamante - Torre Aeropónica',
    variety: 'Fragaria ananassa (Diamante)',
    systemType: 'Aeroponía',
    plantingDate: '2026-08-20',
    expectedHarvestDate: '2026-12-10',
    growthStage: 'vegetativo',
    tankCapacityLiters: 250,
    plantCount: 480,
    location: 'Torre Vertical Norte',
    latitude: -4.031950,
    longitude: -79.202680,
    altitudeMeters: 2162,
    active: true,
    notes: 'Nebulización ultrasónica ciclo 45s ON / 3min OFF. Muy sensible a EC alta.',
  },
];

export const DEFAULT_DEVICES: IoTDevice[] = [
  {
    id: 'dev_esp32_01',
    name: 'ESP32 Node-01 (Invernadero Principal)',
    type: 'ESP32_WIFI',
    macAddressOrIp: '192.168.1.145 / 34:85:18:9B:4C:12',
    status: 'online',
    lastPing: new Date().toISOString(),
    pins: {
      phSensorPin: 'GPIO 34 (ADC1)',
      ecSensorPin: 'GPIO 35 (ADC1)',
      tempWaterPin: 'GPIO 4 (OneWire DS18B20)',
      ultrasonicTriggerPin: 'GPIO 18',
      ultrasonicEchoPin: 'GPIO 19',
      dhtPin: 'GPIO 23 (DHT22 / SHT30)',
    },
    authKey: 'hydro_token_esp32_sec_99182',
  },
  {
    id: 'dev_arduino_02',
    name: 'Arduino Mega 2560 - Módulo Dosificador',
    type: 'ARDUINO_ETHERNET',
    macAddressOrIp: '192.168.1.180 (W5500 Shield)',
    status: 'online',
    lastPing: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    pins: {
      phSensorPin: 'A0 (Analógico)',
      ecSensorPin: 'A1 (Analógico)',
      tempWaterPin: 'Digital Pin 2',
      ultrasonicTriggerPin: 'Pin 7',
      ultrasonicEchoPin: 'Pin 8',
      dhtPin: 'Pin 4',
    },
    authKey: 'hydro_token_ard_sec_55410',
  },
];

export const DEFAULT_LETTERHEAD: LetterheadConfig = {
  // Membrete Superior
  institutionName: 'AGRO-HYDRO RESEARCH & PRODUCTIONS S.A. - UNL',
  slogan: 'Centro de Investigación en Agricultura Hidropónica de Precisión',
  taxId: 'RUC: 1191728340001 / REG-MAG: 4492-2026',
  legalRepresentative: 'Ing. Jover Aguilar - Matrícula Agronómica Nac. #5541',
  address: 'Campus Universitario Sector La Argelia / Km 4.5 Vía Vilcabamba, Loja, Ecuador',
  phone: '+593 7 254-6100 / +593 99 123 4567',
  email: 'jover.aguilar@unl.edu.ec',
  website: 'https://unl.edu.ec/investigacion/hidroponia',
  logoBase64: '',
  watermarkEnabled: true,
  headerAccentColor: '#059669', // Emerald-600
  documentCodePrefix: 'INF-HYDRO-2026',
  isoCertification: 'Norma ISO/IEC 17025 • Buenas Prácticas Agrícolas BPA-MAG',

  // Membrete Inferior
  footerLegalNote: 'Documento técnico con certificación electrónica conforme a la Ley de Trazabilidad y Seguridad Alimentaria. Prohibida su reproducción parcial o adulteración.',
  confidentialityNotice: 'CONFIDENCIALIDAD: La información de nutrientes, telemetría y formulación es propiedad intelectual del laboratorio productor.',
  footerContactLine: 'Centro de Monitoreo AgroHydro IoT • Edificio de Investigación Agronómica UNL • Loja, Ecuador',
  officialSealBase64: '',
  agronomistRegNumber: 'CIP-AGRO-2026-9921',
  auditorLegend: 'Sello de Auditoría Criptográfica SHA-256 verificado en red IoT distribuida.',
  pageNumberFormat: 'Página 1 de 1 - HydroSense IoT Cloud System',
};

// Generate realistic historical telemetry readings for the last 30 days
function generateSeedReadings(cropId: string): TelemetryReading[] {
  const readings: TelemetryReading[] = [];
  const now = Date.now();
  // 60 readings over the past 30 days plus very dense points in the last 48 hours
  const intervalsHours = [
    0, 1, 2, 4, 6, 8, 12, 16, 20, 24, 30, 36, 42, 48,
    72, 96, 120, 144, 168, 200, 240, 280, 320, 360, 400, 450, 500, 550, 600, 650, 700
  ];

  intervalsHours.forEach((h, index) => {
    const timestamp = new Date(now - h * 3600 * 1000).toISOString();
    // Simulate natural variations and cycles
    const diurnalFactor = Math.sin((index % 24) / 24 * Math.PI * 2);
    const ph = Number((6.05 + diurnalFactor * 0.28 + (Math.random() * 0.1 - 0.05)).toFixed(2));
    const ec = Number((1.82 + diurnalFactor * 0.15 + (Math.random() * 0.08 - 0.04)).toFixed(2));
    const tds = Math.round(ec * 640);
    const waterLevelPct = Math.max(25, Math.min(98, Math.round(82 - (h % 90) * 0.5 + Math.random() * 4)));
    const waterLevelLiters = Math.round((waterLevelPct / 100) * 450);
    const waterTempC = Number((21.2 + diurnalFactor * 1.8 + Math.random() * 0.4).toFixed(1));
    const airTempC = Number((23.5 + diurnalFactor * 3.5 + Math.random() * 0.8).toFixed(1));
    const humidityPct = Math.round(68 - diurnalFactor * 12 + Math.random() * 5);

    readings.push({
      id: `read_${timestamp.slice(0, 10)}_${index}`,
      cropId,
      timestamp,
      ph,
      ec,
      tdsPpm: tds,
      waterLevelPct,
      waterLevelLiters,
      waterTempC,
      airTempC,
      humidityPct,
      nutrients: {
        npkRatio: '15-10-30',
        solutionConcentrationPct: 100,
        solADosageMl: 250,
        solBDosageMl: 250,
        solCDosageMl: 80,
        phModifierType: ph > 6.4 ? 'acid' : 'none',
      },
      sensorSource: index % 2 === 0 ? 'ESP32' : 'Arduino',
      deviceId: index % 2 === 0 ? 'dev_esp32_01' : 'dev_arduino_02',
      recordedByUserName: 'Ing. Jover Aguilar',
      notes: index === 0 ? 'Sistema en ciclo diurno con dosificación óptima y oxigenación estable' : undefined,
    });
  });

  return readings.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export const StorageService = {
  // Users & Auth
  getUsers(): UserProfile[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_USERS;
    }
  },

  saveUsers(users: UserProfile[]): void {
    localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
  },

  getCurrentUser(): UserProfile {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    const defaultUser = DEFAULT_USERS[0];
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultUser));
    return defaultUser;
  },

  setCurrentUser(user: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  // Crops
  getCrops(): CropBatch[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CROPS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CROPS, JSON.stringify(DEFAULT_CROPS));
      return DEFAULT_CROPS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_CROPS;
    }
  },

  saveCrops(crops: CropBatch[]): void {
    localStorage.setItem(STORAGE_KEYS.CROPS, JSON.stringify(crops));
  },

  getActiveCropId(): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CROP_ID) || DEFAULT_CROPS[0].id;
  },

  setActiveCropId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CROP_ID, id);
  },

  // Telemetry Readings
  getReadings(): TelemetryReading[] {
    const raw = localStorage.getItem(STORAGE_KEYS.READINGS);
    if (!raw) {
      const initial = generateSeedReadings(DEFAULT_CROPS[0].id);
      localStorage.setItem(STORAGE_KEYS.READINGS, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveReadings(readings: TelemetryReading[]): void {
    localStorage.setItem(STORAGE_KEYS.READINGS, JSON.stringify(readings));
  },

  addReading(reading: TelemetryReading): void {
    const list = this.getReadings();
    list.unshift(reading);
    this.saveReadings(list);
  },

  // Alert Thresholds
  getThresholds(): AlertThresholds {
    const raw = localStorage.getItem(STORAGE_KEYS.THRESHOLDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.THRESHOLDS, JSON.stringify(DEFAULT_THRESHOLDS));
      return DEFAULT_THRESHOLDS;
    }
    try {
      return { ...DEFAULT_THRESHOLDS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_THRESHOLDS;
    }
  },

  saveThresholds(thresholds: AlertThresholds): void {
    localStorage.setItem(STORAGE_KEYS.THRESHOLDS, JSON.stringify(thresholds));
  },

  // Alerts
  getAlerts(): SystemAlert[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ALERTS);
    if (!raw) {
      const sampleAlerts: SystemAlert[] = [
        {
          id: 'alert_sample_1',
          timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
          severity: 'warning',
          param: 'ph',
          title: 'pH Levemente Elevado',
          message: 'El valor de pH registró 6.55 superando el umbral máximo de 6.50 en Módulo NFT.',
          value: 6.55,
          threshold: 6.50,
          resolved: false,
        },
      ];
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(sampleAlerts));
      return sampleAlerts;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveAlerts(alerts: SystemAlert[]): void {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  },

  addAlert(alert: SystemAlert): void {
    const list = this.getAlerts();
    list.unshift(alert);
    this.saveAlerts(list);
  },

  // IoT Devices
  getDevices(): IoTDevice[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DEVICES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(DEFAULT_DEVICES));
      return DEFAULT_DEVICES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_DEVICES;
    }
  },

  saveDevices(devices: IoTDevice[]): void {
    localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices));
  },

  // Letterhead Configuration
  getLetterhead(): LetterheadConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.LETTERHEAD);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LETTERHEAD, JSON.stringify(DEFAULT_LETTERHEAD));
      return DEFAULT_LETTERHEAD;
    }
    try {
      return { ...DEFAULT_LETTERHEAD, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_LETTERHEAD;
    }
  },

  saveLetterhead(config: LetterheadConfig): void {
    localStorage.setItem(STORAGE_KEYS.LETTERHEAD, JSON.stringify(config));
  },

  // Backup & Restore
  exportFullBackup(): string {
    const backup = {
      app: 'HydroSense IoT',
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      user: this.getCurrentUser(),
      users: this.getUsers(),
      crops: this.getCrops(),
      readings: this.getReadings(),
      thresholds: this.getThresholds(),
      alerts: this.getAlerts(),
      devices: this.getDevices(),
      letterhead: this.getLetterhead(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackup(jsonString: string): { success: boolean; message: string; recordCount?: number } {
    try {
      const data = JSON.parse(jsonString);
      if (!data.readings && !data.crops) {
        return { success: false, message: 'El archivo no tiene el formato válido de respaldo de HydroSense.' };
      }

      if (Array.isArray(data.crops)) this.saveCrops(data.crops);
      if (Array.isArray(data.readings)) this.saveReadings(data.readings);
      if (Array.isArray(data.users)) this.saveUsers(data.users);
      if (data.thresholds) this.saveThresholds(data.thresholds);
      if (Array.isArray(data.alerts)) this.saveAlerts(data.alerts);
      if (Array.isArray(data.devices)) this.saveDevices(data.devices);
      if (data.letterhead) this.saveLetterhead(data.letterhead);

      return {
        success: true,
        message: 'Respaldo restaurado exitosamente en el dispositivo.',
        recordCount: data.readings ? data.readings.length : 0,
      };
    } catch (err: any) {
      return { success: false, message: `Error al procesar el archivo: ${err.message}` };
    }
  },
};
