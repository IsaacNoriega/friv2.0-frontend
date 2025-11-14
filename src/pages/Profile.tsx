import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserCircleIcon, ShieldCheckIcon, TrashIcon } from "@heroicons/react/24/solid";
import { api } from "../services/api";
import { auth } from "../utils/auth";

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    hasPaid: false
  });

  useEffect(() => {
    const userData = auth.getUser();
    if (!userData) {
      navigate('/login');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      username: userData.username,
      email: userData.email,
      hasPaid: !!userData.hasPaid
    }));
    // listen to auth changes to reflect hasPaid updates instantly
    const handler = () => {
      // read authoritative user object from auth util
      const latest = auth.getUser();
      if (!latest) return;
      setFormData(prev => ({ ...prev, hasPaid: !!latest.hasPaid, username: latest.username ?? prev.username, email: latest.email ?? prev.email }));
    };
    window.addEventListener('auth:changed', handler as EventListener);
    return () => window.removeEventListener('auth:changed', handler as EventListener);
  }, [navigate]);

  async function submit(e: React.FormEvent){
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = auth.getUser();
      if (!user?.id) {
        throw new Error('Usuario no encontrado');
      }

      await api.updateUser(user.id, formData);
      const updatedUser = await api.getUser(user.id);
      auth.setUser(updatedUser);
      setError('¡Información actualizada correctamente!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error actualizando la información');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-8 text-slate-100 min-h-screen bg-linear-to-br from-[#050d1a] via-[#071123] to-[#0a1628]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <UserCircleIcon className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl font-bold bg-linear-to-r from-purple-400 via-pink-400 to-purple-500 bg-clip-text text-transparent">
              Mi Perfil
            </h1>
          </div>
          <p className="text-slate-400 text-lg ml-13">Administra tu información personal y configuración</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left card - User info */}
          <motion.aside 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 bg-slate-900/40 rounded-xl p-6 border border-slate-700/50 backdrop-blur-sm h-fit"
          >
            <div className="flex flex-col items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-linear-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold ring-4 ring-purple-500/30 shadow-xl shadow-purple-500/20">
                  {(formData.username || 'US').slice(0,2).toUpperCase()}
                </div>
                {formData.hasPaid && (
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-2 border-4 border-slate-900 shadow-lg">
                    <ShieldCheckIcon className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              {/* User name and status */}
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{formData.username}</div>
                <div className="text-sm text-slate-400">{formData.email}</div>
                {formData.hasPaid && (
                  <div className="mt-3 inline-flex items-center gap-2 bg-linear-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/40 rounded-full px-4 py-1.5">
                    <ShieldCheckIcon className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-300 text-sm font-semibold">Usuario Premium</span>
                  </div>
                )}
              </div>

              {/* Premium status details */}
              {formData.hasPaid && (
                <div className="w-full border-t border-slate-700/50 pt-4 mt-2">
                  <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Estado:</span>
                      <span className="font-semibold text-emerald-400 flex items-center gap-1">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                        Activo
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="w-full flex flex-col gap-3 mt-4">
                <button className="w-full py-2.5 rounded-lg bg-linear-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/20">
                  Cambiar Avatar
                </button>
                <button 
                  onClick={async () => {
                    const ok = window.confirm('¿Estás seguro que quieres eliminar tu cuenta? Esta acción no se puede deshacer.');
                    if (!ok) return;
                    setLoading(true);
                    try {
                      const user = auth.getUser();
                      if (!user?.id) throw new Error('Usuario no encontrado');
                      await api.deleteUser(user.id);
                      auth.logout();
                      navigate('/register');
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Error eliminando la cuenta');
                    } finally {
                      setLoading(false);
                    }
                  }} 
                  className="w-full py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-semibold hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <TrashIcon className="w-4 h-4" />
                  Eliminar Cuenta
                </button>
              </div>
            </div>
          </motion.aside>

          {/* Right form - Edit profile */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-slate-900/40 rounded-xl border border-slate-700/50 p-8 backdrop-blur-sm"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">Información del Jugador</h2>
              <p className="text-slate-400">Actualiza tus datos personales y credenciales</p>
            </div>

            <form onSubmit={submit} className="space-y-6">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg ${
                    error.includes('correctamente') 
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                      : 'bg-red-500/10 border border-red-500/30 text-red-400'
                  } flex items-center gap-3`}
                >
                  <span className="text-2xl">{error.includes('correctamente') ? '✓' : '⚠️'}</span>
                  <span className="font-medium">{error}</span>
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                  Nombre de Usuario
                </label>
                <input 
                  value={formData.username} 
                  onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full p-3 bg-slate-800/60 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all" 
                  placeholder="Tu nombre de usuario"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <span className="w-1 h-4 bg-pink-500 rounded-full"></span>
                  Email
                </label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 bg-slate-800/60 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none transition-all" 
                  placeholder="tu@email.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <span className="w-1 h-4 bg-sky-500 rounded-full"></span>
                  Nueva Contraseña
                </label>
                <input 
                  type="password" 
                  placeholder="Dejar en blanco para mantener la actual" 
                  value={formData.password} 
                  onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full p-3 bg-slate-800/60 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-all" 
                />
                <p className="text-xs text-slate-500 ml-1">Solo completa este campo si deseas cambiar tu contraseña</p>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  type="submit" 
                  className="px-8 py-3 rounded-lg bg-linear-to-r from-purple-500 to-pink-500 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/30"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Guardando...
                    </span>
                  ) : (
                    'Guardar Cambios'
                  )}
                </button>
              </div>
            </form>
          </motion.section>
        </div>
      </div>
    </main>
  )
}

