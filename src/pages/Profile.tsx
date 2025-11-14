import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
    <main className="p-8 text-slate-100">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left card */}
        <aside className="lg:col-span-1 bg-[#0f2430] rounded-xl p-6 border border-slate-800">
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full bg-linear-to-br from-[#7c4dff] to-[#ff6fb5] flex items-center justify-center text-white text-2xl font-bold ring-2 ring-sky-500/20">
              {(formData.username || 'IN').slice(0,2).toUpperCase()}
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold">{formData.username}</div>
              <div className="text-amber-300 text-sm">{formData.hasPaid ? 'Usuario Premium' : 'Modo Gratuito'}</div>
            </div>

            <div className="w-full border-t border-slate-800 pt-4 text-sm text-slate-300">
              <div className="flex justify-between mb-2"><span>Nivel:</span><span className="font-semibold">42</span></div>
              <div className="flex justify-between mb-2"><span>Ranking:</span><span className="font-semibold">#247</span></div>
              <div className="flex justify-between mb-2"><span>Victorias:</span><span className="font-semibold">189</span></div>
            </div>

            <button className="mt-4 w-full py-2 rounded-md bg-linear-to-r from-[#5b34ff] to-[#ff3fb6] text-white font-semibold">Cambiar Avatar</button>
          </div>
        </aside>

        {/* Right form */}
        <section className="lg:col-span-2 bg-[#0e1b26] rounded-xl border border-slate-800 p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Información del Jugador</h2>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {error && (
              <div className={`p-4 rounded-md ${error.includes('correctamente') ? 'bg-green-500/10 border border-green-500/20 text-green-500' : 'bg-red-500/10 border border-red-500/20 text-red-500'}`}>
                {error}
              </div>
            )}

            <div>
              <label className="text-sm text-slate-300">Nombre de Usuario</label>
              <input 
                value={formData.username} 
                onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full mt-1 p-3 bg-[#08121a] border border-slate-700 rounded-md text-white" 
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Email</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full mt-1 p-3 bg-[#08121a] border border-slate-700 rounded-md text-white" 
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Nueva Contraseña</label>
              <input 
                type="password" 
                placeholder="Nueva contraseña" 
                value={formData.password} 
                onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full mt-1 p-3 bg-[#08121a] border border-slate-700 rounded-md text-white" 
              />
            </div>

            <div className="flex justify-end">
                          <button 
              type="submit" 
              className="w-full py-3 rounded-md bg-linear-to-r from-[#5b34ff] to-[#ff3fb6] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}

