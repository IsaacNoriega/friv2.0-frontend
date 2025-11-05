import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User } from 'lucide-react';
import { api } from '../services/api';
import { auth } from '../utils/auth';

export const LoginComponent: React.FC<{ onGuest?: (u: any) => void }> = ({ onGuest }) => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Limpiar storage anterior y verificar login
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      auth.logout(); // Limpiar cualquier sesión anterior
      window.location.reload(); // Recargar para limpiar el estado
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-violet-950 to-fuchsia-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl bg-gray-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-10 flex flex-col justify-center">
            <div className="text-center mb-8">
              <h1 className="text-5xl font-extrabold tracking-widest text-white uppercase drop-shadow-[0_2px_8px_rgba(124,58,237,0.3)]">
                Friv 2.0
              </h1>
              <p className="text-gray-400 mt-2">Bienvenido de nuevo </p>
                </div>



            <form onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                setError('');
                try {
                  const response = await api.login(formData);
                  if (response.token && response.user) {
                    auth.setLoginData(response.token, response.user);
                    navigate('/dashboard');
                  }
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Error en el inicio de sesión');
                } finally {
                  setLoading(false);
                }
              }} className="flex flex-col gap-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-500 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-500" size={20} />
                  <input
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    className="w-full pl-10 p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

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
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    defaultValue="password"
                  />
                </div>
              </div>

              <div className="text-right -mt-2 mb-2">
                <button
                  type="button"
                  className="text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button
                type="submit"
                className="w-full p-3 text-lg font-semibold min-h-[50px] bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-all duration-200 hover:shadow-lg hover:shadow-violet-600/30"
              >
                Iniciar Sesión
              </button>

           
            </form>

            <div className="flex items-center text-gray-500 text-sm my-6">
              <span className="flex-grow border-t border-white/10"></span>
              <span className="mx-4">o</span>
              <span className="flex-grow border-t border-white/10"></span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => {
                  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                  window.location.href = `${backendUrl}/auth/google`;
                }}
                className="bg-white text-gray-900 p-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors font-medium"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#FFC107"/>
                  <path d="M3.15302 7.3455L6.43852 9.755C7.32752 7.554 9.48052 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.15902 2 4.82802 4.1685 3.15302 7.3455Z" fill="#FF3D00"/>
                  <path d="M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.5717 17.5742 13.3037 18.0011 12 18C9.39897 18 7.19047 16.3415 6.35847 14.027L3.09747 16.5395C4.75247 19.778 8.11347 22 12 22Z" fill="#4CAF50"/>
                  <path d="M21.8055 10.0415H21V10H12V14H17.6515C17.2571 15.1082 16.5467 16.0766 15.608 16.7855L15.6095 16.785L18.7045 19.404C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#1976D2"/>
                </svg>
                Google
              </button>

              <button
                onClick={() => {
                  onGuest?.({ name: 'Invitado', guest: true });
                  navigate('/dashboard');
                }}
                className="p-3 font-medium flex items-center justify-center gap-2 border border-white/10 text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
              >
                <User className="w-5 h-5" />
                Invitado
              </button>
            </div>

            <p className="text-center text-sm text-gray-400 mt-6">
              ¿No tienes una cuenta?
              <Link
                to="/register"
                className="font-medium text-violet-400 hover:text-violet-300 ml-1"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>

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
              Conecta y juega sin límites
            </h2>
            <p className="text-base text-gray-400 leading-relaxed max-w-xs">
              Tu espacio para relajarte, competir y descubrir nuevos amigos.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
