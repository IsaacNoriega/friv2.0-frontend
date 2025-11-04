import React from 'react';
import { Link } from 'react-router-dom';

export const RegisterComponent: React.FC = () => {
  return (
    // .login-container
    <div className="min-h-screen flex items-center justify-center p-4 py-8">
      {/* .login-card .glass-card */}
      <div className="w-full max-w-6xl bg-gray-900/85 backdrop-blur-lg rounded-2xl overflow-hidden shadow-2xl">
        {/* .card-content */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* .form-column (con position: relative) */}
          <div className="relative p-8 flex flex-col justify-center">
            
            {/* .back-button */}
            <Link 
              to="/login" 
              className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors"
              aria-label="Regresar al login"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </Link>

            {/* .form-header (con margen superior para el botón) */}
            <div className="text-center mb-6 mt-10">
              <h1 className="text-3xl md:text-4xl font-bold tracking-widest text-white uppercase">Orbit</h1>
              <p className="text-base text-gray-400 mt-2">Crea tu cuenta para empezar</p>
            </div>

            <form className="flex flex-col gap-3">
              
              {/* Campo de Nombre */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Nombre completo</label>
                <input 
                  type="text" 
                  placeholder="Tu nombre"
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
                />
                {/* <span className="text-red-400 text-sm mt-1">Tu nombre es requerido</span> */}
              </div>
              
              {/* Campo de Email */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Correo electrónico</label>
                <input 
                  type="email" 
                  placeholder="usuario@ejemplo.com"
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
                />
                {/* <span className="text-red-400 text-sm mt-1">El correo es requerido</span> */}
              </div>

              {/* Campo de Contraseña */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Contraseña</label>
                <input 
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
                />
                {/* <span className="text-red-400 text-sm mt-1">Mínimo 8 caracteres</span> */}
              </div>

              {/* .error-message (ejemplo estático) */}
              {/* <div className="text-red-400 bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-center font-medium mt-2">
                No se pudo completar el registro.
              </div>
              */}

              {/* .register-button */}
              <button 
                className="w-full p-3 text-lg font-semibold min-h-[50px] bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors mt-3" 
                type="submit"
              >
                Crear Cuenta
                {/* Para estado de carga: <Spinner /> */}
              </button>
            </form>

            {/* .divider */}
            <div className="flex items-center text-gray-500 text-sm my-5">
              <span className="flex-grow border-t border-white/10"></span>
              <span className="mx-4">o registrarse con</span>
              <span className="flex-grow border-t border-white/10"></span>
            </div>

            {/* .social-buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button className="w-full p-3 font-medium flex items-center justify-center gap-2 border border-white/10 text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                <span>Google</span>
              </button>
              <button className="w-full p-3 font-medium flex items-center justify-center gap-2 border border-white/10 text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                <span>Microsoft</span>
              </button>
            </div>

            {/* .register-link (ahora es "Inicia sesión") */}
            <p className="text-center text-sm text-gray-400 mt-6">
              ¿Ya tienes una cuenta? 
              <Link to="/login" className="font-medium text-violet-400 hover:text-violet-300 ml-1">
                Inicia sesión
              </Link>
            </p>
          </div>

          {/* .welcome-column (Idéntica a la de Login) */}
          <div className="hidden md:flex flex-col items-center justify-center bg-white/5 p-10 border-l border-white/10 text-center">
            <img 
              src="https://placehold.co/150x150/111827/533483?text=Orbit&font=poppins" 
              alt="Orbit Logo" 
              className="w-24 h-24 rounded-full mb-6" 
            />
            <h2 className="text-2xl font-semibold text-white mb-3">Conecta y Colabora sin Límites</h2>
            <p className="text-base text-gray-400 leading-relaxed max-w-xs">
              La plataforma todo-en-uno para comunicación de equipos, gestión de proyectos y productividad.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};