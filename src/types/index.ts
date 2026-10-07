export type HydroponicType = 
  | 'NFT' 
  | 'DWC' 
  | 'Goteo' 
  | 'Aeroponía' 
  | 'Flujo_Reflujo' 
  | 'Kratky';

export type UserRole = 'super_admin' | 'agronomo' | 'operador' | 'auditor';

export interface UserProfile {
  id: string;
  username: string;
  passwordHash?: string; // stored credentials
  pinCode?: string;
  fullName: string;
  role: UserRole;
  functionTitle: string; // ej. Ingeniero Agrónomo Principal, Operador de Turno Nocturno, etc.
  phone?: string;
  email: string;
  avatarUrl: string; // base64 or URL
  digitalSignatureUrl?: string; // stored digital signature
  googleSubId?: string;
  authProvider?: 'credentials' | 'google';
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface TelemetryReading {
  id: string;
  cropId: string;
  timestamp: string; // ISO 8601
  ph: number; // 0 - 14 (ideal 5.5 - 6.5)
  ec: number; // Electroconductividad en mS/cm (ideal 1.2 - 2.5)
  tdsPpm: number; // Partes por millón
  waterLevelPct: number; // 0 - 100%
  waterLevelLiters: number; // Volumen en litros
  waterTempC: number; // Temp solución nutritiva °C
  airTempC: number; // Temp ambiente °C
  humidityPct: number; // Humedad relativa %
  nutrients: {
    npkRatio: string; // ej. "15-10-30"
    solutionConcentrationPct: number; // %
    solADosageMl: number;
    solBDosageMl: number;
    solCDosageMl: number;
    phModifierType?: 'acid' | 'base' | 'none';
  };
  deviceId?: string;
  sensorSource: 'ESP32' | 'Arduino' | 'Manual' | 'Simulado';
  notes?: string;
  recordedByUserId?: string;
  recordedByUserName?: string;
}

export interface CropBatch {
  id: string;
  name: string; // ej. "Lechuga Batavia Lote #04"
  variety: string; // ej. "Lactuca sativa - Mantecosa"
  systemType: HydroponicType;
  plantingDate: string; // YYYY-MM-DD
  expectedHarvestDate: string; // YYYY-MM-DD
  growthStage: 'germinacion' | 'plantula' | 'vegetativo' | 'pre_cosecha' | 'cosecha';
  tankCapacityLiters: number;
  plantCount: number;
  location: string; // ej. "Módulo Invernadero B - Línea 3"
  latitude: number; // Coordenada Latitud
  longitude: number; // Coordenada Longitud
  altitudeMeters?: number; // Metros sobre el nivel del mar
  active: boolean;
  notes: string;
}

export interface AlertThresholds {
  phMin: number;
  phMax: number;
  ecMin: number;
  ecMax: number;
  waterLevelMinPct: number;
  waterTempMinC: number;
  waterTempMaxC: number;
  airTempMinC: number;
  airTempMaxC: number;
  humidityMinPct: number;
  humidityMaxPct: number;
  pushNotificationsEnabled: boolean;
  soundAlarmEnabled: boolean;
}

export interface SystemAlert {
  id: string;
  timestamp: string;
  severity: 'warning' | 'critical' | 'info';
  param: 'ph' | 'ec' | 'water_level' | 'water_temp' | 'air_temp' | 'humidity' | 'sensor_offline';
  title: string;
  message: string;
  value: number;
  threshold: number;
  resolved: boolean;
  resolvedAt?: string;
}

export interface IoTDevice {
  id: string;
  name: string;
  type: 'ESP32_WIFI' | 'ARDUINO_ETHERNET' | 'ARDUINO_SERIAL' | 'RASPBERRY_PI';
  macAddressOrIp: string;
  status: 'online' | 'offline' | 'warning';
  lastPing: string;
  pins: {
    phSensorPin: string;
    ecSensorPin: string;
    tempWaterPin: string; // OneWire DS18B20
    ultrasonicTriggerPin: string;
    ultrasonicEchoPin: string;
    dhtPin: string;
  };
  authKey: string;
}

export interface LetterheadConfig {
  // --- MEMBRETE SUPERIOR (ENCABEZADO INSTITUCIONAL) ---
  institutionName: string; // Nombre de la Empresa / Finca / Universidad
  slogan: string;
  taxId: string; // RUC / NIT / CIF
  legalRepresentative: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logoBase64: string; // Logo de la institución
  watermarkEnabled: boolean;
  headerAccentColor?: string; // Color primario de cabecera
  documentCodePrefix?: string; // Código de documento (ej. INF-HIDRO-2026)
  isoCertification?: string; // Certificación ISO / BPA

  // --- MEMBRETE INFERIOR (PIE DE PÁGINA & SELLOS LEGALES) ---
  footerLegalNote?: string; // Nota legal o descargo de responsabilidad
  confidentialityNotice?: string; // Nota de confidencialidad
  footerContactLine?: string; // Línea de contacto al pie
  officialSealBase64?: string; // Sello de acreditación institucional
  agronomistRegNumber?: string; // Matrícula o Colegiatura Profesional
  auditorLegend?: string; // Leyenda técnica de auditoría
  pageNumberFormat?: string; // Formato de foliado
}

export interface DigitalSignatureData {
  signatureBase64: string;
  signerName: string;
  signerTitle: string;
  signerIdNumber: string;
  signatureDate: string;
  verificationHash: string;
}

export interface ExportedReportData {
  reportId: string;
  title: string;
  periodType: 'dia' | 'mes' | 'año' | 'personalizado';
  periodLabel: string;
  startDate: string;
  endDate: string;
  generatedAt: string;
  cropBatch: CropBatch;
  readings: TelemetryReading[];
  summary: {
    readingCount: number;
    avgPh: number;
    minPh: number;
    maxPh: number;
    avgEc: number;
    minEc: number;
    maxEc: number;
    avgWaterTemp: number;
    avgAirTemp: number;
    avgHumidity: number;
    minWaterLevel: number;
    totalAlerts: number;
  };
  letterhead: LetterheadConfig;
  signatures: DigitalSignatureData[];
  qrCodeDataUrl?: string;
  securityHash: string;
}
