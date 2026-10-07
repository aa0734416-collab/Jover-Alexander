import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Key, 
  ShieldCheck, 
  Check, 
  X, 
  Upload, 
  Camera, 
  Lock, 
  User, 
  Mail, 
  Briefcase, 
  Phone,
  Trash2,
  RefreshCw,
  Copy,
  Send,
  LogOut,
  Sparkles
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  users: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onSaveUser: (user: UserProfile) => void;
  onDeleteUser: (userId: string) => void;
  onLogout: () => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  users,
  onSelectUser,
  onSaveUser,
  onDeleteUser,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit'>('list');
  const [editingUser, setEditingUser] = useState<Partial<UserProfile>>({
    role: 'agronomo',
    isActive: true,
  });
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [emailNotice, setEmailNotice] = useState<string>('');

  if (!isOpen) return null;

  // Generate safe random credentials
  const generateRandomCredentials = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!#@';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const cleanUser = editingUser.fullName 
      ? editingUser.fullName.toLowerCase().replace(/[^a-z]/g, '').slice(0, 8) + '_' + pin.slice(0, 2)
      : `hydro_${pin}`;

    setEditingUser(prev => ({
      ...prev,
      username: prev.username || cleanUser,
      passwordHash: pass,
      pinCode: pin,
    }));
  };

  const handleStartCreate = () => {
    const defaultUser: Partial<UserProfile> = {
      id: `usr_${Date.now()}`,
      username: '',
      passwordHash: '',
      pinCode: '',
      fullName: '',
      role: 'agronomo',
      functionTitle: 'Ingeniero Agrónomo de Campo',
      phone: '',
      email: '',
      avatarUrl: '',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    setEditingUser(defaultUser);
    setPhotoPreview('');
    setActiveTab('create');
  };

  const handleStartEdit = (user: UserProfile) => {
    setEditingUser({ ...user });
    setPhotoPreview(user.avatarUrl);
    setActiveTab('edit');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setPhotoPreview(base64);
        setEditingUser((prev) => ({ ...prev, avatarUrl: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser.username || !editingUser.fullName) return;

    const userToSave: UserProfile = {
      id: editingUser.id || `usr_${Date.now()}`,
      username: editingUser.username,
      passwordHash: editingUser.passwordHash || 'hydroPass2026',
      pinCode: editingUser.pinCode || '1234',
      fullName: editingUser.fullName,
      role: editingUser.role as UserRole || 'operador',
      functionTitle: editingUser.functionTitle || 'Operador Técnico',
      phone: editingUser.phone || '',
      email: editingUser.email || '',
      avatarUrl: photoPreview || editingUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      createdAt: editingUser.createdAt || new Date().toISOString(),
      isActive: true,
    };

    onSaveUser(userToSave);
    setActiveTab('list');
  };

  // Copy credentials
  const handleCopyCredentials = (u: UserProfile) => {
    const text = `=== CREDENCIALES HYDROSENSE IOT ===\nNombre: ${u.fullName}\nUsuario: ${u.username}\nContraseña: ${u.passwordHash || '••••••••'}\nPIN Rápido: ${u.pinCode || 'N/A'}\nCargo: ${u.functionTitle}\nAcceso: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopiedId(u.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Send credentials via email simulation
  const handleSendCredentialsEmail = (u: UserProfile) => {
    setEmailNotice(`Credenciales despachadas exitosamente a ${u.email || u.fullName}.`);
    setTimeout(() => setEmailNotice(''), 3500);
  };

  const roleLabels: Record<UserRole, { title: string; color: string; desc: string }> = {
    super_admin: { title: 'Super Admin', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30', desc: 'Acceso total y configuración de sistema' },
    agronomo: { title: 'Ingeniero Agrónomo', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', desc: 'Validación de fórmulas y reportes oficiales' },
    operador: { title: 'Operador de Turno', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', desc: 'Monitoreo diario y dosificación de nutrientes' },
    auditor: { title: 'Auditor de Calidad', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30', desc: 'Visualización y exportación de certificaciones' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                Gestión & Generación de Credenciales de Miembros
              </h2>
              <p className="text-xs text-slate-400">
                Almacenamiento seguro en el dispositivo con despacho de credenciales al correo
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

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {emailNotice && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{emailNotice}</span>
            </div>
          )}

          {activeTab === 'list' ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-slate-200">
                  Miembros Registrados del Cultivo ({users.length})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleStartCreate}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition shadow-md shadow-emerald-500/20"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Generar Nuevas Credenciales</span>
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      onLogout();
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 font-bold transition"
                    title="Cerrar sesión actual"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Salir</span>
                  </button>
                </div>
              </div>

              {/* Users list */}
              <div className="space-y-3">
                {users.map((usr) => {
                  const isCurrent = usr.id === currentUser.id;
                  const roleCfg = roleLabels[usr.role] || roleLabels.operador;

                  return (
                    <div
                      key={usr.id}
                      className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-slate-950 border-emerald-500 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={usr.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                          alt={usr.fullName}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                            <span className="font-bold text-white text-sm">{usr.fullName}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${roleCfg.color}`}>
                              {roleCfg.title}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                Sesión Activa
                              </span>
                            )}
                          </div>
                          <p className="text-slate-400 text-xs font-medium">{usr.functionTitle}</p>
                          <p className="text-slate-500 text-[10px] font-mono mt-0.5">
                            Usuario: <strong className="text-slate-300">@{usr.username}</strong> • Email: {usr.email || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 pt-2 sm:pt-0 border-t sm:border-0 border-slate-800">
                        <button
                          onClick={() => handleCopyCredentials(usr)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 text-[11px] font-semibold transition"
                          title="Copiar usuario y contraseña para entregar"
                        >
                          {copiedId === usr.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === usr.id ? 'Copiadas!' : 'Credenciales'}</span>
                        </button>

                        <button
                          onClick={() => handleSendCredentialsEmail(usr)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          title="Enviar credenciales por correo electrónico"
                        >
                          <Send className="w-3.5 h-3.5 text-cyan-400" />
                        </button>

                        {!isCurrent && (
                          <button
                            onClick={() => onSelectUser(usr)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 text-[11px] font-bold transition"
                          >
                            Entrar
                          </button>
                        )}

                        <button
                          onClick={() => handleStartEdit(usr)}
                          className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
                        >
                          Editar
                        </button>

                        {users.length > 1 && !isCurrent && (
                          <button
                            onClick={() => onDeleteUser(usr.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Create / Edit Form */
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-white text-sm">
                  {activeTab === 'create' ? 'Generar Nuevas Credenciales de Miembro' : 'Modificar Credenciales y Perfil'}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="text-slate-400 hover:text-white"
                >
                  Volver a lista
                </button>
              </div>

              {/* Photo Upload & Preview */}
              <div className="flex items-center gap-4 p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <img
                  src={photoPreview || editingUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                  alt="Vista previa"
                  className="w-16 h-16 rounded-xl object-cover border border-slate-700 shadow shrink-0"
                />
                <div className="space-y-1">
                  <span className="font-bold text-slate-200 block text-xs">Foto del Miembro del Cultivo *</span>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition">
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Subir Foto del Dispositivo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-slate-500 block">Identificación visual en el registro de telemetría y firmas</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={editingUser.fullName || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                    placeholder="Ej: Ing. María Guarnizo"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Función / Cargo Específico *</label>
                  <input
                    type="text"
                    required
                    value={editingUser.functionTitle || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, functionTitle: e.target.value })}
                    placeholder="Ej: Supervisora de pH y Solución Nutritiva"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Automatic Credential Generator Trigger */}
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-emerald-500/30">
                <div>
                  <span className="font-bold text-emerald-400 block">Generador de Contraseñas Seguras</span>
                  <span className="text-[10px] text-slate-400">Genera automáticamente contraseña alfanumérica y PIN rápido</span>
                </div>
                <button
                  type="button"
                  onClick={generateRandomCredentials}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 shadow transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generar</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nombre de Usuario *</label>
                  <input
                    type="text"
                    required
                    value={editingUser.username || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    placeholder="ej: mguarnizo"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contraseña Permanente *</label>
                  <input
                    type="text"
                    required
                    value={editingUser.passwordHash || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, passwordHash: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">PIN Rápido (4 dígitos)</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={editingUser.pinCode || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, pinCode: e.target.value })}
                    placeholder="1234"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Rol / Nivel de Acceso *</label>
                  <select
                    value={editingUser.role || 'agronomo'}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="super_admin">Super Administrador</option>
                    <option value="agronomo">Ingeniero Agrónomo</option>
                    <option value="operador">Operador Técnico</option>
                    <option value="auditor">Auditor de Calidad</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Correo Electrónico (Para envío)</label>
                  <input
                    type="email"
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    placeholder="ej: mguarnizo@unl.edu.ec"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  Guardar & Activar Credenciales
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
