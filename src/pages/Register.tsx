import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';

export const RegisterComponent: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-violet-950 to-fuchsia-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl bg-gray-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* === Columna izquierda (Formulario) === */}
          <div className="relative p-10 flex flex-col justify-center">
            <Link
              to="/login"
              className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors"
              aria-label="Regresar al login"
            >
              <ArrowLeft size={24} />
            </Link>

            <div className="text-center mb-8 mt-6">
              <h1 className="text-5xl font-extrabold tracking-widest text-white uppercase drop-shadow-[0_2px_8px_rgba(124,58,237,0.3)]">
                Friv 2.0
              </h1>
              <p className="text-gray-400 mt-2">
                Crea tu cuenta para empezar 
              </p>
            </div>

            <form onSubmit={async (e) => {
                e.preventDefault();
                setError('');
                try {
                  await api.register(formData);
                  navigate('/login');
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Error en el registro');
                }
              }} className="flex flex-col gap-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-500 text-sm">
                  {error}
                </div>
              )}
              {/* Campo: Nombre completo */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-500" size={20} />
                  <input
                    type="text"
                    placeholder="Tu nombre completo"
                    className="w-full pl-10 p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Campo: Correo */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">
                  Correo electrónico
ey mira                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-500" size={20} />
                  <input
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    className="w-full pl-10 p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Campo: Contraseña */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-500" size={20} />
                  <input
                    type="password"
                    placeholder="Tu contraseña"
                    className="w-full pl-10 p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Botón principal */}
              <button
                type="submit"
                className="w-full p-3 text-lg font-semibold min-h-[50px] bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-all duration-200 hover:shadow-lg hover:shadow-violet-600/30"
              >
                Crear Cuenta
              </button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-6">
              ¿Ya tienes una cuenta?
              <Link
                to="/login"
                className="font-medium text-violet-400 hover:text-violet-300 ml-1"
              >
                Inicia sesión
              </Link>
            </p>
          </div>

          {/* === Columna derecha (Bienvenida) === */}
          <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-violet-600/20 to-fuchsia-900/20 p-10 border-l border-white/10 text-center">
            <motion.img
              src="https://placehold.co/150x150/111827/7c3aed?text=Friv2.0"
              alt="Friv2.0 Logo"
              className="w-28 h-28 rounded-full mb-6 shadow-md"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6 }}
            />
            <h2 className="text-2xl font-semibold text-white mb-3">
              Únete a la comunidad
            </h2>
            <p className="text-base text-gray-400 leading-relaxed max-w-xs">
              Crea tu perfil, guarda tus juegos favoritos y compite por el
              primer lugar. ¡Friv 2.0 te espera!
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
