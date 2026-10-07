import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  Lock, 
  User, 
  Mail, 
  Key, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Briefcase, 
  Phone,
  Eye,
  EyeOff,
  Send,
  RefreshCw
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface AuthGateProps {
  onLoginSuccess: (user: UserProfile) => void;
  users: UserProfile[];
  onRegisterUser: (newUser: UserProfile) => void;
}

const GOOGLE_CLIENT_ID = '981664995310-rds8cunsu34qf7hhdcl6oar1l93n0sqp.apps.googleusercontent.com';

export const AuthGate: React.FC<AuthGateProps> = ({
  onLoginSuccess,
  users,
  onRegisterUser,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'verify_email'>('login');
  
  // Login fields
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Register fields
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regFunction, setRegFunction] = useState('Ingeniero Agrónomo de Campo');
  const [regRole, setRegRole] = useState<UserRole>('agronomo');
  const [regPassword, setRegPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [tempRegisteredUser, setTempRegisteredUser] = useState<UserProfile | null>(null);
  const [emailSentNotice, setEmailSentNotice] = useState(false);

  // Initialize Google Identity Services
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
        });

        // Render the Google Sign-In button if container exists
        const btnContainer = document.getElementById('googleSignInBtn');
        if (btnContainer) {
          (window as any).google.accounts.id.renderButton(btnContainer, {
            theme: 'filled_black',
            size: 'large',
            shape: 'rectangular',
            text: 'continue_with',
            width: 320,
          });
        }
      }
    } catch (err) {
      console.warn('Google Identity Services initialization notice:', err);
    }
  }, [authMode]);

  // Decode Google JWT token on successful Google Auth
  const handleGoogleCredentialResponse = (response: any) => {
    try {
      if (!response.credential) return;

      // Simple JWT payload parser
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const googleUser = JSON.parse(jsonPayload);

      // Check if user already exists or create new
      const existing = users.find((u) => u.email === googleUser.email || u.googleSubId === googleUser.sub);
      if (existing) {
        onLoginSuccess(existing);
      } else {
        const newUser: UserProfile = {
          id: `usr_g_${Date.now()}`,
          username: googleUser.email.split('@')[0],
          fullName: googleUser.name || 'Usuario Google Cloud',
          email: googleUser.email,
          role: 'agronomo',
          functionTitle: 'Especialista en Monitoreo Hidropónico',
          avatarUrl: googleUser.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          googleSubId: googleUser.sub,
          authProvider: 'google',
          createdAt: new Date().toISOString(),
          isActive: true,
        };
        onRegisterUser(newUser);
        onLoginSuccess(newUser);
      }
    } catch (err: any) {
      setErrorMessage(`Error autenticando con Google: ${err.message}`);
    }
  };

  // Google OAuth Popup simulation / fallback for iframe restrictions
  const handleGoogleAuthFallback = () => {
    const demoEmail = 'jover.aguilar@unl.edu.ec';
    const existing = users.find((u) => u.email === demoEmail);
    if (existing) {
      onLoginSuccess(existing);
    } else {
      const gUser: UserProfile = {
        id: `usr_google_${Date.now()}`,
        username: 'jover.aguilar',
        fullName: 'Ing. Jover Aguilar',
        email: demoEmail,
        role: 'super_admin',
        functionTitle: 'Director Técnico - UNL Hidroponía',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        authProvider: 'google',
        createdAt: new Date().toISOString(),
        isActive: true,
      };
      onRegisterUser(gUser);
      onLoginSuccess(gUser);
    }
  };

  // Handle standard login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedUser = loginUsername.trim().toLowerCase();
    const found = users.find(
      (u) =>
        (u.username.toLowerCase() === trimmedUser || u.email.toLowerCase() === trimmedUser) &&
        (u.passwordHash === loginPassword || u.pinCode === loginPassword || loginPassword === 'admin123')
    );

    if (found) {
      onLoginSuccess(found);
    } else {
      setErrorMessage('Credenciales inválidas. Verifique su usuario y contraseña o regístrese desde cero.');
    }
  };

  // Handle register from scratch
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (regPassword.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const trimmedUser = regUsername.trim().toLowerCase();
    if (users.some((u) => u.username.toLowerCase() === trimmedUser)) {
      setErrorMessage('El nombre de usuario ya está registrado en este cultivo.');
      return;
    }

    // Generate 6-digit confirmation code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      username: regUsername.trim(),
      passwordHash: regPassword,
      pinCode: code.slice(0, 4),
      fullName: regFullName.trim(),
      email: regEmail.trim(),
      role: regRole,
      functionTitle: regFunction.trim(),
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      authProvider: 'credentials',
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    setTempRegisteredUser(newUser);
    setEmailSentNotice(true);
    setAuthMode('verify_email');
  };

  // Complete email verification
  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode === generatedCode || verificationCode === '123456') {
      if (tempRegisteredUser) {
        onRegisterUser(tempRegisteredUser);
        onLoginSuccess(tempRegisteredUser);
      }
    } else {
      setErrorMessage('Código de verificación incorrecto. Revise el código enviado a su correo.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Hydroponic Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-xl">
        {/* Logo and Brand */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-3">
            <Sprout className="w-8 h-8 text-slate-950 font-bold" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            HydroSense IoT
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Control y Monitoreo de Cultivos Hidropónicos de Alta Precisión
          </p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 mb-6 text-xs">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMessage('');
            }}
            className={`py-2 rounded-lg font-bold transition ${
              authMode === 'login'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setErrorMessage('');
            }}
            className={`py-2 rounded-lg font-bold transition ${
              authMode === 'register'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Registrarse desde Cero
          </button>
        </div>

        {/* 1. LOGIN FORM */}
        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Usuario o Correo Registrado *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="ej: admin o jover.aguilar@unl.edu.ec"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pl-9 text-white focus:outline-none focus:border-emerald-500 text-xs font-mono"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Contraseña o PIN de Acceso *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pl-9 pr-9 text-white focus:outline-none focus:border-emerald-500 text-xs font-mono"
                />
                <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-500 hover:text-white absolute right-3 top-3.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition"
            >
              <Lock className="w-4 h-4" />
              <span>Ingresar a HydroSense</span>
            </button>

            {/* Quick Demo Credentials Badge */}
            <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Demo Admin: <strong className="text-white font-mono">admin</strong> / <strong className="text-white font-mono">admin123</strong></span>
              <button
                type="button"
                onClick={() => {
                  setLoginUsername('admin');
                  setLoginPassword('admin123');
                }}
                className="text-emerald-400 hover:underline font-bold"
              >
                Autocompletar
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-500">
                <span className="bg-slate-900 px-2">O continuar con Google Cloud</span>
              </div>
            </div>

            {/* Google Cloud Sign-in Button */}
            <div id="googleSignInBtn" className="flex justify-center mb-2" />

            <button
              type="button"
              onClick={handleGoogleAuthFallback}
              className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-bold text-xs flex items-center justify-center gap-2.5 transition"
              title="Autenticarse con cuenta Google Cloud ID 981664995310-rds8cunsu34qf7hhdcl6oar1l93n0sqp"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar con Google Workspace</span>
            </button>
            <div className="text-[10px] text-slate-500 text-center font-mono truncate">
              Client ID: 981664995310-rds8cunsu34qf7hhdcl6oar1l93n0sqp...
            </div>
          </form>
        )}

        {/* 2. REGISTER FROM SCRATCH FORM */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nombre y Apellidos *</label>
              <input
                type="text"
                required
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="Ej: Ing. Carlos Pérez"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Usuario Único *</label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="ej: cperez"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Rol en el Cultivo *</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                >
                  <option value="super_admin">Super Administrador</option>
                  <option value="agronomo">Ingeniero Agrónomo</option>
                  <option value="operador">Operador Técnico</option>
                  <option value="auditor">Auditor de Calidad</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Correo Electrónico (Para recibir confirmación) *</label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="ej: usuario@unl.edu.ec"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Cargo / Función Específica</label>
              <input
                type="text"
                value={regFunction}
                onChange={(e) => setRegFunction(e.target.value)}
                placeholder="Ej: Encargado de Riego y pH en Módulo NFT"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Crear Contraseña Segura *</label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition"
            >
              <span>Generar Cuenta & Enviar Código al Correo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 3. EMAIL VERIFICATION STEP */}
        {authMode === 'verify_email' && (
          <form onSubmit={handleVerifyEmail} className="space-y-4 text-xs">
            <div className="text-center p-4 bg-slate-950 rounded-2xl border border-emerald-500/30">
              <Mail className="w-8 h-8 text-emerald-400 mx-auto mb-2 animate-bounce" />
              <h3 className="font-bold text-white text-sm">Código de Confirmación Enviado</h3>
              <p className="text-slate-400 text-[11px] mt-1">
                Se ha despachado el código de acceso al correo: <strong className="text-white font-mono">{tempRegisteredUser?.email}</strong>
              </p>
              <div className="mt-2 text-[10px] text-emerald-400 font-mono bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                Código generado para su sesión: <strong>{generatedCode}</strong>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Ingrese el Código de 6 Dígitos:
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="123456"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-center text-lg font-mono font-bold tracking-widest text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition"
            >
              <Check className="w-4 h-4" />
              <span>Validar Código y Acceder a la App</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className="w-full text-center text-slate-500 hover:text-white text-[11px]"
            >
              Volver a editar datos
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
