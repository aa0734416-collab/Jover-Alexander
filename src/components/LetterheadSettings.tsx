import React, { useState } from 'react';
import { 
  Building2, 
  Upload, 
  Check, 
  FileText, 
  ShieldCheck, 
  Award, 
  Phone, 
  Mail, 
  MapPin, 
  Globe,
  Sliders,
  Sparkles,
  Palette,
  Stamp,
  AlignLeft,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { LetterheadConfig } from '../types';

interface LetterheadSettingsProps {
  letterhead: LetterheadConfig;
  onSaveLetterhead: (config: LetterheadConfig) => void;
}

export const LetterheadSettings: React.FC<LetterheadSettingsProps> = ({
  letterhead,
  onSaveLetterhead,
}) => {
  const [form, setForm] = useState<LetterheadConfig>(letterhead);
  const [activeTab, setActiveTab] = useState<'superior' | 'inferior'>('superior');
  const [saved, setSaved] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setForm((prev) => ({ ...prev, logoBase64: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSealUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setForm((prev) => ({ ...prev, officialSealBase64: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveLetterhead(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            Configuración de Membrete Superior e Inferior
          </h2>
          <p className="text-xs text-slate-400">
            Personalice el encabezado oficial (membrete superior) y el pie de página legal (membrete inferior) para PDF, Word y Excel
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('superior')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
              activeTab === 'superior'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Membrete Superior (Encabezado)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inferior')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
              activeTab === 'inferior'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>Membrete Inferior (Pie Legal)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Form */}
        <div className="lg:col-span-7 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* MEMBRETE SUPERIOR FIELDS */}
            {activeTab === 'superior' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-slate-200 font-bold">
                  <ArrowUp className="w-4 h-4 text-emerald-400" />
                  <span>Campos del Membrete Superior (Cabecera Oficial)</span>
                </div>

                {/* Logo upload */}
                <div className="flex items-center gap-4 p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                  {form.logoBase64 ? (
                    <img
                      src={form.logoBase64}
                      alt="Logo"
                      className="w-16 h-16 rounded-xl object-contain bg-white p-1 border border-slate-700 shadow"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 font-bold border border-slate-700 text-xs">
                      LOGO
                    </div>
                  )}
                  <div className="space-y-1">
                    <span className="font-bold text-slate-200 block">Logotipo Institucional (Superior Izquierdo)</span>
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition">
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Subir Logotipo (PNG / JPG / SVG)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[10px] text-slate-500 block">Aparece en la esquina superior izquierda del reporte</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Nombre de la Empresa / Universidad *</label>
                    <input
                      type="text"
                      required
                      value={form.institutionName}
                      onChange={(e) => setForm({ ...form, institutionName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Lema o Eslogan Institucional</label>
                    <input
                      type="text"
                      value={form.slogan}
                      onChange={(e) => setForm({ ...form, slogan: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">RUC / NIT / CIF Fiscal *</label>
                    <input
                      type="text"
                      required
                      value={form.taxId}
                      onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Prefijo de Folio / Código</label>
                    <input
                      type="text"
                      value={form.documentCodePrefix || 'INF-HYDRO-2026'}
                      onChange={(e) => setForm({ ...form, documentCodePrefix: e.target.value })}
                      placeholder="INF-HYDRO-2026"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Color Acento Cabecera</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={form.headerAccentColor || '#059669'}
                        onChange={(e) => setForm({ ...form, headerAccentColor: e.target.value })}
                        className="w-10 h-9 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={form.headerAccentColor || '#059669'}
                        onChange={(e) => setForm({ ...form, headerAccentColor: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Certificaciones de Calidad / BPA (Cabecera)</label>
                  <input
                    type="text"
                    value={form.isoCertification || ''}
                    onChange={(e) => setForm({ ...form, isoCertification: e.target.value })}
                    placeholder="Ej: Norma ISO/IEC 17025 • Buenas Prácticas Agrícolas BPA"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Dirección del Centro de Investigación / Cultivo</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Teléfonos Oficiales</label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Correo Electrónico Institucional</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Página Web o Repositorio</label>
                    <input
                      type="text"
                      value={form.website}
                      onChange={(e) => setForm({ ...form, website: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* MEMBRETE INFERIOR FIELDS */}
            {activeTab === 'inferior' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-slate-200 font-bold">
                  <ArrowDown className="w-4 h-4 text-emerald-400" />
                  <span>Campos del Membrete Inferior (Pie de Página & Marco Legal)</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Nota Legal y Validez Técnica al Pie *
                  </label>
                  <textarea
                    rows={2}
                    value={form.footerLegalNote || ''}
                    onChange={(e) => setForm({ ...form, footerLegalNote: e.target.value })}
                    placeholder="Documento técnico con certificación electrónica conforme a la Ley de Trazabilidad Agrícola..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500">Se imprime en la parte inferior de todas las páginas</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Cláusula de Confidencialidad y Propiedad Intelectual
                  </label>
                  <textarea
                    rows={2}
                    value={form.confidentialityNotice || ''}
                    onChange={(e) => setForm({ ...form, confidentialityNotice: e.target.value })}
                    placeholder="CONFIDENCIAL: La información de nutrientes y telemetría es propiedad intelectual del laboratorio..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Matrícula Profesional / Colegiatura del Agrónomo
                    </label>
                    <input
                      type="text"
                      value={form.agronomistRegNumber || ''}
                      onChange={(e) => setForm({ ...form, agronomistRegNumber: e.target.value })}
                      placeholder="CIP-AGRO-2026-9921"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Formato de Foliado de Páginas
                    </label>
                    <input
                      type="text"
                      value={form.pageNumberFormat || 'Página 1 de 1 - HydroSense IoT Cloud System'}
                      onChange={(e) => setForm({ ...form, pageNumberFormat: e.target.value })}
                      placeholder="Página 1 de 1 - HydroSense IoT Cloud System"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Línea de Contacto y Ubicación al Pie
                  </label>
                  <input
                    type="text"
                    value={form.footerContactLine || ''}
                    onChange={(e) => setForm({ ...form, footerContactLine: e.target.value })}
                    placeholder="Centro de Monitoreo AgroHydro IoT • Edificio de Investigación Agronómica UNL • Loja, Ecuador"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Leyenda de Auditoría Criptográfica / Blockchain
                  </label>
                  <input
                    type="text"
                    value={form.auditorLegend || ''}
                    onChange={(e) => setForm({ ...form, auditorLegend: e.target.value })}
                    placeholder="Sello de Auditoría Criptográfica SHA-256 verificado en red IoT distribuida."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Secondary stamp / official seal */}
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-200 block">Sello Oficial de Acreditación (Opcional)</span>
                    <span className="text-[10px] text-slate-500">Sello o marca gráfica de organismo certificador</span>
                  </div>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold">
                    <Stamp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cargar Sello</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSealUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              {saved ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-4 h-4" /> ¡Membrete superior e inferior guardados!
                </span>
              ) : (
                <span className="text-slate-500">Almacenamiento persistente en el dispositivo</span>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/20 transition"
              >
                Guardar Membrete Completo
              </button>
            </div>
          </form>
        </div>

        {/* Live Sheet Preview */}
        <div className="lg:col-span-5 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Vista Previa de Hoja Impresa A4
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                FORMATO OFICIAL
              </span>
            </div>

            {/* Simulated Paper Sheet */}
            <div className="bg-white text-slate-900 rounded-xl p-5 shadow-2xl border border-slate-300 font-sans text-xs space-y-4 min-h-[500px] flex flex-col justify-between">
              {/* --- MEMBRETE SUPERIOR VISUAL --- */}
              <div className="border-b-2 border-slate-900 pb-3">
                <div
                  className="h-1.5 w-full rounded-full mb-3"
                  style={{ backgroundColor: form.headerAccentColor || '#059669' }}
                />
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {form.logoBase64 ? (
                      <img src={form.logoBase64} alt="Logo" className="w-11 h-11 object-contain shrink-0" />
                    ) : (
                      <div className="w-11 h-11 bg-slate-100 border border-slate-300 rounded flex items-center justify-center font-bold text-slate-400 text-[10px] shrink-0">
                        LOGO
                      </div>
                    )}
                    <div>
                      <h4 className="font-extrabold text-slate-950 text-xs uppercase leading-tight">
                        {form.institutionName}
                      </h4>
                      <p className="text-[9.5px] text-slate-600 italic leading-snug">{form.slogan}</p>
                      <div className="text-[8.5px] text-slate-500 mt-1 leading-tight">
                        <div>{form.taxId} • {form.address}</div>
                        <div>Tel: {form.phone} | {form.email}</div>
                      </div>
                    </div>
                  </div>
                  {form.isoCertification && (
                    <div className="text-right text-[8px] font-bold text-emerald-800 bg-emerald-50 p-1.5 rounded border border-emerald-200 shrink-0 max-w-[120px]">
                      {form.isoCertification}
                    </div>
                  )}
                </div>
              </div>

              {/* Sample Document Body Simulation */}
              <div className="space-y-2 opacity-75 py-2">
                <div className="h-4 bg-slate-100 rounded w-2/3" />
                <div className="h-2 bg-slate-100 rounded w-full" />
                <div className="h-2 bg-slate-100 rounded w-5/6" />
                <div className="grid grid-cols-4 gap-1.5 pt-2">
                  <div className="h-10 bg-slate-50 border border-slate-200 rounded p-1 text-[8px] text-center">
                    <span className="font-bold text-emerald-700 block">pH 6.12</span>
                    <span className="text-slate-500">Óptimo</span>
                  </div>
                  <div className="h-10 bg-slate-50 border border-slate-200 rounded p-1 text-[8px] text-center">
                    <span className="font-bold text-teal-700 block">EC 1.85</span>
                    <span className="text-slate-500">mS/cm</span>
                  </div>
                  <div className="h-10 bg-slate-50 border border-slate-200 rounded p-1 text-[8px] text-center">
                    <span className="font-bold text-blue-700 block">21.5°C</span>
                    <span className="text-slate-500">Solución</span>
                  </div>
                  <div className="h-10 bg-slate-50 border border-slate-200 rounded p-1 text-[8px] text-center">
                    <span className="font-bold text-purple-700 block">82%</span>
                    <span className="text-slate-500">Agua</span>
                  </div>
                </div>
                <div className="h-16 bg-slate-50 border border-slate-200 rounded p-1 text-[8px] text-slate-400">
                  [ Tabla cronológica con telemetría de sensores ESP32 / Arduino / Código QR ]
                </div>
              </div>

              {/* --- MEMBRETE INFERIOR VISUAL --- */}
              <div className="border-t border-slate-300 pt-3 space-y-1 text-[8px] text-slate-500">
                <div className="flex items-center justify-between text-slate-700 font-semibold">
                  <span>Responsable: {form.legalRepresentative}</span>
                  <span>Matrícula: {form.agronomistRegNumber || 'CIP-2026-9921'}</span>
                </div>
                {form.footerLegalNote && (
                  <p className="italic text-slate-500 leading-tight">
                    {form.footerLegalNote}
                  </p>
                )}
                {form.confidentialityNotice && (
                  <p className="italic text-slate-400 leading-tight">
                    {form.confidentialityNotice}
                  </p>
                )}
                <div className="flex items-center justify-between text-slate-600 font-medium pt-1 border-t border-slate-100">
                  <span>{form.footerContactLine}</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    {form.pageNumberFormat || 'Página 1 de 1'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Tanto el membrete superior como el inferior se incrustan automáticamente en los PDF, Word y hojas de cálculo.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
