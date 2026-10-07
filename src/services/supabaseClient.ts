import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TelemetryReading, CropBatch, SystemAlert } from '../types';

export interface SupabaseConfig {
  projectRef: string;
  url: string;
  anonKey: string;
  autoSync: boolean;
  lastSyncAt: string | null;
}

const STORAGE_KEY = 'hydrosense_supabase_settings';

export const DEFAULT_SUPABASE_CONFIG: SupabaseConfig = {
  projectRef: 'pbrdtcbsvckfibafvwkq',
  url: 'https://pbrdtcbsvckfibafvwkq.supabase.co',
  anonKey: 'sb_publishable_z9A6iZXPvK0gSXaebIk7KQ_EuOSSgLH',
  autoSync: true,
  lastSyncAt: null,
};

let clientInstance: SupabaseClient | null = null;

export const SupabaseService = {
  getConfig(): SupabaseConfig {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SUPABASE_CONFIG));
      return DEFAULT_SUPABASE_CONFIG;
    }
    try {
      return { ...DEFAULT_SUPABASE_CONFIG, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SUPABASE_CONFIG;
    }
  },

  saveConfig(config: SupabaseConfig): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    clientInstance = null; // reset client
  },

  getClient(): SupabaseClient | null {
    if (clientInstance) return clientInstance;
    const cfg = this.getConfig();
    if (cfg.url && cfg.anonKey && cfg.anonKey.trim().length > 15) {
      try {
        clientInstance = createClient(cfg.url, cfg.anonKey, {
          auth: { persistSession: true },
        });
        return clientInstance;
      } catch (e) {
        console.error('Error creating Supabase client:', e);
        return null;
      }
    }
    return null;
  },

  async testConnection(): Promise<{ success: boolean; message: string }> {
    const client = this.getClient();
    if (!client) {
      return {
        success: false,
        message: 'Falta configurar la clave "anon public key" de Supabase para el proyecto pbrdtcbsvckfibafvwkq.',
      };
    }
    try {
      const { error } = await client.from('crops').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        // Table might not exist yet before migration
        if (error.message?.includes('relation "crops" does not exist') || error.code === '42P01') {
          return {
            success: true,
            message: 'Conexión a Supabase exitosa. Se requiere aplicar el script de migración SQL adjunto.',
          };
        }
        return { success: false, message: `Error de Supabase: ${error.message}` };
      }
      return { success: true, message: '¡Conexión y tablas de Supabase verificadas correctamente!' };
    } catch (err: any) {
      return { success: false, message: `Error de red: ${err.message || 'No se pudo contactar el servidor'}` };
    }
  },

  async syncCropsToCloud(crops: CropBatch[]): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      const { error } = await client.from('crops').upsert(
        crops.map(c => ({
          id: c.id,
          name: c.name,
          variety: c.variety,
          system_type: c.systemType,
          planting_date: c.plantingDate,
          expected_harvest_date: c.expectedHarvestDate,
          growth_stage: c.growthStage,
          tank_capacity_liters: c.tankCapacityLiters,
          plant_count: c.plantCount,
          location: c.location,
          active: c.active,
          notes: c.notes,
          updated_at: new Date().toISOString(),
        }))
      );
      return !error;
    } catch {
      return false;
    }
  },

  async syncReadingsToCloud(readings: TelemetryReading[]): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      // Chunk in batches of 50
      const chunk = readings.slice(0, 50).map(r => ({
        id: r.id,
        crop_id: r.cropId,
        timestamp: r.timestamp,
        ph: r.ph,
        ec: r.ec,
        tds_ppm: r.tdsPpm,
        water_level_pct: r.waterLevelPct,
        water_level_liters: r.waterLevelLiters,
        water_temp_c: r.waterTempC,
        air_temp_c: r.airTempC,
        humidity_pct: r.humidityPct,
        npk_ratio: r.nutrients.npkRatio,
        sensor_source: r.sensorSource,
        notes: r.notes || null,
      }));

      const { error } = await client.from('telemetry_readings').upsert(chunk);
      return !error;
    } catch {
      return false;
    }
  },

  getSqlMigration(): string {
    return `-- =========================================================================
-- MIGRACIÓN DE BASE DE DATOS SUPABASE PARA HYDROSENSE IOT
-- Proyecto Ref: pbrdtcbsvckfibafvwkq
-- Comando CLI: supabase migration new new-migration
-- =========================================================================

-- 1. Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de Cultivos y Sistemas Hidropónicos
CREATE TABLE IF NOT EXISTS public.crops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    variety TEXT NOT NULL,
    system_type TEXT NOT NULL CHECK (system_type IN ('NFT', 'DWC', 'Goteo', 'Aeroponía', 'Flujo_Reflujo', 'Kratky')),
    planting_date DATE NOT NULL,
    expected_harvest_date DATE,
    growth_stage TEXT DEFAULT 'vegetativo',
    tank_capacity_liters NUMERIC DEFAULT 500,
    plant_count INTEGER DEFAULT 100,
    location TEXT,
    active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Lecturas de Sensores (pH, EC, Agua, Nutrientes, Temp)
CREATE TABLE IF NOT EXISTS public.telemetry_readings (
    id TEXT PRIMARY KEY,
    crop_id TEXT REFERENCES public.crops(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ph NUMERIC(4,2) NOT NULL,
    ec NUMERIC(4,2) NOT NULL,
    tds_ppm NUMERIC(6,0),
    water_level_pct NUMERIC(5,2),
    water_level_liters NUMERIC(6,1),
    water_temp_c NUMERIC(4,1),
    air_temp_c NUMERIC(4,1),
    humidity_pct NUMERIC(4,1),
    npk_ratio TEXT,
    solution_concentration_pct NUMERIC DEFAULT 100,
    sensor_source TEXT DEFAULT 'ESP32',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas ultra-rápidas por rango de fecha (Día, Mes, Año)
CREATE INDEX IF NOT EXISTS idx_telemetry_crop_time ON public.telemetry_readings(crop_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp ON public.telemetry_readings(timestamp DESC);

-- 4. Tabla de Alertas de Parámetros
CREATE TABLE IF NOT EXISTS public.system_alerts (
    id TEXT PRIMARY KEY,
    crop_id TEXT REFERENCES public.crops(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    severity TEXT NOT NULL CHECK (severity IN ('warning', 'critical', 'info')),
    param TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    value NUMERIC(6,2),
    threshold NUMERIC(6,2),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ
);

-- 5. Tabla de Perfiles de Usuario y Credenciales
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'agronomo', 'operador', 'auditor')),
    function_title TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Políticas de Seguridad RLS (Row Level Security)
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Permitir lectura y escritura a clientes autorizados
CREATE POLICY "Allow public read access to crops" ON public.crops FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update to crops" ON public.crops FOR ALL USING (true);

CREATE POLICY "Allow public read telemetry" ON public.telemetry_readings FOR SELECT USING (true);
CREATE POLICY "Allow public write telemetry" ON public.telemetry_readings FOR ALL USING (true);

CREATE POLICY "Allow public read alerts" ON public.system_alerts FOR SELECT USING (true);
CREATE POLICY "Allow public write alerts" ON public.system_alerts FOR ALL USING (true);

CREATE POLICY "Allow public read user_profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Allow public write user_profiles" ON public.user_profiles FOR ALL USING (true);
`;
  },
};
