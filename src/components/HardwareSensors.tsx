import React, { useState } from 'react';
import { 
  Cpu, 
  Wifi, 
  Code, 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  Play, 
  Settings, 
  ShieldAlert, 
  Radio, 
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { IoTDevice, CropBatch } from '../types';

interface HardwareSensorsProps {
  devices: IoTDevice[];
  activeCrop: CropBatch;
  onSimulateReading: () => void;
  onSaveDevice: (device: IoTDevice) => void;
}

export const HardwareSensors: React.FC<HardwareSensorsProps> = ({
  devices,
  activeCrop,
  onSimulateReading,
  onSaveDevice,
}) => {
  const [selectedDevice, setSelectedDevice] = useState<IoTDevice>(devices[0]);
  const [copied, setCopied] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'ESP32' | 'ARDUINO'>('ESP32');
  const [wifiSsid, setWifiSsid] = useState('MiInvernadero_WiFi');
  const [wifiPass, setWifiPass] = useState('HydroPassword2026');

  // Arduino C++ sketch generator based on device settings
  const generateESP32Sketch = () => {
    return `/*
 * =========================================================================
 * HYDROSENSE IOT - SKETCH OFICIAL PARA ESP32 (WIFI + HTTP JSON)
 * Dispositivo: ${selectedDevice.name}
 * Cultivo Destino: ${activeCrop.name} (${activeCrop.systemType})
 * Supabase Project Ref: pbrdtcbsvckfibafvwkq
 * =========================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <DHT.h>
#include <ArduinoJson.h>

// --- Credenciales WiFi ---
const char* ssid = "${wifiSsid}";
const char* password = "${wifiPass}";

// --- Endpoint de Servidor o Supabase ---
const char* serverUrl = "https://pbrdtcbsvckfibafvwkq.supabase.co/rest/v1/telemetry_readings";
const char* deviceToken = "${selectedDevice.authKey}";

// --- Mapeo de Pines de Hardware ---
const int PIN_PH = 34;          // Sensor pH-4502C (ADC1)
const int PIN_TDS = 35;         // Sensor Gravedad EC/TDS (ADC1)
const int PIN_ONEWIRE = 4;      // DS18B20 Temp Agua impermeable
const int PIN_TRIG = 18;        // HC-SR04 Nivel de Agua Trigger
const int PIN_ECHO = 19;        // HC-SR04 Nivel de Agua Echo
const int PIN_DHT = 23;         // DHT22 Temperatura/Humedad Ambiente

#define DHTTYPE DHT22
DHT dht(PIN_DHT, DHTTYPE);
OneWire oneWire(PIN_ONEWIRE);
DallasTemperature sensors(&oneWire);

// Calibración de pH (Offset buffer pH 7.00 y 4.01)
float phOffset = 0.00;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  
  dht.begin();
  sensors.begin();

  Serial.println("Iniciando HydroSense Node ESP32...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Conectado! IP: " + WiFi.localIP().toString());
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    // 1. Lectura de pH
    int phRaw = analogRead(PIN_PH);
    float phVoltage = phRaw * (3.3 / 4095.0);
    float phVal = 7.00 - ((phVoltage - 1.65) * 3.5) + phOffset;

    // 2. Lectura de EC / TDS Salinidad
    int tdsRaw = analogRead(PIN_TDS);
    float tdsVoltage = tdsRaw * (3.3 / 4095.0);
    float ecVal = (tdsVoltage * 0.75); // mS/cm aproximado
    int tdsPpm = ecVal * 640;

    // 3. Lectura de Temperatura del Agua
    sensors.requestTemperatures();
    float waterTemp = sensors.getTempCByIndex(0);

    // 4. Nivel de agua por Ultrasonido (HC-SR04)
    digitalWrite(PIN_TRIG, LOW);
    delayMicroseconds(2);
    digitalWrite(PIN_TRIG, HIGH);
    delayMicroseconds(10);
    digitalWrite(PIN_TRIG, LOW);
    long duration = pulseIn(PIN_ECHO, HIGH);
    float distanceCm = duration * 0.034 / 2;
    int tankHeightCm = 80;
    int waterLevelPct = constrain(map(distanceCm, tankHeightCm, 5, 0, 100), 0, 100);

    // 5. Clima Ambiente
    float airTemp = dht.readTemperature();
    float humidity = dht.readHumidity();

    // Empaquetar JSON
    StaticJsonDocument<300> doc;
    doc["crop_id"] = "${activeCrop.id}";
    doc["ph"] = phVal;
    doc["ec"] = ecVal;
    doc["tds_ppm"] = tdsPpm;
    doc["water_level_pct"] = waterLevelPct;
    doc["water_temp_c"] = waterTemp;
    doc["air_temp_c"] = airTemp;
    doc["humidity_pct"] = humidity;
    doc["sensor_source"] = "ESP32";

    String jsonString;
    serializeJson(doc, jsonString);

    // Enviar HTTP POST
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", deviceToken);
    
    int httpResponseCode = http.POST(jsonString);
    Serial.println("Transmisión Telemetría: HTTP " + String(httpResponseCode));
    http.end();
  }

  // Esperar intervalo de muestreo (ej. 30 segundos)
  delay(30000);
}
`;
  };

  const generateArduinoSketch = () => {
    return `/*
 * =========================================================================
 * HYDROSENSE IOT - SKETCH ARDUINO MEGA / UNO (SERIAL / ETHERNET)
 * Dispositivo: ${selectedDevice.name}
 * Pines Analógicos y Digitales Mapeados
 * =========================================================================
 */

#include <OneWire.h>
#include <DallasTemperature.h>

const int PIN_PH = A0;
const int PIN_EC = A1;
const int PIN_TEMP_AGUA = 2;
const int PIN_TRIG = 7;
const int PIN_ECHO = 8;

OneWire oneWire(PIN_TEMP_AGUA);
DallasTemperature tempSensor(&oneWire);

void setup() {
  Serial.begin(9600);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  tempSensor.begin();
  Serial.println("HydroSense Arduino Sensor Hub Listo.");
}

void loop() {
  // 1. pH
  int phRaw = analogRead(PIN_PH);
  float phVal = 7.00 - ((phRaw * (5.0 / 1023.0) - 2.5) * 3.5);

  // 2. EC
  int ecRaw = analogRead(PIN_EC);
  float ecVal = (ecRaw * (5.0 / 1023.0)) * 0.8;

  // 3. Temp Agua
  tempSensor.requestTemperatures();
  float waterTemp = tempSensor.getTempCByIndex(0);

  // Imprimir CSV por puerto Serial USB
  Serial.print("CROP:${activeCrop.id};");
  Serial.print("PH:"); Serial.print(phVal, 2); Serial.print(";");
  Serial.print("EC:"); Serial.print(ecVal, 2); Serial.print(";");
  Serial.print("TW:"); Serial.print(waterTemp, 1); Serial.println(";");

  delay(10000); // 10 segundos
}
`;
  };

  const currentCode = activeCodeTab === 'ESP32' ? generateESP32Sketch() : generateArduinoSketch();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadIno = () => {
    const filename = `HydroSense_${activeCodeTab}_Node.ino`;
    const blob = new Blob([currentCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            Integración de Hardware, Sensores, Arduino y ESP32
          </h2>
          <p className="text-xs text-slate-400">
            Conectividad con microcontroladores, mapeo de pines, generador de código C++ y simulador de campo
          </p>
        </div>

        <button
          onClick={onSimulateReading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Simular Telemetría de Campo</span>
        </button>
      </div>

      {/* Hardware Devices Selector & Pin Config */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Device List & Pin Mapping */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Wifi className="w-4 h-4 text-emerald-400" />
            Dispositivos Registrados
          </h3>

          <div className="space-y-2">
            {devices.map((dev) => (
              <div
                key={dev.id}
                onClick={() => setSelectedDevice(dev)}
                className={`p-3 rounded-xl border cursor-pointer transition ${
                  selectedDevice.id === dev.id
                    ? 'bg-slate-950 border-cyan-500 text-white shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-200">{dev.name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400">
                    {dev.type}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">{dev.macAddressOrIp}</div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300">Asignación de Pines del Sensor</h4>
            <div className="space-y-1.5 text-[11px] font-mono">
              <div className="flex justify-between p-2 rounded bg-slate-950/80 border border-slate-800/80">
                <span className="text-slate-400 font-sans">pH Analógico (pH-4502C):</span>
                <span className="text-emerald-400 font-bold">{selectedDevice.pins.phSensorPin}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950/80 border border-slate-800/80">
                <span className="text-slate-400 font-sans">Salinidad / EC TDS:</span>
                <span className="text-teal-400 font-bold">{selectedDevice.pins.ecSensorPin}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950/80 border border-slate-800/80">
                <span className="text-slate-400 font-sans">Sonda T. Agua (DS18B20):</span>
                <span className="text-blue-400 font-bold">{selectedDevice.pins.tempWaterPin}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950/80 border border-slate-800/80">
                <span className="text-slate-400 font-sans">Nivel Ultrasónico (HC-SR04):</span>
                <span className="text-cyan-400 font-bold">{selectedDevice.pins.ultrasonicTriggerPin} / {selectedDevice.pins.ultrasonicEchoPin}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950/80 border border-slate-800/80">
                <span className="text-slate-400 font-sans">Ambiente Clima (DHT22):</span>
                <span className="text-purple-400 font-bold">{selectedDevice.pins.dhtPin}</span>
              </div>
            </div>
          </div>
        </div>

        {/* C++ Code Generator for Arduino & ESP32 */}
        <div className="lg:col-span-2 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">Generador de Firmware (Arduino IDE / PlatformIO)</h3>
              </div>

              {/* Code Tab Switcher */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveCodeTab('ESP32')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    activeCodeTab === 'ESP32' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ESP32 WiFi
                </button>
                <button
                  onClick={() => setActiveCodeTab('ARDUINO')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    activeCodeTab === 'ARDUINO' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Arduino Mega / Uno
                </button>
              </div>
            </div>

            {/* Quick WiFi Parameters */}
            {activeCodeTab === 'ESP32' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 text-xs">
                <div>
                  <label className="text-slate-400 block text-[11px] mb-1">Nombre Red WiFi (SSID):</label>
                  <input
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block text-[11px] mb-1">Contraseña WiFi:</label>
                  <input
                    type="text"
                    value={wifiPass}
                    onChange={(e) => setWifiPass(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>
            )}

            {/* Code Box */}
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-[11px]">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px]">
                <span>Firmware: HydroSense_{activeCodeTab}_Node.ino</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 hover:text-white transition"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                  <button
                    onClick={handleDownloadIno}
                    className="flex items-center gap-1 hover:text-white transition"
                  >
                    <Download className="w-3 h-3" />
                    <span>Descargar .ino</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 text-slate-300 overflow-x-auto max-h-72 leading-relaxed">
                {currentCode}
              </pre>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>
              💡 <strong>Instrucciones:</strong> Abra Arduino IDE, instale las librerías <em>ArduinoJson</em> y <em>DallasTemperature</em>, pegue el código y flashee su microcontrolador mediante puerto USB.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
