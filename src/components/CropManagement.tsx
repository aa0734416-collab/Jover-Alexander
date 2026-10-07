import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Sprout, 
  Layers, 
  Calendar, 
  Droplet, 
  MapPin, 
  X,
  FileCheck
} from 'lucide-react';
import { CropBatch, HydroponicType } from '../types';

interface CropManagementProps {
  crops: CropBatch[];
  activeCropId: string;
  onSelectCrop: (id: string) => void;
  onSaveCrop: (crop: CropBatch) => void;
  onDeleteCrop: (id: string) => void;
}

export const CropManagement: React.FC<CropManagementProps> = ({
  crops,
  activeCropId,
  onSelectCrop,
  onSaveCrop,
  onDeleteCrop,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Partial<CropBatch> | null>(null);

  const handleOpenNew = () => {
    setEditingCrop({
      id: `crop_${Date.now()}`,
      name: '',
      variety: '',
      systemType: 'NFT',
      plantingDate: new Date().toISOString().slice(0, 10),
      expectedHarvestDate: new Date(Date.now() + 45 * 86400000).toISOString().slice(0, 10),
      growthStage: 'vegetativo',
      tankCapacityLiters: 500,
      plantCount: 200,
      location: 'Invernadero A',
      active: true,
      notes: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (crop: CropBatch) => {
    setEditingCrop({ ...crop });
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCrop || !editingCrop.name) return;

    onSaveCrop(editingCrop as CropBatch);
    setModalOpen(false);
    setEditingCrop(null);
  };

  const systemTypeOptions: { type: HydroponicType; label: string; desc: string }[] = [
    { type: 'NFT', label: 'NFT (Nutrient Film)', desc: 'Lámina fina de recirculación constante' },
    { type: 'DWC', label: 'DWC (Raíz Flotante)', desc: 'Oxigenación profunda permanente' },
    { type: 'Goteo', label: 'Goteo en Sustrato', desc: 'Riego localizado con goteros calibrados' },
    { type: 'Aeroponía', label: 'Aeroponía Vertical', desc: 'Nebulización por microaspersores' },
    { type: 'Flujo_Reflujo', label: 'Flujo y Reflujo', desc: 'Inundación y drenaje cíclico' },
    { type: 'Kratky', label: 'Método Pasivo Kratky', desc: 'Sistema estático sin energía eléctrica' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-400" />
            Lotes y Sistemas Hidropónicos
          </h2>
          <p className="text-xs text-slate-400">
            Administración de cultivos activos, tipos de sistema hidráulico y ciclos de cosecha
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Cultivo</span>
        </button>
      </div>

      {/* Grid of Crops */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {crops.map((crop) => {
          const isActive = crop.id === activeCropId;
          return (
            <div
              key={crop.id}
              className={`p-5 rounded-2xl border transition-all ${
                isActive
                  ? 'bg-slate-900 border-emerald-500 shadow-xl shadow-emerald-950/30 ring-1 ring-emerald-500/50'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      {crop.systemType}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 capitalize">
                      {crop.growthStage}
                    </span>
                    {isActive && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500 text-slate-950 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> ACTIVO EN MONITOR
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-extrabold text-white">{crop.name}</h3>
                  <p className="text-xs text-slate-400 italic">{crop.variety}</p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(crop)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="Editar Cultivo"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  {crops.length > 1 && (
                    <button
                      onClick={() => onDeleteCrop(crop.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 transition"
                      title="Eliminar Cultivo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs mb-4">
                <div>
                  <span className="text-slate-500 block text-[10px]">Capacidad Tanque:</span>
                  <span className="font-semibold text-cyan-300 flex items-center gap-1 font-mono">
                    <Droplet className="w-3 h-3" /> {crop.tankCapacityLiters} Litros
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Población Plantas:</span>
                  <span className="font-semibold text-emerald-300 font-mono">
                    {crop.plantCount} plantas
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Siembra:</span>
                  <span className="font-mono text-slate-300">{crop.plantingDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Cosecha Proyectada:</span>
                  <span className="font-mono text-slate-300">{crop.expectedHarvestDate || 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400 flex items-center gap-1 text-[11px] truncate max-w-[200px]">
                  <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                  {crop.location}
                </span>

                {!isActive && (
                  <button
                    onClick={() => onSelectCrop(crop.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-slate-950 text-emerald-400 text-xs font-semibold transition"
                  >
                    Seleccionar para Monitorear
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Edit / Add Crop */}
      {modalOpen && editingCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-400" />
                {editingCrop.id?.includes('crop_') ? 'Registrar Nuevo Cultivo' : 'Editar Cultivo Hidropónico'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre del Lote / Módulo *</label>
                <input
                  type="text"
                  required
                  value={editingCrop.name || ''}
                  onChange={(e) => setEditingCrop({ ...editingCrop, name: e.target.value })}
                  placeholder="Ej: Lechuga Batavia Módulo A"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Variedad Botánica</label>
                  <input
                    type="text"
                    value={editingCrop.variety || ''}
                    onChange={(e) => setEditingCrop({ ...editingCrop, variety: e.target.value })}
                    placeholder="Ej: Lactuca sativa var. capitata"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tipo de Sistema Hidropónico *</label>
                  <select
                    value={editingCrop.systemType || 'NFT'}
                    onChange={(e) => setEditingCrop({ ...editingCrop, systemType: e.target.value as HydroponicType })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-emerald-400 font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    {systemTypeOptions.map((opt) => (
                      <option key={opt.type} value={opt.type}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Capacidad Tanque (L)</label>
                  <input
                    type="number"
                    value={editingCrop.tankCapacityLiters || 500}
                    onChange={(e) => setEditingCrop({ ...editingCrop, tankCapacityLiters: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">No. Plantas</label>
                  <input
                    type="number"
                    value={editingCrop.plantCount || 200}
                    onChange={(e) => setEditingCrop({ ...editingCrop, plantCount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Etapa de Cultivo</label>
                  <select
                    value={editingCrop.growthStage || 'vegetativo'}
                    onChange={(e) => setEditingCrop({ ...editingCrop, growthStage: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white capitalize focus:outline-none focus:border-emerald-500"
                  >
                    <option value="germinacion">Germinación</option>
                    <option value="plantula">Plántula</option>
                    <option value="vegetativo">Vegetativo</option>
                    <option value="pre_cosecha">Pre Cosecha</option>
                    <option value="cosecha">Cosecha</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Fecha de Siembra</label>
                  <input
                    type="date"
                    value={editingCrop.plantingDate || ''}
                    onChange={(e) => setEditingCrop({ ...editingCrop, plantingDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Fecha Cosecha Estimada</label>
                  <input
                    type="date"
                    value={editingCrop.expectedHarvestDate || ''}
                    onChange={(e) => setEditingCrop({ ...editingCrop, expectedHarvestDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ubicación / Invernadero</label>
                <input
                  type="text"
                  value={editingCrop.location || ''}
                  onChange={(e) => setEditingCrop({ ...editingCrop, location: e.target.value })}
                  placeholder="Ej: Invernadero Principal - Bancada 01"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Latitud GPS (Decimal) *</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={editingCrop.latitude ?? -4.032745}
                    onChange={(e) => setEditingCrop({ ...editingCrop, latitude: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Longitud GPS (Decimal) *</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={editingCrop.longitude ?? -79.202318}
                    onChange={(e) => setEditingCrop({ ...editingCrop, longitude: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Notas / Instrucciones de Nutrición</label>
                <textarea
                  rows={2}
                  value={editingCrop.notes || ''}
                  onChange={(e) => setEditingCrop({ ...editingCrop, notes: e.target.value })}
                  placeholder="Parámetros especiales, flujo de bomba, frecuencia..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  Guardar Cultivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
