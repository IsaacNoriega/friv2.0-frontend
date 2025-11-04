import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User } from 'lucide-react';

export const LoginComponent: React.FC = () => {
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

            <form className="flex flex-col gap-5">
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
                    defaultValue="admin@friv2.0.com"
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
              <button className="p-3 font-medium flex items-center justify-center gap-2 border border-white/10 text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                <span>Continuar con Google</span>
              </button>
            

             
              <button className="p-3 font-medium flex items-center justify-center gap-2 border border-white/10 text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                <span>Continuar como invitado</span>
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
